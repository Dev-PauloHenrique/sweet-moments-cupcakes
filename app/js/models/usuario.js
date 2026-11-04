import { hashSenha, verificarSenha } from '../servicos/seguranca.js';
import { ErroAutenticacao, ErroValidacao } from '../servicos/erros.js';

export const PERFIS = ['CLIENTE', 'ATENDENTE', 'ADMINISTRADOR', 'GESTOR'];
export const PERFIS_EQUIPE = ['ATENDENTE', 'ADMINISTRADOR', 'GESTOR'];

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MENSAGEM_LOGIN_INVALIDO = 'E-mail ou senha inválidos.';

const somenteDigitos = (texto) => String(texto ?? '').replace(/\D/g, '');

/** Campos que podem sair do Model (nunca hash/salt). */
const publico = (linha) => linha && ({
  id: linha.id,
  nome: linha.nome,
  email: linha.email,
  perfil: linha.perfil,
  telefone: linha.telefone,
});

export class UsuarioModel {
  constructor(banco) {
    this.banco = banco;
  }

  /** Valida e normaliza os dados de cadastro. Lança ErroValidacao com os campos inválidos. */
  static validarCadastro(entrada = {}) {
    const nome = String(entrada.nome ?? '').trim().replace(/\s+/g, ' ');
    const email = String(entrada.email ?? '').trim().toLowerCase();
    const senha = String(entrada.senha ?? '');
    const telefone = somenteDigitos(entrada.telefone);
    const erros = {};

    if (nome.length < 3 || nome.length > 100) erros.nome = 'Informe seu nome (3 a 100 caracteres).';
    if (!EMAIL_VALIDO.test(email) || email.length > 120) erros.email = 'Informe um e-mail válido.';
    if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha) || senha.length > 72) {
      erros.senha = 'A senha deve ter de 8 a 72 caracteres, com letras e números.';
    }
    if (telefone && (telefone.length < 10 || telefone.length > 11)) {
      erros.telefone = 'Informe o telefone com DDD (10 ou 11 dígitos).';
    }
    if (Object.keys(erros).length) throw new ErroValidacao('Verifique os campos destacados.', erros);
    return { nome, email, senha, telefone: telefone || null };
  }

  /**
   * HU03 — cadastro de cliente. O perfil é sempre CLIENTE:
   * o campo "perfil" enviado pela interface é ignorado (bloqueio de mass assignment).
   */
  async cadastrar(entrada) {
    const dados = UsuarioModel.validarCadastro(entrada);
    return this.#inserir(dados, 'CLIENTE');
  }

  /** Uso interno (carga inicial de dados de demonstração). */
  async criarComPerfil(entrada, perfil) {
    if (!PERFIS.includes(perfil)) throw new ErroValidacao('Perfil inválido.');
    const dados = UsuarioModel.validarCadastro(entrada);
    return this.#inserir(dados, perfil);
  }

  async #inserir({ nome, email, senha, telefone }, perfil) {
    if (this.banco.consultarUm('SELECT id FROM usuario WHERE email = ?', [email])) {
      throw new ErroValidacao('Este e-mail já está cadastrado.', { email: 'Este e-mail já está cadastrado.' });
    }
    const { hash, salt } = await hashSenha(senha);
    const { id } = this.banco.executar(
      `INSERT INTO usuario (nome, email, senha_hash, senha_salt, perfil, telefone, data_cadastro)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, hash, salt, perfil, telefone, this.banco.agoraIso()],
    );
    return this.buscarPorId(id);
  }

  /** HU04 — autenticação. Mensagem genérica para não revelar se o e-mail existe. */
  async autenticar(email, senha) {
    const emailNormalizado = String(email ?? '').trim().toLowerCase();
    const linha = this.banco.consultarUm('SELECT * FROM usuario WHERE email = ?', [emailNormalizado]);
    if (!linha || !senha) throw new ErroAutenticacao(MENSAGEM_LOGIN_INVALIDO);
    const valida = await verificarSenha(String(senha), linha.senha_hash, linha.senha_salt);
    if (!valida) throw new ErroAutenticacao(MENSAGEM_LOGIN_INVALIDO);
    return publico(linha);
  }

  buscarPorId(id) {
    return publico(this.banco.consultarUm('SELECT * FROM usuario WHERE id = ?', [id]));
  }
}
