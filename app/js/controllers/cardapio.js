import { $, $$, cartaoProduto, renderizarEstado } from '../views/componentes.js';
import { escaparHtml as e } from '../views/formatadores.js';
import { ligarBotoesAdicionar } from './comum.js';

/** HU01 — catálogo com filtro por categoria. */
export function iniciar(ctx) {
  const filtros = $('[data-filtros]');
  const grade = $('[data-produtos]');
  const contagem = $('[data-contagem]');
  const parametros = new URLSearchParams(window.location.search);
  let categoriaAtual = Number(parametros.get('categoria')) || 0;

  const categorias = ctx.produtos.listarCategorias();
  filtros.innerHTML = [{ id: 0, nome: 'Todos' }, ...categorias]
    .map((c) => `<button type="button" class="chip" data-categoria="${c.id}" aria-pressed="false">${e(c.nome)}</button>`)
    .join('');

  function renderizar() {
    $$('[data-categoria]', filtros).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.categoria) === categoriaAtual)));
    const lista = ctx.produtos.listar({ categoriaId: categoriaAtual || null });
    contagem.textContent = `${lista.length} ${lista.length === 1 ? 'sabor encontrado' : 'sabores encontrados'}`;
    if (!lista.length) {
      renderizarEstado(grade, { titulo: 'Nenhum cupcake nesta categoria', mensagem: 'Experimente outra categoria.' });
      return;
    }
    grade.innerHTML = lista.map(cartaoProduto).join('');
  }

  filtros.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-categoria]');
    if (!botao) return;
    categoriaAtual = Number(botao.dataset.categoria);
    const url = new URL(window.location.href);
    if (categoriaAtual) url.searchParams.set('categoria', categoriaAtual); else url.searchParams.delete('categoria');
    window.history.replaceState(null, '', url);
    renderizar();
  });

  ligarBotoesAdicionar(grade, ctx);
  renderizar();
}
