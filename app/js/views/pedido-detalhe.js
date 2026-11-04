import { seloStatus } from './componentes.js';
import {
  escaparHtml as e, formatarDataHora, formatarMoeda, formatarNumeroPedido, rotuloFormaPagamento,
  ROTULOS_ENTREGA, ROTULOS_PAGAMENTO_STATUS, ROTULOS_STATUS,
} from './formatadores.js';

/** HTML do detalhe de um pedido (usado pelo cliente e pela equipe). */
export function detalhePedidoHtml(p, { mostrarCliente = false } = {}) {
  const end = p.endereco;
  return `<div class="layout-compra">
    <div>
      <h3>Itens</h3>
      <div class="tabela-wrap"><table>
        <thead><tr><th>Produto</th><th class="numero">Qtd.</th><th class="numero">Preço</th><th class="numero">Subtotal</th></tr></thead>
        <tbody>${p.itens.map((i) => `<tr><td>${e(i.nome)}</td><td class="numero">${i.quantidade}</td>
          <td class="numero">${formatarMoeda(i.precoCentavos)}</td><td class="numero">${formatarMoeda(i.subtotalCentavos)}</td></tr>`).join('')}
        </tbody></table></div>
      ${p.observacao ? `<p><strong>Observações:</strong> ${e(p.observacao)}</p>` : ''}
      <h3>Acompanhamento</h3>
      <ol class="linha-tempo">${p.historico.map((h) => `<li><div><strong>${e(ROTULOS_STATUS[h.status] ?? h.status)}</strong>
        <time datetime="${e(h.data)}">${formatarDataHora(h.data)}</time></div></li>`).join('')}</ol>
    </div>
    <aside class="resumo">
      <h2>Pedido ${formatarNumeroPedido(p.id)}</h2>
      <p>${seloStatus(p.status)}</p>
      <dl>
        ${mostrarCliente ? `<dt>Cliente</dt><dd>${e(p.cliente)}</dd>` : ''}
        <dt>Data</dt><dd>${formatarDataHora(p.data)}</dd>
        <dt>Recebimento</dt><dd>${e(ROTULOS_ENTREGA[p.tipoEntrega])}</dd>
        <dt>Pagamento</dt><dd>${e(rotuloFormaPagamento(p.pagamento.forma))}<br><small>${e(ROTULOS_PAGAMENTO_STATUS[p.pagamento.status] ?? '')}</small></dd>
        <dt>Subtotal</dt><dd>${formatarMoeda(p.subtotalCentavos)}</dd>
        <dt>Entrega</dt><dd>${formatarMoeda(p.taxaEntregaCentavos)}</dd>
        <dt class="total">Total</dt><dd class="total">${formatarMoeda(p.totalCentavos)}</dd>
      </dl>
      ${end ? `<p class="texto-apoio"><strong>Entregar em:</strong><br>${e(end.logradouro)}, ${e(end.numero)}${end.complemento ? ` — ${e(end.complemento)}` : ''}<br>
        ${e(end.bairro)} — ${e(end.cidade)}/${e(end.uf)}<br>CEP ${e(end.cep.replace(/(\d{5})(\d{3})/, '$1-$2'))}</p>` : ''}
    </aside>
  </div>`;
}
