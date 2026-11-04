// Ponto de entrada (front controller / roteador): monta os Models, identifica
// a página pelo atributo data-pagina do <body> e entrega o controle ao Controller.
import { obterBanco, restaurarDemonstracao } from './db/conexao-navegador.js';
import { criarArmazenamentoNavegador } from './servicos/armazenamento.js';
import { Sessao } from './servicos/sessao.js';
import { UsuarioModel, PERFIS_EQUIPE } from './models/usuario.js';
import { ProdutoModel } from './models/produto.js';
import { PedidoModel } from './models/pedido.js';
import { Carrinho } from './models/carrinho.js';
import { $, avisar, renderizarCabecalho, renderizarEstado } from './views/componentes.js';

const CONTROLLERS = {
  inicio: () => import('./controllers/inicio.js'),
  cardapio: () => import('./controllers/cardapio.js'),
  produto: () => import('./controllers/produto.js'),
  carrinho: () => import('./controllers/carrinho.js'),
  checkout: () => import('./controllers/checkout.js'),
  entrar: () => import('./controllers/entrar.js'),
  pedidos: () => import('./controllers/pedidos.js'),
  painel: () => import('./controllers/painel.js'),
};

async function principal() {
  const pagina = document.body.dataset.pagina;
  const conteudo = $('[data-conteudo]');
  try {
    const banco = await obterBanco();
    const armazenamento = criarArmazenamentoNavegador();
    const sessao = new Sessao(armazenamento);
    const usuarios = new UsuarioModel(banco);
    const produtos = new ProdutoModel(banco);
    const ctx = {
      banco,
      sessao,
      usuarios,
      produtos,
      pedidos: new PedidoModel(banco),
      carrinho: new Carrinho(armazenamento, produtos),
      usuario: null,
    };
    const id = sessao.usuarioId();
    ctx.usuario = id ? usuarios.buscarPorId(id) : null;
    if (id && !ctx.usuario) sessao.encerrar();

    ctx.atualizarCabecalho = () => renderizarCabecalho({
      usuario: ctx.usuario,
      quantidadeCarrinho: ctx.carrinho.quantidadeTotal(),
      ehEquipe: PERFIS_EQUIPE.includes(ctx.usuario?.perfil),
    });
    ctx.atualizarCabecalho();

    document.addEventListener('click', (evento) => {
      if (evento.target.closest('[data-sair]')) {
        sessao.encerrar();
        window.location.href = 'index.html';
      }
    });

    if (banco.estado && !banco.estado.persistente) {
      avisar('Seu navegador bloqueou o armazenamento local: os dados serão perdidos ao fechar a página.', 'erro');
    }

    const modulo = await CONTROLLERS[pagina]?.();
    await modulo?.iniciar(ctx);
  } catch (erro) {
    console.error(erro);
    if (conteudo) {
      renderizarEstado(conteudo, {
        tipo: 'erro',
        titulo: 'Não foi possível abrir a loja',
        mensagem: 'Verifique sua conexão e recarregue a página. Se o problema continuar, use um navegador atualizado.',
      });
    }
  }
}

$('[data-restaurar]')?.addEventListener('click', () => {
  // eslint-disable-next-line no-alert
  if (window.confirm('Apagar os dados salvos neste navegador e restaurar a loja de demonstração?')) {
    restaurarDemonstracao();
    window.location.href = 'index.html';
  }
});

principal();
