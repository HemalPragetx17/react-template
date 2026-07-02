import React, { forwardRef, useId } from "react";
import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

type RadioColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

type RadioOrientation = "horizontal" | "vertical";

interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "form" | "size"> {
  label?: string;
  error?: string;
  touched?: boolean;
  options?: { label: string; value: string | number; description?: string; disabled?: boolean }[];
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  orientation?: RadioOrientation;
  color?: RadioColor;
  size?: "sm" | "md" | "lg";
  // Formik integration
  field?: FieldInputProps<string>;
  form?: {
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    setFieldValue?: (field: string, value: any) => void;
  };
}

// ─── Color Maps ─────────────────────────────────────────────────────────────

const ringColorMap: Record<RadioColor, string> = {
  default:   "border-default-600 dark:border-default-400",
  primary:   "border-primary",
  secondary: "border-secondary",
  success:   "border-success",
  warning:   "border-warning",
  danger:    "border-danger",
};

const checkedRingColorMap: Record<RadioColor, string> = {
  default:   "border-default-600 dark:border-default-400",
  primary:   "border-primary",
  secondary: "border-secondary",
  success:   "border-success",
  warning:   "border-warning",
  danger:    "border-danger",
};

const dotColorMap: Record<RadioColor, string> = {
  default:   "bg-default-600 dark:bg-default-400",
  primary:   "bg-primary",
  secondary: "bg-secondary",
  success:   "bg-success",
  warning:   "bg-warning",
  danger:    "bg-danger",
};

// ─── Component ───────────────────────────────────────────────────────────────

const Radio = forwardRef<HTMLDivElement, RadioProps>((props, ref) => {
  const {
    label,
    error,
    touched,
    options = [],
    containerClassName = "",
    labelClassName = "",
    errorClassName = "",
    orientation = "vertical",
    color = "primary",
    size = "md",
    field,
    form,
    value,
    onChange,
    disabled = false,
    ...restProps
  } = props;

    const generatedId = useId();

    // Extract field name for error/touched lookup
    const fieldName = field?.name || (props.name as string | undefined) || generatedId;

  const fieldError =
    fieldName && form?.errors?.[fieldName]
      ? (form.errors[fieldName] as string)
      : error;
  const fieldTouched =
    fieldName && form?.touched?.[fieldName] ? true : touched;

  // Current selected value
  const currentValue = value !== undefined ? value : (field?.value ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (field?.onChange) field.onChange(e);
  };

  const isHorizontal = orientation === "horizontal";

  const labelSizeMap = {
    sm: "text-[10px] mb-1.5",
    md: "text-xs mb-1.5",
    lg: "text-sm mb-1.5",
  };

  const optionSizeMap = {
    sm: {
      circle: "w-4 h-4",
      dot: "w-2 h-2",
      text: "text-xs",
      description: "text-[10px]",
    },
    md: {
      circle: "w-5 h-5",
      dot: "w-2.5 h-2.5",
      text: "text-sm",
      description: "text-xs",
    },
    lg: {
      circle: "w-6 h-6",
      dot: "w-3 h-3",
      text: "text-base",
      description: "text-sm",
    },
  };

  const currentSize = optionSizeMap[size] || optionSizeMap.md;
  const currentLabelSize = labelSizeMap[size] || labelSizeMap.md;

  const gapClass = isHorizontal
    ? size === "sm" ? "gap-x-4 gap-y-2" : size === "lg" ? "gap-x-8 gap-y-4" : "gap-x-6 gap-y-3"
    : size === "sm" ? "gap-1.5" : size === "lg" ? "gap-2.5" : "gap-2";

  return (
    <div className={`w-full ${containerClassName}`} ref={ref}>
      {/* Group Label */}
      {label && (
        <p
          className={`font-medium text-neutral-600 dark:text-neutral-400 select-none ${currentLabelSize} ${labelClassName}`}
        >
          {label}
        </p>
      )}

      {/* Radio Options */}
      <div
        className={`flex ${isHorizontal ? "flex-row flex-wrap" : "flex-col"} ${gapClass}`}
      >
        {options.map((opt, i) => {
          const isChecked = String(currentValue) === String(opt.value);
          const optId = `${fieldName ?? "radio"}-${i}`;
          const isOptDisabled = opt.disabled || disabled;

          return (
            <label
              key={i}
              htmlFor={optId}
              className={`relative inline-flex items-start gap-2.5 cursor-pointer group select-none ${
                isOptDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
              }`}
            >
              {/* Hidden native input */}
              <input
                {...restProps}
                id={optId}
                type="radio"
                name={fieldName}
                value={opt.value}
                checked={isChecked}
                onChange={handleChange}
                onBlur={field?.onBlur || props.onBlur}
                disabled={isOptDisabled}
                className="sr-only"
              />

              {/* Custom Radio Circle */}
              <span
                className={`
                  relative mt-0.5 flex items-center justify-center shrink-0
                  rounded-full border-2 transition-all duration-200
                  ${currentSize.circle}
                  ${isChecked
                    ? checkedRingColorMap[color]
                    : `${ringColorMap[color]} group-hover:border-opacity-80`
                  }
                `}
              >
                <AnimatePresence>
                  {isChecked && (
                    <motion.span
                      key="dot"
                      className={`block rounded-full ${dotColorMap[color]} ${currentSize.dot}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28, duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>
              </span>

              {/* Label Text (+ optional description) */}
              <span className="flex flex-col leading-tight mt-[1px]">
                <span
                  className={`font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors duration-150 ${currentSize.text}`}
                >
                  {opt.label}
                </span>
                {opt.description && (
                  <span className={`text-neutral-500 dark:text-neutral-500 mt-0.5 ${currentSize.description}`}>
                    {opt.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {/* Error Message */}
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

Radio.displayName = "Radio";

export default Radio;
