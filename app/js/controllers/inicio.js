import { $, cartaoProduto } from '../views/componentes.js';
import { ligarBotoesAdicionar } from './comum.js';

/** Página inicial: destaques do cardápio. */
export function iniciar(ctx) {
  const alvo = $('[data-destaques]');
  if (!alvo) return;
  const destaques = ctx.produtos.listar({ somenteAtivos: true }).slice(0, 4);
  alvo.innerHTML = destaques.map(cartaoProduto).join('');
  ligarBotoesAdicionar(alvo, ctx);
}
