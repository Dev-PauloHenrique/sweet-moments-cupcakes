import { $, renderizarEstado } from '../views/componentes.js';
import { escaparHtml as e, formatarMoeda } from '../views/formatadores.js';
import { QUANTIDADE_MAXIMA } from '../models/carrinho.js';
import { ligarBotoesAdicionar } from './comum.js';

/** HU02 — detalhes do produto. */
export function iniciar(ctx) {
  const alvo = $('[data-conteudo]');
  const id = Number(new URLSearchParams(window.location.search).get('id'));
  let p;
  try {
    p = ctx.produtos.buscarPorId(id);
  } catch {
    renderizarEstado(alvo, {
      tipo: 'erro', titulo: 'Produto não encontrado',
      mensagem: 'O cupcake que você procura não existe ou foi removido.',
      acao: { href: 'cardapio.html', rotulo: 'Ver cardápio' },
    });
    return;
  }

  document.title = `${p.nome} | Sweet Moments Cupcakes`;
  $('meta[name="description"]')?.setAttribute('content', p.descricao);

  alvo.innerHTML = `<div class="container">
    <nav class="trilha" aria-label="Você está em">
      <ol><li><a href="index.html">Início</a></li><li><a href="cardapio.html">Cardápio</a></li><li aria-current="page">${e(p.nome)}</li></ol>
    </nav>
    <article class="detalhe">
      <div class="detalhe__imagem">
        <img src="${e(p.imagem)}" alt="Cupcake ${e(p.nome)}" width="600" height="600">
      </div>
      <div>
        <span class="selo">${e(p.categoria)}</span>
        <h1>${e(p.nome)}</h1>
        <p class="leitura">${e(p.descricao)}</p>
        <span class="preco">${formatarMoeda(p.precoCentavos)} <span class="texto-apoio">/ unidade</span></span>
        ${p.ativo
    ? `<p class="alerta alerta--sucesso">Disponível para encomenda.</p>
           <div class="compra">
             <div class="campo">
               <label for="quantidade">Quantidade</label>
               <input class="qtd" id="quantidade" type="number" inputmode="numeric" min="1" max="${QUANTIDADE_MAXIMA}" value="1">
             </div>
             <div class="campo"><button type="button" class="botao" data-adicionar="${p.id}">Adicionar ao carrinho</button></div>
           </div>`
    : '<p class="alerta alerta--aviso">Este sabor está indisponível no momento.</p>'}
        <p><a href="cardapio.html">← Voltar ao cardápio</a></p>
      </div>
    </article>
  </div>`;

  ligarBotoesAdicionar(alvo, ctx, () => Number($('#quantidade')?.value));
}
