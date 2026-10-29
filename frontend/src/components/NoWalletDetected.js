import React from "react";

import { Logo } from "./Header";

export function NoWalletDetected() {
  return (
    <main className="gate">
      <div className="gate__card">
        <Logo />
        <h1 className="gate__title">Nenhuma carteira encontrada.</h1>
        <p className="muted">
          Para participar, instale uma carteira Ethereum como{" "}
          <a href="http://metamask.io" target="_blank" rel="noopener noreferrer">
            MetaMask
          </a>{" "}
          ou{" "}
          <a
            href="https://www.coinbase.com/wallet"
            target="_blank"
            rel="noopener noreferrer"
          >
            Coinbase Wallet
          </a>{" "}
          e recarregue a página.
        </p>
      </div>
    </main>
  );
}
