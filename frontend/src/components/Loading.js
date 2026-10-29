import React from "react";

export function Loading() {
  return (
    <main className="gate" aria-busy="true">
      <div className="loading" role="status">
        <span className="loading__spinner" aria-hidden="true" />
        <span>Carregando o clube…</span>
      </div>
    </main>
  );
}
