// Hash de senhas com PBKDF2-SHA-256 (Web Crypto API), salt individual por usuário.
// Funciona no navegador e no Node.js 18+ (globalThis.crypto.subtle).

const ITERACOES = 120_000;
const TAMANHO_BITS = 256;

const paraHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const deHex = (hex) => new Uint8Array(hex.match(/.{2}/g).map((h) => parseInt(h, 16)));

export function gerarSalt() {
  return paraHex(globalThis.crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashSenha(senha, saltHex = gerarSalt()) {
  const chave = await globalThis.crypto.subtle.importKey(
    'raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: deHex(saltHex), iterations: ITERACOES },
    chave, TAMANHO_BITS,
  );
  return { hash: paraHex(new Uint8Array(bits)), salt: saltHex };
}

/** Compara em tempo constante (não interrompe na primeira diferença). */
export async function verificarSenha(senha, hashEsperado, saltHex) {
  const { hash } = await hashSenha(senha, saltHex);
  if (hash.length !== hashEsperado.length) return false;
  let diferenca = 0;
  for (let i = 0; i < hash.length; i += 1) diferenca |= hash.charCodeAt(i) ^ hashEsperado.charCodeAt(i);
  return diferenca === 0;
}
