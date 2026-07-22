/**
 * Field label & error design tokens — edit fieldStyles.css to change styles project-wide.
 */

/** External / top field label (Input, Textarea, Select, Date pickers, etc.) */
export const labelClasses = "input-label";

/** Group field label (Radio, Checkbox, CheckboxGroup) */
export const labelGroupClasses = "input-label-group";

/** Floating / inside field label */
export const labelFloatingClasses = "input-label-floating";

/** Validation error message */
export const errorClasses = "input-error";

/** Required field asterisk shown after labels */
export const requiredIndicatorClasses = "input-label-required";

export type InputWrapperVariant = "flat" | "bordered" | "underlined" | "faded" | "outlined";

export type FieldColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

/**
 * Default wrapper styles per variant — edit here to change project-wide.
 * Flat/faded keep variantClass bg; bordered uses white fill + neutral border.
 */
export const inputWrapperDefaultClasses: Record<InputWrapperVariant, string> = {
  flat: "shadow-none",
  bordered: "bg-white hover:bg-white focus-within:bg-white !border-neutral-200 shadow-none",
  faded: "shadow-none",
  underlined: "bg-transparent shadow-none",
  outlined: "bg-transparent shadow-none",
};

export const getInputWrapperClassName = (
  wrapperClassName = "",
  variant: InputWrapperVariant = "bordered",
) => `${inputWrapperDefaultClasses[variant] ?? inputWrapperDefaultClasses.bordered} ${wrapperClassName}`.trim();

export const getWrapperBaseClasses = (options: {
  wrapperClassName?: string;
  variant: string;
  isOutlined?: boolean;
  isActive?: boolean;
  hasError?: boolean;
}) => {
  const {
    wrapperClassName = "",
    variant,
    isOutlined = false,
    isActive = false,
    hasError = false,
  } = options;

  const wrapperVariant: InputWrapperVariant = isOutlined ? "outlined" : (variant as InputWrapperVariant);
  const usesInteractiveBorder = !isOutlined && (variant === "bordered" || variant === "faded");

  let base = getInputWrapperClassName(wrapperClassName, wrapperVariant);
  if (usesInteractiveBorder && (isActive || hasError)) {
    base = base.replace(/!border-neutral-200/g, "").trim();
  }
  return base;
};

export const getInteractiveBorderClass = (options: {
  variant: string;
  isOutlined?: boolean;
  isActive?: boolean;
  hasError?: boolean;
  color?: FieldColor;
}) => {
  const {
    variant,
    isOutlined = false,
    isActive = false,
    hasError = false,
    color = "default",
  } = options;

  if (isOutlined) return "";
  if (variant === "flat") {
    return hasError ? "!border-red-500 dark:!border-red-500" : "";
  }
  if (variant !== "bordered" && variant !== "faded") return "";
  if (hasError) return "!border-red-500 dark:!border-red-500";
  if (!isActive) return "";

  switch (color) {
    case "default":
      return "!border-neutral-500 dark:!border-neutral-500";
    case "primary":
      return "!border-primary";
    case "secondary":
      return "!border-secondary";
    case "success":
      return "!border-success";
    case "warning":
      return "!border-warning";
    case "danger":
      return "!border-danger";
    default:
      return "!border-primary";
  }
};

/**
 * Project-wide field value typography (used by Input/Textarea/Select/Date/Time/Chips/Options).
 * Defined in `src/theme/fieldStyles.css` so it can be changed in one place.
 */
export const fieldValueClasses = "field-value";

/** Placeholder typography (Input, Textarea, Select, Date/Time pickers, FileInput, Phone) */
export const fieldPlaceholderClasses = "field-placeholder";
