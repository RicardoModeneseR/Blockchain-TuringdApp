import React from "react";

import { Icon } from "./Icon";
import { displayName, formatTime, shortHash, turings } from "../format";

const COPY = {
  vote: {
    walletText: "Confirme o voto na sua carteira para enviá-lo à blockchain.",
    pendingText:
      "Seu voto foi enviado. Aguarde a confirmação na blockchain antes de considerar a operação concluída.",
    button: "Confirmando voto…",
    successHeading: "Seu reconhecimento chegou.",
    successTitle: "Voto confirmado!",
  },
  issue: {
    walletText: "Confirme a emissão na sua carteira para enviá-la à blockchain.",
    pendingText:
      "A emissão foi enviada. Aguarde a confirmação na blockchain antes de considerar a operação concluída.",
    button: "Confirmando emissão…",
    successHeading: "Turings a caminho.",
    successTitle: "Emissão confirmada!",
  },
};

function TxSummary({ tx }) {
  return (
    <dl className="tx-summary">
      <div>
        <dt>Aluno destinatário</dt>
        <dd>{displayName(tx.codename)}</dd>
      </div>
      <div className="tx-summary__right">
        <dt>Quantidade</dt>
        <dd>{turings(tx.amount)}</dd>
      </div>
    </dl>
  );
}

// Replaces the form while the transaction waits for the wallet / blockchain.
export function TxPending({ tx }) {
  const copy = COPY[tx.kind];
  const signed = tx.stage === "pending";

  return (
    <div className="tx" aria-live="polite">
      <p className="eyebrow">Transação · em andamento</p>
      <h2 className="card__title">Aguardando confirmação</h2>
      <span className="tile tile--lg">
        <Icon name="hourglass" size={22} />
      </span>
      <p className="muted">{signed ? copy.pendingText : copy.walletText}</p>

      <TxSummary tx={tx} />

      <ul className="tx-steps">
        <li className={signed ? "is-done" : "is-current"}>
          <Icon name={signed ? "checkCircle" : "clock"} size={16} />
          {signed ? "Confirmado na carteira" : "Aguardando assinatura na carteira"}
        </li>
        <li className={signed ? "is-current" : "is-todo"}>
          <Icon name="clock" size={16} />
          {signed ? (
            <span>
              Pendente na blockchain · <span className="mono">{shortHash(tx.hash)}</span>
            </span>
          ) : (
            "Envio para a blockchain"
          )}
        </li>
      </ul>

      <button type="button" className="btn btn--block btn--locked" disabled>
        <Icon name="hourglass" size={16} />
        {copy.button}
      </button>
      <p className="footnote">O ranking ainda não mudou. Não é necessário reenviar.</p>
    </div>
  );
}

export function TxSuccess({ tx, onDone }) {
  const copy = COPY[tx.kind];

  return (
    <div className="tx" aria-live="polite">
      <p className="eyebrow">Transação · concluída</p>
      <h2 className="card__title">{copy.successHeading}</h2>

      <div className="notice notice--success" role="status">
        <Icon name="checkCircle" size={22} />
        <div>
          <strong>{copy.successTitle}</strong>
          <p>
            {displayName(tx.codename)} recebeu {turings(tx.amount)}. Ranking atualizado.
          </p>
        </div>
      </div>

      <TxSummary tx={tx} />

      <p className="footnote">
        Transação <span className="mono">{shortHash(tx.hash)}</span> · confirmada às{" "}
        {formatTime(tx.confirmedAt)}
      </p>

      <button type="button" className="btn btn--block btn--primary" onClick={onDone}>
        <Icon name="arrowRight" size={16} />
        Voltar ao painel
      </button>
    </div>
  );
}

export function TxErrorBanner({ message }) {
  return (
    <div className="notice notice--error" role="alert">
      <Icon name="alertCircle" size={18} />
      <div>
        <strong>Transação não enviada</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}
