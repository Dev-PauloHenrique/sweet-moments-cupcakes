# O que mudou em cada versão

Aqui fica anotado tudo de relevante que mudou no projeto, da versão mais nova pra mais antiga.

## [1.2.0] — 2026-11-05

### Novidades
- Fotos de verdade em todos os sabores (no lugar das ilustrações), todas com a mesma mesa de madeira e luz quente de fim de tarde. Viraram WebP de uns 35 KB cada pra não pesar.
- A abertura da página inicial ganhou um vídeo curtinho de fundo, com o título por cima. Se a pessoa pediu menos animação no sistema (ou está economizando dados), aparece só a foto parada.
- Nova imagem de compartilhamento pra quando o link é mandado no WhatsApp/redes.
- Um zoom bem leve na foto do produto quando passa o mouse no cartão.

### Mudanças
- Tirei a faixa e os textos dizendo que a loja era de mentirinha; o enunciado do PIT não pede isso. O aviso de que o pagamento é simulado continuou, porque é regra do projeto (RN11).
- No checkout, a retirada agora mostra só o horário do balcão.
- O banco local foi pra versão 2, então quem já tinha aberto o site recebe o catálogo novo com as fotos automaticamente.
- Textos da documentação ficaram mais diretos.

## [1.1.0] — 2026-11-04

Melhorias que saíram dos testes com usuários (detalhes no [laudo de qualidade](docs/3-testes-e-validacao/laudo-de-qualidade.md)).

### Novidades
- Campo de pesquisa no cardápio, que acha o sabor pelo nome ou ingrediente mesmo sem acento (relato 1). Com teste automático.
- Máscara no celular e no CEP, e o cursor vai direto pro primeiro campo com erro (relato 2). Também com testes.
- Botão "Reativar" na lista de produtos e confirmação antes de desativar (relato 3).
- Formulário de relato de teste no GitHub Issues e a documentação toda em `docs/`.

### Correções
- Botões de + e − do carrinho maiores (44 px), pra não errar o toque no celular (relato 4).

### Pensado, mas ficou pra depois
- Avisar o cliente por e-mail/WhatsApp quando o status muda (relato 5): precisa de servidor e de um serviço de envio, então não cabe num site estático.

## [1.0.0] — 2026-11-04

### Novidades
- A loja inteira: início, cardápio com filtro, detalhe do produto, carrinho, checkout (entrega ou retirada, pagamento simulado), login/cadastro, "Meus pedidos" com o andamento de cada pedido e o painel da equipe (pedidos, produtos e relatório).
- MVC em JavaScript, com SQLite rodando no navegador pelo sql.js e salvando tudo localmente.
- Regras de negócio RN01–RN12 nos Models; senhas guardadas com PBKDF2-SHA-256 e salt próprio de cada usuário.
- 23 testes automáticos (`npm test`).
- Publicação automática no GitHub Pages, que só acontece se os testes passarem.
- `sitemap.xml`, `robots.txt` e `llms.txt`.

### Correções
- O painel tinha rolagem pro lado em telas de 375 px por causa de textos escondidos (pra leitor de tela) escapando da tabela.
