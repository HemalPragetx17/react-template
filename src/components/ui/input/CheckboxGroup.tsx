import React, { forwardRef, useId } from "react";
import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckAtom,
  type CheckboxColor,
  type CheckboxSize,
  type CheckboxRadius,
} from "./Checkbox";
import { DEFAULT_RADIUS } from "../shared/radius";
import { errorClasses, labelGroupClasses } from "../shared/fieldStyles";
import { FieldLabelContent } from "../shared/FieldLabelContent";

// ─── Types ───────────────────────────────────────────────────────────────────

type Orientation = "horizontal" | "vertical";

interface CheckboxGroupOption {
  label: string;
  value: string | number;
  description?: string;
  disabled?: boolean;
}

interface CheckboxGroupProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Group heading label */
  label?: string;
  /** List of checkbox options */
  options?: CheckboxGroupOption[];

  // Error / touched state (standalone)
  error?: string;
  touched?: boolean;

  // Layout
  orientation?: Orientation;

  // HeroUI-style visual props (applied to every checkbox in the group)
  size?: CheckboxSize;
  color?: CheckboxColor;
  radius?: CheckboxRadius;
  isIndeterminate?: boolean;
  lineThrough?: boolean;
  icon?: React.ReactNode;

  // Controlled value (array of selected values)
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;

  // Disabled state
  disabled?: boolean;

  // Classnames
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  isRequired?: boolean;

  // Formik integration
  field?: FieldInputProps<any>;
  form?: {
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    setFieldValue?: (field: string, value: any) => void;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (props, ref) => {
    const {
      label,
      options = [],
      error,
      touched,
      orientation = "vertical",
      size = "md",
      color = "primary",
      radius = DEFAULT_RADIUS,
      isIndeterminate = false,
      lineThrough = false,
      icon,
      value,
      onChange,
      containerClassName = "",
      labelClassName = "",
      errorClassName = "",
      isRequired = false,
      field,
      form,
      disabled = false,
      ...restProps
    } = props;

    const generatedId = useId();

    // Field / Formik meta
    const fieldName = field?.name || (restProps.id as string | undefined) || generatedId;

    const fieldError =
      fieldName && form?.errors?.[fieldName]
        ? (form.errors[fieldName] as string)
        : error;
    const fieldTouched =
      fieldName && form?.touched?.[fieldName] ? true : touched;

    // Resolve current selected array
    const currentArray: (string | number)[] = (() => {
      const raw = value !== undefined ? value : (field?.value ?? []);
      return Array.isArray(raw) ? raw : [];
    })();

    // Toggle handler
    const handleToggle = (optValue: string | number) => {
      const exists = currentArray.includes(optValue);
      const next = exists
        ? currentArray.filter((v) => v !== optValue)
        : [...currentArray, optValue];

      if (form?.setFieldValue && fieldName) {
        form.setFieldValue(fieldName, next);
      } else if (field?.onChange) {
        const evt = {
          target: { name: fieldName || "", value: next },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        field.onChange(evt);
      }

      if (onChange) onChange(next);
    };

    const isHorizontal = orientation === "horizontal";

    const labelSizeClass =
      size === "sm" ? "text-[10px] mb-1.5" : size === "lg" ? "text-sm mb-1.5" : "text-xs mb-1.5";

    const gapClass = isHorizontal
      ? size === "sm" ? "gap-x-4 gap-y-2" : size === "lg" ? "gap-x-8 gap-y-4" : "gap-x-6 gap-y-3"
      : size === "sm" ? "gap-1.5" : size === "lg" ? "gap-2.5" : "gap-2";

    return (
      <div
        ref={ref}
        className={`w-full ${containerClassName}`}
        role="group"
        aria-labelledby={label ? `${fieldName}-group-label` : undefined}
      >
        {/* Group Label */}
        {label && (
          <p
            id={`${fieldName}-group-label`}
            className={`${labelGroupClasses} ${labelSizeClass} ${labelClassName}`}
          >
            <FieldLabelContent label={label} isRequired={isRequired} />
          </p>
        )}

        {/* Options */}
        <div
          className={`flex ${isHorizontal ? "flex-row flex-wrap" : "flex-col"} ${gapClass}`}
        >
          {options.map((opt, i) => {
            const isChecked = currentArray.includes(opt.value);
            const isOptDisabled = opt.disabled || disabled;
            return (
              <CheckAtom
                key={i}
                id={`${fieldName}-${i}`}
                name={fieldName}
                checked={isChecked}
                onToggle={() => {
                  if (!isOptDisabled) {
                    handleToggle(opt.value);
                  }
                }}
                onBlur={field?.onBlur}
                label={opt.label}
                description={opt.description}
                size={size}
                color={color}
                radius={radius}
                isIndeterminate={isIndeterminate}
                lineThrough={lineThrough}
                icon={icon}
                disabled={isOptDisabled}
              />
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
              className={`${errorClasses} ${errorClassName}`}
            >
              {fieldError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

CheckboxGroup.displayName = "CheckboxGroup";

export default CheckboxGroup;
