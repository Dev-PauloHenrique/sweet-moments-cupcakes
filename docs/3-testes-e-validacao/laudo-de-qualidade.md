# Laudo de qualidade

Foram analisados cinco relatos de teste da versão 1.0, cobrindo os quatro perfis (cliente, atendente, administrador e gestor), computador e celular. Nenhum relato apontou falha que impedisse concluir uma tarefa; os pontos levantados foram de **usabilidade e prevenção de erros**. Quatro sugestões foram implementadas na versão 1.1 e uma foi analisada e mantida fora do escopo.

| Relato | Problema / sugestão | Decisão | Correção | Commit |
|---|---|---|---|---|
| 1 — Cardápio | Não havia pesquisa por nome/ingrediente. | Implementada | Campo “Pesquisar sabor” que ignora maiúsculas e acentos e combina com o filtro de categoria; estado vazio orientativo; teste automatizado. | `feat(cardapio): pesquisa de sabores…` |
| 2 — Formulários | Celular e CEP sem formatação; erro exigia procurar o campo. | Implementada | Máscaras “(11) 98765-4321” e “01310-100”; foco e rolagem automáticos até o primeiro campo inválido; testes das máscaras. | `feat(formularios): máscaras…` |
| 3 — Painel de produtos | “Desativar” sem confirmação; reativação escondida no formulário de edição. | Implementada | Confirmação antes de desativar e botão “Reativar” na própria lista. | `feat(painel): confirmar desativação…` |
| 4 — Carrinho no celular | Botões − e + pequenos (32 px), toques errados. | Implementada | Alvos de toque de 44 × 44 px (recomendação de acessibilidade) e estado desabilitado visível. | `fix(carrinho): botões de quantidade…` |
| 5 — Acompanhamento | Notificar o cliente por e-mail/WhatsApp a cada mudança de status. | **Analisada, não implementada** | Exige servidor, serviço de envio pago e consentimento do cliente (LGPD) — fora do escopo de uma aplicação estática no GitHub Pages. O acompanhamento continua disponível pela linha do tempo em “Meus pedidos”. Registrada como *Could Have* no backlog. | — |

## Defeito encontrado pela equipe

Durante o teste de sistema (cenário S13 do [plano de testes](plano-de-testes.md)), o painel apresentava rolagem horizontal em telas de 375 px. A causa raiz foram textos ocultos para leitores de tela posicionados fora do contêiner da tabela. Corrigido na versão 1.0, antes da rodada com usuários.

## Evidências

- **Rastreabilidade:** cada correção está em um commit separado no GitHub, citando o relato atendido (aba *Commits* do repositório) e registrada no [CHANGELOG](../../CHANGELOG.md).
- **Testes automatizados:** 28 de 28 aprovados após as correções (`npm test`), incluindo testes de regressão para a pesquisa e as máscaras; o GitHub Actions só publica o site com todos aprovados.
- **Reteste manual:** cenários S14, S15 e S16 do plano de testes (pesquisa, máscaras/foco, desativar/reativar) aprovados em 04/11/2026.
- **Vídeo:** as mudanças estão demonstradas no vídeo da solução atualizada (roteiro em [roteiro-do-video.md](../2-desenvolvimento/roteiro-do-video.md)).

## Conclusão

A versão 1.1 atende às histórias de usuário HU01–HU14 e às regras RN01–RN12. As melhorias reduziram o esforço de busca, os erros de digitação e o risco de ações acidentais, sem alterar o modelo de dados. Pendências para versões futuras: servidor com banco compartilhado e autenticação no back-end, notificações ao cliente e pagamento real.
