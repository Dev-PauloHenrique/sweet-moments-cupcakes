# Roteiros dos vídeos

O PIT II pede dois vídeos: **(1)** a solução em funcionamento, narrada, com pelo menos 5 minutos; **(2)** as mudanças feitas após os testes, com até 5 minutos. Sugestão de ferramenta gratuita: gravador do Windows (Win + Alt + R na Xbox Game Bar) ou OBS Studio; publique no YouTube como “Não listado” ou no Google Drive com acesso por link.

Antes de gravar: abra o site, clique em **Restaurar loja de demonstração** no rodapé e deixe a janela em tela cheia.

## Vídeo 1 — Solução em funcionamento (≈ 6 min)

| Tempo | Tela | O que falar |
|---|---|---|
| 0:00–0:40 | Página inicial | Apresentação: aluno, disciplina, situação-problema (loja de cupcakes que falhou por má elicitação), objetivo do sistema. Avisar que a loja é fictícia. |
| 0:40–1:20 | Repositório no GitHub | Estrutura: `app/` (código), `docs/` por situação-problema, `tests/`, GitHub Actions publicando no Pages após os testes. |
| 1:20–1:50 | `docs/2-desenvolvimento/arquitetura.md` | Arquitetura MVC, SQLite no navegador via WebAssembly, por que não há servidor. |
| 1:50–2:40 | Cardápio e detalhe | Pesquisa, filtro por categoria, produto indisponível, detalhe e adicionar ao carrinho (contador e aviso). |
| 2:40–3:20 | Carrinho | Alterar quantidade, remover, subtotal recalculado; atualizar a página e mostrar que o carrinho continua. |
| 3:20–4:20 | Checkout | Mostrar redirecionamento para login, entrar como cliente demo, escolher entrega, deixar CEP incompleto (erro no campo), corrigir, pagar com Pix, confirmar e mostrar número/total. |
| 4:20–4:50 | Meus pedidos | Lista e linha do tempo do pedido. |
| 4:50–5:40 | Painel (atendente e administrador) | Atendente avança status; administrador cadastra produto com erro de validação e depois válido; relatório de vendas. |
| 5:40–6:10 | Terminal com `npm test` | 28 testes passando; comentar 2 ou 3 regras testadas (RN08, RN12). |
| 6:10–6:30 | Encerramento | Resumo e próximos passos (servidor real, notificações). |

## Vídeo 2 — Mudanças após os testes (≈ 4 min)

| Tempo | Tela | O que falar |
|---|---|---|
| 0:00–0:30 | `docs/3-testes-e-validacao/laudo-de-qualidade.md` | Cinco testes com usuários, quatro melhorias implementadas, uma sugestão analisada e não implementada. |
| 0:30–1:10 | Cardápio | Pesquisa “limao” encontra “Limão Siciliano” (relato 1). |
| 1:10–1:50 | Cadastro e checkout | Máscaras de celular e CEP; erro leva o foco ao campo (relato 2). |
| 1:50–2:30 | Painel › Produtos | Confirmação ao desativar e botão “Reativar” (relato 3). |
| 2:30–3:00 | Carrinho no celular (F12 › modo dispositivo) | Botões − e + maiores (relato 4). |
| 3:00–3:30 | Relato 5 | Por que notificações por e-mail/WhatsApp não foram implementadas (exigem servidor e serviço pago) e a alternativa: linha do tempo em “Meus pedidos”. |
| 3:30–4:00 | GitHub › Commits | Um commit por correção, mencionando o relato atendido. |
