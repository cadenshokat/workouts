// src/components/ui/Spinner.tsx
import React from "react";

interface SpinnerProps {
  /** Tailwind class(es) to control size (e.g. "h-8 w-8") or add custom styling */
  className?: string;
}

/**
 * A simple circular spinner.
 * Uses Tailwind’s animate-spin and border utilities.
 */
export const Spinner: React.FC<SpinnerProps> = ({ className = "h-6 w-6" }) => (
  <div
    role="status"
    aria-label="Loading"
    className={`
      ${className}
      border-4
      border-primary
      border-t-transparent
      rounded-full
      animate-spin
    `}
  />
);

export default Spinner;
