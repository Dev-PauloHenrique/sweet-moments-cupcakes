import { $, avisar, renderizarEstado } from '../views/componentes.js';
import { escaparHtml as e, formatarMoeda } from '../views/formatadores.js';
import { QUANTIDADE_MAXIMA } from '../models/carrinho.js';
import { mensagemSegura } from '../servicos/erros.js';

/** HU06 — visualizar e modificar o carrinho. */
export function iniciar(ctx) {
  const alvo = $('[data-carrinho]');

  function renderizar() {
    const { itens, totalCentavos, quantidade } = ctx.carrinho.resumo();
    ctx.atualizarCabecalho();
    if (!itens.length) {
      renderizarEstado(alvo, {
        titulo: 'Seu carrinho está vazio',
        mensagem: 'Escolha seus sabores favoritos no cardápio.',
        acao: { href: 'cardapio.html', rotulo: 'Ver cardápio' },
      });
      return;
    }
    const indisponiveis = itens.some((i) => !i.disponivel);
    alvo.innerHTML = `<div class="layout-compra">
      <section aria-labelledby="titulo-itens">
        <h2 id="titulo-itens" class="visualmente-oculto">Itens do carrinho</h2>
        ${indisponiveis ? '<p class="alerta alerta--aviso">Há itens indisponíveis no carrinho. Remova-os para finalizar.</p>' : ''}
        <ul class="lista-itens">
          ${itens.map((i) => `<li class="item">
            <img src="${e(i.imagem)}" alt="" width="80" height="80">
            <div>
              <h3>${e(i.nome)}</h3>
              <p class="texto-apoio">${formatarMoeda(i.precoCentavos)} cada${i.disponivel ? '' : ' — <strong>indisponível</strong>'}</p>
              <div class="item__controles">
                <div class="passo-qtd" role="group" aria-label="Quantidade de ${e(i.nome)}">
                  <button type="button" data-diminuir="${i.produtoId}" aria-label="Diminuir quantidade" ${i.quantidade <= 1 ? 'disabled' : ''}>−</button>
                  <output aria-live="polite">${i.quantidade}</output>
                  <button type="button" data-aumentar="${i.produtoId}" aria-label="Aumentar quantidade" ${i.quantidade >= QUANTIDADE_MAXIMA ? 'disabled' : ''}>+</button>
                </div>
                <button type="button" class="link-botao" data-remover="${i.produtoId}">Remover<span class="visualmente-oculto"> ${e(i.nome)}</span></button>
              </div>
            </div>
            <div class="item__total">${formatarMoeda(i.subtotalCentavos)}</div>
          </li>`).join('')}
        </ul>
      </section>
      <aside class="resumo" aria-labelledby="titulo-resumo">
        <h2 id="titulo-resumo">Resumo</h2>
        <dl>
          <dt>Itens</dt><dd>${quantidade}</dd>
          <dt class="total">Subtotal</dt><dd class="total">${formatarMoeda(totalCentavos)}</dd>
        </dl>
        <p class="texto-apoio">Taxa de entrega calculada no próximo passo.</p>
        ${indisponiveis
    ? '<button type="button" class="botao botao--largo" disabled>Finalizar pedido</button>'
    : '<a class="botao botao--largo" href="checkout.html">Finalizar pedido</a>'}
        <p><a href="cardapio.html">Continuar comprando</a></p>
      </aside>
    </div>`;
  }

  alvo.addEventListener('click', (evento) => {
    const b = evento.target.closest('button');
    if (!b) return;
    try {
      const atual = ctx.carrinho.resumo().itens;
      const qtd = (id) => atual.find((i) => i.produtoId === Number(id))?.quantidade ?? 0;
      if (b.dataset.aumentar) ctx.carrinho.alterarQuantidade(b.dataset.aumentar, qtd(b.dataset.aumentar) + 1);
      else if (b.dataset.diminuir) ctx.carrinho.alterarQuantidade(b.dataset.diminuir, qtd(b.dataset.diminuir) - 1);
      else if (b.dataset.remover) { ctx.carrinho.remover(b.dataset.remover); avisar('Item removido do carrinho.'); }
      else return;
      renderizar();
    } catch (erro) {
      avisar(mensagemSegura(erro), 'erro');
    }
  });

  renderizar();
}
