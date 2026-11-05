// Servidorzinho pra rodar o site na sua máquina, sem instalar nada.
// Uso: node ferramentas/servidor.mjs  →  http://localhost:8080
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('../app/', import.meta.url));
const PORTA = Number(process.env.PORT) || 8080;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.wasm': 'application/wasm', '.sql': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};

createServer(async (req, res) => {
  try {
    let caminho = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (caminho.endsWith('/')) caminho += 'index.html';
    const arquivo = normalize(join(RAIZ, caminho));
    if (!arquivo.startsWith(RAIZ.endsWith(sep) ? RAIZ : RAIZ + sep)) throw new Error('fora da raiz'); // impede path traversal
    if (!(await stat(arquivo)).isFile()) throw new Error('não é arquivo');
    res.writeHead(200, {
      'Content-Type': TIPOS[extname(arquivo)] ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    });
    res.end(await readFile(arquivo));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(join(RAIZ, '404.html')).catch(() => 'Não encontrado'));
  }
}).listen(PORTA, () => console.log(`Sweet Moments rodando em http://localhost:${PORTA}`));
