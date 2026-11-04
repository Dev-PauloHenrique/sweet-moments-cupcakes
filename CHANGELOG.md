# Histórico de mudanças

Todas as alterações relevantes do projeto ficam registradas aqui (formato inspirado no Keep a Changelog).

## [1.0.0] — 2026-11-04

### Adicionado
- Loja web responsiva: início, cardápio com filtro por categoria, detalhe do produto, carrinho, checkout (entrega/retirada e pagamento demonstrativo), login/cadastro, "Meus pedidos" com linha do tempo de status e painel da equipe (pedidos, produtos e relatório de vendas).
- Arquitetura MVC em JavaScript (ES Modules) com banco SQLite executado no navegador via sql.js (WebAssembly) e persistência local.
- Regras de negócio RN01–RN12 implementadas nos Models; senhas com PBKDF2-SHA-256 e salt individual.
- 23 testes automatizados (`npm test`) cobrindo usuários, produtos, carrinho, pedidos, permissões e relatório.
- Publicação automática no GitHub Pages condicionada à aprovação dos testes (GitHub Actions).
- Arquivos de descoberta: `sitemap.xml`, `robots.txt` e `llms.txt`.
