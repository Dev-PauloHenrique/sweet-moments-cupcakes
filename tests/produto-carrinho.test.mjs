import { test } from 'node:test';
import assert from 'node:assert/strict';
import { novoBanco, criarEquipe } from './auxiliar.mjs';
import { UsuarioModel } from '../app/js/models/usuario.js';
import { ProdutoModel, reaisParaCentavos, IMAGENS_DISPONIVEIS } from '../app/js/models/produto.js';
import { Carrinho } from '../app/js/models/carrinho.js';
import { criarArmazenamentoMemoria } from '../app/js/servicos/armazenamento.js';
import { ErroAutorizacao, ErroAutenticacao, ErroNaoEncontrado, ErroValidacao } from '../app/js/servicos/erros.js';

const novoProduto = {
  nome: 'Café com Canela', descricao: 'Massa de café com cobertura de canela.', preco: '15,90', categoriaId: 3, imagem: IMAGENS_DISPONIVEIS[0],
};

test('converte preços em reais para centavos', () => {
  assert.equal(reaisParaCentavos('12,90'), 1290);
  assert.equal(reaisParaCentavos('R$ 7.5'), 750);
  assert.equal(reaisParaCentavos(14), 1400);
  assert.ok(Number.isNaN(reaisParaCentavos('abc')));
  assert.ok(Number.isNaN(reaisParaCentavos('-3')));
});

test('HU01: catálogo traz nome, descrição, preço, imagem e disponibilidade', async () => {
  const produtos = new ProdutoModel(await novoBanco());
  const lista = produtos.listar();
  assert.equal(lista.length, 9);
  for (const p of lista) {
    assert.ok(p.nome && p.descricao && p.imagem && p.precoCentavos > 0);
    assert.equal(typeof p.ativo, 'boolean');
  }
  assert.equal(produtos.listar({ somenteAtivos: true }).length, 8);
  assert.ok(produtos.listar({ categoriaId: 1 }).every((p) => p.categoriaId === 1));
});

test('HU02: produto inexistente gera erro "não encontrado"', async () => {
  const produtos = new ProdutoModel(await novoBanco());
  assert.throws(() => produtos.buscarPorId(999), ErroNaoEncontrado);
});

test('HU11/RN09: somente administrador gerencia produtos', async () => {
  const banco = await novoBanco();
  const equipe = await criarEquipe(new UsuarioModel(banco));
  const produtos = new ProdutoModel(banco);
  assert.throws(() => produtos.criar(null, novoProduto), ErroAutenticacao);
  assert.throws(() => produtos.criar(equipe.cliente, novoProduto), ErroAutorizacao);
  assert.throws(() => produtos.criar(equipe.atendente, novoProduto), ErroAutorizacao);
  assert.throws(() => produtos.criar(equipe.gestor, novoProduto), ErroAutorizacao);

  const criado = produtos.criar(equipe.admin, { ...novoProduto, ativo: 0, id: 1 }); // campos extras ignorados
  assert.equal(criado.precoCentavos, 1590);
  assert.equal(criado.ativo, true);
  assert.notEqual(criado.id, 1);

  const editado = produtos.atualizar(equipe.admin, criado.id, { ...novoProduto, preco: '16,50' });
  assert.equal(editado.precoCentavos, 1650);
  assert.equal(produtos.definirAtivo(equipe.admin, criado.id, false).ativo, false);
});

test('HU11: valida dados do produto e nome único', async () => {
  const banco = await novoBanco();
  const { admin } = await criarEquipe(new UsuarioModel(banco));
  const produtos = new ProdutoModel(banco);
  assert.throws(
    () => produtos.criar(admin, { nome: 'X', descricao: 'curta', preco: '0', categoriaId: 99, imagem: '../../etc/passwd' }),
    (e) => e instanceof ErroValidacao && ['nome', 'descricao', 'preco', 'categoriaId', 'imagem'].every((c) => c in e.campos),
  );
  assert.throws(() => produtos.criar(admin, { ...novoProduto, nome: 'chocolate belga' }), ErroValidacao);
});

test('HU05/HU06: carrinho adiciona, altera, remove e recalcula o total', async () => {
  const produtos = new ProdutoModel(await novoBanco());
  const carrinho = new Carrinho(criarArmazenamentoMemoria(), produtos);
  carrinho.adicionar(1, 2); // 2 x 12,90
  carrinho.adicionar(2); // 1 x 13,90
  carrinho.adicionar(1, 1); // soma no mesmo item
  let r = carrinho.resumo();
  assert.equal(r.itens.length, 2);
  assert.equal(r.quantidade, 4);
  assert.equal(r.totalCentavos, 3 * 1290 + 1390);

  r = carrinho.alterarQuantidade(2, 5);
  assert.equal(r.totalCentavos, 3 * 1290 + 5 * 1390);
  r = carrinho.remover(1);
  assert.equal(r.itens.length, 1);
  assert.equal(r.totalCentavos, 5 * 1390);
});

test('HU05/RN01: impede quantidade inválida e produto indisponível', async () => {
  const produtos = new ProdutoModel(await novoBanco());
  const carrinho = new Carrinho(criarArmazenamentoMemoria(), produtos);
  for (const q of [0, -1, 1.5, 21, 'abc']) assert.throws(() => carrinho.adicionar(1, q), ErroValidacao);
  const indisponivel = produtos.listar().find((p) => !p.ativo);
  assert.throws(() => carrinho.adicionar(indisponivel.id), /indisponível/);
  assert.throws(() => carrinho.adicionar(999), ErroNaoEncontrado);
});

test('carrinho ignora dados corrompidos no armazenamento', async () => {
  const produtos = new ProdutoModel(await novoBanco());
  const armazenamento = criarArmazenamentoMemoria();
  armazenamento.gravar('smc:carrinho', '{isto não é json');
  assert.equal(new Carrinho(armazenamento, produtos).resumo().itens.length, 0);
  armazenamento.gravar('smc:carrinho', JSON.stringify([{ produtoId: 1, quantidade: 999 }, { produtoId: 2, quantidade: 1 }]));
  assert.equal(new Carrinho(armazenamento, produtos).resumo().itens.length, 1);
});

test('v1.1 (relato 1): pesquisa por nome/descrição ignora maiúsculas e acentos', async () => {
  const produtos = new ProdutoModel(await novoBanco());
  assert.deepEqual(produtos.listar({ busca: 'LIMAO' }).map((p) => p.nome), ['Limão Siciliano']);
  assert.ok(produtos.listar({ busca: 'chocolate' }).length >= 3);
  assert.equal(produtos.listar({ busca: 'chocolate', categoriaId: 2 }).length, 1);
  assert.equal(produtos.listar({ busca: 'abacaxi' }).length, 0);
  assert.equal(produtos.listar({ busca: "' OR 1=1 --" }).length, 0);
  assert.equal(produtos.listar({ busca: '   ' }).length, 9);
});
