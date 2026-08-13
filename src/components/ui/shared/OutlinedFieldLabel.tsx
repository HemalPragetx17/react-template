import { motion } from "framer-motion";
import React from "react";

import { FieldLabelContent } from "./FieldLabelContent";
import {
  getOutlinedLegendFontSize,
  getOutlinedNotchFloatY,
  labelFloatingClasses,
  outlinedFieldsetClasses,
  outlinedFloatedLabelChromeClasses,
  outlinedFloatLabelClasses,
  outlinedLegendClasses,
  outlinedLegendCollapsedClasses,
  outlinedLegendFloatedClasses,
  type OutlinedFieldSize,
} from "./fieldStyles";

interface OutlinedFieldsetProps {
  showFloated: boolean;
  radiusClass: string;
  borderClassName: string;
  label?: React.ReactNode;
  isRequired?: boolean;
  size: OutlinedFieldSize;
  className?: string;
}

/** Fieldset border + legend notch for labelPlacement="outlined" */
export function OutlinedFieldset({
  showFloated,
  radiusClass,
  borderClassName,
  label,
  isRequired,
  size,
  className = "",
}: OutlinedFieldsetProps) {
  if (!label) return null;

  return (
    <fieldset className={`${outlinedFieldsetClasses} ${radiusClass} ${borderClassName} ${className}`.trim()}>
      <legend
        className={`${outlinedLegendClasses} ${showFloated ? outlinedLegendFloatedClasses : outlinedLegendCollapsedClasses}`}
        style={{ fontSize: getOutlinedLegendFontSize(size), height: 0 }}
      >
        <span>
          <FieldLabelContent label={label} isRequired={isRequired} />
        </span>
      </legend>
    </fieldset>
  );
}

interface OutlinedFloatLabelProps {
  htmlFor?: string;
  label: React.ReactNode;
  isRequired?: boolean;
  size: OutlinedFieldSize;
  labelClassName?: string;
  colorClassName: string;
  className?: string;
}

/** Static visible label on the outlined top border (prefer OutlinedMotionLabel for animation) */
export function OutlinedFloatLabel({
  htmlFor,
  label,
  isRequired,
  size,
  labelClassName = "",
  colorClassName,
  className = "",
}: OutlinedFloatLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`${outlinedFloatLabelClasses} ${className} ${labelClassName} ${colorClassName} transition-colors duration-200`.trim()}
      style={{ fontSize: getOutlinedLegendFontSize(size) }}
    >
      <FieldLabelContent label={label} isRequired={isRequired} />
    </label>
  );
}

export interface OutlinedMotionLabelProps {
  htmlFor?: string;
  label: React.ReactNode;
  isRequired?: boolean;
  size: OutlinedFieldSize;
  showFloated: boolean;
  outlinedFloatY: number;
  outlinedInitialY: number;
  textSizeClass: string;
  labelClassName?: string;
  colorClassName: string;
  className?: string;
  /** x when floated (default 0) */
  floatX?: number;
  /** x when collapsed inside field (default 0) */
  initialX?: number;
  topClass?: string;
  leftClass?: string;
}

/** Animated outlined label — keeps legend notch width in sync via matching floated font-size */
export function OutlinedMotionLabel({
  htmlFor,
  label,
  isRequired,
  size,
  showFloated,
  outlinedFloatY,
  outlinedInitialY,
  textSizeClass,
  labelClassName = "",
  colorClassName,
  className = "",
  floatX = 0,
  initialX = 0,
  topClass = "top-1/2",
  leftClass = "left-3",
}: OutlinedMotionLabelProps) {
  return (
    <motion.label
      htmlFor={htmlFor}
      initial={false}
      animate={{
        y: showFloated ? getOutlinedNotchFloatY(size, outlinedFloatY) : outlinedInitialY,
        x: showFloated ? floatX : initialX,
        scale: 1,
      }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={`
        absolute ${leftClass} ${topClass} z-20 ${labelFloatingClasses}
        ${showFloated ? outlinedFloatedLabelChromeClasses : textSizeClass}
        ${labelClassName} ${colorClassName} transition-colors duration-200
        ${className}
      `.trim()}
      style={{
        transformOrigin: "left center",
        ...(showFloated ? { fontSize: getOutlinedLegendFontSize(size) } : undefined),
      }}
    >
      <FieldLabelContent label={label} isRequired={isRequired} />
    </motion.label>
  );
}
