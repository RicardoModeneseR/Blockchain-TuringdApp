import React from "react";

import { Logo } from "./Header";
import { Icon } from "./Icon";
import { NetworkErrorMessage } from "./NetworkErrorMessage";

export function ConnectWallet({ connectWallet, connecting, networkError, dismiss }) {
  return (
    <main className="gate">
      <div className="gate__card">
        <Logo />
        <p className="eyebrow">Turma de Blockchain / Espaço da comunidade</p>
        <h1 className="gate__title">Entre no clube.</h1>
        <p className="muted">
          Conecte sua carteira para votar, acompanhar o ranking e ver o que
          rolou na turma.
        </p>

        {/* Wallet network should be set to Localhost:8545. */}
        {networkError && (
          <NetworkErrorMessage message={networkError} dismiss={dismiss} />
        )}

        <button
          type="button"
          className="btn btn--block btn--primary"
          onClick={connectWallet}
          disabled={connecting}
        >
          <Icon name={connecting ? "hourglass" : "wallet"} size={16} />
          {connecting ? "Conectando… confirme na carteira" : "Conectar carteira"}
        </button>
        <p className="footnote">Rede local Hardhat · localhost:8545</p>
      </div>
    </main>
  );
}
