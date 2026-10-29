import React from "react";

import { STUDENT_CODENAMES } from "../codenames";
import { displayName } from "../format";
import { CodenameAmountForm } from "./CodenameAmountForm";
import { Icon } from "./Icon";
import { TxPending, TxSuccess } from "./TransactionStatus";

const OPTIONS = STUDENT_CODENAMES.map((codename) => ({
  value: codename,
  label: displayName(codename),
}));

// Superuser-only form that mints Turings for a student (issueToken).
export function IssueCard({ tx, busy, onIssue, onDismissTx }) {
  const own = tx && tx.kind === "issue" ? tx : null;

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

  return (
    <section className="card" aria-labelledby="issue-title">
      <div className="card__head card__head--tight">
        <h2 id="issue-title" className="card__title">
          Emitir Turings
        </h2>
        <Icon name="plusCircle" size={20} className="accent" />
      </div>
      <p className="card__subtitle">Adicione Turings para um aluno da turma.</p>

      <CodenameAmountForm
        id="issue"
        options={OPTIONS}
        amountHint="Informe uma quantidade maior que zero."
        submitLabel="Emitir Turings"
        submitIcon="plus"
        submitVariant="secondary"
        disabled={busy}
        error={own && own.stage === "error" ? own : null}
        onDismissError={onDismissTx}
        onSubmit={onIssue}
      />

      <p className="footnote">issueToken · Requer confirmação na carteira.</p>
    </section>
  );
}
