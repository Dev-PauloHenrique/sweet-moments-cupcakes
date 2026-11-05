// Erros "do negócio". A mensagem deles vai direto pra tela, então nada de
// SQL, stack trace ou detalhe interno aqui.

export class ErroAplicacao extends Error {
  constructor(mensagem, campos = {}) {
    super(mensagem);
    this.name = this.constructor.name;
    this.campos = campos; // { nomeDoCampo: 'mensagem específica' }
  }
}

export class ErroValidacao extends ErroAplicacao {}
export class ErroAutenticacao extends ErroAplicacao {}
export class ErroAutorizacao extends ErroAplicacao {}
export class ErroNaoEncontrado extends ErroAplicacao {}

/** Converte qualquer erro em uma mensagem segura para a interface. */
export function mensagemSegura(erro) {
  if (erro instanceof ErroAplicacao) return erro.message;
  return 'Não foi possível concluir a operação. Tente novamente.';
}
