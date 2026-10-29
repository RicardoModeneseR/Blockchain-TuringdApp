import React from "react";

import { CodenameMark } from "./CodenameMark";
import { Icon } from "./Icon";
import { displayName, formatTime } from "../format";

// Podium slots, left to right: 2nd, 1st, 3rd.
const PODIUM_ORDER = [1, 0, 2];

// Codenames ordered by balance (highest first), with a podium for the top 3.
export function Ranking({
  ranking,
  currentCodename,
  voting,
  updatedAt,
  refreshing,
  onRefresh,
}) {
  const max = ranking.length > 0 ? ranking[0].balance : null;

  const share = (balance) => {
    if (!max || max.isZero() || balance.isZero()) {
      return 0;
    }
    return Math.max(4, balance.mul(100).div(max).toNumber());
  };

  return (
    <section className="card card--ranking" aria-labelledby="ranking-title">
      <div className="card__head">
        <div className="ranking__heading">
          <Icon name="chart" size={22} className="ranking__icon" />
          <div>
            <h2 id="ranking-title" className="card__title">
              Quem movimenta o clube
            </h2>
            <p className="card__meta">
              {ranking.length} alunos · Classificação por saldo de Turings
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <Icon name="refresh" size={14} className={refreshing ? "spin" : ""} />
          Atualizar
        </button>
      </div>

      <ol className="podium" aria-label="Três primeiros colocados">
        {PODIUM_ORDER.filter((i) => ranking[i]).map((i) => {
          const { codename, balance } = ranking[i];
          return (
            <li key={codename} className={`podium__slot podium__slot--${i + 1}`}>
              <CodenameMark
                codename={codename}
                variant={i === 0 ? "solid" : "soft"}
                size={i === 0 ? 34 : 28}
                showInitials
              />
              <span className="podium__name">{displayName(codename)}</span>
              <div className="podium__block">
                <span className="podium__value">{balance.toString()}</span>
                <span className="podium__unit">Turings</span>
                <span className="podium__place">{i + 1}º</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="table-wrap">
        <table className="ranking">
          <thead>
            <tr>
              <th scope="col">Posição</th>
              <th scope="col">Codinome do aluno</th>
              <th scope="col" className="ranking__num" colSpan={2}>
                Turings ↓
              </th>
            </tr>
          </thead>
          <tbody>
            {ranking.map(({ codename, balance }, index) => {
              const isMe = codename === currentCodename;
              return (
                <tr key={codename} className={isMe ? "is-me" : undefined}>
                  <td className="ranking__pos">{String(index + 1).padStart(2, "0")}</td>
                  <td>
                    <span className="ranking__name">
                      <CodenameMark
                        codename={codename}
                        variant={index === 0 ? "lime" : "outline"}
                        size={16}
                      />
                      {isMe ? <strong>{displayName(codename)}</strong> : displayName(codename)}
                      {isMe && <span className="you-tag">você</span>}
                    </span>
                  </td>
                  <td className="ranking__bar-cell" aria-hidden="true">
                    {!isMe && (
                      <span className="ranking__bar">
                        <span
                          className={index === 0 ? "is-top" : undefined}
                          style={{ width: `${share(balance)}%` }}
                        />
                      </span>
                    )}
                  </td>
                  <td className="ranking__num">{balance.toString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card__foot card__foot--ranking">
        <p className="with-icon">
          <Icon name={voting ? "checkCircle" : "lock"} size={15} className="accent" />
          <strong>
            {voting ? "Atualizado às " : "Consulta disponível · atualizado às "}
            {formatTime(updatedAt)} · saldos on-chain
          </strong>
        </p>
        <p className="indent">O ranking é atualizado após a confirmação das transações.</p>
      </div>
    </section>
  );
}
