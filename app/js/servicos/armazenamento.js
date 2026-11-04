// Abstração de armazenamento chave-valor. No navegador usa localStorage;
// nos testes (Node) usa memória. Falhas de armazenamento (modo privado,
// cota cheia) nunca derrubam a aplicação.

export function criarArmazenamentoMemoria() {
  const mapa = new Map();
  return {
    ler: (chave) => (mapa.has(chave) ? mapa.get(chave) : null),
    gravar: (chave, valor) => { mapa.set(chave, String(valor)); return true; },
    remover: (chave) => { mapa.delete(chave); },
  };
}

export function criarArmazenamentoNavegador() {
  return {
    ler(chave) {
      try { return globalThis.localStorage.getItem(chave); } catch { return null; }
    },
    gravar(chave, valor) {
      try { globalThis.localStorage.setItem(chave, valor); return true; } catch { return false; }
    },
    remover(chave) {
      try { globalThis.localStorage.removeItem(chave); } catch { /* ignora */ }
    },
  };
}

export function lerJson(armazenamento, chave, padrao) {
  const texto = armazenamento.ler(chave);
  if (!texto) return padrao;
  try { return JSON.parse(texto); } catch { return padrao; }
}
