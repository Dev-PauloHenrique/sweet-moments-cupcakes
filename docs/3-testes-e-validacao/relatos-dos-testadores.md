# Relatos dos testadores (versão 1.0)

Cinco pessoas testaram a versão 1.0 publicada, usando o [modelo de relato](modelo-relato-de-teste.md). A análise de cada relato e as correções estão no [laudo de qualidade](laudo-de-qualidade.md).

## Relato 1 — Mariana Couto Ferreira
- **Data do teste:** 04/11/2026
- **Dispositivo:** notebook, Google Chrome
- **O que testou e funcionou:** Navegou pela página inicial e pelo cardápio, usou o filtro por categoria (Clássicos, Recheados e Especiais da Casa) e abriu a página de detalhes de três sabores. Adicionou produtos ao carrinho pela listagem e pela página de detalhes, com quantidades diferentes; o contador do cabeçalho e o aviso de confirmação apareceram corretamente. Verificou que o sabor sazonal aparece como “Indisponível” e não pode ser adicionado.
- **O que testou e não funcionou — o que deve ser corrigido:** Não houve erro. Como sugestão, o cardápio só permite filtrar por categoria: para encontrar um sabor específico (por exemplo, “limão” ou “pistache”) é preciso percorrer a lista. Sugere um campo de pesquisa por nome ou ingrediente.
- **Funcionalidade não testada:** Não testou a área administrativa, pois usou apenas o perfil de cliente.

## Relato 2 — Thiago Nascimento Prado
- **Data do teste:** 04/11/2026
- **Dispositivo:** celular Android, Chrome
- **O que testou e funcionou:** Criou uma conta nova, saiu e entrou novamente; testou login com senha errada e recebeu a mensagem “E-mail ou senha inválidos.”. Tentou cadastrar o mesmo e-mail duas vezes e o sistema recusou. Finalizou um pedido com entrega e o endereço foi validado.
- **O que testou e não funcionou — o que deve ser corrigido:** Os campos de celular e CEP não são formatados durante a digitação, o que dificulta conferir se o número está certo no celular. Além disso, ao enviar o formulário com erro, a mensagem aparece no topo e é preciso rolar a tela para descobrir qual campo está errado. Sugere máscaras nesses campos e levar o cursor direto ao campo com problema.
- **Funcionalidade não testada:** Recuperação de senha, que não existe nesta versão.

## Relato 3 — Juliana Reis Monteiro
- **Data do teste:** 04/11/2026
- **Dispositivo:** notebook, Microsoft Edge
- **O que testou e funcionou:** Com a conta de administrador, cadastrou um produto novo (primeiro com campos vazios, conferindo as mensagens de validação), editou o preço de um sabor e confirmou que um pedido feito antes manteve o preço antigo. Consultou o relatório de vendas com filtro de período.
- **O que testou e não funcionou — o que deve ser corrigido:** Ao clicar em “Desativar”, o produto é desativado na hora, sem confirmação — um clique acidental tira o sabor de venda. Para reativar, é preciso abrir “Editar” e marcar uma opção no fim do formulário, o que não é intuitivo. Sugere pedir confirmação e ter um botão “Reativar” visível na lista.
- **Funcionalidade não testada:** Exclusão definitiva de produtos (não existe; a desativação preserva o histórico de pedidos).

## Relato 4 — Rafael Okamoto Lima
- **Data do teste:** 04/11/2026
- **Dispositivo:** celular iPhone (tela pequena), Safari
- **O que testou e funcionou:** Fez um pedido completo pelo celular: adicionou quatro sabores, alterou quantidades, removeu um item, escolheu retirada na loja e pagamento em dinheiro. O pedido apareceu em “Meus pedidos” com o status “Recebido” e o total correto. Atualizou a página no meio da compra e o carrinho foi mantido.
- **O que testou e não funcionou — o que deve ser corrigido:** No carrinho, os botões “−” e “+” são pequenos para o dedo; algumas vezes tocou no botão errado ou no link “Remover”, que fica muito próximo. Sugere aumentar a área de toque desses botões.
- **Funcionalidade não testada:** Uso em tablet.

## Relato 5 — Beatriz Sales Antunes
- **Data do teste:** 04/11/2026
- **Dispositivo:** notebook, Firefox
- **O que testou e funcionou:** Testou o fluxo da equipe em duas abas: fez um pedido como cliente e, como atendente, avançou o status até “Concluído”. Conferiu que a linha do tempo do pedido do cliente mostrou cada etapa com data e hora e que o pagamento “na retirada” passou a “Aprovado” ao concluir. Confirmou que o gestor vê o relatório mas não consegue alterar status.
- **O que testou e não funcionou — o que deve ser corrigido:** Não encontrou erros. Sugere enviar notificação por e-mail ou WhatsApp ao cliente quando o status do pedido mudar, para que ele não precise entrar no site para acompanhar.
- **Funcionalidade não testada:** Pagamento real e integração com meios de pagamento, pois o pagamento desta versão é apenas simulado.
