import {
  $, avisar, dadosFormulario, limparErros, mostrarErros, renderizarEstado,
} from '../views/componentes.js';
import {
  escaparHtml as e, formatarMoeda, formatarNumeroPedido, rotuloFormaPagamento, ROTULOS_PAGAMENTO_STATUS,
} from '../views/formatadores.js';
import { TAXA_ENTREGA_CENTAVOS, UFS } from '../models/pedido.js';
import { FORMAS_PAGAMENTO } from '../servicos/pagamento.js';
import { exigirLoginPagina } from './comum.js';

/** HU07, HU08 e HU09 — entrega/retirada, pagamento demonstrativo e confirmação. */
export function iniciar(ctx) {
  if (!exigirLoginPagina(ctx, 'checkout.html')) return;
  const alvo = $('[data-checkout]');
  const resumo = ctx.carrinho.resumo();

  if (ctx.usuario.perfil !== 'CLIENTE') {
    renderizarEstado(alvo, {
      tipo: 'erro', titulo: 'Compras são feitas com conta de cliente',
      mensagem: 'Você entrou com uma conta da equipe. Saia e entre com uma conta de cliente para comprar.',
    });
    return;
  }
  if (!resumo.itens.length) {
    renderizarEstado(alvo, {
      titulo: 'Seu carrinho está vazio', mensagem: 'Adicione cupcakes antes de finalizar o pedido.',
      acao: { href: 'cardapio.html', rotulo: 'Ver cardápio' },
    });
    return;
  }
  if (resumo.itens.some((i) => !i.disponivel)) {
    renderizarEstado(alvo, {
      tipo: 'erro', titulo: 'Há itens indisponíveis no carrinho',
      mensagem: 'Remova os itens indisponíveis para continuar.', acao: { href: 'carrinho.html', rotulo: 'Revisar carrinho' },
    });
    return;
  }

  const end = ctx.pedidos.ultimoEndereco(ctx.usuario) ?? {};
  const v = (campo) => e(end[campo] ?? '');

  alvo.innerHTML = `<form class="layout-compra" novalidate data-form-checkout>
    <div>
      <div data-alerta role="alert" hidden></div>
      <fieldset>
        <legend>Como você quer receber?</legend>
        <div class="opcoes">
          <label class="opcao"><input type="radio" name="tipoEntrega" value="RETIRADA" checked>
            <span><strong>Retirar na loja</strong> — grátis<small>Loja fictícia: Rua dos Confeiteiros, 123 — Centro. Retirada das 10h às 19h, a partir de 2 horas após o pedido.</small></span></label>
          <label class="opcao"><input type="radio" name="tipoEntrega" value="ENTREGA">
            <span><strong>Entrega no endereço</strong> — ${formatarMoeda(TAXA_ENTREGA_CENTAVOS)}<small>Valor fixo de demonstração.</small></span></label>
        </div>
        <span class="erro-campo" data-erro-para="tipoEntrega"></span>
      </fieldset>

      <fieldset data-endereco hidden>
        <legend>Endereço de entrega</legend>
        <div class="linha-campos">
          <div class="campo"><label for="cep">CEP <span class="obrigatorio" aria-hidden="true">*</span></label>
            <input id="cep" name="cep" inputmode="numeric" autocomplete="postal-code" maxlength="9" value="${v('cep')}">
            <span class="erro-campo" data-erro-para="cep"></span></div>
          <div class="campo"><label for="numero">Número <span class="obrigatorio" aria-hidden="true">*</span></label>
            <input id="numero" name="numero" maxlength="10" value="${v('numero')}">
            <span class="erro-campo" data-erro-para="numero"></span></div>
        </div>
        <div class="campo"><label for="logradouro">Rua/Avenida <span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="logradouro" name="logradouro" autocomplete="address-line1" maxlength="120" value="${v('logradouro')}">
          <span class="erro-campo" data-erro-para="logradouro"></span></div>
        <div class="campo"><label for="complemento">Complemento</label>
          <input id="complemento" name="complemento" autocomplete="address-line2" maxlength="60" value="${v('complemento')}"></div>
        <div class="linha-campos">
          <div class="campo"><label for="bairro">Bairro <span class="obrigatorio" aria-hidden="true">*</span></label>
            <input id="bairro" name="bairro" maxlength="60" value="${v('bairro')}">
            <span class="erro-campo" data-erro-para="bairro"></span></div>
          <div class="campo"><label for="cidade">Cidade <span class="obrigatorio" aria-hidden="true">*</span></label>
            <input id="cidade" name="cidade" autocomplete="address-level2" maxlength="60" value="${v('cidade')}">
            <span class="erro-campo" data-erro-para="cidade"></span></div>
          <div class="campo"><label for="uf">UF <span class="obrigatorio" aria-hidden="true">*</span></label>
            <select id="uf" name="uf" autocomplete="address-level1"><option value="">Selecione</option>
              ${UFS.map((uf) => `<option ${end.uf === uf ? 'selected' : ''}>${uf}</option>`).join('')}</select>
            <span class="erro-campo" data-erro-para="uf"></span></div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Forma de pagamento</legend>
        <p class="texto-apoio">Pagamento demonstrativo: nenhum valor é cobrado e nenhum dado de cartão é solicitado.</p>
        <div class="opcoes">
          ${Object.entries(FORMAS_PAGAMENTO).map(([valor, rotulo], i) => `<label class="opcao">
            <input type="radio" name="formaPagamento" value="${valor}" ${i === 0 ? 'checked' : ''}><span><strong>${e(rotulo)}</strong></span></label>`).join('')}
        </div>
        <span class="erro-campo" data-erro-para="formaPagamento"></span>
      </fieldset>

      <div class="campo"><label for="observacao">Observações (opcional)</label>
        <textarea id="observacao" name="observacao" maxlength="300" placeholder="Ex.: escrever “Feliz aniversário” no cartão"></textarea></div>
    </div>

    <aside class="resumo" aria-labelledby="titulo-resumo">
      <h2 id="titulo-resumo">Seu pedido</h2>
      <ul class="texto-apoio">${resumo.itens.map((i) => `<li>${i.quantidade}× ${e(i.nome)}</li>`).join('')}</ul>
      <dl>
        <dt>Subtotal</dt><dd>${formatarMoeda(resumo.totalCentavos)}</dd>
        <dt>Entrega</dt><dd data-taxa>${formatarMoeda(0)}</dd>
        <dt class="total">Total</dt><dd class="total" data-total>${formatarMoeda(resumo.totalCentavos)}</dd>
      </dl>
      <button type="submit" class="botao botao--largo">Confirmar pedido</button>
      <p><a href="carrinho.html">Voltar ao carrinho</a></p>
    </aside>
  </form>`;

  const form = $('[data-form-checkout]');
  const atualizarEntrega = () => {
    const entrega = form.elements.tipoEntrega.value === 'ENTREGA';
    $('[data-endereco]', form).hidden = !entrega;
    const taxa = entrega ? TAXA_ENTREGA_CENTAVOS : 0;
    $('[data-taxa]', form).textContent = formatarMoeda(taxa);
    $('[data-total]', form).textContent = formatarMoeda(resumo.totalCentavos + taxa);
  };
  form.addEventListener('change', (evento) => { if (evento.target.name === 'tipoEntrega') atualizarEntrega(); });

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    limparErros(form);
    const dados = dadosFormulario(form);
    const botao = $('button[type="submit"]', form);
    botao.disabled = true;
    try {
      const pedido = ctx.pedidos.criar(ctx.usuario, {
        itens: ctx.carrinho.itensParaPedido(),
        tipoEntrega: dados.tipoEntrega,
        formaPagamento: dados.formaPagamento,
        observacao: dados.observacao,
        endereco: dados,
      });
      ctx.carrinho.limpar();
      ctx.atualizarCabecalho();
      mostrarConfirmacao(alvo, pedido);
    } catch (erro) {
      mostrarErros(form, erro);
      avisar('Não foi possível finalizar. Verifique os dados.', 'erro');
      botao.disabled = false;
    }
  });
}

function mostrarConfirmacao(alvo, pedido) {
  alvo.innerHTML = `<section class="estado" tabindex="-1" data-confirmacao>
    <h2>Pedido ${formatarNumeroPedido(pedido.id)} confirmado!</h2>
    <p>Total: <strong>${formatarMoeda(pedido.totalCentavos)}</strong> ·
      ${e(rotuloFormaPagamento(pedido.pagamento.forma))} — ${e(ROTULOS_PAGAMENTO_STATUS[pedido.pagamento.status])}</p>
    <p>${pedido.tipoEntrega === 'ENTREGA' ? 'Vamos avisar quando sair para entrega.' : 'Avisaremos quando estiver pronto para retirada.'}</p>
    <a class="botao" href="pedidos.html?id=${pedido.id}">Acompanhar pedido</a>
  </section>`;
  $('[data-confirmacao]', alvo).focus();
  window.scrollTo({ top: 0 });
}
