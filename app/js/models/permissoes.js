import { ErroAutenticacao, ErroAutorizacao } from '../servicos/erros.js';

/** Matriz de permissões por perfil (princípio do menor privilégio). */
export const PERMISSOES = {
  CLIENTE: ['comprar', 'ver_proprios_pedidos'],
  ATENDENTE: ['ver_todos_pedidos', 'atualizar_status'],
  ADMINISTRADOR: ['ver_todos_pedidos', 'atualizar_status', 'gerenciar_produtos', 'ver_relatorio'],
  GESTOR: ['ver_todos_pedidos', 'ver_relatorio'],
};

export function pode(usuario, permissao) {
  return Boolean(usuario && PERMISSOES[usuario.perfil]?.includes(permissao));
}

export function exigirLogin(usuario) {
  if (!usuario) throw new ErroAutenticacao('Entre na sua conta para continuar.');
}

export function exigir(usuario, permissao) {
  exigirLogin(usuario);
  if (!pode(usuario, permissao)) throw new ErroAutorizacao('Você não tem permissão para esta ação.');
}
