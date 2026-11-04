import { lerJson } from './armazenamento.js';

/**
 * Limitador de tentativas (ex.: login): após N falhas dentro da janela,
 * bloqueia novas tentativas por alguns segundos. Em um sistema com servidor
 * este controle deve existir no back-end; aqui ele é demonstrativo.
 */
export class LimitadorTentativas {
  constructor(armazenamento, chave, { maximo = 5, janelaMs = 5 * 60_000, bloqueioMs = 30_000 } = {}, agora = () => Date.now()) {
    Object.assign(this, { armazenamento, chave: `smc:limite:${chave}`, maximo, janelaMs, bloqueioMs, agora });
  }

  #estado() {
    const e = lerJson(this.armazenamento, this.chave, null);
    return e && Array.isArray(e.falhas) ? e : { falhas: [], bloqueadoAte: 0 };
  }

  /** Segundos restantes de bloqueio (0 = liberado). */
  segundosBloqueado() {
    const restante = this.#estado().bloqueadoAte - this.agora();
    return restante > 0 ? Math.ceil(restante / 1000) : 0;
  }

  registrarFalha() {
    const e = this.#estado();
    const limite = this.agora() - this.janelaMs;
    e.falhas = [...e.falhas.filter((t) => t > limite), this.agora()];
    if (e.falhas.length >= this.maximo) {
      e.bloqueadoAte = this.agora() + this.bloqueioMs;
      e.falhas = [];
    }
    this.armazenamento.gravar(this.chave, JSON.stringify(e));
  }

  limpar() {
    this.armazenamento.remover(this.chave);
  }
}
