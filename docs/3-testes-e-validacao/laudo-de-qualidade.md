# Laudo de qualidade

Cinco pessoas testaram a versão 1.0 usando os quatro perfis (cliente, atendente, administrador e gestor), no computador e no celular. Ninguém ficou travado sem conseguir terminar uma tarefa; o que apareceu foram pontos de **usabilidade e de evitar erro bobo**. Quatro sugestões viraram melhoria na versão 1.1 e uma eu analisei e deixei pra depois.

| Relato | O que apareceu | O que decidi | O que foi feito | Commit |
|---|---|---|---|---|
| 1 — Cardápio | Não dava pra pesquisar sabor pelo nome ou ingrediente. | Fiz | Campo "Pesquisar sabor" que ignora maiúscula e acento e funciona junto com o filtro de categoria, com mensagem amigável quando não acha nada e teste automático. | `feat(cardapio): pesquisa de sabores…` |
| 2 — Formulários | Celular e CEP sem formatação, e depois de um erro era preciso caçar o campo. | Fiz | Máscaras "(11) 98765-4321" e "01310-100"; o cursor vai direto pro primeiro campo errado; testes das máscaras. | `feat(formularios): máscaras…` |
| 3 — Produtos no painel | "Desativar" agia na hora, sem perguntar, e pra reativar tinha que achar uma opção dentro do "Editar". | Fiz | Pergunta antes de desativar e botão "Reativar" na própria lista. | `feat(painel): confirmar desativação…` |
| 4 — Carrinho no celular | Os botões − e + eram pequenos (32 px) e o dedo errava. | Fiz | Botões com 44 × 44 px, que é o tamanho recomendado pra toque, e cara de desabilitado quando não dá pra clicar. | `fix(carrinho): botões de quantidade…` |
| 5 — Acompanhar pedido | Mandar e-mail/WhatsApp pro cliente a cada mudança de status. | **Deixei pra depois** | Precisa de servidor, de um serviço de envio pago e do consentimento do cliente (LGPD), e o site é estático no GitHub Pages. Por enquanto o cliente acompanha pela linha do tempo em "Meus pedidos". Ficou no backlog como *Could Have*. | — |

## Um defeito que eu mesmo achei

No teste de sistema (cenário S13 do [plano de testes](plano-de-testes.md)), o painel ficava com rolagem pro lado em telas de 375 px. O culpado eram textos escondidos (feitos pra leitor de tela) que escapavam da tabela. Corrigi ainda na 1.0, antes da rodada com usuários.

## Como dá pra conferir

- **Commits:** cada correção tem seu próprio commit no GitHub, dizendo qual relato resolve (aba *Commits*), e tudo está anotado no [CHANGELOG](../../CHANGELOG.md).
- **Testes automáticos:** 28 de 28 passando depois das correções (`npm test`), incluindo testes novos pra pesquisa e pras máscaras. O GitHub Actions só publica o site se todos passarem.
- **Reteste na mão:** os cenários S14, S15 e S16 do plano de testes (pesquisa, máscaras/foco, desativar/reativar) passaram em 04/11/2026.

## Fechando

A versão 1.1 cobre as histórias HU01 a HU14 e as regras RN01 a RN12. As melhorias deixaram mais fácil achar um sabor, diminuíram erro de digitação e o risco de clicar em algo sem querer, sem precisar mexer no banco. Pro futuro ficam: um servidor com banco compartilhado e login no back-end, avisos pro cliente e pagamento de verdade.
