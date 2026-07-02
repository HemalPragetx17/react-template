import React, { forwardRef, useId } from "react";
import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

export type CheckboxColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxRadius = "none" | "sm" | "md" | "lg" | "full";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "form" | "onChange" | "size"> {
  label?: string;
  error?: string;
  touched?: boolean;
  options?: { label: string; value: string | number; description?: string }[];
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  indeterminate?: boolean;
  onChange?: ((value: any) => void) | any;

  // HeroUI-style props
  size?: CheckboxSize;
  color?: CheckboxColor;
  radius?: CheckboxRadius;
  isIndeterminate?: boolean;
  lineThrough?: boolean;
  icon?: React.ReactNode;

  // Formik integration
  field?: FieldInputProps<any>;
  form?: {
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    setFieldValue?: (field: string, value: any) => void;
  };
}

// ─── Color Maps ──────────────────────────────────────────────────────────────

export const bgColorMap: Record<CheckboxColor, string> = {
  default:   "bg-default-600",
  primary:   "bg-primary",
  secondary: "bg-secondary",
  success:   "bg-success",
  warning:   "bg-warning",
  danger:    "bg-danger",
};

export const borderColorMap: Record<CheckboxColor, string> = {
  default:   "border-default-600",
  primary:   "border-primary",
  secondary: "border-secondary",
  success:   "border-success",
  warning:   "border-warning",
  danger:    "border-danger",
};

export const textColorMap: Record<CheckboxColor, string> = {
  default:   "text-default-foreground",
  primary:   "text-primary-foreground",
  secondary: "text-secondary-foreground",
  success:   "text-success-foreground",
  warning:   "text-warning-foreground",
  danger:    "text-danger-foreground",
};

// ─── Size Maps ───────────────────────────────────────────────────────────────

export const sizeMap: Record<CheckboxSize, { box: string; icon: number; text: string }> = {
  sm: { box: "w-4 h-4",   icon: 10, text: "text-xs" },
  md: { box: "w-5 h-5",   icon: 12, text: "text-sm" },
  lg: { box: "w-6 h-6",   icon: 14, text: "text-base" },
};

export const radiusMap: Record<CheckboxRadius, string> = {
  none: "rounded-none",
  sm:   "rounded-sm",
  md:   "rounded-md",
  lg:   "rounded-lg",
  full: "rounded-full",
};


// ─── Single Checkbox Atom (exported for reuse in CheckboxGroup) ───────

export interface CheckAtomProps {
  id?: string;
  name?: string;
  checked: boolean;
  onToggle: () => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  label?: string | React.ReactNode;
  description?: string;
  size: CheckboxSize;
  color: CheckboxColor;
  radius: CheckboxRadius;
  isIndeterminate?: boolean;
  lineThrough?: boolean;
  icon?: React.ReactNode;
  labelClassName?: string;
  disabled?: boolean;
}

export const CheckAtom: React.FC<CheckAtomProps> = ({
  id,
  name,
  checked,
  onToggle,
  onBlur,
  label,
  description,
  size,
  color,
  radius,
  isIndeterminate = false,
  lineThrough = false,
  icon,
  labelClassName = "",
  disabled = false,
}) => {
  const sc = sizeMap[size];
  const isActive = isIndeterminate || checked;
  const generatedId = useId();
  const inputId = id || generatedId;

  // SVG stroke width & viewbox dim stay fixed; we just scale by box size
  const svgDim = sc.icon;

  return (
    <label
      htmlFor={inputId}
      className={`relative inline-flex items-start gap-2.5 cursor-pointer group select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* Hidden native input */}
      <input
        id={inputId}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        onBlur={onBlur}
        disabled={disabled}
        className="sr-only"
      />

      {/* ── Animated box ── */}
      <motion.span
        className={`
          relative mt-0.5 flex items-center justify-center shrink-0 border-2
          transition-colors duration-200 overflow-hidden
          ${sc.box}
          ${radiusMap[radius]}
          ${isActive
            ? `${bgColorMap[color]} ${borderColorMap[color]} ${textColorMap[color]}`
            : `border-neutral-300 dark:border-neutral-600 bg-transparent`}
        `}
        whileTap={disabled ? {} : { scale: 0.72 }}
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
      >
        {icon ? (
          // ── Custom icon with fade/scale ──
          <AnimatePresence mode="wait">
            {isActive && (
              <motion.span
                key="custom-icon"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                {icon}
              </motion.span>
            )}
          </AnimatePresence>
        ) : isIndeterminate ? (
          // ── Indeterminate dash — path-draw ──
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={2.8}
            style={{ width: svgDim, height: svgDim }}
            aria-hidden
          >
            <motion.path
              d="M 3 8 L 13 8"
              initial={false}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ pathLength: { duration: 0.2, ease: "easeOut" } }}
            />
          </svg>
        ) : (
          // ── Checkmark — self-drawing SVG path ──
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.8}
            style={{ width: svgDim, height: svgDim }}
            aria-hidden
          >
            <motion.path
              d="M 2.5 8.5 L 6.5 12 L 13.5 4.5"
              initial={false}
              animate={{
                pathLength: checked ? 1 : 0,
                opacity:    checked ? 1 : 0,
              }}
              transition={{
                pathLength: { duration: 0.22, ease: [0.33, 1, 0.68, 1] },
                opacity:    { duration: 0.12 },
              }}
            />
          </svg>
        )}
      </motion.span>

      {/* Label */}
      {(label || description) && (
        <span className="flex flex-col leading-tight mt-[1.5px]">
          {label && (
            <span
              className={`font-medium text-neutral-700 dark:text-neutral-300 transition-colors transition-opacity duration-200 ${
                sc.text
              } ${lineThrough && checked ? "line-through opacity-60" : ""} ${labelClassName}`}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>((props, ref) => {
  const {
    label,
    error,
    touched,
    options = [],
    containerClassName = "",
    labelClassName = "",
    errorClassName = "",
    size = "md",
    color = "primary",
    radius = "md",
    isIndeterminate: propIsIndeterminate = false,
    indeterminate = false,
    lineThrough = false,
    icon,
    field,
    form,
    value,
    onChange,
    disabled = false,
    ...restProps
  } = props;

  const fieldName = field?.name || (props.name as string | undefined);

  const fieldError =
    fieldName && form?.errors?.[fieldName]
      ? (form.errors[fieldName] as string)
      : error;
  const fieldTouched =
    fieldName && form?.touched?.[fieldName] ? true : touched;

  const currentValue = value !== undefined ? value : (field?.value ?? restProps.checked ?? "");
  const isMulti = options && options.length > 0;
  const activeIndeterminate = propIsIndeterminate || indeterminate;

  // ── Multi-checkbox toggle ────────────────────────────────────────────────
  const handleMultiToggle = (optValue: string | number) => {
    const currentArray = Array.isArray(currentValue) ? currentValue : [];
    const exists = currentArray.includes(optValue);
    const newArray = exists
      ? currentArray.filter((v) => v !== optValue)
      : [...currentArray, optValue];

    if (form?.setFieldValue && fieldName) {
      form.setFieldValue(fieldName, newArray);
    } else if (field?.onChange) {
      const evt = {
        target: { name: fieldName || "", value: newArray },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      field.onChange(evt);
    }
    if (onChange) onChange(newArray);
  };

  // ── Single toggle ────────────────────────────────────────────────────────
  const handleSingleToggle = () => {
    const isChecked = restProps.checked !== undefined ? !!restProps.checked : !!currentValue;
    const next = !isChecked;
    if (form?.setFieldValue && fieldName) {
      form.setFieldValue(fieldName, next);
    } else if (field?.onChange) {
      const evt = {
        target: { name: fieldName || "", value: next, checked: next },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      field.onChange(evt);
    }
    if (onChange) {
      // Pass both boolean and synthetic event structure support if possible, or forward boolean
      // Many custom handlers expect a boolean. If a handler expects event, pass a dual-compatible or forward boolean
      onChange(next);
    }
  };

  return (
    <div className={`${isMulti ? "w-full" : "w-fit"} ${containerClassName}`} ref={ref}>
      {/* Group label (only for multi) */}
      {label && isMulti && (
        <p className={`font-medium text-neutral-600 dark:text-neutral-400 select-none ${
          size === "sm" ? "text-[10px] mb-1.5" : size === "lg" ? "text-sm mb-1.5" : "text-xs mb-1.5"
        } ${labelClassName}`}>
          {label}
        </p>
      )}

      {/* Multi-select group */}
      {isMulti ? (
        <div className={`flex flex-wrap ${
          size === "sm" ? "gap-x-4 gap-y-2" : size === "lg" ? "gap-x-8 gap-y-4" : "gap-x-6 gap-y-3"
        }`}>
          {options.map((opt, i) => {
            const currentArray = Array.isArray(currentValue) ? currentValue : [];
            const isChecked = currentArray.includes(opt.value);
            return (
              <CheckAtom
                key={i}
                id={`${fieldName}-${i}`}
                name={fieldName}
                checked={isChecked}
                onToggle={() => handleMultiToggle(opt.value)}
                onBlur={field?.onBlur || props.onBlur}
                label={opt.label}
                description={opt.description}
                size={size}
                color={color}
                radius={radius}
                isIndeterminate={activeIndeterminate}
                lineThrough={lineThrough}
                icon={icon}
                labelClassName={labelClassName}
                disabled={disabled as boolean}
              />
            );
          })}
        </div>
      ) : (
        /* Single checkbox */
        <CheckAtom
          id={field?.name || props.id || props.name}
          name={fieldName}
          checked={restProps.checked !== undefined ? !!restProps.checked : !!currentValue}
          onToggle={handleSingleToggle}
          onBlur={field?.onBlur || props.onBlur}
          label={label}
          size={size}
          color={color}
          radius={radius}
          isIndeterminate={activeIndeterminate}
          lineThrough={lineThrough}
          icon={icon}
          labelClassName={labelClassName}
          disabled={disabled as boolean}
        />
      )}

      {/* Error */}
      <AnimatePresence>
        {fieldTouched && fieldError && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`mt-1.5 text-sm text-red-500 ${errorClassName}`}
          >
            {fieldError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;
