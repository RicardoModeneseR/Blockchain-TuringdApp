# Turing dApp · turing club

dApp de votação da turma de Blockchain. Os alunos reconhecem o trabalho dos colegas votando com **Turings (TUR)**, um token criado sob demanda, e o ranking da turma é montado a partir dos saldos on-chain.

O projeto tem duas partes:

- **Contrato** (`contracts/Turing.sol`): token, cadastro dos alunos, votação e emissão.
- **Frontend** (`frontend/`): app React "turing club", que conversa com o contrato pela MetaMask.

---

## Sumário

1. [Como funciona](#como-funciona)
2. [Estrutura do projeto](#estrutura-do-projeto)
3. [Pré-requisitos](#pré-requisitos)
4. [Como rodar](#como-rodar)
5. [Configurando a MetaMask](#configurando-a-metamask)
6. [O contrato em detalhes](#o-contrato-em-detalhes)
7. [O frontend em detalhes](#o-frontend-em-detalhes)
8. [Solução de problemas](#solução-de-problemas)
9. [Créditos e licença](#créditos-e-licença)

---

## Como funciona

**Papéis**

| Papel | Quem é | O que pode fazer |
|---|---|---|
| Superusuário | quem fez o deploy (`owner`) e a professora (`roberta`) | abrir e encerrar a votação, emitir Turings, atualizar a carteira de um aluno |
| Aluno | os codinomes `nome1` … `nome19` cadastrados no contrato | votar nos colegas enquanto a votação está aberta |
| Visitante | qualquer outra carteira | apenas acompanhar o ranking |

**Regras da votação**

- Cada voto dá de **1 a 2 Turings** ao aluno escolhido.
- Não é possível votar em si mesmo, nem votar duas vezes no mesmo colega.
- A cada **10 votos**, quem vota ganha **1 Turing** de recompensa.
- Os Turings não existem de antemão: são criados (*mint*) a cada voto ou emissão, sem limite máximo de supply.

---

## Estrutura do projeto

```
.
├── contracts/
│   └── Turing.sol             # contrato do token e da votação
├── scripts/
│   └── deploy.js              # faz o deploy e copia ABI + endereço para o frontend
├── tasks/
│   └── faucet.js              # `npx hardhat faucet <endereço>`: envia 1 ETH para gás
├── hardhat.config.js
└── frontend/                  # app React (Create React App)
    ├── public/
    └── src/
        ├── index.js           # ponto de entrada
        ├── styles.css         # design system (cores, tipografia, componentes)
        ├── codenames.js       # lista de codinomes, precisa bater com o contrato
        ├── format.js          # helpers de texto e tradução dos erros do contrato
        ├── contracts/         # gerado pelo deploy (ignorado no git)
        └── components/
            ├── Dapp.js        # toda a lógica: carteira, leituras, eventos, transações
            ├── Header.js, Hero.js, VotingControl.js
            ├── VoteCard.js, IssueCard.js, CodenameAmountForm.js, Select.js
            ├── TransactionStatus.js
            ├── Ranking.js, ActivityFeed.js
            └── ...            # telas de conexão, carregamento e ícones
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) em uma [versão suportada pelo Hardhat](https://hardhat.org/nodejs-versions) (LTS)
- Navegador com a extensão [MetaMask](https://metamask.io)

---

## Como rodar

Use três terminais, todos a partir da raiz do projeto.

**1. Instale as dependências**

```sh
npm install
cd frontend && npm install && cd ..
```

**2. Suba a rede local** (terminal 1, fica rodando)

```sh
npx hardhat node
```

O terminal mostra as 20 contas de teste com as chaves privadas. Elas serão usadas na MetaMask.

**3. Faça o deploy do contrato** (terminal 2)

```sh
npx hardhat run scripts/deploy.js --network localhost
```

O script salva o ABI e o endereço do contrato em `frontend/src/contracts/`.

**4. Dê ETH para as carteiras fora da lista do Hardhat**

As contas `roberta` e `nome1` não fazem parte das contas padrão do Hardhat e começam sem ETH para pagar gás:

```sh
npx hardhat faucet <endereço> --network localhost
```

**5. Inicie o frontend** (terminal 3)

```sh
cd frontend
npm start
```

Abra [http://localhost:3000](http://localhost:3000) e clique em **Conectar carteira**.

> Sempre que reiniciar o `npx hardhat node`, a rede volta do zero: repita os passos 3 e 4 e limpe os dados da MetaMask (veja [Solução de problemas](#solução-de-problemas)).

---

## Configurando a MetaMask

**Rede.** Ao conectar, o app troca a MetaMask para a rede Hardhat e a cadastra, se ainda não existir. Para configurar manualmente:

| Campo | Valor |
|---|---|
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Moeda | `ETH` |

**Contas.** Na MetaMask, use **Add wallet → Import an account** e cole a chave privada da conta desejada:

- **Alunos `nome2` … `nome19`:** são as contas `#2` a `#19` do Hardhat. As chaves aparecem no terminal do `npx hardhat node` e já vêm com 10.000 ETH.
- **Superusuário:** a conta `#0` do Hardhat é o `owner` (quem fez o deploy). A `roberta` usa a carteira cadastrada no construtor do contrato.

Para testar outro papel, basta trocar de conta na MetaMask: o app recarrega sozinho.

> As chaves das contas do Hardhat são públicas. Use-as **apenas** na rede local, nunca em uma rede real.

---

## O contrato em detalhes

`contracts/Turing.sol` · token `Turing (TUR)`, 0 casas decimais.

| Função | Quem chama | O que faz |
|---|---|---|
| `vote(codinome, quantidade)` | aluno | dá 1–2 TUR ao colega; a cada 10 votos, o eleitor ganha 1 TUR |
| `issueToken(codinome, quantidade)` | superusuário | emite TUR para um codinome |
| `votingOn()` / `votingOff()` | superusuário | abre e encerra a votação |
| `updateUser(codinome, novoEndereço)` | superusuário | troca a carteira de um codinome |
| `transfer(para, quantidade)` | aluno | transfere TUR do próprio saldo |
| `balanceOf`, `users`, `codenameOf`, `hasVote`, `voting` … | qualquer um | leituras públicas |

Os alunos são cadastrados no **construtor** do contrato. Para alterar a turma, edite o construtor e também `frontend/src/codenames.js`, já que o contrato não permite listar os codinomes.

---

## O frontend em detalhes

**Telas**

- **Aluno:** formulário de voto, ranking com pódio e o feed "O que rolou na turma".
- **Superusuário:** painel "Controle da votação" (abrir/encerrar), formulário "Emitir Turings", ranking e feed.
- **Visitante:** apenas ranking e feed.
- **Transações:** cada envio mostra as etapas (assinatura na carteira → confirmação na blockchain → concluída) e traduz os erros do contrato para mensagens em português.

**Como os dados são lidos**

- As **leituras** (papéis, saldos, ranking, status da votação, eventos) vão direto ao node em `http://127.0.0.1:8545`. A MetaMask guarda respostas em cache por bloco e, depois de reiniciar o node, devolveria o estado antigo.
- A **MetaMask** é usada só para escolher a conta e assinar as transações.
- O ranking é atualizado pelo evento `Transfer`. O status da votação e o feed são atualizados a cada novo bloco.

**Privacidade dos votos.** O app nunca mostra quem votou em quem: o feed exibe apenas quem recebeu os Turings. Isso vale **para a interface**. Na blockchain, toda transação é pública: o endereço de quem chamou `vote` e o mapping `hasVote` podem ser consultados por qualquer pessoa com acesso à rede.

---

## Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Contrato Turing não encontrado nesta rede" | o node foi reiniciado sem novo deploy, ou a MetaMask está com cache antigo | faça o deploy de novo e, na MetaMask, vá em **Configurações → Avançado → Limpar dados da guia de atividades** |
| A MetaMask mostra "Transaction failed", mas o app mostra a operação concluída | histórico/cache antigo da MetaMask | limpe os dados da guia de atividades; o app reflete o estado real do node |
| Erro `Invalid nonce` no terminal do node | nonce da MetaMask desatualizado após reiniciar o node | limpe os dados da guia de atividades |
| Transações falham por falta de saldo | a carteira não tem ETH para gás | `npx hardhat faucet <endereço> --network localhost` |
| O botão de conectar não abre a MetaMask | o site já está autorizado, então a MetaMask conecta direto na conta selecionada | é o comportamento esperado; para escolher outra conta, troque na MetaMask |
| O papel exibido não é o esperado | a conta selecionada na MetaMask não é a que você pensa | confira o endereço no chip do canto superior direito |

---

## Créditos e licença

Projeto baseado no [Hardhat Boilerplate](https://github.com/NomicFoundation/hardhat-boilerplate), da Nomic Foundation, distribuído sob a licença MIT (veja `LICENSE`).
