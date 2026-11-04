import { lerJson } from '../servicos/armazenamento.js';
import { ErroValidacao } from '../servicos/erros.js';

const CHAVE = 'smc:carrinho';
export const QUANTIDADE_MAXIMA = 20;

/**
 * Carrinho de compras (HU05/HU06). Fica no armazenamento do navegador,
 * por isso sobrevive a uma atualização da página. Os preços NÃO são
 * guardados aqui: são sempre lidos do banco no momento de exibir/finalizar.
 */
export class Carrinho {
  constructor(armazenamento, produtos) {
    this.armazenamento = armazenamento;
    this.produtos = produtos; // ProdutoModel
  }

  #ler() {
    const itens = lerJson(this.armazenamento, CHAVE, []);
    if (!Array.isArray(itens)) return [];
    return itens.filter((i) => Number.isInteger(i?.produtoId)
      && Number.isInteger(i?.quantidade) && i.quantidade >= 1 && i.quantidade <= QUANTIDADE_MAXIMA);
  }

  #gravar(itens) {
    this.armazenamento.gravar(CHAVE, JSON.stringify(itens));
  }

  static validarQuantidade(quantidade) {
    const q = Number(quantidade);
    if (!Number.isInteger(q) || q < 1 || q > QUANTIDADE_MAXIMA) {
      throw new ErroValidacao(`A quantidade deve ser de 1 a ${QUANTIDADE_MAXIMA}.`);
    }
    return q;
  }

  /** RN01: somente produtos cadastrados e disponíveis. */
  adicionar(produtoId, quantidade = 1) {
    const q = Carrinho.validarQuantidade(quantidade);
    const produto = this.produtos.buscarPorId(produtoId);
    if (!produto.ativo) throw new ErroValidacao('Este produto está indisponível no momento.');
    const itens = this.#ler();
    const item = itens.find((i) => i.produtoId === produto.id);
    if (item) {
      item.quantidade = Carrinho.validarQuantidade(Math.min(item.quantidade + q, QUANTIDADE_MAXIMA));
    } else {
      itens.push({ produtoId: produto.id, quantidade: q });
    }
    this.#gravar(itens);
    return this.resumo();
  }

  alterarQuantidade(produtoId, quantidade) {
    const q = Carrinho.validarQuantidade(quantidade);
    const itens = this.#ler();
    const item = itens.find((i) => i.produtoId === Number(produtoId));
    if (!item) throw new ErroValidacao('Item não encontrado no carrinho.');
    item.quantidade = q;
    this.#gravar(itens);
    return this.resumo();
  }

  remover(produtoId) {
    this.#gravar(this.#ler().filter((i) => i.produtoId !== Number(produtoId)));
    return this.resumo();
  }

  limpar() {
    this.#gravar([]);
  }

  quantidadeTotal() {
    return this.#ler().reduce((soma, i) => soma + i.quantidade, 0);
  }

  /** Itens com dados atuais do banco; itens de produtos removidos/indisponíveis são sinalizados. */
  resumo() {
    const itens = [];
    for (const { produtoId, quantidade } of this.#ler()) {
      let produto;
      try { produto = this.produtos.buscarPorId(produtoId); } catch { continue; }
      itens.push({
        produtoId,
        quantidade,
        nome: produto.nome,
        imagem: produto.imagem,
        precoCentavos: produto.precoCentavos,
        disponivel: produto.ativo,
        subtotalCentavos: produto.precoCentavos * quantidade,
      });
    }
    const totalCentavos = itens.filter((i) => i.disponivel).reduce((s, i) => s + i.subtotalCentavos, 0);
    return { itens, totalCentavos, quantidade: itens.reduce((s, i) => s + i.quantidade, 0) };
  }

  /** Formato esperado por PedidoModel.criar. */
  itensParaPedido() {
    return this.#ler().map(({ produtoId, quantidade }) => ({ produtoId, quantidade }));
  }
}
