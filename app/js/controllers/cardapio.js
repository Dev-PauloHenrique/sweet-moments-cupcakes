import { $, $$, cartaoProduto, renderizarEstado } from '../views/componentes.js';
import { escaparHtml as e } from '../views/formatadores.js';
import { ligarBotoesAdicionar } from './comum.js';

/** HU01 — catálogo com filtro por categoria e pesquisa por nome (v1.1). */
export function iniciar(ctx) {
  const filtros = $('[data-filtros]');
  const grade = $('[data-produtos]');
  const contagem = $('[data-contagem]');
  const campoBusca = $('#busca');
  const parametros = new URLSearchParams(window.location.search);
  let categoriaAtual = Number(parametros.get('categoria')) || 0;
  campoBusca.value = (parametros.get('busca') ?? '').slice(0, 60);

  const categorias = ctx.produtos.listarCategorias();
  filtros.innerHTML = [{ id: 0, nome: 'Todos' }, ...categorias]
    .map((c) => `<button type="button" class="chip" data-categoria="${c.id}" aria-pressed="false">${e(c.nome)}</button>`)
    .join('');

  function atualizarUrl() {
    const url = new URL(window.location.href);
    if (categoriaAtual) url.searchParams.set('categoria', categoriaAtual); else url.searchParams.delete('categoria');
    if (campoBusca.value.trim()) url.searchParams.set('busca', campoBusca.value.trim()); else url.searchParams.delete('busca');
    window.history.replaceState(null, '', url);
  }

  function renderizar() {
    $$('[data-categoria]', filtros).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.categoria) === categoriaAtual)));
    const busca = campoBusca.value.trim();
    const lista = ctx.produtos.listar({ categoriaId: categoriaAtual || null, busca });
    contagem.textContent = `${lista.length} ${lista.length === 1 ? 'sabor encontrado' : 'sabores encontrados'}`;
    if (!lista.length) {
      renderizarEstado(grade, {
        titulo: busca ? `Nenhum sabor encontrado para “${busca}”` : 'Nenhum cupcake nesta categoria',
        mensagem: busca ? 'Confira a grafia ou pesquise por outro ingrediente, como “chocolate”.' : 'Experimente outra categoria.',
      });
      return;
    }
    grade.innerHTML = lista.map(cartaoProduto).join('');
  }

  filtros.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-categoria]');
    if (!botao) return;
    categoriaAtual = Number(botao.dataset.categoria);
    atualizarUrl();
    renderizar();
  });

  let espera;
  campoBusca.addEventListener('input', () => {
    clearTimeout(espera);
    espera = setTimeout(() => { atualizarUrl(); renderizar(); }, 200);
  });
  $('[data-form-busca]').addEventListener('submit', (evento) => { evento.preventDefault(); atualizarUrl(); renderizar(); });

  ligarBotoesAdicionar(grade, ctx);
  renderizar();
}
