# Histórico de mudanças

Todas as alterações relevantes do projeto ficam registradas aqui (formato inspirado no Keep a Changelog).

## [1.1.0] — 2026-11-04

Melhorias a partir dos testes com usuários (ver `docs/3-testes-e-validacao/laudo-de-qualidade.md`).

### Adicionado
- Pesquisa de sabores por nome ou ingrediente no cardápio, sem diferenciar maiúsculas e acentos (relato 1). Teste de regressão incluído.
- Máscaras de digitação para celular e CEP; foco automático no primeiro campo inválido (relato 2). Testes das máscaras e dos formatadores do front-end.
- Botão "Reativar" na lista de produtos e confirmação antes de desativar (relato 3).
- Formulário de relato de teste em GitHub Issues e documentação completa em `docs/`.

### Corrigido
- Botões de quantidade do carrinho com área de toque de 44 px (relato 4).

### Analisado e não implementado
- Notificações por e-mail/WhatsApp (relato 5): exigem servidor e serviço de envio; fora do escopo da aplicação estática.

## [1.0.0] — 2026-11-04

### Corrigido
- Rolagem horizontal no painel em telas de 375 px (textos ocultos para leitores de tela escapavam da tabela).

### Adicionado
- Loja web responsiva: início, cardápio com filtro por categoria, detalhe do produto, carrinho, checkout (entrega/retirada e pagamento demonstrativo), login/cadastro, "Meus pedidos" com linha do tempo de status e painel da equipe (pedidos, produtos e relatório de vendas).
- Arquitetura MVC em JavaScript (ES Modules) com banco SQLite executado no navegador via sql.js (WebAssembly) e persistência local.
- Regras de negócio RN01–RN12 implementadas nos Models; senhas com PBKDF2-SHA-256 e salt individual.
- 23 testes automatizados (`npm test`) cobrindo usuários, produtos, carrinho, pedidos, permissões e relatório.
- Publicação automática no GitHub Pages condicionada à aprovação dos testes (GitHub Actions).
- Arquivos de descoberta: `sitemap.xml`, `robots.txt` e `llms.txt`.
