import { lerJson } from './armazenamento.js';

const CHAVE = 'smc:sessao';
const DURACAO_MS = 8 * 60 * 60 * 1000; // 8 horas

/**
 * Sessão do usuário. Guarda apenas o id e a expiração; perfil e dados
 * são sempre relidos do banco a cada página (não se confia em dados
 * de perfil salvos no armazenamento).
 */
export class Sessao {
  constructor(armazenamento, agora = () => Date.now()) {
    this.armazenamento = armazenamento;
    this.agora = agora;
  }

  iniciar(usuarioId) {
    this.armazenamento.gravar(CHAVE, JSON.stringify({ usuarioId, expiraEm: this.agora() + DURACAO_MS }));
  }

  encerrar() {
    this.armazenamento.remover(CHAVE);
  }

  usuarioId() {
    const dados = lerJson(this.armazenamento, CHAVE, null);
    if (!dados || !Number.isInteger(dados.usuarioId) || dados.expiraEm < this.agora()) {
      if (dados) this.encerrar();
      return null;
    }
    return dados.usuarioId;
  }
}
