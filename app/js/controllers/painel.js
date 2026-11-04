import {
  $, $$, avisar, dadosFormulario, limparErros, mostrarErros, renderizarEstado, seloStatus,
} from '../views/componentes.js';
import {
  centavosParaCampo, escaparHtml as e, formatarDataHora, formatarMoeda, formatarNumeroPedido,
  ROTULOS_ENTREGA, ROTULOS_STATUS,
} from '../views/formatadores.js';
import { detalhePedidoHtml } from '../views/pedido-detalhe.js';
import { pode } from '../models/permissoes.js';
import { STATUS } from '../models/pedido.js';
import { IMAGENS_DISPONIVEIS } from '../models/produto.js';
import { mensagemSegura } from '../servicos/erros.js';
import { exigirLoginPagina } from './comum.js';

/** Área administrativa: HU11 (produtos), HU12 (pedidos) e HU13 (relatório). */
export function iniciar(ctx) {
  if (!exigirLoginPagina(ctx, 'painel.html')) return;
  const raiz = $('[data-painel]');
  const u = ctx.usuario;
  const abas = [
    { id: 'pedidos', rotulo: 'Pedidos', permitido: pode(u, 'ver_todos_pedidos'), render: abaPedidos },
    { id: 'produtos', rotulo: 'Produtos', permitido: pode(u, 'gerenciar_produtos'), render: abaProdutos },
    { id: 'relatorio', rotulo: 'Relatório de vendas', permitido: pode(u, 'ver_relatorio'), render: abaRelatorio },
  ].filter((a) => a.permitido);

  if (!abas.length) {
    renderizarEstado(raiz, {
      tipo: 'erro', titulo: 'Acesso restrito à equipe',
      mensagem: 'Sua conta não tem permissão para acessar o painel.', acao: { href: 'cardapio.html', rotulo: 'Ir para o cardápio' },
    });
    return;
  }

  $('[data-perfil]').textContent = { ATENDENTE: 'Atendente', ADMINISTRADOR: 'Administrador', GESTOR: 'Gestor' }[u.perfil];
  raiz.innerHTML = `<div class="abas" role="tablist" aria-label="Seções do painel">
      ${abas.map((a, i) => `<button type="button" role="tab" id="aba-${a.id}" aria-controls="painel-aba"
        aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-aba="${a.id}">${e(a.rotulo)}</button>`).join('')}
    </div>
    <section id="painel-aba" role="tabpanel" tabindex="0"></section>
    <dialog data-dialogo></dialog>`;
  const painel = $('#painel-aba');
  const dialogo = $('[data-dialogo]');

  function abrir(id) {
    $$('[role="tab"]', raiz).forEach((b) => {
      const ativa = b.dataset.aba === id;
      b.setAttribute('aria-selected', String(ativa));
      b.tabIndex = ativa ? 0 : -1;
    });
    painel.setAttribute('aria-labelledby', `aba-${id}`);
    abas.find((a) => a.id === id).render(ctx, painel, dialogo);
  }
  $('[role="tablist"]', raiz).addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-aba]');
    if (b) abrir(b.dataset.aba);
  });
  $('[role="tablist"]', raiz).addEventListener('keydown', (ev) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(ev.key)) return;
    const botoes = $$('[role="tab"]', raiz);
    const atual = botoes.indexOf(document.activeElement);
    const proximo = botoes[(atual + (ev.key === 'ArrowRight' ? 1 : -1) + botoes.length) % botoes.length];
    proximo.focus();
    abrir(proximo.dataset.aba);
  });
  abrir(abas[0].id);
}

/* ---------------- HU12: pedidos ---------------- */
function abaPedidos(ctx, painel, dialogo) {
  const podeAtualizar = pode(ctx.usuario, 'atualizar_status');
  painel.innerHTML = `<form class="barra-filtros" data-filtros>
      <div class="campo"><label for="f-status">Status</label>
        <select id="f-status" name="status"><option value="">Todos</option>
        ${STATUS.map((s) => `<option value="${s}">${e(ROTULOS_STATUS[s])}</option>`).join('')}</select></div>
      <div class="campo"><label for="f-de">De</label><input id="f-de" name="de" type="date"></div>
      <div class="campo"><label for="f-ate">Até</label><input id="f-ate" name="ate" type="date"></div>
      <button type="submit" class="botao botao--neutro">Filtrar</button>
    </form>
    <div data-alerta hidden></div>
    <div data-tabela></div>`;
  const form = $('[data-filtros]', painel);
  const tabela = $('[data-tabela]', painel);

  function carregar() {
    limparErros(painel);
    let lista;
    try {
      lista = ctx.pedidos.listarTodos(ctx.usuario, dadosFormulario(form));
    } catch (erro) {
      mostrarErros(painel, erro);
      return;
    }
    if (!lista.length) {
      renderizarEstado(tabela, { titulo: 'Nenhum pedido encontrado', mensagem: 'Altere os filtros ou aguarde novos pedidos.' });
      return;
    }
    tabela.innerHTML = `<div class="tabela-wrap"><table>
      <caption class="visualmente-oculto">Pedidos recebidos</caption>
      <thead><tr><th>Pedido</th><th>Data</th><th>Cliente</th><th>Recebimento</th><th class="numero">Total</th><th>Status</th><th><span class="visualmente-oculto">Ações</span></th></tr></thead>
      <tbody>${lista.map((p) => `<tr><td>${formatarNumeroPedido(p.id)}</td><td>${formatarDataHora(p.data)}</td>
        <td>${e(p.cliente)}</td><td>${e(ROTULOS_ENTREGA[p.tipoEntrega])}</td><td class="numero">${formatarMoeda(p.totalCentavos)}</td>
        <td>${seloStatus(p.status)}</td>
        <td><button type="button" class="botao botao--neutro botao--pequeno" data-ver="${p.id}">${podeAtualizar ? 'Gerenciar' : 'Ver'}<span class="visualmente-oculto"> pedido ${formatarNumeroPedido(p.id)}</span></button></td></tr>`).join('')}
      </tbody></table></div>`;
  }

  function abrirPedido(id) {
    const p = ctx.pedidos.detalhar(ctx.usuario, id);
    const acoes = podeAtualizar && p.proximosStatus.length
      ? p.proximosStatus.map((s) => `<button type="button" class="botao ${s === 'CANCELADO' ? 'botao--perigo' : ''}" data-status="${s}">
          ${s === 'CANCELADO' ? 'Cancelar pedido' : `Marcar como “${e(ROTULOS_STATUS[s])}”`}</button>`).join('')
      : '';
    dialogo.innerHTML = `<div class="dialogo__corpo">${detalhePedidoHtml(p, { mostrarCliente: true })}</div>
      <div class="dialogo__acoes">${acoes}<button type="button" class="botao botao--neutro" data-fechar>Fechar</button></div>`;
    dialogo.dataset.pedido = String(id);
    if (!dialogo.open) dialogo.showModal();
  }

  form.addEventListener('submit', (ev) => { ev.preventDefault(); carregar(); });
  tabela.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-ver]');
    if (b) abrirPedido(Number(b.dataset.ver));
  });
  dialogo.onclick = (ev) => {
    if (ev.target.closest('[data-fechar]')) { dialogo.close(); return; }
    const b = ev.target.closest('[data-status]');
    if (!b) return;
    if (b.dataset.status === 'CANCELADO' && !window.confirm('Cancelar este pedido? Esta ação não pode ser desfeita.')) return;
    try {
      ctx.pedidos.atualizarStatus(ctx.usuario, Number(dialogo.dataset.pedido), b.dataset.status);
      avisar(`Status atualizado para “${ROTULOS_STATUS[b.dataset.status]}”.`, 'sucesso');
      abrirPedido(Number(dialogo.dataset.pedido));
      carregar();
    } catch (erro) {
      avisar(mensagemSegura(erro), 'erro');
    }
  };
  carregar();
}

/* ---------------- HU11: produtos ---------------- */
function abaProdutos(ctx, painel, dialogo) {
  const categorias = ctx.produtos.listarCategorias();
  painel.innerHTML = `<p><button type="button" class="botao" data-novo>+ Novo produto</button></p><div data-tabela></div>`;
  const tabela = $('[data-tabela]', painel);

  function carregar() {
    const lista = ctx.produtos.listar();
    tabela.innerHTML = `<div class="tabela-wrap"><table>
      <caption class="visualmente-oculto">Produtos cadastrados</caption>
      <thead><tr><th>Produto</th><th>Categoria</th><th class="numero">Preço</th><th>Situação</th><th><span class="visualmente-oculto">Ações</span></th></tr></thead>
      <tbody>${lista.map((p) => `<tr><td>${e(p.nome)}</td><td>${e(p.categoria)}</td><td class="numero">${formatarMoeda(p.precoCentavos)}</td>
        <td>${p.ativo ? 'Ativo' : 'Inativo'}</td>
        <td><button type="button" class="botao botao--neutro botao--pequeno" data-editar="${p.id}">Editar<span class="visualmente-oculto"> ${e(p.nome)}</span></button>
          ${p.ativo
    ? `<button type="button" class="botao botao--perigo botao--pequeno" data-desativar="${p.id}">Desativar<span class="visualmente-oculto"> ${e(p.nome)}</span></button>`
    : `<button type="button" class="botao botao--secundario botao--pequeno" data-reativar="${p.id}">Reativar<span class="visualmente-oculto"> ${e(p.nome)}</span></button>`}</td></tr>`).join('')}
      </tbody></table></div>`;
  }

  function abrirFormulario(produto = null) {
    const v = (c) => e(produto?.[c] ?? '');
    dialogo.innerHTML = `<form novalidate data-form-produto>
      <div class="dialogo__corpo">
        <h2>${produto ? 'Editar produto' : 'Novo produto'}</h2>
        <div data-alerta role="alert" hidden></div>
        <div class="campo"><label for="p-nome">Nome *</label><input id="p-nome" name="nome" maxlength="80" value="${v('nome')}"><span class="erro-campo" data-erro-para="nome"></span></div>
        <div class="campo"><label for="p-desc">Descrição *</label><textarea id="p-desc" name="descricao" maxlength="400">${v('descricao')}</textarea><span class="erro-campo" data-erro-para="descricao"></span></div>
        <div class="linha-campos">
          <div class="campo"><label for="p-preco">Preço (R$) *</label><input id="p-preco" name="preco" inputmode="decimal" placeholder="12,90"
            value="${produto ? centavosParaCampo(produto.precoCentavos) : ''}"><span class="erro-campo" data-erro-para="preco"></span></div>
          <div class="campo"><label for="p-cat">Categoria *</label><select id="p-cat" name="categoriaId"><option value="">Selecione</option>
            ${categorias.map((c) => `<option value="${c.id}" ${produto?.categoriaId === c.id ? 'selected' : ''}>${e(c.nome)}</option>`).join('')}</select>
            <span class="erro-campo" data-erro-para="categoriaId"></span></div>
        </div>
        <div class="campo"><label for="p-img">Imagem *</label><select id="p-img" name="imagem"><option value="">Selecione</option>
          ${IMAGENS_DISPONIVEIS.map((i) => `<option value="${e(i)}" ${produto?.imagem === i ? 'selected' : ''}>${e(i.split('/').pop())}</option>`).join('')}</select>
          <span class="erro-campo" data-erro-para="imagem"></span></div>
      </div>
      <div class="dialogo__acoes"><button type="button" class="botao botao--neutro" data-fechar>Cancelar</button><button type="submit" class="botao">Salvar</button></div>
    </form>`;
    const form = $('[data-form-produto]', dialogo);
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      limparErros(form);
      const dados = dadosFormulario(form);
      try {
        if (produto) {
          ctx.produtos.atualizar(ctx.usuario, produto.id, dados);
        } else {
          ctx.produtos.criar(ctx.usuario, dados);
        }
        dialogo.close();
        avisar('Produto salvo.', 'sucesso');
        carregar();
      } catch (erro) {
        mostrarErros(form, erro);
      }
    });
    if (!dialogo.open) dialogo.showModal();
  }

  dialogo.onclick = (ev) => { if (ev.target.closest('[data-fechar]')) dialogo.close(); };
  painel.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    try {
      if (b.matches('[data-novo]')) abrirFormulario();
      else if (b.dataset.editar) abrirFormulario(ctx.produtos.buscarPorId(b.dataset.editar));
      else if (b.dataset.desativar) {
        // v1.1 (relato 3): confirmação antes de tirar o produto do cardápio
        const p = ctx.produtos.buscarPorId(b.dataset.desativar);
        if (!window.confirm(`Desativar “${p.nome}”? Ele continuará no cardápio como indisponível e poderá ser reativado.`)) return;
        ctx.produtos.definirAtivo(ctx.usuario, p.id, false);
        avisar(`“${p.nome}” desativado. Use “Reativar” para voltar a vendê-lo.`);
        carregar();
      } else if (b.dataset.reativar) {
        const p = ctx.produtos.definirAtivo(ctx.usuario, b.dataset.reativar, true);
        avisar(`“${p.nome}” reativado no cardápio.`, 'sucesso');
        carregar();
      }
    } catch (erro) {
      avisar(mensagemSegura(erro), 'erro');
    }
  });
  carregar();
}

/* ---------------- HU13: relatório ---------------- */
function abaRelatorio(ctx, painel) {
  painel.innerHTML = `<form class="barra-filtros" data-filtros>
      <div class="campo"><label for="r-de">De</label><input id="r-de" name="de" type="date"></div>
      <div class="campo"><label for="r-ate">Até</label><input id="r-ate" name="ate" type="date"></div>
      <button type="submit" class="botao botao--neutro">Aplicar período</button>
    </form><div data-alerta hidden></div><div data-resultado></div>`;
  const form = $('[data-filtros]', painel);
  const alvo = $('[data-resultado]', painel);

  function carregar() {
    limparErros(painel);
    let r;
    try {
      r = ctx.pedidos.resumo(ctx.usuario, dadosFormulario(form));
    } catch (erro) {
      mostrarErros(painel, erro);
      return;
    }
    alvo.innerHTML = `<div class="indicadores">
        <div class="indicador"><span>Pedidos</span><strong>${r.pedidos}</strong></div>
        <div class="indicador"><span>Faturamento</span><strong>${formatarMoeda(r.faturamentoCentavos)}</strong></div>
        <div class="indicador"><span>Ticket médio</span><strong>${formatarMoeda(r.ticketMedioCentavos)}</strong></div>
        <div class="indicador"><span>Cancelados</span><strong>${r.cancelados}</strong></div>
      </div>
      <p class="texto-apoio">Faturamento e ticket médio desconsideram pedidos cancelados.</p>
      <div class="grade-3">
        <div><h3>Mais vendidos</h3>${r.maisVendidos.length ? `<div class="tabela-wrap"><table>
          <thead><tr><th>Produto</th><th class="numero">Unid.</th><th class="numero">Receita</th></tr></thead>
          <tbody>${r.maisVendidos.map((m) => `<tr><td>${e(m.nome)}</td><td class="numero">${m.quantidade}</td><td class="numero">${formatarMoeda(m.receitaCentavos)}</td></tr>`).join('')}</tbody>
          </table></div>` : '<p class="texto-apoio">Sem vendas no período.</p>'}</div>
        <div><h3>Pedidos por status</h3>${r.porStatus.length ? `<div class="tabela-wrap"><table>
          <thead><tr><th>Status</th><th class="numero">Pedidos</th></tr></thead>
          <tbody>${r.porStatus.map((s) => `<tr><td>${seloStatus(s.status)}</td><td class="numero">${s.quantidade}</td></tr>`).join('')}</tbody>
          </table></div>` : '<p class="texto-apoio">Sem pedidos no período.</p>'}</div>
      </div>`;
  }
  form.addEventListener('submit', (ev) => { ev.preventDefault(); carregar(); });
  carregar();
}
