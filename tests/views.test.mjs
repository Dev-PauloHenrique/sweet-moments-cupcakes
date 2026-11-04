import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mascararCep, mascararTelefone } from '../app/js/views/mascaras.js';
import {
  destinoSeguro, escaparHtml, formatarMoeda, formatarNumeroPedido,
} from '../app/js/views/formatadores.js';

test('front-end: escapa HTML para evitar XSS', () => {
  assert.equal(escaparHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escaparHtml(null), '');
});

test('front-end: formata moeda brasileira e número do pedido', () => {
  assert.equal(formatarMoeda(1290).replace(/\s/g, ' '), 'R$ 12,90');
  assert.equal(formatarMoeda(123456).replace(/\s/g, ' '), 'R$ 1.234,56');
  assert.equal(formatarNumeroPedido(7), '#00007');
});

test('front-end: redirecionamento após login só aceita páginas internas', () => {
  assert.equal(destinoSeguro('checkout.html'), 'checkout.html');
  assert.equal(destinoSeguro('https://site-malicioso.example'), 'index.html');
  assert.equal(destinoSeguro('//evil.example/checkout.html', 'cardapio.html'), 'cardapio.html');
  assert.equal(destinoSeguro(null, 'painel.html'), 'painel.html');
});

test('v1.1 (relato 2): máscaras de CEP e telefone', () => {
  assert.equal(mascararCep('01310100'), '01310-100');
  assert.equal(mascararCep('01310-1009999'), '01310-100');
  assert.equal(mascararCep('abc12'), '12');
  assert.equal(mascararTelefone('11987654321'), '(11) 98765-4321');
  assert.equal(mascararTelefone('1133334444'), '(11) 3333-4444');
  assert.equal(mascararTelefone('119'), '(11) 9');
  assert.equal(mascararTelefone(''), '');
});
