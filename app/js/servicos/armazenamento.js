// Um "guarda-volumes" chave-valor: no navegador usa o localStorage e nos
// testes usa a memória. Se o navegador bloquear (modo anônimo, cota cheia),
// o site continua funcionando.

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
