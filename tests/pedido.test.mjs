import { test } from 'node:test';
import assert from 'node:assert/strict';
import { novoBanco, criarEquipe, ENDERECO_VALIDO } from './auxiliar.mjs';
import { UsuarioModel } from '../app/js/models/usuario.js';
import { ProdutoModel, IMAGENS_DISPONIVEIS } from '../app/js/models/produto.js';
import { PedidoModel, TAXA_ENTREGA_CENTAVOS } from '../app/js/models/pedido.js';
import { simularPagamento } from '../app/js/servicos/pagamento.js';
import { ErroAutenticacao, ErroAutorizacao, ErroNaoEncontrado, ErroValidacao } from '../app/js/servicos/erros.js';

async function cenario() {
  const banco = await novoBanco();
  const equipe = await criarEquipe(new UsuarioModel(banco));
  return { banco, equipe, pedidos: new PedidoModel(banco), produtos: new ProdutoModel(banco) };
}

const retirada = (itens = [{ produtoId: 1, quantidade: 2 }]) => ({ itens, tipoEntrega: 'RETIRADA', formaPagamento: 'PIX' });

test('pagamento é apenas simulado (RN11)', () => {
  assert.deepEqual(simularPagamento('PIX', 1000), { aprovado: true, status: 'APROVADO' });
  assert.equal(simularPagamento('DINHEIRO', 1000).status, 'PENDENTE');
  assert.equal(simularPagamento('BOLETO', 1000).aprovado, false);
});

test('HU09: cria pedido de retirada com total calculado pelo banco (RN04)', async () => {
  const { pedidos, equipe } = await cenario();
  const p = pedidos.criar(equipe.cliente, retirada([{ produtoId: 1, quantidade: 2 }, { produtoId: 2, quantidade: 1 }]));
  assert.ok(p.id > 0);
  assert.equal(p.status, 'RECEBIDO');
  assert.equal(p.subtotalCentavos, 2 * 1290 + 1390);
  assert.equal(p.taxaEntregaCentavos, 0);
  assert.equal(p.totalCentavos, p.subtotalCentavos);
  assert.equal(p.itens.length, 2);
  assert.deepEqual(p.pagamento, { forma: 'PIX', status: 'APROVADO' });
  assert.equal(p.historico[0].status, 'RECEBIDO');
});

test('HU07/RN06: entrega exige endereço válido e soma a taxa', async () => {
  const { pedidos, equipe } = await cenario();
  const base = { itens: [{ produtoId: 1, quantidade: 1 }], tipoEntrega: 'ENTREGA', formaPagamento: 'CARTAO' };
  assert.throws(() => pedidos.criar(equipe.cliente, base), (e) => e instanceof ErroValidacao && 'cep' in e.campos);
  assert.throws(
    () => pedidos.criar(equipe.cliente, { ...base, endereco: { ...ENDERECO_VALIDO, uf: 'XX', cep: '123' } }),
    (e) => 'uf' in e.campos && 'cep' in e.campos,
  );
  const p = pedidos.criar(equipe.cliente, { ...base, endereco: ENDERECO_VALIDO });
  assert.equal(p.totalCentavos, 1290 + TAXA_ENTREGA_CENTAVOS);
  assert.equal(p.endereco.cep, '01310100');
  assert.equal(p.pagamento.status, 'PENDENTE');
});

test('RN02/RN03/RN05: exige login, itens e modalidade de recebimento', async () => {
  const { pedidos, equipe } = await cenario();
  assert.throws(() => pedidos.criar(null, retirada()), ErroAutenticacao);
  assert.throws(() => pedidos.criar(equipe.atendente, retirada()), ErroAutorizacao);
  assert.throws(() => pedidos.criar(equipe.cliente, retirada([])), /vazio/);
  assert.throws(() => pedidos.criar(equipe.cliente, { ...retirada(), tipoEntrega: 'DRONE' }), ErroValidacao);
  assert.throws(() => pedidos.criar(equipe.cliente, { ...retirada(), formaPagamento: 'BOLETO' }), ErroValidacao);
  assert.throws(() => pedidos.criar(equipe.cliente, retirada([{ produtoId: 1, quantidade: 0 }])), ErroValidacao);
  assert.throws(() => pedidos.criar(equipe.cliente, retirada([{ produtoId: 9, quantidade: 1 }])), /indisponível/);
});

test('transação: falha no meio não deixa pedido pela metade', async () => {
  const { banco, pedidos, equipe } = await cenario();
  const antes = banco.consultarUm('SELECT COUNT(*) AS n FROM pedido').n;
  assert.throws(() => pedidos.criar(equipe.cliente, retirada([{ produtoId: 1, quantidade: 1 }, { produtoId: 1, quantidade: 1 }])));
  assert.equal(banco.consultarUm('SELECT COUNT(*) AS n FROM pedido').n, antes);
});

test('RN12: mudar o preço do produto não altera pedidos já registrados', async () => {
  const { pedidos, produtos, equipe } = await cenario();
  const p = pedidos.criar(equipe.cliente, retirada([{ produtoId: 1, quantidade: 1 }]));
  const atual = produtos.buscarPorId(1);
  produtos.atualizar(equipe.admin, 1, {
    nome: atual.nome, descricao: atual.descricao, preco: '99,00', categoriaId: atual.categoriaId, imagem: IMAGENS_DISPONIVEIS[0],
  });
  const depois = pedidos.detalhar(equipe.cliente, p.id);
  assert.equal(depois.totalCentavos, 1290);
  assert.equal(depois.itens[0].precoCentavos, 1290);
});

test('HU10/RN08: cliente vê apenas os próprios pedidos', async () => {
  const { pedidos, equipe } = await cenario();
  const meu = pedidos.criar(equipe.cliente, retirada());
  pedidos.criar(equipe.outroCliente, retirada());
  assert.equal(pedidos.listarDoCliente(equipe.cliente).length, 1);
  assert.throws(() => pedidos.detalhar(equipe.outroCliente, meu.id), ErroNaoEncontrado);
  assert.throws(() => pedidos.listarTodos(equipe.cliente), ErroAutorizacao);
  assert.equal(pedidos.detalhar(equipe.atendente, meu.id).id, meu.id);
});

test('HU12/RN10: equipe autorizada atualiza status seguindo as etapas', async () => {
  const { pedidos, equipe } = await cenario();
  const p = pedidos.criar(equipe.cliente, { ...retirada(), formaPagamento: 'DINHEIRO' });
  assert.throws(() => pedidos.atualizarStatus(equipe.cliente, p.id, 'EM_PREPARACAO'), ErroAutorizacao);
  assert.throws(() => pedidos.atualizarStatus(equipe.gestor, p.id, 'EM_PREPARACAO'), ErroAutorizacao);
  assert.throws(() => pedidos.atualizarStatus(equipe.atendente, p.id, 'CONCLUIDO'), /não permitida/);

  pedidos.atualizarStatus(equipe.atendente, p.id, 'EM_PREPARACAO');
  const pronto = pedidos.atualizarStatus(equipe.admin, p.id, 'PRONTO');
  assert.deepEqual(pronto.proximosStatus, ['CONCLUIDO']); // retirada não "sai para entrega"
  const concluido = pedidos.atualizarStatus(equipe.atendente, p.id, 'CONCLUIDO');
  assert.equal(concluido.historico.length, 4);
  assert.equal(concluido.pagamento.status, 'APROVADO');
  assert.deepEqual(concluido.proximosStatus, []);
});

test('HU13: resumo comercial por período ignora cancelados no faturamento', async () => {
  let agora = new Date('2026-10-10T15:00:00Z');
  const banco = await novoBanco({ relogio: () => agora });
  const equipe = await criarEquipe(new UsuarioModel(banco));
  const pedidos = new PedidoModel(banco);
  pedidos.criar(equipe.cliente, retirada([{ produtoId: 2, quantidade: 2 }])); // 27,80
  agora = new Date('2026-11-03T15:00:00Z');
  pedidos.criar(equipe.cliente, retirada([{ produtoId: 1, quantidade: 1 }])); // 12,90
  const cancelado = pedidos.criar(equipe.cliente, retirada([{ produtoId: 7, quantidade: 3 }]));
  pedidos.atualizarStatus(equipe.atendente, cancelado.id, 'CANCELADO');

  assert.throws(() => pedidos.resumo(equipe.atendente), ErroAutorizacao);
  const total = pedidos.resumo(equipe.gestor);
  assert.equal(total.pedidos, 3);
  assert.equal(total.cancelados, 1);
  assert.equal(total.faturamentoCentavos, 2780 + 1290);
  assert.equal(total.ticketMedioCentavos, Math.round((2780 + 1290) / 2));
  assert.equal(total.maisVendidos[0].nome, 'Chocolate Belga');

  const novembro = pedidos.resumo(equipe.admin, { de: '2026-11-01', ate: '2026-11-30' });
  assert.equal(novembro.pedidos, 2);
  assert.equal(novembro.faturamentoCentavos, 1290);
  assert.throws(() => pedidos.resumo(equipe.gestor, { de: '2026-12-01', ate: '2026-11-01' }), ErroValidacao);
  assert.throws(() => pedidos.resumo(equipe.gestor, { de: "2026-01-01' OR 1=1 --" }), ErroValidacao);
});

test('carga de demonstração cria contas de todos os perfis e pedidos de exemplo', async () => {
  const banco = await novoBanco({ comDemonstracao: true });
  const perfis = banco.consultar('SELECT perfil FROM usuario ORDER BY id').map((l) => l.perfil);
  assert.deepEqual(perfis, ['CLIENTE', 'ATENDENTE', 'ADMINISTRADOR', 'GESTOR']);
  assert.equal(banco.consultarUm('SELECT COUNT(*) AS n FROM pedido').n, 2);
  assert.equal(banco.versao(), 1);
});
