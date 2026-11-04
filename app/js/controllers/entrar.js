import {
  $, dadosFormulario, limparErros, mostrarErros,
} from '../views/componentes.js';
import { destinoSeguro, escaparHtml as e } from '../views/formatadores.js';
import { CONTAS_DEMO, SENHA_DEMO } from '../db/inicializar.js';
import { PERFIS_EQUIPE } from '../models/usuario.js';
import { LimitadorTentativas } from '../servicos/limitador.js';
import { criarArmazenamentoNavegador } from '../servicos/armazenamento.js';
import { ErroAutenticacao, ErroValidacao } from '../servicos/erros.js';
import { aplicarMascara, mascararTelefone } from '../views/mascaras.js';

/** HU03 (cadastro) e HU04 (autenticação). */
export function iniciar(ctx) {
  const parametros = new URLSearchParams(window.location.search);
  const voltar = parametros.get('voltar');
  const destino = (usuario) => destinoSeguro(voltar, PERFIS_EQUIPE.includes(usuario.perfil) ? 'painel.html' : 'cardapio.html');

  if (ctx.usuario) {
    window.location.replace(destino(ctx.usuario));
    return;
  }
  if (voltar) {
    const aviso = $('[data-aviso-login]');
    aviso.hidden = false;
  }

  const limitador = new LimitadorTentativas(criarArmazenamentoNavegador(), 'login');
  const formLogin = $('[data-form-login]');
  const formCadastro = $('[data-form-cadastro]');
  aplicarMascara(formCadastro.elements.telefone, mascararTelefone);

  $('[data-contas-demo]').innerHTML = CONTAS_DEMO.map((c) => `<li>
      <button type="button" class="link-botao" data-preencher="${e(c.email)}">${e(c.nome.replace(' Demonstração', ''))}</button>
      — <code>${e(c.email)}</code></li>`).join('');
  $('[data-senha-demo]').textContent = SENHA_DEMO;
  $('[data-contas-demo]').addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-preencher]');
    if (!botao) return;
    formLogin.elements.email.value = botao.dataset.preencher;
    formLogin.elements.senha.value = SENHA_DEMO;
    formLogin.elements.email.focus();
  });

  formLogin.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limparErros(formLogin);
    const espera = limitador.segundosBloqueado();
    if (espera) {
      mostrarErros(formLogin, new ErroAutenticacao(`Muitas tentativas. Aguarde ${espera} segundos e tente novamente.`));
      return;
    }
    const { email, senha } = dadosFormulario(formLogin);
    const botao = $('button[type="submit"]', formLogin);
    botao.disabled = true;
    try {
      const usuario = await ctx.usuarios.autenticar(email, senha);
      limitador.limpar();
      ctx.sessao.iniciar(usuario.id);
      window.location.replace(destino(usuario));
    } catch (erro) {
      limitador.registrarFalha();
      mostrarErros(formLogin, erro);
      botao.disabled = false;
    }
  });

  formCadastro.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limparErros(formCadastro);
    const dados = dadosFormulario(formCadastro);
    if (dados.site) return; // honeypot: campo invisível preenchido indica robô
    if (dados.senha !== dados.confirmacao) {
      mostrarErros(formCadastro, new ErroValidacao('As senhas não conferem.', { confirmacao: 'As senhas não conferem.' }));
      return;
    }
    const botao = $('button[type="submit"]', formCadastro);
    botao.disabled = true;
    try {
      const usuario = await ctx.usuarios.cadastrar({
        nome: dados.nome, email: dados.email, senha: dados.senha, telefone: dados.telefone,
      });
      ctx.sessao.iniciar(usuario.id);
      const alerta = $('[data-alerta]', formCadastro);
      alerta.hidden = false;
      alerta.className = 'alerta alerta--sucesso';
      alerta.textContent = `Conta criada com sucesso! Bem-vindo(a), ${usuario.nome.split(' ')[0]}. Redirecionando…`;
      setTimeout(() => window.location.replace(destino(usuario)), 1500);
    } catch (erro) {
      mostrarErros(formCadastro, erro);
      botao.disabled = false;
    }
  });
}
