import { exigir } from './permissoes.js';
import { ErroNaoEncontrado, ErroValidacao } from '../servicos/erros.js';

/** Imagens que o administrador pode associar a um produto (não há upload de arquivos). */
export const IMAGENS_DISPONIVEIS = [
  'img/produtos/baunilha-frutas-vermelhas.svg',
  'img/produtos/chocolate-belga.svg',
  'img/produtos/red-velvet.svg',
  'img/produtos/brigadeiro.svg',
  'img/produtos/doce-de-leite.svg',
  'img/produtos/limao-siciliano.svg',
  'img/produtos/pistache.svg',
  'img/produtos/cenoura-chocolate.svg',
  'img/produtos/maracuja.svg',
];

const CAMPOS = `p.id, p.nome, p.descricao, p.preco_centavos AS precoCentavos, p.imagem,
  p.ativo, p.categoria_id AS categoriaId, c.nome AS categoria`;

const normalizar = (linha) => linha && { ...linha, ativo: linha.ativo === 1 };

/** Converte "12,90", "12.90" ou 12.9 em centavos (1290). */
export function reaisParaCentavos(valor) {
  const texto = String(valor ?? '').trim().replace(/\s|R\$/g, '').replace(',', '.');
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(texto)) return NaN;
  return Math.round(Number(texto) * 100);
}

export class ProdutoModel {
  constructor(banco) {
    this.banco = banco;
  }

  /** HU01 — catálogo. Por padrão mostra ativos e inativos (inativos aparecem como indisponíveis). */
  listar({ categoriaId = null, somenteAtivos = false } = {}) {
    const filtros = [];
    const parametros = [];
    if (categoriaId) { filtros.push('p.categoria_id = ?'); parametros.push(Number(categoriaId)); }
    if (somenteAtivos) filtros.push('p.ativo = 1');
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    return this.banco
      .consultar(`SELECT ${CAMPOS} FROM produto p JOIN categoria c ON c.id = p.categoria_id
                  ${where} ORDER BY p.ativo DESC, c.id, p.nome`, parametros)
      .map(normalizar);
  }

  /** HU02 — detalhes do produto. */
  buscarPorId(id) {
    const produto = normalizar(this.banco.consultarUm(
      `SELECT ${CAMPOS} FROM produto p JOIN categoria c ON c.id = p.categoria_id WHERE p.id = ?`,
      [Number(id)],
    ));
    if (!produto) throw new ErroNaoEncontrado('Produto não encontrado.');
    return produto;
  }

  listarCategorias() {
    return this.banco.consultar('SELECT id, nome, descricao FROM categoria ORDER BY id');
  }

  /** Lista apenas os campos permitidos (bloqueio de mass assignment) e valida cada um. */
  #validar(entrada = {}) {
    const nome = String(entrada.nome ?? '').trim();
    const descricao = String(entrada.descricao ?? '').trim();
    const precoCentavos = reaisParaCentavos(entrada.preco);
    const categoriaId = Number(entrada.categoriaId);
    const imagem = String(entrada.imagem ?? '');
    const erros = {};

    if (nome.length < 3 || nome.length > 80) erros.nome = 'O nome deve ter de 3 a 80 caracteres.';
    if (descricao.length < 10 || descricao.length > 400) erros.descricao = 'A descrição deve ter de 10 a 400 caracteres.';
    if (!Number.isInteger(precoCentavos) || precoCentavos < 100 || precoCentavos > 100000) {
      erros.preco = 'Informe um preço entre R$ 1,00 e R$ 1.000,00.';
    }
    if (!this.banco.consultarUm('SELECT id FROM categoria WHERE id = ?', [categoriaId])) {
      erros.categoriaId = 'Selecione uma categoria.';
    }
    if (!IMAGENS_DISPONIVEIS.includes(imagem)) erros.imagem = 'Selecione uma imagem da lista.';
    if (Object.keys(erros).length) throw new ErroValidacao('Verifique os campos destacados.', erros);
    return { nome, descricao, precoCentavos, categoriaId, imagem };
  }

  #garantirNomeUnico(nome, idAtual = 0) {
    const existente = this.banco.consultarUm(
      'SELECT id FROM produto WHERE lower(nome) = lower(?) AND id <> ?', [nome, idAtual],
    );
    if (existente) throw new ErroValidacao('Já existe um produto com esse nome.', { nome: 'Já existe um produto com esse nome.' });
  }

  /** HU11 — cadastrar produto (somente ADMINISTRADOR, RN09). */
  criar(usuario, entrada) {
    exigir(usuario, 'gerenciar_produtos');
    const d = this.#validar(entrada);
    this.#garantirNomeUnico(d.nome);
    const { id } = this.banco.executar(
      `INSERT INTO produto (categoria_id, nome, descricao, preco_centavos, imagem, ativo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [d.categoriaId, d.nome, d.descricao, d.precoCentavos, d.imagem],
    );
    return this.buscarPorId(id);
  }

  /** HU11 — editar produto. Alterar o preço não afeta pedidos já feitos (RN12). */
  atualizar(usuario, id, entrada) {
    exigir(usuario, 'gerenciar_produtos');
    this.buscarPorId(id);
    const d = this.#validar(entrada);
    this.#garantirNomeUnico(d.nome, Number(id));
    this.banco.executar(
      `UPDATE produto SET categoria_id = ?, nome = ?, descricao = ?, preco_centavos = ?, imagem = ?
       WHERE id = ?`,
      [d.categoriaId, d.nome, d.descricao, d.precoCentavos, d.imagem, Number(id)],
    );
    return this.buscarPorId(id);
  }

  /** HU11 — ativar/desativar (desativar não apaga: mantém o histórico de pedidos). */
  definirAtivo(usuario, id, ativo) {
    exigir(usuario, 'gerenciar_produtos');
    this.buscarPorId(id);
    this.banco.executar('UPDATE produto SET ativo = ? WHERE id = ?', [ativo ? 1 : 0, Number(id)]);
    return this.buscarPorId(id);
  }
}
