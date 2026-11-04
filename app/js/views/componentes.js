// Componentes de interface reutilizados pelas páginas (camada View).
import { escaparHtml as e, formatarMoeda, ROTULOS_STATUS } from './formatadores.js';
import { mensagemSegura } from '../servicos/erros.js';

export const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
export const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

/** Mensagem curta e acessível (região aria-live do rodapé). */
export function avisar(mensagem, tipo = 'info') {
  const regiao = $('#avisos');
  if (!regiao) return;
  const aviso = document.createElement('div');
  aviso.className = `aviso aviso--${tipo}`;
  aviso.textContent = mensagem;
  regiao.append(aviso);
  setTimeout(() => aviso.remove(), 4000);
}

export function renderizarCabecalho({ usuario, quantidadeCarrinho, ehEquipe }) {
  $$('[data-contador-carrinho]').forEach((el) => {
    el.textContent = String(quantidadeCarrinho);
    el.hidden = quantidadeCarrinho === 0;
  });
  const carrinho = $('.botao-carrinho');
  if (carrinho) carrinho.setAttribute('aria-label', `Carrinho, ${quantidadeCarrinho} ${quantidadeCarrinho === 1 ? 'item' : 'itens'}`);
  $$('[data-somente-equipe]').forEach((el) => { el.hidden = !ehEquipe; });
  const conta = $('[data-conta]');
  if (!conta) return;
  conta.innerHTML = usuario
    ? `<span class="conta__nome">Olá, ${e(usuario.nome.split(' ')[0])}</span>
       <button type="button" class="botao botao--neutro botao--pequeno" data-sair>Sair</button>`
    : '<a class="botao botao--secundario botao--pequeno" href="entrar.html">Entrar</a>';
}

/** Estados de carregamento, vazio, erro e sem permissão. */
export function renderizarEstado(alvo, { tipo = 'vazio', titulo, mensagem = '', acao = null }) {
  const classe = tipo === 'carregando' ? 'estado carregando' : 'estado';
  alvo.innerHTML = `<div class="${classe}" ${tipo === 'carregando' ? 'aria-busy="true"' : ''}>
      ${titulo ? `<h2>${e(titulo)}</h2>` : ''}
      ${mensagem ? `<p>${e(mensagem)}</p>` : ''}
      ${acao ? `<a class="botao" href="${e(acao.href)}">${e(acao.rotulo)}</a>` : ''}
    </div>`;
}

export function cartaoProduto(p) {
  const link = `produto.html?id=${encodeURIComponent(p.id)}`;
  return `<article class="produto ${p.ativo ? '' : 'produto--indisponivel'}">
    <div class="produto__imagem">
      <img src="${e(p.imagem)}" alt="Cupcake ${e(p.nome)}" width="400" height="400" loading="lazy" decoding="async">
      ${p.ativo ? '' : '<span class="etiqueta">Indisponível</span>'}
    </div>
    <div class="produto__corpo">
      <span class="produto__categoria">${e(p.categoria)}</span>
      <h3><a href="${link}">${e(p.nome)}</a></h3>
      <p class="produto__descricao">${e(p.descricao)}</p>
      <div class="produto__rodape">
        <span class="preco">${formatarMoeda(p.precoCentavos)}</span>
        ${p.ativo
    ? `<button type="button" class="botao botao--pequeno" data-adicionar="${p.id}" aria-label="Adicionar ${e(p.nome)} ao carrinho">Adicionar</button>`
    : '<button type="button" class="botao botao--pequeno" disabled>Indisponível</button>'}
      </div>
    </div>
  </article>`;
}

export const seloStatus = (status) => `<span class="status status--${e(status)}">${e(ROTULOS_STATUS[status] ?? status)}</span>`;

/** Mostra erros de validação ao lado dos campos (atributo name = chave do erro). */
export function mostrarErros(formulario, erro) {
  limparErros(formulario);
  const alerta = $('[data-alerta]', formulario);
  if (alerta) {
    alerta.hidden = false;
    alerta.className = 'alerta alerta--erro';
    alerta.textContent = mensagemSegura(erro);
  }
  for (const [campo, mensagem] of Object.entries(erro?.campos ?? {})) {
    const entrada = formulario.elements?.namedItem?.(campo);
    const destino = $(`[data-erro-para="${campo}"]`, formulario);
    if (entrada?.setAttribute) entrada.setAttribute('aria-invalid', 'true');
    if (destino) destino.textContent = mensagem;
  }
}

export function limparErros(formulario) {
  $$('[aria-invalid]', formulario).forEach((el) => el.removeAttribute('aria-invalid'));
  $$('[data-erro-para]', formulario).forEach((el) => { el.textContent = ''; });
  const alerta = $('[data-alerta]', formulario);
  if (alerta) { alerta.hidden = true; alerta.textContent = ''; }
}

export const dadosFormulario = (formulario) => Object.fromEntries(new FormData(formulario).entries());
