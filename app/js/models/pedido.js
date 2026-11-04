import { exigir, exigirLogin, pode } from './permissoes.js';
import { FORMAS_PAGAMENTO, simularPagamento } from '../servicos/pagamento.js';
import { ErroNaoEncontrado, ErroValidacao } from '../servicos/erros.js';
import { Carrinho } from './carrinho.js';

export const TAXA_ENTREGA_CENTAVOS = 800; // valor fictício de demonstração

export const STATUS = ['RECEBIDO', 'EM_PREPARACAO', 'PRONTO', 'SAIU_PARA_ENTREGA', 'CONCLUIDO', 'CANCELADO'];

/** Etapas permitidas a partir de cada status (HU12). */
const TRANSICOES = {
  RECEBIDO: ['EM_PREPARACAO', 'CANCELADO'],
  EM_PREPARACAO: ['PRONTO', 'CANCELADO'],
  PRONTO: ['SAIU_PARA_ENTREGA', 'CONCLUIDO'],
  SAIU_PARA_ENTREGA: ['CONCLUIDO'],
  CONCLUIDO: [],
  CANCELADO: [],
};

export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const texto = (v, max) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

/** RN06 — endereço válido para entrega. */
export function validarEndereco(entrada = {}) {
  const endereco = {
    cep: String(entrada.cep ?? '').replace(/\D/g, ''),
    logradouro: texto(entrada.logradouro, 120),
    numero: texto(entrada.numero, 10),
    complemento: texto(entrada.complemento, 60) || null,
    bairro: texto(entrada.bairro, 60),
    cidade: texto(entrada.cidade, 60),
    uf: String(entrada.uf ?? '').trim().toUpperCase(),
  };
  const erros = {};
  if (endereco.cep.length !== 8) erros.cep = 'Informe um CEP com 8 dígitos.';
  if (endereco.logradouro.length < 3) erros.logradouro = 'Informe a rua/avenida.';
  if (!endereco.numero) erros.numero = 'Informe o número (ou "s/n").';
  if (endereco.bairro.length < 2) erros.bairro = 'Informe o bairro.';
  if (endereco.cidade.length < 2) erros.cidade = 'Informe a cidade.';
  if (!UFS.includes(endereco.uf)) erros.uf = 'Selecione o estado (UF).';
  if (Object.keys(erros).length) throw new ErroValidacao('Preencha corretamente o endereço de entrega.', erros);
  return endereco;
}

export class PedidoModel {
  constructor(banco) {
    this.banco = banco;
  }

  /** HU09 — finalizar pedido. Tudo é gravado em uma única transação. */
  criar(usuario, { itens = [], tipoEntrega, endereco, formaPagamento, observacao } = {}) {
    exigir(usuario, 'comprar'); // RN02
    if (!Array.isArray(itens) || itens.length === 0) {
      throw new ErroValidacao('Seu carrinho está vazio.'); // RN03
    }
    if (!['ENTREGA', 'RETIRADA'].includes(tipoEntrega)) {
      throw new ErroValidacao('Escolha entrega ou retirada.', { tipoEntrega: 'Escolha entrega ou retirada.' }); // RN05
    }
    if (!Object.hasOwn(FORMAS_PAGAMENTO, formaPagamento)) {
      throw new ErroValidacao('Escolha a forma de pagamento.', { formaPagamento: 'Escolha a forma de pagamento.' });
    }
    const enderecoValido = tipoEntrega === 'ENTREGA' ? validarEndereco(endereco) : null;
    const obs = texto(observacao, 300) || null;

    // RN01 + RN04: preços e disponibilidade vêm do banco, nunca da interface.
    const linhas = [];
    const vistos = new Set();
    for (const item of itens) {
      const produtoId = Number(item?.produtoId);
      if (vistos.has(produtoId)) throw new ErroValidacao('Há itens repetidos no carrinho.');
      vistos.add(produtoId);
      const quantidade = Carrinho.validarQuantidade(item?.quantidade);
      const produto = this.banco.consultarUm(
        'SELECT id, nome, preco_centavos, ativo FROM produto WHERE id = ?', [produtoId],
      );
      if (!produto) throw new ErroValidacao('Um dos produtos do carrinho não existe mais.');
      if (produto.ativo !== 1) throw new ErroValidacao(`"${produto.nome}" está indisponível. Remova-o do carrinho.`);
      linhas.push({ produtoId, quantidade, preco: produto.preco_centavos });
    }
    const subtotal = linhas.reduce((s, l) => s + l.preco * l.quantidade, 0);
    const taxa = tipoEntrega === 'ENTREGA' ? TAXA_ENTREGA_CENTAVOS : 0;
    const total = subtotal + taxa;

    const pagamento = simularPagamento(formaPagamento, total);
    if (!pagamento.aprovado) throw new ErroValidacao(`Pagamento não aprovado: ${pagamento.motivo}`);

    const agora = this.banco.agoraIso();
    const pedidoId = this.banco.transacao(() => {
      let enderecoId = null;
      if (enderecoValido) {
        const e = enderecoValido;
        enderecoId = this.banco.executar(
          `INSERT INTO endereco (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [usuario.id, e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf],
        ).id;
      }
      const { id } = this.banco.executar(
        `INSERT INTO pedido (cliente_id, data_pedido, tipo_entrega, endereco_id, subtotal_centavos,
           taxa_entrega_centavos, valor_total_centavos, status, observacao)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'RECEBIDO', ?)`,
        [usuario.id, agora, tipoEntrega, enderecoId, subtotal, taxa, total, obs],
      );
      for (const l of linhas) {
        this.banco.executar(
          `INSERT INTO item_pedido (pedido_id, produto_id, quantidade, preco_unitario_centavos)
           VALUES (?, ?, ?, ?)`, [id, l.produtoId, l.quantidade, l.preco],
        );
      }
      this.banco.executar(
        `INSERT INTO pagamento (pedido_id, forma, valor_centavos, status, data_pagamento)
         VALUES (?, ?, ?, ?, ?)`, [id, formaPagamento, total, pagamento.status, agora],
      );
      this.banco.executar(
        'INSERT INTO historico_status (pedido_id, status, data, usuario_id) VALUES (?, ?, ?, ?)',
        [id, 'RECEBIDO', agora, usuario.id],
      );
      return id;
    });
    return this.detalhar(usuario, pedidoId);
  }

  /** Último endereço usado pelo cliente, para preencher o checkout. */
  ultimoEndereco(usuario) {
    exigirLogin(usuario);
    return this.banco.consultarUm(
      `SELECT cep, logradouro, numero, complemento, bairro, cidade, uf FROM endereco
       WHERE usuario_id = ? ORDER BY id DESC LIMIT 1`, [usuario.id],
    );
  }

  /** HU10 — histórico do cliente autenticado (RN08). */
  listarDoCliente(usuario) {
    exigirLogin(usuario);
    return this.banco.consultar(
      `SELECT p.id, p.data_pedido AS data, p.status, p.tipo_entrega AS tipoEntrega,
              p.valor_total_centavos AS totalCentavos,
              (SELECT SUM(quantidade) FROM item_pedido WHERE pedido_id = p.id) AS itens
       FROM pedido p WHERE p.cliente_id = ? ORDER BY p.data_pedido DESC, p.id DESC`, [usuario.id],
    );
  }

  /** HU12/HU13 — lista para a equipe, com filtros opcionais. */
  listarTodos(usuario, { status = '', de = '', ate = '' } = {}) {
    exigir(usuario, 'ver_todos_pedidos');
    const filtros = [];
    const parametros = [];
    if (status) {
      if (!STATUS.includes(status)) throw new ErroValidacao('Status inválido.');
      filtros.push('p.status = ?'); parametros.push(status);
    }
    this.#filtroPeriodo(filtros, parametros, de, ate);
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    return this.banco.consultar(
      `SELECT p.id, p.data_pedido AS data, p.status, p.tipo_entrega AS tipoEntrega,
              p.valor_total_centavos AS totalCentavos, u.nome AS cliente,
              (SELECT SUM(quantidade) FROM item_pedido WHERE pedido_id = p.id) AS itens
       FROM pedido p JOIN usuario u ON u.id = p.cliente_id
       ${where} ORDER BY p.data_pedido DESC, p.id DESC`, parametros,
    );
  }

  /** Detalhe do pedido: o dono ou a equipe autorizada (RN08). */
  detalhar(usuario, id) {
    exigirLogin(usuario);
    const p = this.banco.consultarUm(
      `SELECT p.*, u.nome AS cliente_nome, pg.forma AS pagamento_forma, pg.status AS pagamento_status,
              e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf
       FROM pedido p
       JOIN usuario u ON u.id = p.cliente_id
       LEFT JOIN pagamento pg ON pg.pedido_id = p.id
       LEFT JOIN endereco e ON e.id = p.endereco_id
       WHERE p.id = ?`, [Number(id)],
    );
    // Mesma mensagem para "não existe" e "não é seu", para não revelar pedidos de terceiros.
    if (!p || (p.cliente_id !== usuario.id && !pode(usuario, 'ver_todos_pedidos'))) {
      throw new ErroNaoEncontrado('Pedido não encontrado.');
    }
    const itens = this.banco.consultar(
      `SELECT i.produto_id AS produtoId, pr.nome, i.quantidade,
              i.preco_unitario_centavos AS precoCentavos,
              i.quantidade * i.preco_unitario_centavos AS subtotalCentavos
       FROM item_pedido i JOIN produto pr ON pr.id = i.produto_id
       WHERE i.pedido_id = ? ORDER BY i.id`, [p.id],
    );
    const historico = this.banco.consultar(
      'SELECT status, data FROM historico_status WHERE pedido_id = ? ORDER BY id', [p.id],
    );
    return {
      id: p.id,
      data: p.data_pedido,
      status: p.status,
      cliente: p.cliente_nome,
      tipoEntrega: p.tipo_entrega,
      endereco: p.endereco_id ? {
        cep: p.cep, logradouro: p.logradouro, numero: p.numero, complemento: p.complemento,
        bairro: p.bairro, cidade: p.cidade, uf: p.uf,
      } : null,
      subtotalCentavos: p.subtotal_centavos,
      taxaEntregaCentavos: p.taxa_entrega_centavos,
      totalCentavos: p.valor_total_centavos,
      observacao: p.observacao,
      pagamento: { forma: p.pagamento_forma, status: p.pagamento_status },
      itens,
      historico,
      proximosStatus: this.proximosStatus(p.status, p.tipo_entrega),
    };
  }

  proximosStatus(status, tipoEntrega) {
    return (TRANSICOES[status] ?? []).filter((s) => {
      if (s === 'SAIU_PARA_ENTREGA') return tipoEntrega === 'ENTREGA';
      if (status === 'PRONTO' && s === 'CONCLUIDO') return tipoEntrega === 'RETIRADA';
      return true;
    });
  }

  /** HU12 — atualizar status conforme as etapas permitidas (RN10). */
  atualizarStatus(usuario, id, novoStatus) {
    exigir(usuario, 'atualizar_status');
    const pedido = this.banco.consultarUm('SELECT id, status, tipo_entrega FROM pedido WHERE id = ?', [Number(id)]);
    if (!pedido) throw new ErroNaoEncontrado('Pedido não encontrado.');
    if (!this.proximosStatus(pedido.status, pedido.tipo_entrega).includes(novoStatus)) {
      throw new ErroValidacao('Mudança de status não permitida para este pedido.');
    }
    const agora = this.banco.agoraIso();
    this.banco.transacao(() => {
      this.banco.executar('UPDATE pedido SET status = ? WHERE id = ?', [novoStatus, pedido.id]);
      this.banco.executar(
        'INSERT INTO historico_status (pedido_id, status, data, usuario_id) VALUES (?, ?, ?, ?)',
        [pedido.id, novoStatus, agora, usuario.id],
      );
      // pagamento presencial é considerado recebido quando o pedido é concluído
      if (novoStatus === 'CONCLUIDO') {
        this.banco.executar(
          "UPDATE pagamento SET status = 'APROVADO' WHERE pedido_id = ? AND status = 'PENDENTE'", [pedido.id],
        );
      }
    });
    return this.detalhar(usuario, pedido.id);
  }

  /** HU13 — indicadores comerciais por período (pedidos cancelados não entram no faturamento). */
  resumo(usuario, { de = '', ate = '' } = {}) {
    exigir(usuario, 'ver_relatorio');
    const filtros = [];
    const parametros = [];
    this.#filtroPeriodo(filtros, parametros, de, ate);
    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
    const geral = this.banco.consultarUm(
      `SELECT COUNT(*) AS pedidos,
              COALESCE(SUM(CASE WHEN status <> 'CANCELADO' THEN valor_total_centavos END), 0) AS faturamentoCentavos,
              SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) AS cancelados
       FROM pedido p ${where}`, parametros,
    );
    const validos = geral.pedidos - (geral.cancelados ?? 0);
    const porStatus = this.banco.consultar(
      `SELECT status, COUNT(*) AS quantidade FROM pedido p ${where} GROUP BY status ORDER BY quantidade DESC`, parametros,
    );
    const maisVendidos = this.banco.consultar(
      `SELECT pr.nome, SUM(i.quantidade) AS quantidade,
              SUM(i.quantidade * i.preco_unitario_centavos) AS receitaCentavos
       FROM item_pedido i JOIN pedido p ON p.id = i.pedido_id JOIN produto pr ON pr.id = i.produto_id
       ${where ? `${where} AND` : 'WHERE'} p.status <> 'CANCELADO'
       GROUP BY pr.id ORDER BY quantidade DESC, pr.nome LIMIT 5`, parametros,
    );
    return {
      pedidos: geral.pedidos,
      cancelados: geral.cancelados ?? 0,
      faturamentoCentavos: geral.faturamentoCentavos,
      ticketMedioCentavos: validos > 0 ? Math.round(geral.faturamentoCentavos / validos) : 0,
      porStatus,
      maisVendidos,
    };
  }

  /** Datas no formato AAAA-MM-DD, interpretadas no fuso local do navegador. */
  #filtroPeriodo(filtros, parametros, de, ate) {
    const dataValida = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(new Date(`${d}T00:00:00`).getTime());
    if (de) {
      if (!dataValida(de)) throw new ErroValidacao('Data inicial inválida.');
      filtros.push('p.data_pedido >= ?'); parametros.push(new Date(`${de}T00:00:00`).toISOString());
    }
    if (ate) {
      if (!dataValida(ate)) throw new ErroValidacao('Data final inválida.');
      filtros.push('p.data_pedido <= ?'); parametros.push(new Date(`${ate}T23:59:59.999`).toISOString());
    }
    if (de && ate && de > ate) throw new ErroValidacao('A data inicial deve ser anterior à final.');
  }
}

