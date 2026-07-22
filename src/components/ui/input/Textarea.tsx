import React, { forwardRef, useEffect, useRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { getIn } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../button/Button";
import { DEFAULT_RADIUS, getRadiusClass, type Radius } from "../shared/radius";
import {
  errorClasses,
  fieldPlaceholderClasses,
  fieldValueClasses,
  getInteractiveBorderClass,
  getWrapperBaseClasses,
  labelClasses,
  labelFloatingClasses,
  type FieldColor,
} from "../shared/fieldStyles";
import { FieldLabelContent } from "../shared/FieldLabelContent";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "form"> {
  label?: string;
  error?: string;
  touched?: boolean;
  containerClassName?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  isRequired?: boolean;

  // HeroUI-style variant props
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "underlined" | "faded";
  radius?: Radius;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  labelPlacement?: "inside" | "outside" | "outside-left" | "outside-top" | "outlined";

  // Clearable
  isClearable?: boolean;

  // Autosize
  minRows?: number;
  maxRows?: number;
  disableAutosize?: boolean;

  // Formik integration
  field?: FieldInputProps<string>;
  form?: {
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    setFieldValue?: (field: string, value: any) => void;
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const {
      label,
      error,
      touched,
      containerClassName = "",
      wrapperClassName = "",
      inputClassName = "",
      labelClassName = "",
      errorClassName = "",
      isRequired = false,
      size = "md",
      variant = "bordered",
      radius = DEFAULT_RADIUS,
      color = "primary",
      labelPlacement = "outside-top",
      isClearable = false,
      minRows = 3,
      maxRows,
      disableAutosize = false,
      field,
      form,
      value,
      onChange,
      placeholder,
      rows,
      disabled = false,
      ...restProps
    } = props;

    const [isFocused, setIsFocused] = useState(false);
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    const resolvedVariant = labelPlacement === "outlined" ? "bordered" : variant;

    // Value resolution
    const inputValue = value !== undefined ? value : (field?.value ?? "");
    const hasValue = String(inputValue).length > 0;

    // Field meta
    const fieldName = field?.name || (props.name as string | undefined);
    const inputId = field?.name || props.id || props.name || undefined;
    const fieldError =
      fieldName && getIn(form?.errors, fieldName)
        ? (getIn(form?.errors, fieldName) as string)
        : error;
    const fieldTouched =
      fieldName && getIn(form?.touched, fieldName) ? true : touched;

    // ── Autosize ──────────────────────────────────────────────────────────
    const LINE_HEIGHT = 24; // px — approximate line height
    const paddingV = { sm: 8, md: 10, lg: 14 }[size] ?? 10;
    const labelH = labelPlacement === "inside" && label ? 20 : 0; // space for floated label

    const minH = minRows * LINE_HEIGHT + paddingV * 2 + labelH;
    const maxH = maxRows ? maxRows * LINE_HEIGHT + paddingV * 2 + labelH : undefined;

    const autoResize = () => {
      const el = internalRef.current;
      if (!el || disableAutosize) return;
      el.style.height = "auto";
      const next = Math.max(el.scrollHeight, minH);
      el.style.height = `${maxH ? Math.min(next, maxH) : next}px`;
      el.style.overflowY =
        maxH && el.scrollHeight > maxH ? "auto" : "hidden";
    };

    useEffect(() => {
      autoResize();
    }, [inputValue, disableAutosize]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) onChange(e);
      if (field?.onChange) field.onChange(e);
      autoResize();
    };

    const handleClear = () => {
      if (form?.setFieldValue && field?.name) {
        form.setFieldValue(field.name, "");
      } else if (field?.onChange) {
        const evt = {
          target: { name: field.name || "", value: "" },
        } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
        field.onChange(evt);
      }
      if (onChange) {
        const evt = {
          target: { name: field?.name || props.name || "", value: "" },
        } as unknown as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(evt);
      }
      setTimeout(() => internalRef.current?.focus(), 0);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      field?.onBlur?.(e);
      props.onBlur?.(e);
    };

    // ── Size ──────────────────────────────────────────────────────────────
    const sizeConfigs = {
      sm: {
        textSize: "text-xs",
        labelSize: "text-[10px]",
        px: "px-2.5",
        pt: label && labelPlacement === "inside" ? "pt-5" : "pt-2",
        pb: "pb-2",
        floatY: 4,
        floatX: -3,
        floatYOutside: -20,
        floatXOutside: -14,
        initialY: 14,
        initialYOutside: 8,
        floatScale: 0.83,
        outlinedFloatY: -8.5,
        outlinedInitialY: 8,
      },
      md: {
        textSize: "text-sm",
        labelSize: "text-xs",
        px: "px-3",
        pt: label && labelPlacement === "inside" ? "pt-6" : "pt-2.5",
        pb: "pb-2.5",
        floatY: 5,
        floatX: 0,
        floatYOutside: -23,
        floatXOutside: -14,
        initialY: 18,
        initialYOutside: 10,
        floatScale: 0.85,
        outlinedFloatY: -11.5,
        outlinedInitialY: 10,
      },
      lg: {
        textSize: "text-base",
        labelSize: "text-sm",
        px: "px-4",
        pt: label && labelPlacement === "inside" ? "pt-7" : "pt-3",
        pb: "pb-3",
        floatY: 6,
        floatX: 3,
        floatYOutside: -26,
        floatXOutside: -14,
        initialY: 22,
        initialYOutside: 12,
        floatScale: 0.87,
        outlinedFloatY: -13,
        outlinedInitialY: 12,
      },
    };

    const flatColorClasses = {
      default: "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-within:bg-neutral-200 dark:focus-within:bg-neutral-700 text-foreground",
      primary: "bg-primary-50 dark:bg-primary-950/20 hover:bg-primary-100 dark:hover:bg-primary-950/40 focus-within:bg-primary-100 dark:focus-within:bg-primary-950/40 text-primary",
      secondary: "bg-secondary-50 dark:bg-secondary-950/20 hover:bg-secondary-100 dark:hover:bg-secondary-950/40 focus-within:bg-secondary-100 dark:focus-within:bg-secondary-950/40 text-secondary",
      success: "bg-success-50 dark:bg-success-950/20 hover:bg-success-100 dark:hover:bg-success-950/40 focus-within:bg-success-100 dark:focus-within:bg-success-950/40 text-success",
      warning: "bg-warning-50 dark:bg-warning-950/20 hover:bg-warning-100 dark:hover:bg-warning-950/40 focus-within:bg-warning-100 dark:focus-within:bg-warning-950/40 text-warning",
      danger: "bg-danger-50 dark:bg-danger-950/20 hover:bg-danger-100 dark:hover:bg-danger-950/40 focus-within:bg-danger-100 dark:focus-within:bg-danger-950/40 text-danger",
    };

    const borderedColorClasses = {
      default: "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 focus-within:border-neutral-500 dark:focus-within:border-neutral-500 text-foreground",
      primary: "border-neutral-300 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-400 focus-within:border-primary text-primary",
      secondary: "border-neutral-300 dark:border-neutral-700 hover:border-secondary-300 dark:hover:border-secondary-400 focus-within:border-secondary text-secondary",
      success: "border-neutral-300 dark:border-neutral-700 hover:border-success-300 dark:hover:border-success-400 focus-within:border-success text-success",
      warning: "border-neutral-300 dark:border-neutral-700 hover:border-warning-300 dark:hover:border-warning-400 focus-within:border-warning text-warning",
      danger: "border-neutral-300 dark:border-neutral-700 hover:border-danger-300 dark:hover:border-danger-400 focus-within:border-danger text-danger",
    };

    const underlinedColorClasses = {
      default: "border-b-neutral-200 focus-within:border-b-neutral-500 text-foreground",
      primary: "border-b-primary-200 focus-within:border-b-primary text-primary",
      secondary: "border-b-secondary-200 focus-within:border-b-secondary text-secondary",
      success: "border-b-success-200 focus-within:border-b-success text-success",
      warning: "border-b-warning-200 focus-within:border-b-warning text-warning",
      danger: "border-b-danger-200 focus-within:border-b-danger text-danger",
    };

    const fadedColorClasses = {
      default: "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 focus-within:border-neutral-400 text-foreground",
      primary: "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 focus-within:border-primary text-primary",
      secondary: "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 focus-within:border-secondary text-secondary",
      success: "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 focus-within:border-success text-success",
      warning: "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 focus-within:border-warning text-warning",
      danger: "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 focus-within:border-danger text-danger",
    };

    const focusBorderColors = {
      default: "border-neutral-500",
      primary: "border-primary",
      secondary: "border-secondary",
      success: "border-success",
      warning: "border-warning",
      danger: "border-danger",
    };

    const focusTextColors = {
      default: "text-foreground",
      primary: "text-primary",
      secondary: "text-secondary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
    };

    const underlineColors = {
      default: "bg-neutral-500",
      primary: "bg-primary",
      secondary: "bg-secondary",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
    };

    // ── Variant ───────────────────────────────────────────────────────────
    const variantConfigs = {
      flat: `border-2 border-transparent ${flatColorClasses[color] || flatColorClasses.default}`,
      bordered: `border-2 ${borderedColorClasses[color] || borderedColorClasses.default}`,
      underlined: `border-b rounded-none relative ${underlinedColorClasses[color] || underlinedColorClasses.default}`,
      faded: `border-2 ${fadedColorClasses[color] || fadedColorClasses.default}`,
    };

    const isOutlined = labelPlacement === "outlined";
    const cs = sizeConfigs[size] ?? sizeConfigs.md;
    const variantClass = isOutlined
      ? "bg-transparent border-none"
      : (variantConfigs[resolvedVariant] ?? variantConfigs.bordered);
    const radiusClass =
      resolvedVariant === "underlined" ? "rounded-none" : getRadiusClass(radius);

    const hasError = !!(fieldTouched && fieldError);

    const wrapperBaseClasses = getWrapperBaseClasses({
      wrapperClassName,
      variant: resolvedVariant,
      isOutlined,
      isActive: isFocused,
      hasError,
    });

    const interactiveBorderClass = getInteractiveBorderClass({
      variant: resolvedVariant,
      isOutlined,
      isActive: isFocused,
      hasError,
      color: color as FieldColor,
    });

    const isFloating = labelPlacement === "inside" || labelPlacement === "outside" || labelPlacement === "outlined";
    const shouldFloat = isFocused || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);

    // ── Outside label ─────────────────────────────────────────────────────
    const renderExternalLabel = () => {
      if (!label || isFloating) return null;
      return (
        <label
          htmlFor={inputId}
          className={`${labelClasses} ${labelPlacement === "outside-left" ? "mb-0 shrink-0" : "mb-2"} ${labelClassName}`}
        >
          <FieldLabelContent label={label} isRequired={isRequired} />
        </label>
      );
    };

    const isOutsideLeft = labelPlacement === "outside-left";

    return (
      <div className={`w-full flow-root ${containerClassName}`}>
        <div className={isOutsideLeft ? "flex items-start gap-3 w-full" : "w-full"}>
          {/* Outside label */}
          {renderExternalLabel()}

          <div
            className={`
              relative w-full transition-all duration-200 ease-in-out box-border group
              ${variantClass}
              ${radiusClass}
              ${wrapperBaseClasses}
              ${interactiveBorderClass}
              ${labelPlacement === "inside" ? "" : (isFloating && label && !isOutlined ? "mt-6" : "")}
              ${isOutlined && label ? "mt-[10px]" : ""}
              ${cs.px}
              ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
            `}
            onClick={() => internalRef.current?.focus()}
          >
            {/* Outlined Fieldset Border and Legend Notch Cutout */}
            {isOutlined && (
              <fieldset
                className={`
                  absolute inset-0 pointer-events-none transition-all duration-200 m-0 p-0
                  ${radiusClass}
                  ${hasError
                    ? "border-2 border-red-500 dark:border-red-500"
                    : isFocused
                      ? `border-2 ${focusBorderColors[color] || "border-primary"}`
                      : "border-2 border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500"
                  }
                `}
              >
                {label && (
                  <legend
                    className={`
                      ml-2 font-medium transition-all duration-200 ease-out block whitespace-nowrap overflow-hidden invisible
                      ${shouldFloat || isFocused || hasValue ? "max-w-full px-1" : "max-w-0 px-0"}
                    `}
                    style={{
                      fontSize: `${size === "sm" ? 9 : size === "lg" ? 12 : 10.5}px`,
                      height: 0,
                    }}
                  >
                    <span><FieldLabelContent label={label} isRequired={isRequired} /></span>
                  </legend>
                )}
              </fieldset>
            )}

            {/* Inside floating label */}
            {(isFloating || isOutlined) && label && (
              <motion.label
                htmlFor={inputId}
                initial={false}
                animate={{
                  y: shouldFloat || (isOutlined && (isFocused || hasValue))
                    ? (isOutlined
                      ? cs.outlinedFloatY
                      : (labelPlacement === "inside" ? cs.floatY : cs.floatYOutside))
                    : (isOutlined ? cs.outlinedInitialY : (labelPlacement === "inside" ? cs.initialY : cs.initialYOutside)),
                  x: shouldFloat || (isOutlined && (isFocused || hasValue))
                    ? (isOutlined
                      ? 0
                      : (labelPlacement === "inside" ? cs.floatX : cs.floatXOutside))
                    : 0,
                  scale: shouldFloat || (isOutlined && (isFocused || hasValue))
                    ? (isOutlined ? 0.75 : cs.floatScale)
                    : 1,
                }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                className={`
                  absolute left-3 top-0 z-10 ${labelFloatingClasses} transition-colors duration-200
                  ${cs.textSize} ${labelClassName} ${
                    isFocused && color !== "default"
                      ? (focusTextColors[color] || "text-primary")
                      : (shouldFloat || (isOutlined && (isFocused || hasValue)))
                        ? isFocused
                          ? "text-neutral-800 dark:text-neutral-200"
                          : "text-neutral-700 dark:text-neutral-300"
                        : "text-neutral-400 dark:text-neutral-500"
                  }
                `}
                style={{ transformOrigin: isOutlined ? "left" : "top left" }}
              >
                <FieldLabelContent label={label} isRequired={isRequired} />
              </motion.label>
            )}

            {/* Clear button */}
            {isClearable && hasValue && (
              <Button
                color="default"
                size="xs"
                variant="flat"
                radius="full"
                isIconOnly
                title="Clear"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="!absolute top-2 right-2 z-10"
              >
                <FaXmark className="w-3.5 h-3.5" aria-hidden />
              </Button>
            )}

            {/* Textarea Container */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <textarea
                {...restProps}
                id={inputId}
                name={field?.name || props.name}
                value={inputValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                ref={(node) => {
                  internalRef.current = node;
                  if (typeof ref === "function") ref(node);
                  else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
                }}
                placeholder={!isFloating || shouldFloat ? placeholder : ""}
                rows={disableAutosize ? (rows ?? minRows) : undefined}
                style={
                  disableAutosize
                    ? undefined
                    : { minHeight: minH, maxHeight: maxH, overflowY: "hidden", resize: "none" }
                }
                className={`
                  w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0
                  text-neutral-800 dark:text-neutral-100
                  ${disableAutosize ? "resize-y" : "resize-none"} transition-all duration-200
                  ${fieldValueClasses} ${fieldPlaceholderClasses} p-0
                  ${labelPlacement === "inside" ? (size === "sm" ? "mt-4" : size === "lg" ? "mt-6" : "mt-5") : "mt-2.5"}
                  mb-2.5
                  ${isClearable && hasValue ? "pr-8" : ""}
                  ${inputClassName}
                `}
              />
            </div>

            {/* Underline Animation for Underlined Variant */}
            {resolvedVariant === "underlined" && (
              <motion.div
                className={`absolute bottom-0 left-0 right-0 h-[2px] z-20 ${underlineColors[color] || "bg-primary"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isFocused ? 1 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ originX: 0.5 }}
              />
            )}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {hasError && (
            <motion.p
              key="err"
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

Textarea.displayName = "Textarea";

export default Textarea;
