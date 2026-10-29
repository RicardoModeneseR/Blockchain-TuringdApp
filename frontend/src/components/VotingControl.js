import React from "react";

import { Icon } from "./Icon";

// Superuser-only panel to turn the voting on and off.
export function VotingControl({ voting, tx, busy, votingOn, votingOff }) {
  const pending =
    tx && tx.kind === "voting" && (tx.stage === "wallet" || tx.stage === "pending");
  const error = tx && tx.kind === "voting" && tx.stage === "error" ? tx : null;

  return (
    <section className="control" aria-labelledby="control-title">
      <div className="control__head">
        <h2 id="control-title" className="control__title">
          <Icon name="sliders" size={18} />
          Controle da votação
        </h2>
        <span className={`pill ${voting ? "pill--lime" : "pill--dark"}`}>
          <Icon name={voting ? "checkCircle" : "lock"} size={14} />
          {voting ? "Votação aberta" : "Votação encerrada"}
        </span>
      </div>

      <div className="control__body">
        <div className="control__copy">
          <strong>{voting ? "A turma já pode votar." : "A votação está fechada."}</strong>
          <p>
            {voting
              ? "Encerrar desabilita novos votos. O ranking permanece consultável."
              : "Abrir permite que os alunos registrados enviem seus votos."}
          </p>
          <p>As alterações de status dependem da confirmação da transação.</p>
          {error && (
            <p className="control__error" role="alert">
              <Icon name="alertCircle" size={14} />
              {error.message}
            </p>
          )}
        </div>

        <div className="control__actions">
          <div className="control__action">
            <button
              type="button"
              className="btn btn--on-dark"
              onClick={votingOn}
              disabled={busy || voting}
            >
              <Icon name={pending && tx.on ? "hourglass" : "play"} size={15} />
              {pending && tx.on ? "Confirmando…" : "Abrir votação"}
            </button>
            <span className="control__caption">
              votingOn · {voting ? "A votação já está aberta" : "Confirmar na carteira"}
            </span>
          </div>
          <div className="control__action">
            <button
              type="button"
              className="btn btn--on-dark"
              onClick={votingOff}
              disabled={busy || !voting}
            >
              <Icon name={pending && !tx.on ? "hourglass" : "square"} size={15} />
              {pending && !tx.on ? "Confirmando…" : "Encerrar votação"}
            </button>
            <span className="control__caption">
              votingOff · {voting ? "Confirmar na carteira" : "A votação já está encerrada"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
