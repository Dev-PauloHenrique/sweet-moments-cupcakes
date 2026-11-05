// Funções que só formatam coisas pra mostrar (não mexem na tela), por isso dá pra testar no Node.
import { FORMAS_PAGAMENTO } from '../servicos/pagamento.js';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const formatarMoeda = (centavos) => moeda.format((Number(centavos) || 0) / 100);
export const formatarDataHora = (iso) => (iso ? dataHora.format(new Date(iso)) : '');
export const formatarNumeroPedido = (id) => `#${String(id).padStart(5, '0')}`;
export const centavosParaCampo = (centavos) => (Number(centavos) / 100).toFixed(2).replace('.', ',');

export const ROTULOS_STATUS = {
  RECEBIDO: 'Recebido',
  EM_PREPARACAO: 'Em preparação',
  PRONTO: 'Pronto',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};
export const ROTULOS_ENTREGA = { ENTREGA: 'Entrega', RETIRADA: 'Retirada na loja' };
export const ROTULOS_PAGAMENTO_STATUS = { PENDENTE: 'Pendente', APROVADO: 'Aprovado (simulado)', RECUSADO: 'Recusado' };
export const rotuloFormaPagamento = (forma) => FORMAS_PAGAMENTO[forma] ?? forma;

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escapa texto antes de inseri-lo em HTML (proteção contra XSS). */
export const escaparHtml = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);

/** Permite redirecionar apenas para páginas internas conhecidas (evita open redirect). */
const PAGINAS_INTERNAS = ['index.html', 'cardapio.html', 'carrinho.html', 'checkout.html', 'pedidos.html', 'painel.html'];
export function destinoSeguro(valor, padrao = 'index.html') {
  const pagina = String(valor ?? '').split(/[?#]/)[0];
  return PAGINAS_INTERNAS.includes(pagina) ? pagina : padrao;
}
