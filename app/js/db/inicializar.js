import { BancoDeDados } from './banco.js';
import { UsuarioModel } from '../models/usuario.js';
import { PedidoModel } from '../models/pedido.js';

export const VERSAO_ESQUEMA = 2;

/**
 * Contas de demonstração, uma de cada perfil, pra quem for avaliar conseguir
 * testar tudo. Elas só existem no navegador de quem abre o site.
 */
export const SENHA_DEMO = 'Cupcake2026';
export const CONTAS_DEMO = [
  { nome: 'Cliente Demonstração', email: 'cliente@sweetmoments.test', perfil: 'CLIENTE', telefone: '11987654321' },
  { nome: 'Atendente Demonstração', email: 'atendente@sweetmoments.test', perfil: 'ATENDENTE' },
  { nome: 'Administrador Demonstração', email: 'admin@sweetmoments.test', perfil: 'ADMINISTRADOR' },
  { nome: 'Gestor Demonstração', email: 'gestor@sweetmoments.test', perfil: 'GESTOR' },
];

/**
 * Abre o banco salvo ou cria um novo a partir do schema.sql + dados iniciais.
 * @param {object} p
 * @param {object} p.SQL módulo sql.js já inicializado
 * @param {string} p.schemaSql conteúdo de db/schema.sql
 * @param {string} p.dadosIniciaisSql conteúdo de db/dados-iniciais.sql
 * @param {Uint8Array|null} [p.dadosSalvos] banco exportado anteriormente
 * @param {boolean} [p.comDemonstracao] cria contas e pedidos de exemplo
 */
export async function criarBanco({
  SQL, schemaSql, dadosIniciaisSql, dadosSalvos = null, aoAlterar, relogio, comDemonstracao = true,
}) {
  if (dadosSalvos) {
    try {
      const banco = new BancoDeDados(new SQL.Database(dadosSalvos), { aoAlterar, relogio });
      if (banco.versao() === VERSAO_ESQUEMA) return banco;
    } catch {
      // banco salvo corrompido ou incompatível: recria abaixo
    }
  }
  const db = new SQL.Database();
  db.exec(schemaSql);
  db.exec(dadosIniciaisSql);
  const banco = new BancoDeDados(db, { relogio });
  if (comDemonstracao) await popularDemonstracao(banco);
  if (aoAlterar) {
    banco.aoAlterar = aoAlterar;
    aoAlterar(banco);
  }
  return banco;
}

async function popularDemonstracao(banco) {
  const usuarios = new UsuarioModel(banco);
  const contas = {};
  for (const conta of CONTAS_DEMO) {
    contas[conta.perfil] = await usuarios.criarComPerfil({ ...conta, senha: SENHA_DEMO }, conta.perfil);
  }
  const pedidos = new PedidoModel(banco);
  const primeiro = pedidos.criar(contas.CLIENTE, {
    itens: [{ produtoId: 2, quantidade: 4 }, { produtoId: 4, quantidade: 2 }],
    tipoEntrega: 'RETIRADA',
    formaPagamento: 'PIX',
  });
  for (const status of ['EM_PREPARACAO', 'PRONTO', 'CONCLUIDO']) {
    pedidos.atualizarStatus(contas.ATENDENTE, primeiro.id, status);
  }
  const segundo = pedidos.criar(contas.CLIENTE, {
    itens: [{ produtoId: 3, quantidade: 6 }],
    tipoEntrega: 'ENTREGA',
    formaPagamento: 'CARTAO',
    endereco: {
      cep: '01310100', logradouro: 'Avenida Exemplo', numero: '100',
      bairro: 'Centro', cidade: 'São Paulo', uf: 'SP',
    },
  });
  pedidos.atualizarStatus(contas.ATENDENTE, segundo.id, 'EM_PREPARACAO');
}
