import React, { useEffect, useRef, useState } from "react";

import { Icon } from "./Icon";

// Accessible listbox styled like the design's dropdown.
// options: [{ value, label, disabled, hint }]
export function Select({
  id,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  invalid,
  describedBy,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onMouseDown = (event) => {
      if (!rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0 && listRef.current) {
      const item = listRef.current.children[active];
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [open, active]);

  const openList = () => {
    const index = options.findIndex((option) => option.value === value);
    setActive(index >= 0 ? index : options.findIndex((o) => !o.disabled));
    setOpen(true);
  };

  const move = (step) => {
    let next = active;
    for (let i = 0; i < options.length; i++) {
      next = (next + step + options.length) % options.length;
      if (!options[next].disabled) {
        setActive(next);
        return;
      }
    }
  };

  const choose = (option) => {
    if (option.disabled) {
      return;
    }
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (disabled) {
      return;
    }
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          move(event.key === "ArrowDown" ? 1 : -1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open && active >= 0) {
          choose(options[active]);
        } else {
          openList();
        }
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
      default:
    }
  };

  const listId = `${id}-list`;

  return (
    <div className="select" ref={rootRef}>
      <button
        id={id}
        type="button"
        className={`field select__trigger${open ? " is-open" : ""}${
          invalid ? " is-invalid" : ""
        }`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={selected ? "" : "select__placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="chevronDown" size={16} className="select__chevron" />
      </button>

      {open && (
        <ul id={listId} className="select__list" role="listbox" ref={listRef}>
          {options.map((option, index) => (
            <li
              id={`${id}-opt-${index}`}
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              aria-disabled={option.disabled || undefined}
              className={`select__option${index === active ? " is-active" : ""}${
                option.value === value ? " is-selected" : ""
              }${option.disabled ? " is-disabled" : ""}`}
              onMouseEnter={() => !option.disabled && setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.hint && <span className="select__hint">{option.hint}</span>}
              {option.value === value && <Icon name="check" size={15} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
