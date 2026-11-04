# Plano e resultados de testes (verificação e validação)

Seguindo o **Modelo V** do material da disciplina: cada nível de construção tem um nível de teste correspondente.

| Construção | Teste correspondente | Como foi feito |
|---|---|---|
| Requisitos | Teste de aceitação | Testes com 5 usuários ([relatos](relatos-dos-testadores.md)) |
| Análise | Teste de sistema | Roteiro manual ponta a ponta no navegador (seção 2) |
| Arquitetura | Teste de integração | Models + SQLite real (sql.js) nos testes automatizados |
| Código | Teste unitário | Funções puras (hash, máscaras, formatadores, preços) |

- **Verificação** (“construímos o produto corretamente?”): testes automatizados e revisão do código contra as regras RN01–RN12.
- **Validação** (“construímos o produto certo?”): testes com usuários, que geraram as melhorias da versão 1.1.

## 1. Testes automatizados

Executar com `npm test` (Node.js 20+). Rodam também a cada envio ao GitHub; **o site só é publicado se todos passarem** (`.github/workflows/publicar.yml`).

Resultado em 04/11/2026: **28 testes, 28 aprovados, 0 falhas.**

| Arquivo | Teste | Requisito / regra |
|---|---|---|
| `usuario.test.mjs` | Hash de senha com salt individual e verificação | RNF03 |
| | Cadastro normaliza dados, não guarda senha em texto e ignora `perfil` enviado | HU03, mass assignment |
| | E-mail duplicado recusado (sem diferenciar maiúsculas) | HU03 |
| | Validação de nome, e-mail, senha forte e telefone | HU03 |
| | Login válido; mensagem genérica idêntica para e-mail inexistente e senha errada | HU04 |
| `produto-carrinho.test.mjs` | Conversão de reais para centavos | RNF05 |
| | Catálogo traz todos os campos, filtro de categoria e de ativos | HU01 |
| | Produto inexistente gera “não encontrado” | HU02 |
| | Só administrador cria/edita/desativa produto; campos extras ignorados | HU11, RN09 |
| | Validação de produto e nome único; caminho de imagem malicioso recusado | HU11 |
| | Carrinho adiciona, soma, altera, remove e recalcula | HU05, HU06 |
| | Quantidade inválida e produto indisponível recusados | RN01 |
| | Carrinho ignora dados corrompidos no armazenamento | RNF08 |
| | Pesquisa sem acento/maiúsculas, combinada com categoria, segura contra injeção | HU14 (v1.1) |
| `pedido.test.mjs` | Pagamento apenas simulado | RN11 |
| | Pedido de retirada com total calculado pelo banco | HU09, RN04 |
| | Entrega exige endereço válido e soma taxa | HU07, RN06 |
| | Exige login, perfil cliente, itens, modalidade e forma de pagamento | RN02, RN03, RN05 |
| | Falha no meio não deixa pedido pela metade (transação) | RNF05 |
| | Mudança de preço não altera pedido anterior | RN12 |
| | Cliente vê só os próprios pedidos | HU10, RN08 |
| | Equipe autorizada muda status seguindo as etapas; pagamento presencial aprovado ao concluir | HU12, RN10 |
| | Relatório por período, cancelados fora do faturamento, datas inválidas recusadas | HU13 |
| | Carga de demonstração cria os 4 perfis e 2 pedidos | — |
| `views.test.mjs` | Escape de HTML contra XSS | RNF03 |
| | Formatação de moeda (R$) e número do pedido | RNF02 |
| | Redirecionamento pós-login só para páginas internas | RNF03 |
| | Máscaras de CEP e telefone | v1.1 |

## 2. Teste de sistema (roteiro manual)

Executado em 04/11/2026 no navegador integrado (Chromium), servidor local `npm start`, larguras desktop e 375 px.

| # | Cenário | Passos | Resultado esperado | Resultado |
|---|---|---|---|---|
| S01 | Página inicial | Abrir `index.html` | Destaques carregados do SQLite, sem erros no console | ✅ |
| S02 | Adicionar ao carrinho | Cardápio › “Adicionar” 2× em Chocolate Belga | Contador = 2 e aviso “Produto adicionado” | ✅ |
| S03 | Checkout sem login | Abrir `checkout.html` deslogado | Redireciona a `entrar.html?voltar=checkout.html` com aviso | ✅ |
| S04 | Login inválido | E-mail inexistente + senha qualquer | “E-mail ou senha inválidos.” | ✅ |
| S05 | Login e retorno | Conta cliente demo | Volta ao checkout com resumo do carrinho | ✅ |
| S06 | Endereço inválido | Entrega com CEP “123” e UF vazia | Erros nos campos CEP e UF, pedido não gravado | ✅ |
| S07 | Pedido com entrega | Corrigir endereço, Pix, confirmar | “Pedido #00003 confirmado”, total R$ 35,80 (27,80 + 8,00), carrinho vazio | ✅ |
| S08 | Acompanhar | `pedidos.html?id=3` | Detalhe, endereço, linha do tempo “Recebido” | ✅ |
| S09 | Atendente | Login atendente › Painel | Só a aba Pedidos; “Gerenciar” #00003 › “Em preparação” | ✅ |
| S10 | Administrador – produto | Novo produto com dados inválidos e depois válidos | 5 mensagens de erro; depois “Produto salvo” e 10 produtos | ✅ |
| S11 | Relatório | Aba Relatório | 3 pedidos, faturamento R$ 215,80, ticket R$ 71,93 | ✅ |
| S12 | Conta da equipe no checkout | Admin abre `checkout.html` | Mensagem “Compras são feitas com conta de cliente” | ✅ |
| S13 | Responsividade | Todas as páginas a 375 px | Sem rolagem horizontal | ❌ → ✅ (ver abaixo) |
| S14 | v1.1 pesquisa | `cardapio.html?busca=limão` | 1 resultado: Limão Siciliano | ✅ |
| S15 | v1.1 máscaras e foco | Digitar 11912345678 no celular; enviar cadastro com e-mail inválido | “(11) 91234-5678”; foco no campo e-mail | ✅ |
| S16 | v1.1 desativar/reativar | Reativar “Maracujá” e desativar de novo | Confirmação exibida; estado alterna Ativo/Inativo | ✅ |

**Defeito encontrado no S13:** no painel, em 375 px, a página ganhava 790 px de largura. Causa raiz: textos “visualmente ocultos” (para leitores de tela) com `position: absolute` dentro da tabela rolável escapavam do contêiner. Correção: `position: relative` no contêiner da tabela e nos botões; retestado em painel, cardápio e carrinho (375 px = 375 px).

## 3. Testes com usuários (validação)

Cinco pessoas testaram a versão 1.0 usando o [modelo de relato](modelo-relato-de-teste.md). Os relatos estão em [relatos-dos-testadores.md](relatos-dos-testadores.md) e a análise em [laudo-de-qualidade.md](laudo-de-qualidade.md).

## 4. Não coberto

- Testes automatizados de interface (cliques) com ferramentas como Playwright — feitos manualmente.
- Navegadores Safari/iOS e Firefox não foram testados nesta rodada.
- Auditoria formal de acessibilidade (WCAG) com leitor de tela.
- Desempenho com grande volume de pedidos (o banco é por navegador).
