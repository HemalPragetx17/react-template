import React from "react";
import { requiredIndicatorClasses } from "./fieldStyles";

interface FieldLabelContentProps {
  label: React.ReactNode;
  isRequired?: boolean;
}

export function FieldLabelContent({ label, isRequired = false }: FieldLabelContentProps) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <span>{label}</span>
      {isRequired && (
        <span className={requiredIndicatorClasses} aria-hidden="true">
          *
        </span>
      )}
    </span>
  );
}
