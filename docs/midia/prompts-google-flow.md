# Imagens: ilustrações atuais e prompts para o Google Flow

## Situação atual

O site usa **ilustrações vetoriais originais** (`app/img/produtos/*.svg` e `app/img/hero.svg`), criadas para o projeto. São leves (3–13 KB), nítidas em qualquer tela e não dependem de serviços externos.

## Trocar por fotos geradas no Google Flow (opcional)

1. Acesse o [Google Flow](https://labs.google/fx/tools/flow) com sua conta Google e crie um projeto.
2. Escolha o modo **Imagem**, proporção **1:1**, **1 saída por pedido**. Confira na tela o modelo e o custo em créditos antes de gerar.
3. Gere primeiro a imagem do **Chocolate Belga** (peça de referência). Se aprovada, use-a como referência de estilo nas demais para manter luz e fundo iguais.
4. Baixe cada imagem aprovada, salve como `app/img/produtos/<nome-do-arquivo>.webp` (ou `.png`) e altere o caminho correspondente em `app/db/dados-iniciais.sql` e na lista `IMAGENS_DISPONIVEIS` de `app/js/models/produto.js`.
5. Clique em **Restaurar loja de demonstração** no rodapé do site para recriar o banco com os novos caminhos.

> As imagens geradas por IA são ilustrativas: os produtos são fictícios. Não peça textos, logotipos ou marcas na imagem — títulos e preços ficam no HTML.

### Estilo comum (repetir em todos os prompts)

> Professional food photography of a single gourmet cupcake, centered, three-quarter view from slightly above, on a matte cream ceramic plate over a warm off-white linen background (#FFF8F0 tones). Soft natural window light from the left, gentle shadow, shallow depth of field, crisp focus on the frosting texture. Warm, inviting, artisanal bakery mood. Square 1:1 composition with the cupcake filling about 60% of the frame and even margins so it can be cropped safely. No text, no logos, no hands, no people, no extra desserts, no watermark.

### Prompts por produto (adicionar ao estilo comum)

| Arquivo | Prompt específico |
|---|---|
| `baunilha-frutas-vermelhas` | Vanilla cupcake in a pale pink paper liner, smooth swirl of ivory vanilla buttercream topped with fresh raspberries, one blueberry and half a strawberry. |
| `chocolate-belga` | Dark chocolate cupcake in a brown paper liner, tall swirl of glossy dark chocolate ganache frosting with fine dark chocolate shavings on top. |
| `red-velvet` | Red velvet cupcake in a deep red paper liner, white cream cheese frosting swirl sprinkled with fine red velvet cake crumbs. |
| `brigadeiro` | Chocolate cupcake in a brown liner, frosting of creamy Brazilian brigadeiro covered with chocolate sprinkles, a small brigadeiro truffle on top. |
| `doce-de-leite` | Vanilla cupcake in a caramel-colored liner, swirl of golden dulce de leche frosting with a light caramel drizzle and visible flakes of sea salt. |
| `limao-siciliano` | Lemon cupcake in a pale yellow liner, lightly torched toasted meringue swirl, a thin slice of Sicilian lemon and a small mint leaf on top. |
| `pistache` | Butter cupcake in a pale green liner, soft pistachio cream frosting swirl topped with chopped green pistachios. |
| `cenoura-chocolate` | Brazilian-style carrot cupcake (orange crumb visible at the edge) in an orange liner, topped with a shiny milk chocolate glaze. |
| `maracuja` | Light cupcake in a yellow liner, passion fruit mousse swirl with a spoonful of passion fruit pulp and black seeds on top. |

### Imagem de destaque da página inicial (`hero`)

> Three gourmet cupcakes arranged in a gentle triangle on a cream marble counter — chocolate ganache on the left, vanilla buttercream with fresh berries in the center and slightly forward, red velvet with cream cheese frosting on the right. Soft morning window light, warm cream and raspberry tones, shallow depth of field, editorial bakery photography. Square 1:1, subjects centered so a 4:5 crop still works. No text, no logos, no people, no watermark.

### Revisão antes de usar

Confira: cupcake inteiro no quadro, forminha sem deformações, cobertura coerente com o sabor descrito, ausência de textos ou objetos estranhos, mesma iluminação entre as fotos e boa leitura em tamanho pequeno (miniatura do carrinho).
