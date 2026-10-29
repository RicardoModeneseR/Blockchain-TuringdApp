import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TuringArtifact from "../contracts/Turing.json";
import contractAddress from "../contracts/contract-address.json";

import { PROFESSOR_CODENAME, STUDENT_CODENAMES } from "../codenames";
import { describeTxError, displayName, isRejectedByUser, turings } from "../format";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Header } from "./Header";
import { Hero, StatusBanner } from "./Hero";
import { VotingControl } from "./VotingControl";
import { VoteCard, NotRegisteredCard } from "./VoteCard";
import { IssueCard } from "./IssueCard";
import { Ranking } from "./Ranking";
import { ActivityFeed } from "./ActivityFeed";

// This is the default id used by the Hardhat Network
const HARDHAT_NETWORK_ID = '31337';

// Reads go straight to the Hardhat node: MetaMask caches call results by
// block number, so after restarting the node and redeploying it can keep
// answering with the old contract's state (e.g. the wrong codename/role).
const LOCAL_RPC_URL = "http://127.0.0.1:8545";

// How many past blocks are scanned to build the activity feed. Hardhat mines
// one transaction per block, so this is roughly the last N transactions.
const ACTIVITY_LOOKBACK_BLOCKS = 40;
const ACTIVITY_MAX_ITEMS = 6;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Turing contract
//   3. Finds out whether the user is a regular user or a superuser
//      (the contract owner or the professor)
//   4. Keeps the ranking updated by listening to the contract's Transfer
//      events (both vote and issueToken mint tokens, which emits Transfer)
//   5. Builds the activity feed from the contract transactions of each block
//   6. Sends the vote, issueToken, votingOn and votingOff transactions
//   7. Renders the whole application
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      // The user's address and what they are allowed to do
      selectedAddress: undefined,
      userInfo: undefined,
      // Whether the voting is active
      voting: undefined,
      // List of { codename, account, balance }, ordered by balance
      ranking: undefined,
      rankingUpdatedAt: undefined,
      refreshing: false,
      // Recent contract transactions, newest first
      activity: [],
      // The transaction being sent / last result:
      // { kind, stage: "wallet" | "pending" | "success" | "error", ... }
      tx: undefined,
      networkError: undefined,
      connecting: false,
    };

    this.state = this.initialState;
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install a wallet.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          connecting={this.state.connecting}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (
      !this.state.userInfo ||
      this.state.voting === undefined ||
      !this.state.ranking
    ) {
      return <Loading />;
    }

    const { selectedAddress, userInfo, voting, ranking, tx, activity } = this.state;
    const busy = tx !== undefined && (tx.stage === "wallet" || tx.stage === "pending");
    const { isSuperuser, isAuthorized } = userInfo;

    let hero;
    if (isSuperuser) {
      hero = {
        // The contract owner has no codename, like "Admin" in the header.
        title: `Área do superusuário, ${displayName(userInfo.codename) || "Admin"}`,
        subtitle: "Distribua Turings, participe e acompanhe a votação em um só lugar.",
        badge: "Superusuário",
      };
    } else if (isAuthorized) {
      hero = {
        title: displayName(userInfo.codename),
        subtitle: voting
          ? "Vote nos trabalhos dos colegas"
          : "A votação foi encerrada. Explore a classificação e a atividade da turma.",
        badge: "Aluno registrado",
      };
    } else {
      hero = {
        title: "Uma turma. Muitas contribuições.",
        subtitle: "Esta carteira não está registrada. Acompanhe a classificação e a atividade da turma.",
        badge: "Visitante",
      };
    }

    const voteCard = isAuthorized ? (
      <VoteCard
        userInfo={userInfo}
        voting={voting}
        tx={tx}
        busy={busy}
        compact={isSuperuser}
        onVote={(codename, amount) => this._vote(codename, amount)}
        onDismissTx={() => this._dismissTx()}
      />
    ) : (
      !isSuperuser && <NotRegisteredCard />
    );

    const rankingCard = (
      <Ranking
        ranking={ranking}
        currentCodename={userInfo.codename}
        voting={voting}
        updatedAt={this.state.rankingUpdatedAt}
        refreshing={this.state.refreshing}
        onRefresh={() => this._refreshRanking()}
      />
    );

    return (
      <div className="app">
        <Header
          address={selectedAddress}
          codename={userInfo.codename}
          isSuperuser={isSuperuser}
          onDisconnect={() => this._disconnect()}
        />

        <main className="page">
          <Hero {...hero} />

          {isSuperuser ? (
            <VotingControl
              voting={voting}
              tx={tx}
              busy={busy}
              votingOn={() => this._setVoting(true)}
              votingOff={() => this._setVoting(false)}
            />
          ) : (
            <StatusBanner voting={voting} canVote={isAuthorized} />
          )}

          <div className={`layout${isSuperuser ? " layout--admin" : ""}`}>
            <div className="layout__side">
              {voteCard}
              {isSuperuser ? (
                <IssueCard
                  tx={tx}
                  busy={busy}
                  onIssue={(codename, amount) => this._issueToken(codename, amount)}
                  onDismissTx={() => this._dismissTx()}
                />
              ) : (
                <ActivityFeed items={activity} />
              )}
            </div>

            <div className="layout__main">
              {rankingCard}
              {isSuperuser && <ActivityFeed items={activity} layout="row" />}
            </div>
          </div>
        </main>

        <footer className="footer">
          <span>
            <strong>turing club</strong> / construído em comunidade
          </span>
          <span>
            Rede local Hardhat · contrato{" "}
            <span className="mono">
              {contractAddress.Turing.slice(0, 6)}…{contractAddress.Turing.slice(-4)}
            </span>
          </span>
        </footer>
      </div>
    );
  }

  componentWillUnmount() {
    this._stopListening();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.
    this.setState({ connecting: true, networkError: undefined });

    try {
      const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // First we make sure the wallet is on the Hardhat network, since the
      // provider must be created after any chain switch.
      await this._ensureNetwork();

      await this._initialize(selectedAddress);
    } catch (error) {
      console.error(error);
      this.setState({ ...this.initialState, networkError: this._connectErrorMessage(error) });
      return;
    } finally {
      this.setState({ connecting: false });
    }

    // We reinitialize it whenever the user changes their account.
    if (!this._accountsListener) {
      this._accountsListener = ([newAddress]) => {
        this._stopListening();
        // `accountsChanged` event can be triggered with an undefined newAddress.
        // This happens when the user removes the Dapp from the "Connected
        // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
        // To avoid errors, we reset the dapp state
        if (newAddress === undefined) {
          return this._resetState();
        }

        this._initialize(newAddress).catch((error) => {
          console.error(error);
          this.setState({ ...this.initialState, networkError: this._connectErrorMessage(error) });
        });
      };
      window.ethereum.on("accountsChanged", this._accountsListener);

      // The ethers provider is bound to a chain, so start over if it changes.
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }

  // Turns the errors that can happen while connecting into a message for the
  // connect screen.
  _connectErrorMessage(error) {
    if (error.code === 4001 || error.code === "ACTION_REJECTED") {
      return "A conexão foi recusada na carteira. Tente novamente quando quiser.";
    }
    if (error.code === -32002) {
      return "Já existe um pedido aberto na carteira. Abra a extensão da MetaMask para continuar.";
    }
    if (error.code === "CONTRACT_NOT_FOUND") {
      return error.message;
    }
    return `Não foi possível conectar: ${error.message || error}`;
  }

  async _initialize(userAddress) {
    // We first store the user's address in the component's state, clearing
    // the data that depends on it
    this._stopListening();
    this._lastProcessedBlock = undefined;

    this._initializeEthers();

    // Without this check every contract call would fail and the dapp would
    // stay on the loading screen forever.
    const code = await this._provider.getCode(contractAddress.Turing);
    if (code === "0x") {
      const error = new Error(
        "Contrato Turing não encontrado nesta rede. Confira se o node do Hardhat está rodando e faça o deploy de novo (npx hardhat run scripts/deploy.js --network localhost). Se o node foi reiniciado, limpe o cache da MetaMask em Configurações → Avançado → Limpar dados da guia de atividades."
      );
      error.code = "CONTRACT_NOT_FOUND";
      throw error;
    }

    this.setState({
      ...this.initialState,
      selectedAddress: userAddress,
    });

    await Promise.all([
      this._updateUserInfo(userAddress),
      this._updateVoting(),
      this._updateRanking(),
    ]);
    this._loadActivity().catch((error) => console.error(error));
    this._startListening();
  }

  _initializeEthers() {
    // Reads, events and receipts come from the node itself...
    this._provider = new ethers.providers.JsonRpcProvider(LOCAL_RPC_URL);
    this._provider.pollingInterval = 1000;

    this._turing = new ethers.Contract(
      contractAddress.Turing,
      TuringArtifact.abi,
      this._provider
    );

    // ...while transactions are signed and sent by the user's wallet.
    const wallet = new ethers.providers.Web3Provider(window.ethereum);
    this._turingSigner = this._turing.connect(wallet.getSigner(0));
  }

  // Instead of polling balanceOf() on a timer, we listen to the Transfer
  // event: every vote() and issueToken() mints tokens, which emits Transfer,
  // so the ranking is refreshed whenever any user's balance changes.
  //
  // votingOn/votingOff don't emit events, so the voting status and the
  // activity feed are refreshed on every new block.
  _startListening() {
    this._turing.on("Transfer", () => {
      this._updateRanking();
      this._updateUserInfo(this.state.selectedAddress);
    });

    this._provider.on("block", (blockNumber) => {
      this._updateVoting();
      this._processBlocks(blockNumber);
    });
  }

  _stopListening() {
    if (this._turing) {
      this._turing.removeAllListeners();
    }
    if (this._provider) {
      this._provider.removeAllListeners();
    }
  }

  // Superusers are the contract owner and the professor, the same accounts
  // accepted by the contract's onlyOwnerOrProfessor modifier.
  async _updateUserInfo(userAddress) {
    const [owner, professor, isAuthorized, codename, balance] =
      await Promise.all([
        this._turing.owner(),
        this._turing.users(PROFESSOR_CODENAME),
        this._turing.isAuthorized(userAddress),
        this._turing.codenameOf(userAddress),
        this._turing.balanceOf(userAddress),
      ]);

    const address = userAddress.toLowerCase();
    const isSuperuser =
      address === owner.toLowerCase() || address === professor.toLowerCase();

    // Which codenames this user already voted for (the contract rejects a
    // second vote for the same codename).
    const voted = {};
    if (codename) {
      const flags = await Promise.all(
        STUDENT_CODENAMES.map((c) => this._turing.hasVote(codename, c))
      );
      STUDENT_CODENAMES.forEach((c, i) => {
        voted[c] = flags[i];
      });
    }

    this.setState({
      userInfo: { isAuthorized, isSuperuser, codename, balance, voted },
    });
  }

  async _updateVoting() {
    const voting = await this._turing.voting();
    this.setState({ voting });
  }

  // The addresses are read from the contract every time, since updateUser
  // can change the account behind a codename.
  async _updateRanking() {
    const ranking = await Promise.all(
      STUDENT_CODENAMES.map(async (codename) => {
        const account = await this._turing.users(codename);
        const balance = await this._turing.balanceOf(account);
        return { codename, account, balance };
      })
    );

    ranking.sort((a, b) => {
      if (a.balance.eq(b.balance)) {
        return 0;
      }
      return a.balance.gt(b.balance) ? -1 : 1;
    });

    this.setState({ ranking, rankingUpdatedAt: new Date() });
  }

  async _refreshRanking() {
    this.setState({ refreshing: true });
    try {
      await Promise.all([this._updateRanking(), this._updateVoting()]);
    } finally {
      this.setState({ refreshing: false });
    }
  }

  async _loadActivity() {
    const latest = await this._provider.getBlockNumber();
    this._lastProcessedBlock = Math.max(-1, latest - ACTIVITY_LOOKBACK_BLOCKS);
    await this._processBlocks(latest);
  }

  // Reads the Turing transactions mined since the last processed block and
  // turns them into activity feed items.
  async _processBlocks(toBlock) {
    if (this._lastProcessedBlock === undefined || toBlock <= this._lastProcessedBlock) {
      return;
    }
    const fromBlock = this._lastProcessedBlock + 1;
    this._lastProcessedBlock = toBlock;

    const items = [];
    for (let n = fromBlock; n <= toBlock; n++) {
      const block = await this._provider.getBlockWithTransactions(n);
      const time = new Date(block.timestamp * 1000);

      for (const tx of block.transactions) {
        if (!tx.to || tx.to.toLowerCase() !== contractAddress.Turing.toLowerCase()) {
          continue;
        }
        const receipt = await this._provider.getTransactionReceipt(tx.hash);
        if (receipt.status !== 1) {
          continue;
        }
        let parsed;
        try {
          parsed = this._turing.interface.parseTransaction(tx);
        } catch (error) {
          continue;
        }
        const base = { block: n, time };
        items.push(...this._describeTransaction(tx, parsed, base));
      }
    }

    if (items.length > 0) {
      this.setState((state) => {
        const seen = new Set(state.activity.map((item) => item.id));
        const merged = [...items.filter((item) => !seen.has(item.id)), ...state.activity];
        merged.sort((a, b) => b.block - a.block || b.order - a.order);
        return { activity: merged.slice(0, ACTIVITY_MAX_ITEMS) };
      });
    }
  }

  _describeTransaction(tx, parsed, base) {
    const id = (i) => `${tx.hash}-${i}`;
    const { name, args } = parsed;

    switch (name) {
      // Votes are anonymous: only the recipient is shown, never the voter
      // (tx.from), not even through the 10-vote reward minted in the same tx.
      case "vote":
        return [
          {
            ...base,
            id: id(0),
            order: 0,
            icon: "check",
            title: `${displayName(args.codename)} recebeu ${turings(args.amount)}`,
            detail: "Voto confirmado",
          },
        ];
      case "issueToken":
        return [
          {
            ...base,
            id: id(0),
            order: 0,
            icon: "plus",
            title: `${displayName(args.codename)} recebeu ${turings(args.amount)}`,
            detail: "Emissão confirmada",
          },
        ];
      case "votingOn":
      case "votingOff":
        return [
          {
            ...base,
            id: id(0),
            order: 0,
            icon: name === "votingOn" ? "radio" : "lock",
            title: name === "votingOn" ? "Votação aberta" : "Votação encerrada",
            detail: "Superusuário",
          },
        ];
      case "updateUser":
        return [
          {
            ...base,
            id: id(0),
            order: 0,
            icon: "wallet",
            title: `Carteira de ${displayName(args.codename)} atualizada`,
            detail: "Superusuário",
          },
        ];
      default:
        return [];
    }
  }

  // The token has 0 decimals, so amounts are whole Turings and are sent to
  // the contract as typed.
  _vote(codename, amount) {
    return this._sendTransaction({ kind: "vote", codename, amount }, () =>
      this._turingSigner.vote(codename, amount)
    );
  }

  _issueToken(codename, amount) {
    return this._sendTransaction({ kind: "issue", codename, amount }, () =>
      this._turingSigner.issueToken(codename, amount)
    );
  }

  _setVoting(on) {
    return this._sendTransaction({ kind: "voting", on }, () =>
      on ? this._turingSigner.votingOn() : this._turingSigner.votingOff()
    );
  }

  // Sends a transaction and waits for it to be mined, tracking each stage in
  // `tx` so the UI can show it. The ranking itself is updated by the
  // Transfer listener.
  async _sendTransaction(details, send) {
    this.setState({ tx: { ...details, stage: "wallet" } });

    try {
      const sent = await send();
      this.setState({ tx: { ...details, stage: "pending", hash: sent.hash } });

      const receipt = await this._provider.waitForTransaction(sent.hash);

      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await Promise.all([this._updateVoting(), this._updateRanking()]);

      // The voting control just reflects the new status, no success screen.
      if (details.kind === "voting") {
        this.setState({ tx: undefined });
      } else {
        this.setState({
          tx: { ...details, stage: "success", hash: sent.hash, confirmedAt: new Date() },
        });
      }
    } catch (error) {
      if (!isRejectedByUser(error)) {
        console.error(error);
      }
      this.setState({
        tx: { ...details, stage: "error", message: describeTxError(error, details.kind) },
      });
    }
  }

  // This method just clears part of the state.
  _dismissTx() {
    this.setState({ tx: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _disconnect() {
    this._stopListening();
    this._resetState();
  }

  // This method resets the state
  _resetState() {
    this._lastProcessedBlock = undefined;
    this.setState(this.initialState);
  }

  // Switches the wallet to the Hardhat network (Localhost:8545), adding it
  // to the wallet first if it doesn't know it yet. `networkVersion` is
  // deprecated in MetaMask, so the chain id is asked to the wallet.
  async _ensureNetwork() {
    const chainIdHex = `0x${Number(HARDHAT_NETWORK_ID).toString(16)}`;
    const current = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(current, 16) === Number(HARDHAT_NETWORK_ID)) {
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      // 4902: the wallet doesn't have this chain
      if (error.code !== 4902 && !(error.data && error.data.originalError && error.data.originalError.code === 4902)) {
        throw error;
      }
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: "Hardhat Localhost",
            rpcUrls: ["http://127.0.0.1:8545"],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          },
        ],
      });
    }
  }
}
