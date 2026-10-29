import React from "react";

import { Icon } from "./Icon";
import { formatTime } from "../format";

// "O que rolou na turma": recent contract transactions.
// layout: "list" (sidebar) or "row" (horizontal, under the ranking).
export function ActivityFeed({ items, layout = "list" }) {
  const visible = items.slice(0, layout === "row" ? 3 : 4);

  return (
    <section className={`card activity activity--${layout}`} aria-labelledby="activity-title">
      <h2 id="activity-title" className="card__title card__title--sm with-icon">
        <Icon name="messages" size={18} />
        O que rolou na turma
      </h2>

      {visible.length === 0 ? (
        <p className="muted activity__empty">
          Nenhuma movimentação ainda. Votos e emissões aparecem aqui.
        </p>
      ) : (
        <ul className="activity__list">
          {visible.map((item) => (
            <li key={item.id} className="activity__item">
              {layout === "list" && (
                <span className="tile tile--sm">
                  <Icon name={item.icon} size={14} />
                </span>
              )}
              <div>
                <strong>{item.title}</strong>
                <span>
                  {item.detail} · {formatTime(item.time)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="footnote">Transações do contrato Turing · atualizadas a cada bloco.</p>
    </section>
  );
}
