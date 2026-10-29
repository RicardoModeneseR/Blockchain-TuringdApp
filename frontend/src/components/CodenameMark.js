import React from "react";

import { initials, shapeOf } from "../format";

const SHAPES = {
  hexagon: "M12 2.2 20.5 7.1v9.8L12 21.8 3.5 16.9V7.1Z",
  diamond: "M12 2.5 21.5 12 12 21.5 2.5 12Z",
};

// Hexagon or diamond mark that identifies a codename.
// variant: "outline" | "soft" | "solid" | "lime"
export function CodenameMark({
  codename,
  variant = "outline",
  size = 18,
  showInitials = false,
}) {
  return (
    <span
      className={`mark mark--${variant}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d={SHAPES[shapeOf(codename)]} strokeLinejoin="round" />
      </svg>
      {showInitials && (
        <span
          className="mark__label"
          style={{ fontSize: Math.round(size * 0.38) }}
        >
          {initials(codename)}
        </span>
      )}
    </span>
  );
}
