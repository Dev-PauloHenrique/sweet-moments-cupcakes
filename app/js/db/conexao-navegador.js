// Abre o SQLite no navegador e guarda o arquivo do banco no localStorage.
// O sql.js (vendor/sql-wasm.js) já foi carregado antes, como script normal.
import { criarBanco } from './inicializar.js';

const CHAVE = 'smc:banco:v1';
let promessa = null;

function paraBase64(bytes) {
  let binario = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binario);
}

function deBase64(texto) {
  const binario = atob(texto);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

function carregarSalvo() {
  try {
    const texto = localStorage.getItem(CHAVE);
    return texto ? deBase64(texto) : null;
  } catch {
    return null;
  }
}

async function buscarTexto(caminho) {
  const resposta = await fetch(new URL(caminho, import.meta.url));
  if (!resposta.ok) throw new Error(`Falha ao carregar ${caminho}`);
  return resposta.text();
}

async function abrir() {
  if (typeof globalThis.initSqlJs !== 'function') throw new Error('sql.js não carregado');
  const [SQL, schemaSql, dadosIniciaisSql] = await Promise.all([
    globalThis.initSqlJs({ locateFile: (arquivo) => new URL(`../../vendor/${arquivo}`, import.meta.url).href }),
    buscarTexto('../../db/schema.sql'),
    buscarTexto('../../db/dados-iniciais.sql'),
  ]);
  const estado = { persistente: true };
  const banco = await criarBanco({
    SQL,
    schemaSql,
    dadosIniciaisSql,
    dadosSalvos: carregarSalvo(),
    aoAlterar: (banco) => {
      try {
        localStorage.setItem(CHAVE, paraBase64(banco.exportar()));
      } catch {
        estado.persistente = false; // modo privado/cota: segue funcionando só em memória
      }
    },
  });
  banco.estado = estado;
  return banco;
}

export function obterBanco() {
  promessa ??= abrir();
  return promessa;
}

/** Apaga os dados locais e recria a loja de demonstração. */
export function restaurarDemonstracao() {
  try {
    localStorage.removeItem(CHAVE);
    localStorage.removeItem('smc:carrinho');
    localStorage.removeItem('smc:sessao');
  } catch { /* ignora */ }
}
