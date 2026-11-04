-- Dados iniciais fictícios (catálogo de demonstração).
-- Usuários de demonstração são criados em js/db/inicializar.js,
-- porque as senhas precisam ser transformadas em hash no momento da carga.

INSERT INTO categoria (id, nome, descricao) VALUES
  (1, 'Clássicos', 'Sabores tradicionais que nunca saem do cardápio.'),
  (2, 'Recheados', 'Massa macia com recheio cremoso no centro.'),
  (3, 'Especiais da Casa', 'Combinações autorais e ingredientes selecionados.');

INSERT INTO produto (categoria_id, nome, descricao, preco_centavos, imagem, ativo) VALUES
  (1, 'Baunilha com Frutas Vermelhas',
      'Massa de baunilha com cobertura de buttercream suave e frutas vermelhas frescas por cima.',
      1290, 'img/produtos/baunilha-frutas-vermelhas.svg', 1),
  (1, 'Chocolate Belga',
      'Massa de cacau intensa com ganache de chocolate meio amargo e raspas de chocolate.',
      1390, 'img/produtos/chocolate-belga.svg', 1),
  (1, 'Red Velvet',
      'Massa aveludada de cacau suave com cobertura de cream cheese e farelo de massa vermelha.',
      1490, 'img/produtos/red-velvet.svg', 1),
  (2, 'Brigadeiro Gourmet',
      'Massa de chocolate recheada com brigadeiro cremoso e finalizada com granulado belga.',
      1350, 'img/produtos/brigadeiro.svg', 1),
  (2, 'Doce de Leite com Flor de Sal',
      'Massa de baunilha recheada com doce de leite e cobertura salpicada com flor de sal.',
      1450, 'img/produtos/doce-de-leite.svg', 1),
  (2, 'Limão Siciliano',
      'Massa cítrica recheada com creme de limão siciliano e merengue levemente maçaricado.',
      1390, 'img/produtos/limao-siciliano.svg', 1),
  (3, 'Pistache',
      'Massa amanteigada com creme de pistache e pistaches picados na cobertura.',
      1690, 'img/produtos/pistache.svg', 1),
  (3, 'Cenoura com Chocolate',
      'Releitura do bolo de cenoura com cobertura brilhante de chocolate ao leite.',
      1250, 'img/produtos/cenoura-chocolate.svg', 1),
  (3, 'Maracujá (sazonal)',
      'Massa leve com mousse de maracujá. Disponível apenas em algumas épocas do ano.',
      1390, 'img/produtos/maracuja.svg', 0);
