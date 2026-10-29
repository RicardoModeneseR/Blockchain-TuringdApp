import React from "react";

import { Icon } from "./Icon";

export function NetworkErrorMessage({ message, dismiss }) {
  return (
    <div className="notice notice--error" role="alert">
      <Icon name="alertCircle" size={18} />
      <div>
        <strong>Problema de rede</strong>
        <p>{message}</p>
      </div>
      <button
        type="button"
        className="notice__close"
        aria-label="Fechar"
        onClick={dismiss}
      >
        &times;
      </button>
    </div>
  );
}
