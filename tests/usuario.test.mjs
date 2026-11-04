import { test } from 'node:test';
import assert from 'node:assert/strict';
import { novoBanco, SENHA_TESTE } from './auxiliar.mjs';
import { UsuarioModel } from '../app/js/models/usuario.js';
import { hashSenha, verificarSenha } from '../app/js/servicos/seguranca.js';
import { ErroAutenticacao, ErroValidacao } from '../app/js/servicos/erros.js';

test('hash de senha usa salt individual e verifica corretamente', async () => {
  const a = await hashSenha('Segredo123');
  const b = await hashSenha('Segredo123');
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.hash, b.hash);
  assert.ok(await verificarSenha('Segredo123', a.hash, a.salt));
  assert.equal(await verificarSenha('Errada123', a.hash, a.salt), false);
});

test('HU03: cadastra cliente, nunca guarda a senha em texto e ignora "perfil" enviado', async () => {
  const banco = await novoBanco();
  const usuarios = new UsuarioModel(banco);
  const u = await usuarios.cadastrar({
    nome: '  Ana   Souza ', email: 'ANA@Exemplo.com', senha: SENHA_TESTE, telefone: '(11) 98888-7777', perfil: 'ADMINISTRADOR',
  });
  assert.equal(u.perfil, 'CLIENTE');
  assert.equal(u.nome, 'Ana Souza');
  assert.equal(u.email, 'ana@exemplo.com');
  assert.equal(u.telefone, '11988887777');
  assert.equal('senha_hash' in u, false);
  const linha = banco.consultarUm('SELECT senha_hash FROM usuario WHERE id = ?', [u.id]);
  assert.notEqual(linha.senha_hash, SENHA_TESTE);
  assert.equal(linha.senha_hash.length, 64);
});

test('HU03: impede e-mail duplicado (sem diferenciar maiúsculas)', async () => {
  const usuarios = new UsuarioModel(await novoBanco());
  await usuarios.cadastrar({ nome: 'Ana', email: 'ana@exemplo.com', senha: SENHA_TESTE });
  await assert.rejects(
    usuarios.cadastrar({ nome: 'Outra Ana', email: 'Ana@Exemplo.com', senha: SENHA_TESTE }),
    (e) => e instanceof ErroValidacao && Boolean(e.campos.email),
  );
});

test('HU03: valida campos obrigatórios e força da senha', async () => {
  const usuarios = new UsuarioModel(await novoBanco());
  await assert.rejects(
    usuarios.cadastrar({ nome: 'A', email: 'invalido', senha: '123', telefone: '123' }),
    (e) => e instanceof ErroValidacao
      && ['nome', 'email', 'senha', 'telefone'].every((c) => c in e.campos),
  );
});

test('HU04: autentica com credenciais válidas e usa mensagem genérica nas inválidas', async () => {
  const usuarios = new UsuarioModel(await novoBanco());
  await usuarios.cadastrar({ nome: 'Bruno', email: 'bruno@exemplo.com', senha: SENHA_TESTE });
  const logado = await usuarios.autenticar(' BRUNO@exemplo.com ', SENHA_TESTE);
  assert.equal(logado.email, 'bruno@exemplo.com');

  const senhaErrada = await usuarios.autenticar('bruno@exemplo.com', 'errada999').catch((e) => e);
  const emailInexistente = await usuarios.autenticar('ninguem@exemplo.com', SENHA_TESTE).catch((e) => e);
  assert.ok(senhaErrada instanceof ErroAutenticacao);
  assert.ok(emailInexistente instanceof ErroAutenticacao);
  assert.equal(senhaErrada.message, emailInexistente.message);
});
