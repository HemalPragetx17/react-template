import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import React, { forwardRef, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "../button/Button";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "form" | "size"> {
  label?: string;
  error?: string;
  touched?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  isPasswordToggle?: boolean;
  numInputs?: number;
  isClearable?: boolean;

  // Premium HeroUI Variants
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "underlined" | "faded";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  labelPlacement?: "inside" | "outside" | "outside-left" | "outside-top" | "outlined";

  // Formik integration
  field?: FieldInputProps<string>;
  form?: {
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    setFieldValue?: (field: string, value: any) => void;
  };
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    label,
    error,
    touched,
    startContent,
    endContent,
    containerClassName = "",
    inputClassName = "",
    labelClassName = "",
    errorClassName = "",
    isPasswordToggle = false,
    numInputs: _numInputs,
    isClearable = false,
    size = "md",
    variant = "bordered",
    radius = "md",
    color = "primary",
    labelPlacement = "outside",
    type = "text",
    field,
    form,
    value,
    onChange,
    onFocus,
    onBlur,
    placeholder,
    disabled = false,
    ...restProps
  } = props;

  const resolvedVariant = labelPlacement === "outlined" ? "bordered" : variant;

  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  // Determine if the component is controlled (either via value prop or Formik field)
  const isControlled = value !== undefined || field !== undefined;

  // Prioritize explicitly passed value prop, fallback to Formik field value, then internal state
  const inputValue = isControlled
    ? (value !== undefined ? value : (field?.value ?? ""))
    : internalValue;

  const hasValue = String(inputValue).length > 0;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
    if (field?.onBlur) field.onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
    if (field?.onChange) {
      field.onChange(e);
    }
  };

  const handleClear = () => {
    if (form?.setFieldValue && field?.name) {
      form.setFieldValue(field.name, "");
    } else if (field?.onChange) {
      const syntheticEvent = {
        target: {
          name: field.name || "",
          value: "",
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      field.onChange(syntheticEvent);
    }
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: field?.name || props.name || "",
          value: "",
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  // Extract field name for accessing error and touched state from form
  const fieldName = field?.name || (props.name as string | undefined);

  // Determine error and touched state - prioritize Formik form data
  const fieldError = fieldName && form?.errors?.[fieldName] ? (form.errors[fieldName] as string) : error;
  const fieldTouched = fieldName && form?.touched?.[fieldName] ? true : touched;

  const isPassword = type === "password";

  const inputType =
    isPassword && isPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

  // Size Configurations
  const sizeConfigs = {
    sm: {
      wrapperPadding: labelPlacement === "inside" && label ? "py-1 px-2.5" : "py-1.5 px-2.5",
      textSize: "text-xs",
      labelSize: "text-[10px]",
      insideHeight: "h-12",
      outsideHeight: "h-10",
      floatY: labelPlacement === "inside" && label ? -20 : -10,
      floatX: labelPlacement === "inside" && label ? -3 : 0,
      initialY: -8,
      floatYOutside: -41,
      floatXOutside: -14,
      floatScale: 0.83,
      // outlined variant: y = -(wrapper_height/2 + label_height/2) to center on border line
      // h-10=40px → center=20px; text-xs line-height=16px → label_height/2=8px → y=-(20+8)=-28
      outlinedFloatY: -28.5,
      outlinedInitialY: -8,
    },
    md: {
      wrapperPadding: labelPlacement === "inside" && label ? "py-1.5 px-3" : "py-2.5 px-3",
      textSize: "text-sm",
      labelSize: "text-xs",
      insideHeight: "h-14",
      outsideHeight: "h-12",
      floatY: labelPlacement === "inside" && label ? -23 : -12,
      floatX: labelPlacement === "inside" && label ? 0 : 0,
      initialY: -10,
      floatYOutside: -47,
      floatXOutside: -14,
      floatScale: 0.85,
      // h-12=48px → center=24px; text-sm line-height=20px → label_height/2=10px → y=-(24+10)=-34
      outlinedFloatY: -35,
      outlinedInitialY: -10,
    },
    lg: {
      wrapperPadding: labelPlacement === "inside" && label ? "py-2 px-4" : "py-3.5 px-4",
      textSize: "text-base",
      labelSize: "text-sm",
      insideHeight: "h-16",
      outsideHeight: "h-14",
      floatY: labelPlacement === "inside" && label ? -26 : -14,
      floatX: labelPlacement === "inside" && label ? 3 : 0,
      initialY: -12,
      floatYOutside: -54,
      floatXOutside: -14,
      floatScale: 0.87,
      // h-14=56px → center=28px; text-base line-height=24px → label_height/2=12px → y=-(28+12)=-40
      outlinedFloatY: -41,
      outlinedInitialY: -12,
    },
  };

  // Color-specific configurations
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

  const focusBorderColors = {
    default: "border-neutral-500",
    primary: "border-primary",
    secondary: "border-secondary",
    success: "border-success",
    warning: "border-warning",
    danger: "border-danger",
  };

  const fieldsetBorderColors = {
    default: "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500 focus-within:border-neutral-500",
    primary: "border-neutral-300 dark:border-neutral-700 group-hover:border-primary-300 dark:group-hover:border-primary-800 focus-within:border-primary",
    secondary: "border-neutral-300 dark:border-neutral-700 group-hover:border-secondary-300 dark:group-hover:border-secondary-800 focus-within:border-secondary",
    success: "border-neutral-300 dark:border-neutral-700 group-hover:border-success-300 dark:group-hover:border-success-800 focus-within:border-success",
    warning: "border-neutral-300 dark:border-neutral-700 group-hover:border-warning-300 dark:group-hover:border-warning-800 focus-within:border-warning",
    danger: "border-neutral-300 dark:border-neutral-700 group-hover:border-danger-300 dark:group-hover:border-danger-800 focus-within:border-danger",
  };

  // Variant Configurations
  const variantConfigs = {
    flat: `border-2 border-transparent ${flatColorClasses[color] || flatColorClasses.default}`,
    bordered: `border-2 ${borderedColorClasses[color] || borderedColorClasses.default}`,
    underlined: `border-b rounded-none relative ${underlinedColorClasses[color] || underlinedColorClasses.default}`,
    faded: `border-2 ${fadedColorClasses[color] || fadedColorClasses.default}`,
  };

  // Radius Configurations
  const radiusConfigs = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const currentSize = sizeConfigs[size] || sizeConfigs.md;
  // When labelPlacement="outlined" the fieldset draws the border; wrapper gets no border
  const isOutlined = labelPlacement === "outlined";
  const currentVariantClass = isOutlined
    ? "bg-transparent border-none"
    : (variantConfigs[resolvedVariant] || variantConfigs.flat);
  const currentRadiusClass = resolvedVariant === "underlined" ? "rounded-none" : (radiusConfigs[radius] || radiusConfigs.md);

  // Fallback map for start/end content maintaining backwards compatibility
  const actualStartContent = startContent;
  const actualEndContent = endContent;

  const isFloating = labelPlacement === "inside" || labelPlacement === "outside";
  const shouldFloat = isFocused || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);

  // Render Label Helper
  const renderExternalLabel = () => {
    if (!label || isFloating || isOutlined) return null;
    return (
      <label
        htmlFor={field?.name || props.id || props.name}
        className={`block font-medium select-none transition-colors duration-200 ${labelPlacement === "outside-left" ? "mb-0 shrink-0" : "mb-1.5"
          } ${currentSize.labelSize} ${labelClassName} ${
            isFocused && color !== "default"
              ? (focusTextColors[color] || "text-primary")
              : isFocused
                ? "text-neutral-800 dark:text-neutral-200"
                : "text-neutral-700 dark:text-neutral-300"
          }`}
      >
        {label}
      </label>
    );
  };

  const isOutsideLeft = labelPlacement === "outside-left";

  const resolvedPlaceholder = placeholder || "";

  return (
    <div className={`w-full flow-root ${containerClassName}`}>
      {/* Outer Layout Strategy based on labelPlacement */}
      <div className={`${isOutsideLeft ? "flex items-center gap-3 w-full" : "w-full"}`}>
        {/* Render external label if outside or outside-left/top */}
        {renderExternalLabel()}

        {/* Input Wrapper Container */}
        <div
          className={`
            relative flex items-center gap-2.5 w-full transition-all duration-200 ease-in-out box-border group
            ${currentVariantClass}
            ${currentRadiusClass}
            ${currentSize.wrapperPadding}
            ${fieldTouched && fieldError && !isOutlined ? "!border-red-500 dark:!border-red-500" : ""}
            ${labelPlacement === "inside" ? currentSize.insideHeight : `${currentSize.outsideHeight} ${isFloating && label && !isOutlined ? "mt-6" : ""} ${isOutlined && label ? "mt-[10px]" : ""}`}
            ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
          `}
        >
          {/* Outlined Fieldset Border and Legend Cutout */}
          {isOutlined && (
            <fieldset
              className={`
                absolute inset-0 pointer-events-none transition-all duration-200 m-0 p-0
                ${currentRadiusClass}
                ${fieldTouched && fieldError
                  ? "border-2 border-red-500 dark:border-red-500"
                  : isFocused
                    ? `border-2 ${focusBorderColors[color] || "border-primary"}`
                    : `border-2 ${fieldsetBorderColors[color] || "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500"}`
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
                  <span>{label}</span>
                </legend>
              )}
            </fieldset>
          )}

          {/* Floating Label */}
          {(isFloating || isOutlined) && label && (
            <motion.label
              htmlFor={field?.name || props.id || props.name}
              initial={false}
              animate={{
                y: shouldFloat || (isOutlined && (isFocused || hasValue))
                  ? (isOutlined
                    ? currentSize.outlinedFloatY
                    : (labelPlacement === "inside" ? currentSize.floatY : currentSize.floatYOutside))
                  : (isOutlined ? currentSize.outlinedInitialY : currentSize.initialY),
                x: shouldFloat || (isOutlined && (isFocused || hasValue))
                  ? (isOutlined
                    ? 0
                    : (labelPlacement === "inside" ? currentSize.floatX : currentSize.floatXOutside))
                  : (actualStartContent ? 32 : 0),
                scale: shouldFloat || (isOutlined && (isFocused || hasValue))
                  ? (isOutlined ? 0.75 : currentSize.floatScale)
                  : 1,
              }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className={`
                absolute left-3 top-1/2 z-10 font-medium pointer-events-none origin-left transition-colors duration-200
                ${currentSize.textSize}
                 ${labelClassName} ${
                  isFocused && color !== "default"
                    ? (focusTextColors[color] || "text-primary")
                    : (shouldFloat || (isOutlined && (isFocused || hasValue)))
                      ? isFocused
                        ? "text-neutral-800 dark:text-neutral-200"
                        : "text-neutral-700 dark:text-neutral-300"
                      : "text-neutral-400 dark:text-neutral-500"
                }
              `}
            >
              {label}
            </motion.label>
          )}

          {/* Start Content / Icon */}
          {actualStartContent && (
            <div className="flex items-center justify-center shrink-0 text-neutral-500">
              {actualStartContent}
            </div>
          )}

          {/* Central Stack: Input */}
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            <input
              {...restProps}
              id={field?.name || props.id || props.name}
              name={field?.name || props.name}
              value={inputValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onWheel={(e) => {
                if (type === "number") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              ref={ref}
              type={inputType}
              placeholder={(!isFloating && !isOutlined) || shouldFloat ? resolvedPlaceholder : ""}
              disabled={disabled}
              className={`
                w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0
                 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400
                ${currentSize.textSize}
                ${labelPlacement === "inside" && isFloating && shouldFloat ? (size === "sm" ? "mt-3" : size === "lg" ? "mt-5" : "mt-4") : ""}
                ${inputClassName}
              `}
            />
          </div>

          {/* Clear Button */}
          {isClearable && !disabled && (
            <div className="w-7 h-7 flex items-center justify-center shrink-0">
              {hasValue && (
                <Button
                  color="default"
                  size="xs"
                  variant="flat"
                  radius="full"
                  isIconOnly
                  tabIndex={-1}
                  onClick={handleClear}
                  className="w-7 h-7 min-w-7 min-h-7"
                >
                  <FaXmark className="w-3.5 h-3.5" aria-hidden />
                </Button>
              )}
            </div>
          )}

          {/* End Content / Password Toggle */}
          {isPassword && isPasswordToggle ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex items-center justify-center shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
            >
              {showPassword ? (
                <FiEyeOff className="w-6 h-6 opacity-75" aria-hidden />
              ) : (
                <FiEye className="w-6 h-6 opacity-75" aria-hidden />
              )}
            </button>
          ) : (
            actualEndContent && (
              <div className="flex items-center justify-center shrink-0 text-neutral-500">
                {actualEndContent}
              </div>
            )
          )}

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
        {fieldTouched && fieldError && (
          <motion.p
            key="err"
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

Input.displayName = "Input";

export default Input;
