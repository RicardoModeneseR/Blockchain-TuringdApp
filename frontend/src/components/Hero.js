import React from "react";

import { Icon } from "./Icon";

export function Hero({ title, subtitle, badge }) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">
          Turma de Blockchain <span aria-hidden="true">/</span> Espaço da comunidade
        </p>
        <h1 className="hero__title">{title}</h1>
        <p className="hero__subtitle">{subtitle}</p>
      </div>
      <span className="role-badge">
        <Icon name="checkCircle" size={14} />
        {badge}
      </span>
    </section>
  );
}

// Voting status strip shown to students and visitors.
export function StatusBanner({ voting, canVote }) {
  if (voting) {
    return (
      <div className="status-banner status-banner--open" role="status">
        <Icon name="radio" size={18} className="status-banner__icon" />
        <strong>Votação aberta</strong>
        <span className="status-banner__text">
          {canVote
            ? "Você já pode participar. A confirmação acontece na sua carteira."
            : "Os alunos registrados já podem votar."}
        </span>
        <span className="pill pill--lime">
          <Icon name="checkCircle" size={14} />
          {canVote ? "Pronta para votar" : "Em andamento"}
        </span>
      </div>
    );
  }

  return (
    <div className="status-banner status-banner--closed" role="status">
      <Icon name="lock" size={17} className="status-banner__icon" />
      <strong>Votação encerrada</strong>
      <span className="status-banner__text">
        Novos votos estão desabilitados; o ranking continua disponível.
      </span>
      <span className="pill pill--plain">
        <Icon name="lock" size={14} />
        Somente consulta
      </span>
    </div>
  );
}
