/**
 * Field label & error design tokens — edit fieldStyles.css to change styles project-wide.
 */

import { getRadiusClass, radiusCssVarNames, type Radius } from "./radius";

/** Change this to update date calendar day-cell radius project-wide */
export const DEFAULT_CALENDAR_RADIUS: Radius = "full";

/** CSS variable for calendar day cells — synced via syncCalendarRadiusCssVariable() */
export const CALENDAR_RADIUS_CSS_VAR = "var(--calendar-radius)";

/** Sync --calendar-radius in CSS to match DEFAULT_CALENDAR_RADIUS. Call once at app startup. */
export function syncCalendarRadiusCssVariable(): void {
  if (typeof document === "undefined") return;

  document.documentElement.style.setProperty(
    "--calendar-radius",
    `var(${radiusCssVarNames[DEFAULT_CALENDAR_RADIUS]})`,
  );
}

export function getCalendarRadiusCssVar(
  radius: Radius = DEFAULT_CALENDAR_RADIUS,
): string {
  return radius === DEFAULT_CALENDAR_RADIUS
    ? CALENDAR_RADIUS_CSS_VAR
    : `var(${radiusCssVarNames[radius]})`;
}

export function getCalendarRadiusClass(
  radius: Radius = DEFAULT_CALENDAR_RADIUS,
): string {
  return getRadiusClass(radius);
}

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

/** Input value text — same for every color token (borders/bg stay themed) */
export const fieldInputTextClasses = "text-foreground dark:text-neutral-200";

/** Flat variant surface tokens (base + hover/focus) — shared by Input, PhoneNumberInput, etc. */
const flatSurfaceTokens: Record<FieldColor, { base: string; interactive: string }> = {
  default: {
    base: "bg-neutral-100 dark:bg-neutral-800",
    interactive:
      "hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-within:bg-neutral-200 dark:focus-within:bg-neutral-700",
  },
  primary: {
    base: "bg-primary-50 dark:bg-primary-950/20",
    interactive:
      "hover:bg-primary-100 dark:hover:bg-primary-950/40 focus-within:bg-primary-100 dark:focus-within:bg-primary-950/40",
  },
  secondary: {
    base: "bg-secondary-50 dark:bg-secondary-950/20",
    interactive:
      "hover:bg-secondary-100 dark:hover:bg-secondary-950/40 focus-within:bg-secondary-100 dark:focus-within:bg-secondary-950/40",
  },
  success: {
    base: "bg-success-50 dark:bg-success-950/20",
    interactive:
      "hover:bg-success-100 dark:hover:bg-success-950/40 focus-within:bg-success-100 dark:focus-within:bg-success-950/40",
  },
  warning: {
    base: "bg-warning-50 dark:bg-warning-950/20",
    interactive:
      "hover:bg-warning-100 dark:hover:bg-warning-950/40 focus-within:bg-warning-100 dark:focus-within:bg-warning-950/40",
  },
  danger: {
    base: "bg-danger-50 dark:bg-danger-950/20",
    interactive:
      "hover:bg-danger-100 dark:hover:bg-danger-950/40 focus-within:bg-danger-100 dark:focus-within:bg-danger-950/40",
  },
};

function withImportantUtilities(className: string): string {
  return className
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const pseudoIdx = token.indexOf(":");
      if (pseudoIdx === -1) {
        return token.startsWith("!") ? token : `!${token}`;
      }
      const pseudo = token.slice(0, pseudoIdx + 1);
      const util = token.slice(pseudoIdx + 1);
      return `${pseudo}${util.startsWith("!") ? util : `!${util}`}`;
    })
    .join(" ");
}

/** Flat background classes — use on phone container or split input/flag parts */
export function getFlatSurfaceClasses(
  color: FieldColor = "default",
  interactive = true,
  important = false,
): string {
  const token = flatSurfaceTokens[color] ?? flatSurfaceTokens.default;
  const raw = interactive ? `${token.base} ${token.interactive}` : token.base;
  return important ? withImportantUtilities(raw) : raw;
}

/**
 * Two-box phone (singleBorder=false) — each part uses the same chrome as the
 * single-border container: flat surfaces, bordered/faded variant tokens, 2px borders.
 */
export function getPhoneTwoBoxPartClasses(
  variant: Exclude<InputWrapperVariant, "outlined">,
  color: FieldColor = "default",
  disabled = false,
): string {
  const shell = "transition-all duration-200 ease-in-out box-border !border-2";

  if (variant === "flat") {
    // Flat bg comes from phone index.css (--phone-flat-bg on .phone-input-color-*)
    // because runtime !bg-* utilities are not in the Tailwind bundle.
    const disabledCls = disabled ? inputDisabledOpacityClass : "";
    return `${shell} !border-transparent ${fieldInputTextClasses} ${disabledCls}`.trim();
  }

  if (variant === "bordered" || variant === "faded") {
    // Bordered/faded chrome (bg + borders) comes from phone index.css for two-box.
    const disabledCls = disabled ? getInputDisabledClasses(variant, color) : "";
    return `${shell} ${fieldInputTextClasses} ${disabledCls}`.trim();
  }

  const variantCls = withImportantUtilities(getInputVariantClasses(variant, color));
  const disabledCls = disabled ? getInputDisabledClasses(variant, color) : "";
  const combined = disabled
    ? stripInteractiveFieldClasses(`${variantCls} ${disabledCls}`)
    : variantCls;

  return `${shell} ${combined}`.trim();
}

/** Flat variant — color-tinted backgrounds; value text uses default foreground */
export const flatColorClasses: Record<FieldColor, string> = {
  default: `${getFlatSurfaceClasses("default")} ${fieldInputTextClasses}`,
  primary: `${getFlatSurfaceClasses("primary")} ${fieldInputTextClasses}`,
  secondary: `${getFlatSurfaceClasses("secondary")} ${fieldInputTextClasses}`,
  success: `${getFlatSurfaceClasses("success")} ${fieldInputTextClasses}`,
  warning: `${getFlatSurfaceClasses("warning")} ${fieldInputTextClasses}`,
  danger: `${getFlatSurfaceClasses("danger")} ${fieldInputTextClasses}`,
};

/** Bordered variant — transparent fill + subtle grey border in dark mode */
export const borderedColorClasses: Record<FieldColor, string> = {
  default:
    `border-neutral-300 hover:border-neutral-400 focus-within:border-neutral-500 bg-transparent dark:bg-transparent dark:border-neutral-600 dark:hover:border-neutral-500 dark:focus-within:border-neutral-500 ${fieldInputTextClasses}`,
  primary:
    `border-neutral-300 hover:border-primary-300 focus-within:border-primary bg-transparent dark:bg-transparent dark:border-neutral-600 dark:hover:border-primary-400 dark:focus-within:border-primary ${fieldInputTextClasses}`,
  secondary:
    `border-neutral-300 hover:border-secondary-300 focus-within:border-secondary bg-transparent dark:bg-transparent dark:border-neutral-600 dark:hover:border-secondary-400 dark:focus-within:border-secondary ${fieldInputTextClasses}`,
  success:
    `border-neutral-300 hover:border-success-300 focus-within:border-success bg-transparent dark:bg-transparent dark:border-neutral-600 dark:hover:border-success-400 dark:focus-within:border-success ${fieldInputTextClasses}`,
  warning:
    `border-neutral-300 hover:border-warning-300 focus-within:border-warning bg-transparent dark:bg-transparent dark:border-neutral-600 dark:hover:border-warning-400 dark:focus-within:border-warning ${fieldInputTextClasses}`,
  danger:
    `border-neutral-300 hover:border-danger-300 focus-within:border-danger bg-transparent dark:bg-transparent dark:border-neutral-600 dark:hover:border-danger-400 dark:focus-within:border-danger ${fieldInputTextClasses}`,
};

/** Underlined variant — subtle bottom border in dark mode */
export const underlinedColorClasses: Record<FieldColor, string> = {
  default:
    `border-b-neutral-200 hover:border-b-neutral-300 focus-within:border-b-neutral-500 dark:border-b-neutral-600 dark:hover:border-b-neutral-500 dark:focus-within:border-b-neutral-400 ${fieldInputTextClasses}`,
  primary:
    `border-b-primary-200 hover:border-b-primary-300 focus-within:border-b-primary dark:border-b-neutral-600 dark:hover:border-b-primary-400 dark:focus-within:border-b-primary ${fieldInputTextClasses}`,
  secondary:
    `border-b-secondary-200 hover:border-b-secondary-300 focus-within:border-b-secondary dark:border-b-neutral-600 dark:hover:border-b-secondary-400 dark:focus-within:border-b-secondary ${fieldInputTextClasses}`,
  success:
    `border-b-success-200 hover:border-b-success-300 focus-within:border-b-success dark:border-b-neutral-600 dark:hover:border-b-success-400 dark:focus-within:border-b-success ${fieldInputTextClasses}`,
  warning:
    `border-b-warning-200 hover:border-b-warning-300 focus-within:border-b-warning dark:border-b-neutral-600 dark:hover:border-b-warning-400 dark:focus-within:border-b-warning ${fieldInputTextClasses}`,
  danger:
    `border-b-danger-200 hover:border-b-danger-300 focus-within:border-b-danger dark:border-b-neutral-600 dark:hover:border-b-danger-400 dark:focus-within:border-b-danger ${fieldInputTextClasses}`,
};

/** Faded variant — charcoal fill + subtle border in dark mode */
export const fadedColorClasses: Record<FieldColor, string> = {
  default:
    `bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 focus-within:border-neutral-400 dark:focus-within:border-neutral-500 ${fieldInputTextClasses}`,
  primary:
    `bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:border-primary-300 dark:hover:border-primary-400 focus-within:border-primary dark:focus-within:border-primary ${fieldInputTextClasses}`,
  secondary:
    `bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:border-secondary-300 dark:hover:border-secondary-400 focus-within:border-secondary dark:focus-within:border-secondary ${fieldInputTextClasses}`,
  success:
    `bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:border-success-300 dark:hover:border-success-400 focus-within:border-success dark:focus-within:border-success ${fieldInputTextClasses}`,
  warning:
    `bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:border-warning-300 dark:hover:border-warning-400 focus-within:border-warning dark:focus-within:border-warning ${fieldInputTextClasses}`,
  danger:
    `bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 hover:border-danger-300 dark:hover:border-danger-400 focus-within:border-danger dark:focus-within:border-danger ${fieldInputTextClasses}`,
};

export const focusTextColors: Record<FieldColor, string> = {
  default: "text-foreground dark:text-neutral-200",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

/** Floating label color for flat variant with a filled value */
export function getFlatFloatingLabelClass(
  color: FieldColor,
  shouldFloat: boolean,
  isFocused: boolean,
): string {
  if (color === "default") {
    if (shouldFloat || isFocused) {
      return isFocused
        ? "text-neutral-800 dark:text-neutral-200"
        : "text-neutral-700 dark:text-neutral-300";
    }
    return "text-neutral-400 dark:text-neutral-500";
  }

  if (shouldFloat || isFocused) {
    return focusTextColors[color] ?? "text-primary";
  }

  return "text-neutral-400 dark:text-neutral-500";
}

export const underlineColors: Record<FieldColor, string> = {
  default: "bg-neutral-500",
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export const focusBorderColors: Record<FieldColor, string> = {
  default: "border-neutral-500 dark:border-neutral-500",
  primary: "border-primary",
  secondary: "border-secondary",
  success: "border-success",
  warning: "border-warning",
  danger: "border-danger",
};

export const fieldsetBorderColors: Record<FieldColor, string> = {
  default:
    "border-neutral-300 dark:border-neutral-600 group-hover:border-neutral-400 dark:group-hover:border-neutral-500 focus-within:border-neutral-500 dark:focus-within:border-neutral-500",
  primary:
    "border-neutral-300 dark:border-neutral-600 group-hover:border-primary-300 dark:group-hover:border-primary-400 focus-within:border-primary",
  secondary:
    "border-neutral-300 dark:border-neutral-600 group-hover:border-secondary-300 dark:group-hover:border-secondary-400 focus-within:border-secondary",
  success:
    "border-neutral-300 dark:border-neutral-600 group-hover:border-success-300 dark:group-hover:border-success-400 focus-within:border-success",
  warning:
    "border-neutral-300 dark:border-neutral-600 group-hover:border-warning-300 dark:group-hover:border-warning-400 focus-within:border-warning",
  danger:
    "border-neutral-300 dark:border-neutral-600 group-hover:border-danger-300 dark:group-hover:border-danger-400 focus-within:border-danger",
};

export const inputDisabledInteractionClasses =
  "cursor-not-allowed pointer-events-none";

/** Change this to tune disabled dimming for all fields project-wide */
export const inputDisabledOpacityClass = "opacity-70";

/** Wrapper dimming for disabled pickers / textarea (no bg override) */
export const inputDisabledWrapperClasses =
  `${inputDisabledOpacityClass} ${inputDisabledInteractionClasses}`;

/** Neutral disabled chrome for bordered / faded / underlined / default flat */
export const inputDisabledClasses =
  "!bg-gray-50 dark:!bg-neutral-800 !border-gray-200 dark:!border-neutral-700 cursor-not-allowed pointer-events-none";

/** Disabled flat keeps theme background; only dims interaction */
export function getInputDisabledClasses(
  variant: InputWrapperVariant = "bordered",
  color: FieldColor = "default",
): string {
  if (variant === "flat" && color !== "default") {
    return `${inputDisabledInteractionClasses} ${inputDisabledOpacityClass}`;
  }

  if (variant === "flat") {
    return `${inputDisabledClasses} ${inputDisabledOpacityClass}`;
  }

  return `${inputDisabledClasses} ${inputDisabledOpacityClass}`;
}

export function getInputVariantClasses(
  variant: Exclude<InputWrapperVariant, "outlined">,
  color: FieldColor = "default",
): string {
  switch (variant) {
    case "flat":
      return `border-2 border-transparent ${flatColorClasses[color] ?? flatColorClasses.default}`;
    case "bordered":
      return `border-2 ${borderedColorClasses[color] ?? borderedColorClasses.default}`;
    case "underlined":
      return `border-b rounded-none relative ${underlinedColorClasses[color] ?? underlinedColorClasses.default}`;
    case "faded":
      return `border-2 ${fadedColorClasses[color] ?? fadedColorClasses.default}`;
    default:
      return getInputVariantClasses("flat", color);
  }
}

/** Remove hover/focus-within/group-hover utilities — use when field is disabled */
export function stripInteractiveFieldClasses(className: string): string {
  return className
    .split(/\s+/)
    .filter((token) => token && !/(^|:)(hover|focus-within|group-hover):/.test(token))
    .join(" ");
}

/**
 * Default wrapper styles per variant — edit here to change project-wide.
 * Flat/faded keep variantClass bg; bordered uses white fill + neutral border.
 */
export const inputWrapperDefaultClasses: Record<InputWrapperVariant, string> = {
  flat: "shadow-none",
  bordered:
    "bg-white dark:bg-transparent hover:bg-white dark:hover:bg-transparent focus-within:bg-white dark:focus-within:bg-transparent !border-neutral-200 dark:!border-neutral-600 shadow-none",
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
    base = base
      .replace(/!border-neutral-200/g, "")
      .replace(/dark:!border-neutral-600/g, "")
      .trim();
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
