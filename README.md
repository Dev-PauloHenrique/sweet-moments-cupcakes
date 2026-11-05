# Sweet Moments Cupcakes 🧁

Uma lojinha online de cupcakes gourmet que eu fiz para o **Projeto Integrador Transdisciplinar em Engenharia de Software II** (Cruzeiro do Sul Virtual).

**Feito por:** Paulo Henrique Cordeiro Santos

- 🌐 **Ver o site funcionando:** https://dev-paulohenrique.github.io/sweet-moments-cupcakes/
- 📚 **Documentação:** [docs/](docs/README.md)
- 🧪 **Testes:** `npm test` roda 28 testes automáticos (e o GitHub roda de novo antes de cada publicação)

## O que dá pra fazer no site

| Quem | O que faz |
|---|---|
| Visitante / cliente | Olha o cardápio, pesquisa e filtra sabores, monta o carrinho, cria conta, escolhe entrega ou retirada, "paga" (o pagamento é simulado) e acompanha o pedido |
| Atendente | Vê os pedidos e vai mudando o status |
| Administrador | Faz tudo do atendente, cadastra e edita produtos e vê o relatório de vendas |
| Gestor | Vê os pedidos e o relatório, sem mexer em nada |

Na página **Entrar** tem contas prontas de cada perfil pra testar rapidinho. O passo a passo tá no [manual de uso](docs/2-desenvolvimento/manual-de-uso.md).

## Com o que foi feito

| Parte | Tecnologia |
|---|---|
| Telas (View) | HTML, CSS e JavaScript puro, sem framework |
| Regras do negócio (Model e Controller) | JavaScript, no padrão **MVC** |
| Banco de dados | **SQLite** rodando no próprio navegador com o [sql.js](https://github.com/sql-js/sql.js) |
| Testes | `node:test`, que já vem no Node.js |
| Hospedagem | GitHub Pages, publicado automaticamente pelo GitHub Actions |

**"Ué, cadê o servidor?"** O GitHub Pages só serve arquivos estáticos. Pra ter um link de graça e sempre no ar, as regras e o banco SQLite rodam direto no navegador de quem acessa. Expliquei melhor (e com os limites dessa escolha) em [arquitetura.md](docs/2-desenvolvimento/arquitetura.md).

## Rodando na sua máquina

Só precisa do [Node.js](https://nodejs.org/) 20 ou mais novo. Não tem `npm install`, porque o projeto não usa dependência nenhuma.

```bash
git clone https://github.com/Dev-PauloHenrique/sweet-moments-cupcakes.git
cd sweet-moments-cupcakes
npm test     # roda os testes
npm start    # abre em http://localhost:8080
```

## Como as pastas estão organizadas

```
app/          o site em si (HTML, CSS, JS em MVC, banco SQLite, fotos e vídeo)
docs/         documentação separada pelas três situações-problema
tests/        testes automáticos
ferramentas/  servidorzinho pra rodar local
.github/      publicação automática e formulário de relato de teste
```

## Créditos de terceiros

- [sql.js](https://github.com/sql-js/sql.js) 1.10.3, licença MIT (fica em `app/vendor/`).
- Fontes [Fraunces](https://fonts.google.com/specimen/Fraunces) e [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans), licença SIL Open Font, carregadas pelo Google Fonts.
