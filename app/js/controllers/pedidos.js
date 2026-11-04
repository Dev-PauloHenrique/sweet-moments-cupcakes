import { $, renderizarEstado, seloStatus } from '../views/componentes.js';
import {
  escaparHtml as e, formatarDataHora, formatarMoeda, formatarNumeroPedido, ROTULOS_ENTREGA,
} from '../views/formatadores.js';
import { detalhePedidoHtml } from '../views/pedido-detalhe.js';
import { exigirLoginPagina } from './comum.js';

/** HU10 — histórico e acompanhamento dos pedidos do cliente. */
export function iniciar(ctx) {
  if (!exigirLoginPagina(ctx, 'pedidos.html')) return;
  const lista = $('[data-lista-pedidos]');
  const detalhe = $('[data-detalhe-pedido]');
  const id = Number(new URLSearchParams(window.location.search).get('id'));

  if (id) {
    try {
      const p = ctx.pedidos.detalhar(ctx.usuario, id);
      detalhe.hidden = false;
      detalhe.innerHTML = `<h2>Detalhes do pedido</h2>${detalhePedidoHtml(p)}`;
    } catch {
      detalhe.hidden = false;
      detalhe.innerHTML = '<p class="alerta alerta--erro">Pedido não encontrado.</p>';
    }
  }

  const pedidos = ctx.pedidos.listarDoCliente(ctx.usuario);
  if (!pedidos.length) {
    renderizarEstado(lista, {
      titulo: 'Você ainda não fez pedidos',
      mensagem: 'Quando fizer um pedido, ele aparecerá aqui com o status atualizado.',
      acao: { href: 'cardapio.html', rotulo: 'Fazer meu primeiro pedido' },
    });
    return;
  }
  lista.innerHTML = `<div class="tabela-wrap"><table>
    <caption class="visualmente-oculto">Seus pedidos</caption>
    <thead><tr><th>Pedido</th><th>Data</th><th>Recebimento</th><th class="numero">Itens</th><th class="numero">Total</th><th>Status</th></tr></thead>
    <tbody>${pedidos.map((p) => `<tr>
      <td><a href="pedidos.html?id=${p.id}" ${p.id === id ? 'aria-current="true"' : ''}>${formatarNumeroPedido(p.id)}</a></td>
      <td>${formatarDataHora(p.data)}</td><td>${e(ROTULOS_ENTREGA[p.tipoEntrega])}</td>
      <td class="numero">${p.itens}</td><td class="numero">${formatarMoeda(p.totalCentavos)}</td><td>${seloStatus(p.status)}</td>
    </tr>`).join('')}</tbody></table></div>`;
}
