// Coisinhas que mais de um controller usa.
import { avisar } from '../views/componentes.js';
import { mensagemSegura } from '../servicos/erros.js';

/** Liga os botões [data-adicionar] de um container ao carrinho. */
export function ligarBotoesAdicionar(container, ctx, obterQuantidade = () => 1) {
  container.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-adicionar]');
    if (!botao) return;
    try {
      ctx.carrinho.adicionar(Number(botao.dataset.adicionar), obterQuantidade());
      ctx.atualizarCabecalho();
      avisar('Produto adicionado ao carrinho.', 'sucesso');
    } catch (erro) {
      avisar(mensagemSegura(erro), 'erro');
    }
  });
}

/** Redireciona para o login guardando a página de retorno. */
export function exigirLoginPagina(ctx, pagina) {
  if (ctx.usuario) return true;
  window.location.replace(`entrar.html?voltar=${encodeURIComponent(pagina)}`);
  return false;
}
