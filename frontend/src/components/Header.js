import React, { useEffect, useRef, useState } from "react";

import { CodenameMark } from "./CodenameMark";
import { Icon } from "./Icon";
import { displayName } from "../format";

export function Logo() {
  return (
    <span className="logo">
      <span className="logo__mark" aria-hidden="true">
        t.
      </span>
      <span className="logo__text">turing club</span>
    </span>
  );
}

// Top bar: brand, navigation and the connected wallet chip.
export function Header({ address, codename, isSuperuser, onDisconnect }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const close = (event) => {
      if (event.type === "keydown" && event.key !== "Escape") {
        return;
      }
      if (event.type === "mousedown" && menuRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const name = codename ? displayName(codename) : isSuperuser ? "Admin" : "Visitante";
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Logo />

        <nav className="topbar__nav" aria-label="Principal">
          <span className="topbar__link topbar__link--active" aria-current="page">
            Painel da turma
          </span>
          <span className="topbar__link topbar__link--muted">
            Blockchain / 2026.2
          </span>
        </nav>

        <div className="wallet" ref={menuRef}>
          <button
            type="button"
            className="wallet__chip"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <CodenameMark
              codename={codename || "roberta"}
              variant={isSuperuser && !codename ? "lime" : "soft"}
              size={26}
            />
            <span className="wallet__text">
              <span className="wallet__name">
                {name} · <span className="mono">{short}</span>
              </span>
              <span className="wallet__hint">Carteira conectada · Hardhat local</span>
            </span>
            <Icon name="chevronDown" size={16} />
          </button>

          {open && (
            <div className="wallet__menu" role="menu">
              <p className="wallet__address mono">{address}</p>
              <button type="button" role="menuitem" onClick={copyAddress}>
                <Icon name={copied ? "check" : "copy"} size={15} />
                {copied ? "Endereço copiado" : "Copiar endereço"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onDisconnect();
                }}
              >
                <Icon name="logOut" size={15} />
                Desconectar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
