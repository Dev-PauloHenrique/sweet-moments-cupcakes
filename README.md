# Sweet Moments Cupcakes 🧁

Loja virtual **fictícia** de cupcakes gourmet, desenvolvida para o **Projeto Integrador Transdisciplinar em Engenharia de Software II** (Cruzeiro do Sul Virtual).

**Aluno:** Paulo Henrique Cordeiro Santos

- 🌐 **Site em funcionamento:** https://dev-paulohenrique.github.io/sweet-moments-cupcakes/
- 📚 **Documentação:** [docs/](docs/README.md)
- 🧪 **Testes:** `npm test` — 28 testes automatizados (executados também pelo GitHub Actions antes de cada publicação)

> Projeto acadêmico: marca, produtos, preços e endereço são fictícios. Nenhum pedido, entrega ou pagamento é real, e os dados digitados ficam salvos apenas no navegador de quem usa.

## O que o sistema faz

| Perfil | Funcionalidades |
|---|---|
| Visitante / Cliente | Cardápio com pesquisa e filtro, detalhes do produto, carrinho, cadastro e login, checkout com entrega ou retirada, pagamento demonstrativo (Pix, cartão ou dinheiro), histórico e acompanhamento do pedido |
| Atendente | Lista de pedidos com filtros e atualização de status |
| Administrador | Pedidos, cadastro/edição/desativação de produtos e relatório de vendas |
| Gestor | Pedidos e relatório de vendas (somente leitura) |

Contas de demonstração para cada perfil estão na página **Entrar** do site e no [manual de uso](docs/2-desenvolvimento/manual-de-uso.md).

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end (View) | HTML5, CSS3, JavaScript (ES Modules), sem frameworks |
| Lógica de negócio (Model e Controller) | JavaScript — padrão **MVC** |
| Banco de dados | **SQLite 3** no navegador via [sql.js](https://github.com/sql-js/sql.js) (WebAssembly), persistido no `localStorage` |
| Testes | `node:test` (Node.js 20+) |
| Hospedagem e CI/CD | GitHub Pages + GitHub Actions |

Por que não há servidor? O GitHub Pages hospeda apenas arquivos estáticos; para ter um link gratuito e sempre disponível, as regras de negócio e o banco SQLite rodam no próprio navegador. Detalhes, limitações e checklist de segurança em [arquitetura.md](docs/2-desenvolvimento/arquitetura.md).

## Como executar localmente

Requisito: [Node.js](https://nodejs.org/) 20 ou superior. Não é preciso instalar dependências.

```bash
git clone https://github.com/Dev-PauloHenrique/sweet-moments-cupcakes.git
cd sweet-moments-cupcakes
npm test     # roda os testes
npm start    # abre o servidor em http://localhost:8080
```

## Estrutura

```
app/        código publicado (HTML, CSS, JS em MVC, banco SQLite, imagens)
docs/       documentação por situação-problema (requisitos, UML, banco, IHC, testes, laudo)
tests/      testes automatizados
ferramentas/servidor local de desenvolvimento
.github/    publicação automática e formulário de relato de teste
```

## Licenças de terceiros

- [sql.js](https://github.com/sql-js/sql.js) 1.10.3 — licença MIT (arquivos em `app/vendor/`).
- Fontes [Fraunces](https://fonts.google.com/specimen/Fraunces) e [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans) — SIL Open Font License, carregadas do Google Fonts.
- Ilustrações dos cupcakes — criadas para este projeto.
