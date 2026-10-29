import React from "react";

import { STUDENT_CODENAMES } from "../codenames";
import { displayName } from "../format";
import { CodenameAmountForm } from "./CodenameAmountForm";
import { Icon } from "./Icon";
import { TxPending, TxSuccess } from "./TransactionStatus";

// Max Turings per vote, as enforced by Turing.vote().
const MAX_VOTE = 2;

export function VoteCard({ userInfo, voting, tx, busy, compact, onVote, onDismissTx }) {
  const own = tx && tx.kind === "vote" ? tx : null;

  if (own && (own.stage === "wallet" || own.stage === "pending")) {
    return (
      <section className="card">
        <TxPending tx={own} />
      </section>
    );
  }

  if (own && own.stage === "success") {
    return (
      <section className="card">
        <TxSuccess tx={own} onDone={onDismissTx} />
      </section>
    );
  }

  // Students can't vote for themselves nor twice for the same codename.
  const options = STUDENT_CODENAMES.filter((c) => c !== userInfo.codename).map(
    (codename) => ({
      value: codename,
      label: displayName(codename),
      disabled: userInfo.voted[codename],
      hint: userInfo.voted[codename] ? "já votado" : undefined,
    })
  );

  return (
    <section className="card" aria-labelledby="vote-title">
      <div className="card__head">
        <h2 id="vote-title" className="card__title">
          Faça seu voto
        </h2>
        <span className="tile">
          <Icon name="ballot" size={18} />
        </span>
      </div>

      <CodenameAmountForm
        id="vote"
        options={options}
        maxAmount={MAX_VOTE}
        amountHint={`Informe uma quantidade de 1 a ${MAX_VOTE}.`}
        submitLabel="Votar"
        submitIcon="arrowUpRight"
        locked={!voting}
        lockedLabel="Votação encerrada"
        disabled={busy}
        error={own && own.stage === "error" ? own : null}
        onDismissError={onDismissTx}
        onSubmit={onVote}
      />

      <div className="card__foot">
        {voting ? (
          <>
            <strong>Seu voto, passo a passo</strong>
            <p>
              {compact
                ? "Escolha → confirme na carteira → aguarde a transação."
                : "Escolha o aluno e a quantidade. Confirme na carteira e aguarde a transação: o ranking será atualizado após a confirmação."}
            </p>
          </>
        ) : (
          <p className="with-icon">
            <Icon name="info" size={15} />
            O superusuário encerrou a votação. Não é possível enviar novos votos
            neste momento.
          </p>
        )}
      </div>
    </section>
  );
}

// Shown in place of the vote form to wallets not registered in the contract.
export function NotRegisteredCard() {
  return (
    <section className="card" aria-labelledby="visitor-title">
      <div className="card__head">
        <h2 id="visitor-title" className="card__title">
          Faça seu voto
        </h2>
        <span className="tile">
          <Icon name="ballot" size={18} />
        </span>
      </div>
      <div className="notice notice--neutral">
        <Icon name="info" size={18} />
        <div>
          <strong>Carteira não registrada</strong>
          <p>
            Este endereço não está no contrato da turma. Você pode acompanhar o
            ranking, mas não pode votar.
          </p>
        </div>
      </div>
    </section>
  );
}
