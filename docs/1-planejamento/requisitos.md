# Requisitos do projeto

**Projeto:** Sweet Moments Cupcakes — loja web responsiva de cupcakes gourmet
**Disciplina:** Projeto Integrador Transdisciplinar em Engenharia de Software II
**Aluno:** Paulo Henrique Cordeiro Santos
**Versão do documento:** 2.0 (revisão da PIT I — novembro de 2026)

> Resumo rápido: aqui está o que o sistema precisa fazer, as regras que ele segue e o que mudou desde a PIT I. O pagamento é simulado, então nada é cobrado de verdade.

## O que mudou desde a primeira versão

| Versão | O que mudou | Motivo |
|---|---|---|
| 1.0 | Especificação inicial (PIT I): histórias de usuário, regras de negócio, backlog MoSCoW, requisitos e diagramas com Flask + MySQL. | Atender à situação-problema 1 (elicitação de requisitos). |
| 2.0 | Arquitetura revista para **aplicação estática com MVC em JavaScript e SQLite no navegador**, hospedada no GitHub Pages; premissas pendentes resolvidas (catálogo, status, pagamentos, perfis); carrinho passou a ser armazenado no navegador; classe `Cliente` incorporada a `Usuario` por meio do atributo `perfil`; incluído histórico de status do pedido; diagramas UML atualizados. | Reduzir custo e complexidade de hospedagem (sem servidor), manter a modelagem fiel ao que foi implementado e permitir que tutores testem a solução apenas abrindo um link. |
| 2.1 | Pesquisa de sabores (UC02), máscaras de CEP/telefone, confirmação/reativação de produtos e alvos de toque maiores. | Sugestões dos testes com usuários (Situação 3). |

## 1. A ideia

No site, o cliente vê o cardápio, monta o carrinho, escolhe se vai **retirar na loja** ou **receber em casa**, escolhe como vai pagar (de forma simulada) e acompanha o pedido. Do outro lado, a equipe (atendente, administrador e gestor) usa um painel pra mudar o status dos pedidos, cuidar do catálogo e ver como estão as vendas.

A situação-problema de origem descreve uma loja de cupcakes gourmet frustrada com um aplicativo anterior que falhou por **má elicitação de requisitos**. Por isso, a especificação foi feita antes da implementação, com histórias de usuário, critérios de aceitação, regras de negócio rastreáveis e validação com usuários.

## 2. Objetivo geral

Desenvolver uma aplicação web responsiva, simples de usar e de manter, que cubra o fluxo completo de compra (catálogo → carrinho → pedido → acompanhamento) e o fluxo administrativo (pedidos → produtos → relatório), seguindo boas práticas de Engenharia de Software: requisitos ágeis, UML, modelagem de dados, padrão MVC, testes automatizados e versionamento no Git.

## 3. Escopo

### 3.1 Dentro do escopo (versão 1.1)
- Página inicial institucional com destaques e perguntas frequentes.
- Cardápio com filtro por categoria e pesquisa por nome/ingrediente.
- Detalhes do produto com disponibilidade.
- Cadastro e autenticação de clientes; contas de demonstração para cada perfil.
- Carrinho persistente no navegador (sobrevive à atualização da página).
- Checkout com entrega (endereço + taxa fixa) ou retirada (instruções).
- Pagamento demonstrativo: Pix (aprovado na simulação), cartão ou dinheiro na entrega/retirada (pendente).
- Histórico de pedidos com linha do tempo de status.
- Painel da equipe: pedidos (filtro por status/período e atualização de status), produtos (cadastrar, editar, desativar/reativar) e relatório de vendas (pedidos, faturamento, ticket médio, mais vendidos).

### 3.2 Fora do escopo
Gateway de pagamento real, emissão fiscal, logística/rastreamento, notificações por e-mail/WhatsApp, recuperação de senha por e-mail, aplicativo nativo nas lojas, programa de fidelidade e integração com sistemas externos. Esses itens dependem de um servidor e de serviços pagos e ficam para versões futuras.

## 4. Usuários e perfis

| Perfil | Responsabilidade | Permissões no sistema |
|---|---|---|
| Visitante | Conhecer a loja e montar o carrinho. | Ver cardápio, detalhes e carrinho; cadastrar-se; entrar. |
| Cliente | Comprar e acompanhar pedidos. | Tudo do visitante + finalizar pedido e ver **apenas os próprios** pedidos. |
| Atendente | Operar os pedidos do dia. | Ver todos os pedidos e atualizar status. |
| Administrador | Manter o catálogo e supervisionar a operação. | Pedidos, status, produtos e relatório. |
| Gestor | Acompanhar resultados comerciais. | Ver pedidos e relatório (somente leitura). |

## 5. Histórias de usuário e critérios de aceitação

| ID | História | Critérios de aceitação | Status |
|---|---|---|---|
| HU01 | Como **cliente**, quero ver os cupcakes disponíveis para conhecer as opções. | Lista com nome, imagem, descrição, categoria e preço; filtro por categoria; indisponíveis aparecem sinalizados e sem botão de compra. | Implementada |
| HU02 | Como **cliente**, quero ver os detalhes de um cupcake antes de comprar. | Página com descrição, preço, imagem, disponibilidade e escolha de quantidade; produto inexistente mostra mensagem amigável. | Implementada |
| HU03 | Como **cliente**, quero criar uma conta. | Nome, e-mail válido e senha forte obrigatórios; e-mail duplicado é recusado; senha guardada apenas como hash; confirmação de sucesso visível. | Implementada |
| HU04 | Como **cliente**, quero entrar com e-mail e senha. | Credenciais validadas; mensagem genérica “E-mail ou senha inválidos”; bloqueio temporário após 5 tentativas; retorno à página de origem. | Implementada |
| HU05 | Como **cliente**, quero adicionar cupcakes ao carrinho. | Só produtos ativos; quantidade de 1 a 20; contador do carrinho atualiza; aviso de confirmação. | Implementada |
| HU06 | Como **cliente**, quero revisar e alterar o carrinho. | Alterar quantidade (+/−), remover item, subtotal recalculado com o preço atual do banco; estado vazio com atalho ao cardápio. | Implementada |
| HU07 | Como **cliente**, quero escolher entre entrega e retirada. | Entrega exige endereço completo (CEP, rua, número, bairro, cidade, UF) e soma taxa; retirada mostra instruções e não cobra taxa. | Implementada |
| HU08 | Como **cliente**, quero selecionar a forma de pagamento. | Pix, cartão ou dinheiro; nenhum dado de cartão é solicitado; status demonstrativo vinculado ao pedido. | Implementada |
| HU09 | Como **cliente**, quero confirmar minha compra. | Carrinho não vazio; resumo com subtotal, taxa e total; pedido, itens e pagamento gravados juntos; número do pedido exibido; carrinho esvaziado. | Implementada |
| HU10 | Como **cliente**, quero acompanhar meus pedidos. | Lista com número, data, recebimento, itens, total e status; detalhe com linha do tempo; cliente não acessa pedido de outro. | Implementada |
| HU11 | Como **administrador**, quero cadastrar, editar e desativar produtos. | Validação de nome, descrição, preço, categoria e imagem; nome único; desativar pede confirmação e é reversível (“Reativar”); somente administrador. | Implementada |
| HU12 | Como **atendente**, quero atualizar o status dos pedidos. | Filtros por status e período; somente transições permitidas (ex.: retirada não “sai para entrega”); cancelamento pede confirmação; histórico registra quem e quando. | Implementada |
| HU13 | Como **gestor**, quero ver informações de vendas. | Quantidade de pedidos, faturamento, ticket médio, cancelados, mais vendidos e pedidos por status, com filtro de período; cancelados não entram no faturamento. | Implementada |
| HU14 | Como **cliente**, quero pesquisar um sabor pelo nome ou ingrediente. | Busca ignora maiúsculas e acentos, combina com o filtro de categoria e mostra estado vazio orientativo. | Implementada (v1.1) |

## 6. Regras de negócio

| ID | Regra | Onde é garantida |
|---|---|---|
| RN01 | Só produtos cadastrados e ativos podem ir ao carrinho/pedido. | `Carrinho.adicionar`, `PedidoModel.criar` |
| RN02 | Todo pedido pertence a um cliente autenticado. | `PedidoModel.criar` (permissão `comprar`) |
| RN03 | Pedido precisa de pelo menos um item. | `PedidoModel.criar` |
| RN04 | Total = Σ(preço atual do banco × quantidade) + taxa de entrega. | `PedidoModel.criar` (preços nunca vêm da interface) |
| RN05 | O cliente deve escolher entrega ou retirada. | `PedidoModel.criar` + `CHECK` no banco |
| RN06 | Entrega exige endereço válido. | `validarEndereco` + `CHECK (tipo_entrega = 'RETIRADA' OR endereco_id IS NOT NULL)` |
| RN07 | Cada pedido tem identificador único. | Chave primária `pedido.id` (exibida como `#00001`) |
| RN08 | O cliente só consulta os próprios pedidos. | `PedidoModel.listarDoCliente` / `detalhar` |
| RN09 | Só o administrador gerencia produtos. | Permissão `gerenciar_produtos` |
| RN10 | Só atendente e administrador alteram status. | Permissão `atualizar_status` |
| RN11 | Pagamentos são demonstrativos, sem transação real. | `servicos/pagamento.js` |
| RN12 | Alterar preço não muda pedidos anteriores. | `item_pedido.preco_unitario_centavos` copiado na compra |

## 7. Backlog priorizado (MoSCoW)

| Código | Funcionalidade | Prioridade | Situação |
|---|---|---|---|
| HU01–HU12 | Fluxo de compra e operação da loja | Must Have | Entregue (v1.0) |
| HU13 | Relatório de vendas | Should Have | Entregue (v1.0) |
| HU14 | Pesquisa no cardápio | Should Have | Entregue (v1.1, a partir de teste com usuário) |
| — | Notificações por e-mail/WhatsApp | Could Have | Não implementada (exige servidor) |
| — | Pagamento real, nota fiscal, rastreamento | Won't Have (nesta versão) | Fora do escopo |

## 8. Requisitos funcionais

| Código | Requisito | HU |
|---|---|---|
| RF01 | Apresentar o catálogo com filtro por categoria. | HU01 |
| RF02 | Apresentar os detalhes de cada produto. | HU02 |
| RF03 | Cadastrar clientes. | HU03 |
| RF04 | Autenticar usuários e encerrar sessão. | HU04 |
| RF05 | Adicionar produtos ao carrinho. | HU05 |
| RF06 | Alterar e remover itens do carrinho. | HU06 |
| RF07 | Calcular subtotal, taxa e total automaticamente. | HU06, HU09 |
| RF08 | Permitir escolher entrega ou retirada. | HU07 |
| RF09 | Permitir escolher forma de pagamento demonstrativa. | HU08 |
| RF10 | Registrar pedidos. | HU09 |
| RF11 | Listar pedidos do cliente. | HU10 |
| RF12 | Exibir status e histórico do pedido. | HU10 |
| RF13 | Gerenciar produtos (criar, editar, desativar, reativar). | HU11 |
| RF14 | Atualizar status respeitando o fluxo permitido. | HU12 |
| RF15 | Exibir indicadores de vendas por período. | HU13 |
| RF16 | Pesquisar produtos por nome/ingrediente. | HU14 |

## 9. Requisitos não funcionais

| Código | Requisito | Como foi atendido |
|---|---|---|
| RNF01 | Responsividade | Layout *mobile-first* testado em 375 px e desktop, sem rolagem horizontal. |
| RNF02 | Usabilidade | Linguagem simples, estados de carregamento/vazio/erro/sucesso, mensagens ao lado do campo, foco no primeiro erro. |
| RNF03 | Segurança | Hash PBKDF2-SHA-256 com salt, consultas parametrizadas, escape de HTML, CSP, permissões por perfil, limite de tentativas de login. |
| RNF04 | Privacidade (LGPD) | Coleta mínima (nome, e-mail, celular opcional, endereço só para entrega); dados ficam apenas no navegador do usuário e podem ser apagados no rodapé. |
| RNF05 | Integridade | Chaves estrangeiras, `CHECK`, `UNIQUE` e transações no SQLite. |
| RNF06 | Manutenibilidade | Padrão MVC, módulos ES pequenos, sem dependências externas além do sql.js. |
| RNF07 | Compatibilidade | Navegadores modernos com WebAssembly (Chrome, Edge, Firefox, Safari, Opera). |
| RNF08 | Tratamento de erros | Erros de domínio com mensagens seguras; falhas inesperadas mostram estado de erro sem detalhes técnicos. |
| RNF09 | Desempenho | Site estático, fotos em WebP (~35 KB), imagens carregadas só quando aparecem na tela, sem frameworks. |
| RNF10 | Persistência | Banco SQLite salvo no `localStorage` após cada escrita. |
| RNF11 | Acessibilidade (meta WCAG 2.2 AA) | HTML semântico, rótulos, foco visível, contraste ≥ 4,5:1, alvos de toque de 44 px, `aria-live`, redução de movimento. |

## 10. Metodologia e ferramentas

- **Processo:** incremental e iterativo, com backlog MoSCoW e ciclos curtos (v1.0 → testes com usuários → v1.1).
- **Front-end:** HTML5, CSS3 e JavaScript (ES Modules), sem frameworks.
- **Back-end (lógica de negócio):** camadas Model e Controller em JavaScript, padrão **MVC**.
- **Banco de dados:** **SQLite 3** via [sql.js](https://github.com/sql-js/sql.js) (WebAssembly), com `schema.sql` versionado.
- **Testes:** `node:test` (testes automatizados) + roteiro de testes manuais + testes com usuários.
- **Versionamento e hospedagem:** Git, GitHub, GitHub Actions e GitHub Pages.
- **Modelagem:** UML em Mermaid (renderizado pelo GitHub) com exportação em PNG.

### Por que JavaScript no lugar de Python/Flask + MySQL (decisão de arquitetura)

O planejamento da PIT I previa Flask + MySQL. Na revisão, optou-se por executar o Model e o Controller no navegador porque o GitHub Pages hospeda apenas arquivos estáticos e o objetivo era entregar um link funcional, gratuito e estável para tutores e testadores. O SQLite é um SGBD relacional popular e de fácil manutenção, e o mesmo `schema.sql` pode ser executado em um servidor no futuro. A troca mantém o MVC, o modelo relacional e as regras de negócio, e está registrada nos diagramas atualizados.

## 11. Premissas resolvidas (pendências da PIT I)

1. **Catálogo:** 9 sabores fictícios em 3 categorias, de R$ 12,50 a R$ 16,90 (um sazonal inativo para demonstrar indisponibilidade).
2. **Entrega/retirada:** retirada grátis em endereço fictício; entrega com taxa fixa de R$ 8,00.
3. **Pagamentos exibidos:** Pix (simulado, aprovado), cartão e dinheiro na entrega/retirada (pendente até a conclusão).
4. **Status:** Recebido → Em preparação → Pronto → (Saiu para entrega) → Concluído; Cancelado a partir de Recebido/Em preparação.
5. **Níveis de acesso:** matriz de permissões da seção 4.
6. **Painel do gestor:** pedidos, faturamento, ticket médio, cancelados, mais vendidos e pedidos por status, por período.
