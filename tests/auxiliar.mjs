// Monta um banco SQLite em memória idêntico ao do navegador, usando os
// mesmos arquivos schema.sql, dados-iniciais.sql e sql.js da aplicação.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { criarBanco } from '../app/js/db/inicializar.js';

const require = createRequire(import.meta.url);
const initSqlJs = require('../app/vendor/sql-wasm.js');
const raiz = new URL('../app/', import.meta.url);

let SQL;
export async function novoBanco({ comDemonstracao = false, relogio } = {}) {
  SQL ??= await initSqlJs({ locateFile: (f) => fileURLToPath(new URL(`vendor/${f}`, raiz)) });
  const [schemaSql, dadosIniciaisSql] = await Promise.all([
    readFile(new URL('db/schema.sql', raiz), 'utf8'),
    readFile(new URL('db/dados-iniciais.sql', raiz), 'utf8'),
  ]);
  return criarBanco({ SQL, schemaSql, dadosIniciaisSql, comDemonstracao, relogio });
}

export const SENHA_TESTE = 'SenhaForte123';

/** Cria rapidamente um usuário de cada perfil. */
export async function criarEquipe(usuarios) {
  const mk = (perfil, email) => usuarios.criarComPerfil(
    { nome: `${perfil} Teste`, email, senha: SENHA_TESTE }, perfil,
  );
  return {
    cliente: await mk('CLIENTE', 'cliente@teste.test'),
    outroCliente: await mk('CLIENTE', 'outro@teste.test'),
    atendente: await mk('ATENDENTE', 'atendente@teste.test'),
    admin: await mk('ADMINISTRADOR', 'admin@teste.test'),
    gestor: await mk('GESTOR', 'gestor@teste.test'),
  };
}

export const ENDERECO_VALIDO = {
  cep: '01310-100', logradouro: 'Rua das Flores', numero: '42', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP',
};
