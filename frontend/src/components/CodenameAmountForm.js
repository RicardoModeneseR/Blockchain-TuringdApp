import React, { useState } from "react";

import { Icon } from "./Icon";
import { Select } from "./Select";
import { TxErrorBanner } from "./TransactionStatus";

// Codename selector + amount of Turings. Used by both vote and issueToken.
// When `locked` is set the fields are shown disabled and empty, and the
// submit button explains why (e.g. voting closed).
export function CodenameAmountForm({
  id,
  options,
  maxAmount,
  amountHint,
  submitLabel,
  submitIcon,
  submitVariant = "primary",
  locked,
  lockedLabel,
  disabled,
  error,
  onDismissError,
  onSubmit,
}) {
  const [codename, setCodename] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!codename) {
      next.codename = "Selecione um aluno para continuar.";
    }
    const value = Number(amount);
    if (!amount || !Number.isInteger(value) || value <= 0) {
      next.amount = "Insira uma quantidade maior que zero para continuar.";
    } else if (maxAmount && value > maxAmount) {
      next.amount = `O voto aceita no máximo ${maxAmount} Turings.`;
    }
    return next;
  };

  const submit = (event) => {
    event.preventDefault();
    if (locked || disabled) {
      return;
    }
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) {
      onSubmit(codename, amount);
    }
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form__group">
        <label className="label" htmlFor={`${id}-codename`}>
          Codinome do aluno
        </label>
        <Select
          id={`${id}-codename`}
          value={locked ? "" : codename}
          options={options}
          placeholder="Selecione um aluno"
          disabled={locked || disabled}
          invalid={Boolean(errors.codename)}
          describedBy={`${id}-codename-help`}
          onChange={(value) => {
            setCodename(value);
            clearError("codename");
          }}
        />
        <FieldHelp id={`${id}-codename-help`} error={errors.codename}>
          Escolha um aluno registrado da turma.
        </FieldHelp>
      </div>

      <div className="form__group">
        <label className="label" htmlFor={`${id}-amount`}>
          Quantidade de Turings
        </label>
        <div
          className={`field field--suffix${errors.amount ? " is-invalid" : ""}${
            locked || disabled ? " is-disabled" : ""
          }`}
        >
          <input
            id={`${id}-amount`}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            max={maxAmount}
            placeholder="0"
            value={locked ? "" : amount}
            disabled={locked || disabled}
            aria-invalid={Boolean(errors.amount) || undefined}
            aria-describedby={`${id}-amount-help`}
            onChange={(event) => {
              setAmount(event.target.value);
              clearError("amount");
            }}
          />
          <span className="field__suffix">Turings</span>
        </div>
        <FieldHelp id={`${id}-amount-help`} error={errors.amount}>
          {amountHint}
        </FieldHelp>
      </div>

      {error && <TxErrorBanner message={error.message} />}

      {locked ? (
        <button type="button" className="btn btn--block btn--locked" disabled>
          <Icon name="lock" size={16} />
          {lockedLabel}
        </button>
      ) : error ? (
        <button
          type="button"
          className="btn btn--block btn--secondary"
          onClick={onDismissError}
        >
          <Icon name="rotateCcw" size={16} />
          Revisar e tentar novamente
        </button>
      ) : (
        <button
          type="submit"
          className={`btn btn--block btn--${submitVariant}`}
          disabled={disabled}
        >
          <Icon name={submitIcon} size={16} />
          {submitLabel}
        </button>
      )}
    </form>
  );
}

function FieldHelp({ id, error, children }) {
  if (error) {
    return (
      <p id={id} className="help help--error" role="alert">
        <Icon name="alertTriangle" size={13} />
        {error}
      </p>
    );
  }
  return (
    <p id={id} className="help">
      {children}
    </p>
  );
}
