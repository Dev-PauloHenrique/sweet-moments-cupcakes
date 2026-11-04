// Camada de acesso a dados: encapsula o SQLite (sql.js).
// Todas as consultas usam parâmetros vinculados (?), nunca concatenação de texto.

export class BancoDeDados {
  /**
   * @param {object} db instância de SQL.Database (sql.js)
   * @param {object} [opcoes]
   * @param {() => void} [opcoes.aoAlterar] chamado após cada escrita confirmada (persistência)
   * @param {() => Date} [opcoes.relogio] permite fixar a data nos testes
   */
  constructor(db, { aoAlterar = () => {}, relogio = () => new Date() } = {}) {
    this.db = db;
    this.aoAlterar = aoAlterar;
    this.relogio = relogio;
    this.emTransacao = false;
    this.db.run('PRAGMA foreign_keys = ON;');
  }

  agoraIso() {
    return this.relogio().toISOString();
  }

  /** INSERT/UPDATE/DELETE. Retorna o id inserido e o nº de linhas afetadas. */
  executar(sql, parametros = []) {
    this.db.run(sql, parametros);
    const alteradas = this.db.getRowsModified();
    const id = this.consultarUm('SELECT last_insert_rowid() AS id').id;
    if (!this.emTransacao) this.aoAlterar(this);
    return { id, alteradas };
  }

  consultar(sql, parametros = []) {
    const comando = this.db.prepare(sql);
    try {
      comando.bind(parametros);
      const linhas = [];
      while (comando.step()) linhas.push(comando.getAsObject());
      return linhas;
    } finally {
      comando.free();
    }
  }

  consultarUm(sql, parametros = []) {
    return this.consultar(sql, parametros)[0] ?? null;
  }

  /** Executa várias escritas de forma atômica (tudo ou nada). */
  transacao(funcao) {
    if (this.emTransacao) return funcao();
    this.db.run('BEGIN TRANSACTION;');
    this.emTransacao = true;
    try {
      const resultado = funcao();
      this.db.run('COMMIT;');
      this.emTransacao = false;
      this.aoAlterar(this);
      return resultado;
    } catch (erro) {
      this.db.run('ROLLBACK;');
      this.emTransacao = false;
      throw erro;
    }
  }

  versao() {
    return this.consultarUm('PRAGMA user_version').user_version;
  }

  exportar() {
    const bytes = this.db.export();
    // o sql.js reabre o banco ao exportar, o que desliga os PRAGMAs
    this.db.run('PRAGMA foreign_keys = ON;');
    return bytes;
  }
}
