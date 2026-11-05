-- =============================================================
-- Sweet Moments Cupcakes — Projeto físico do banco de dados
-- SGBD: SQLite 3 (executado no navegador via sql.js/WebAssembly)
-- Valores monetários armazenados em centavos (INTEGER) para evitar
-- erros de arredondamento de ponto flutuante.
-- Datas armazenadas em ISO-8601 (UTC), ex.: 2026-11-04T18:30:00.000Z
-- =============================================================

PRAGMA foreign_keys = ON;

CREATE TABLE usuario (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nome           TEXT    NOT NULL CHECK (length(nome) BETWEEN 3 AND 100),
  email          TEXT    NOT NULL UNIQUE COLLATE NOCASE CHECK (length(email) <= 120),
  senha_hash     TEXT    NOT NULL,
  senha_salt     TEXT    NOT NULL,
  perfil         TEXT    NOT NULL DEFAULT 'CLIENTE'
                 CHECK (perfil IN ('CLIENTE', 'ATENDENTE', 'ADMINISTRADOR', 'GESTOR')),
  telefone       TEXT    CHECK (telefone IS NULL OR length(telefone) BETWEEN 10 AND 11),
  data_cadastro  TEXT    NOT NULL
);

CREATE TABLE categoria (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nome       TEXT    NOT NULL UNIQUE CHECK (length(nome) BETWEEN 3 AND 60),
  descricao  TEXT
);

CREATE TABLE produto (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria_id    INTEGER NOT NULL REFERENCES categoria (id),
  nome            TEXT    NOT NULL UNIQUE CHECK (length(nome) BETWEEN 3 AND 80),
  descricao       TEXT    NOT NULL CHECK (length(descricao) BETWEEN 10 AND 400),
  preco_centavos  INTEGER NOT NULL CHECK (preco_centavos BETWEEN 100 AND 100000),
  imagem          TEXT    NOT NULL,
  ativo           INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
);

CREATE TABLE endereco (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id   INTEGER NOT NULL REFERENCES usuario (id),
  cep          TEXT    NOT NULL CHECK (length(cep) = 8),
  logradouro   TEXT    NOT NULL,
  numero       TEXT    NOT NULL,
  complemento  TEXT,
  bairro       TEXT    NOT NULL,
  cidade       TEXT    NOT NULL,
  uf           TEXT    NOT NULL CHECK (length(uf) = 2)
);

CREATE TABLE pedido (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id             INTEGER NOT NULL REFERENCES usuario (id),
  data_pedido            TEXT    NOT NULL,
  tipo_entrega           TEXT    NOT NULL CHECK (tipo_entrega IN ('ENTREGA', 'RETIRADA')),
  endereco_id            INTEGER REFERENCES endereco (id),
  subtotal_centavos      INTEGER NOT NULL CHECK (subtotal_centavos > 0),
  taxa_entrega_centavos  INTEGER NOT NULL DEFAULT 0 CHECK (taxa_entrega_centavos >= 0),
  valor_total_centavos   INTEGER NOT NULL CHECK (valor_total_centavos > 0),
  status                 TEXT    NOT NULL DEFAULT 'RECEBIDO'
                         CHECK (status IN ('RECEBIDO', 'EM_PREPARACAO', 'PRONTO',
                                           'SAIU_PARA_ENTREGA', 'CONCLUIDO', 'CANCELADO')),
  observacao             TEXT    CHECK (observacao IS NULL OR length(observacao) <= 300),
  -- RN06: pedidos com entrega precisam de endereço
  CHECK (tipo_entrega = 'RETIRADA' OR endereco_id IS NOT NULL)
);

CREATE TABLE item_pedido (
  id                       INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id                INTEGER NOT NULL REFERENCES pedido (id) ON DELETE CASCADE,
  produto_id               INTEGER NOT NULL REFERENCES produto (id),
  quantidade               INTEGER NOT NULL CHECK (quantidade BETWEEN 1 AND 20),
  -- RN12: o preço é copiado no momento da compra
  preco_unitario_centavos  INTEGER NOT NULL CHECK (preco_unitario_centavos > 0),
  UNIQUE (pedido_id, produto_id)
);

CREATE TABLE pagamento (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id       INTEGER NOT NULL UNIQUE REFERENCES pedido (id) ON DELETE CASCADE,
  forma           TEXT    NOT NULL CHECK (forma IN ('PIX', 'CARTAO', 'DINHEIRO')),
  valor_centavos  INTEGER NOT NULL CHECK (valor_centavos > 0),
  status          TEXT    NOT NULL CHECK (status IN ('PENDENTE', 'APROVADO', 'RECUSADO')),
  data_pagamento  TEXT    NOT NULL
);

CREATE TABLE historico_status (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id   INTEGER NOT NULL REFERENCES pedido (id) ON DELETE CASCADE,
  status      TEXT    NOT NULL,
  data        TEXT    NOT NULL,
  usuario_id  INTEGER NOT NULL REFERENCES usuario (id)
);

CREATE INDEX idx_produto_categoria   ON produto (categoria_id);
CREATE INDEX idx_pedido_cliente      ON pedido (cliente_id);
CREATE INDEX idx_pedido_data         ON pedido (data_pedido);
CREATE INDEX idx_item_pedido_pedido  ON item_pedido (pedido_id);
CREATE INDEX idx_historico_pedido    ON historico_status (pedido_id);

PRAGMA user_version = 2;
