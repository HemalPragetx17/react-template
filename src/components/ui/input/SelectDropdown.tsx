import type { FieldProps } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import React, { useLayoutEffect, useRef, useState } from "react";
import { FaCheck, FaChevronDown, FaXmark } from "react-icons/fa6";
import type {
  ClearIndicatorProps,
  DropdownIndicatorProps,
  MultiValue,
  MultiValueRemoveProps,
  OptionProps,
  SingleValue,
} from "react-select";
import Select, { components } from "react-select";
import Button from "../button/Button";
import type { CheckboxColor } from "./Checkbox";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  label: string;
  value: string | number;
}

type SelectVariant = "flat" | "bordered" | "underlined" | "faded";
type SelectSize = "sm" | "md" | "lg";
type SelectRadius = "none" | "sm" | "md" | "lg" | "full";
type SelectColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";
type SelectLabelPlacement = "inside" | "outside" | "outside-left" | "outside-top" | "outlined";

interface SelectDropdownProps extends Omit<FieldProps, 'meta'> {
  meta?: any;
  label?: string;
  placeholder?: string;
  options: SelectOption[];

  isMulti?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isSearchable?: boolean;
  showCheckbox?: boolean;
  closeMenuOnSelect?: boolean;
  /** Max chips shown before showing "+N more" badge (default: 3) */
  maxVisibleChips?: number;

  onInputChange?: (value: string) => void;
  isLoading?: boolean;
  isApiSearch?: boolean;

  // HeroUI-style props
  variant?: SelectVariant;
  size?: SelectSize;
  radius?: SelectRadius;
  color?: SelectColor;
  labelPlacement?: SelectLabelPlacement;

  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Color Tokens                                  */
/* -------------------------------------------------------------------------- */

const colorTokens: Record<
  SelectColor,
  { bg: string; text: string; multiValueBg: string; multiValueText: string; focusBorder: string }
> = {
  default: { bg: "bg-default-600", text: "text-white", multiValueBg: "bg-default-600", multiValueText: "text-white", focusBorder: "border-default-600" },
  primary: { bg: "bg-primary", text: "text-white", multiValueBg: "bg-primary", multiValueText: "text-white", focusBorder: "border-primary" },
  secondary: { bg: "bg-secondary", text: "text-white", multiValueBg: "bg-secondary", multiValueText: "text-white", focusBorder: "border-secondary" },
  success: { bg: "bg-success", text: "text-white", multiValueBg: "bg-success", multiValueText: "text-white", focusBorder: "border-success" },
  warning: { bg: "bg-warning", text: "text-neutral-900", multiValueBg: "bg-warning", multiValueText: "text-neutral-900", focusBorder: "border-warning" },
  danger: { bg: "bg-danger", text: "text-white", multiValueBg: "bg-danger", multiValueText: "text-white", focusBorder: "border-danger" },
};

/* -------------------------------------------------------------------------- */
/*                              Size Tokens                                   */
/* -------------------------------------------------------------------------- */

const sizeTokens: Record<
  SelectSize,
  {
    minH: string;
    textSize: string;
    labelSize: string;
    ptInside: string;
    pb: string;
    px: string;
    floatY: number;
    floatX: number;
    floatYOutside: number;
    floatXOutside: number;
    floatScale: number;
    insideMinH: string;
    outsideHeight: string;
    insideHeight: string;
    // outlined variant: y = -(wrapper_height/2 + label_height/2) to center on border line
    outlinedFloatY: number;
    outlinedInitialY: number;
  }
> = {
  sm: {
    minH: "!min-h-[28px]",
    textSize: "text-xs",
    labelSize: "text-[10px]",
    ptInside: "pt-4",
    pb: "",
    px: "px-2.5",
    floatY: -22,
    floatX: -3,
    floatYOutside: -41,
    floatXOutside: -10,
    floatScale: 0.83,
    insideMinH: "!min-h-12",
    outsideHeight: "h-10",
    insideHeight: "h-12",
    // h-10=40px → center=20px; text-xs line-height=16px → label_height/2=8px → y=-(20+8)=-28
    outlinedFloatY: -28.5,
    outlinedInitialY: -8,
  },
  md: {
    minH: "!min-h-[40px]",
    textSize: "text-sm",
    labelSize: "text-xs",
    ptInside: "pt-5",
    pb: "",
    px: "px-3",
    floatY: -25,
    floatX: -4,
    floatYOutside: -46.5,
    floatXOutside: -12,
    floatScale: 0.85,
    insideMinH: "!min-h-14",
    outsideHeight: "h-12",
    insideHeight: "h-14",
    // h-12=48px → center=24px; text-sm line-height=20px → label_height/2=10px → y=-(24+10)=-34
    outlinedFloatY: -35,
    outlinedInitialY: -10,
  },
  lg: {
    minH: "!min-h-[52px]",
    textSize: "text-base",
    labelSize: "text-sm",
    ptInside: "pt-6",
    pb: "",
    px: "px-4",
    floatY: -28,
    floatX: -5,
    floatYOutside: -52,
    floatXOutside: -16,
    floatScale: 0.87,
    insideMinH: "!min-h-16",
    outsideHeight: "h-14",
    insideHeight: "h-16",
    // h-14=56px → center=28px; text-base line-height=24px → label_height/2=12px → y=-(28+12)=-40
    outlinedFloatY: -41,
    outlinedInitialY: -12,
  },
};

/* -------------------------------------------------------------------------- */
/*                           Variant / Radius Tokens                          */
/* -------------------------------------------------------------------------- */

const radiusMap: Record<SelectRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

/* -------------------------------------------------------------------------- */
/*                         Custom Dropdown Indicator                          */
/* -------------------------------------------------------------------------- */

const CustomDropdownIndicator = (props: DropdownIndicatorProps<SelectOption, boolean>) => {
  return (
    <components.DropdownIndicator {...props}>
      <motion.div
        className="w-4 h-4 text-neutral-400 flex items-center justify-center"
        animate={{ rotate: props.selectProps.menuIsOpen ? 180 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <FaChevronDown className="w-4 h-4 text-neutral-600" aria-hidden />
      </motion.div>
    </components.DropdownIndicator>
  );
};

/* -------------------------------------------------------------------------- */
/*                         Custom Clear Indicator                             */
/* -------------------------------------------------------------------------- */

const CustomClearIndicator = (props: ClearIndicatorProps<SelectOption, boolean>) => {
  return (
    <components.ClearIndicator {...props}>
      <Button
        color="default"
        size="xs"
        variant="flat"
        radius="full"
        isIconOnly
        tabIndex={-1}
      >
        <FaXmark className="w-3.5 h-3.5" aria-hidden />
      </Button>
    </components.ClearIndicator>
  );
};

/* -------------------------------------------------------------------------- */
/*                       Custom Multi-Value Remove                            */
/* -------------------------------------------------------------------------- */

const CustomMultiValueRemove = (props: MultiValueRemoveProps<SelectOption>) => {
  const size: SelectSize = (props.selectProps as any)?.sizeProp ?? "md";
  const labelPlacement: SelectLabelPlacement = (props.selectProps as any)?.labelPlacementProp ?? "outside";
  const isSmallInside = size === "sm" && labelPlacement === "inside";
  const iconSize = isSmallInside ? "w-2.5 h-2.5" : "w-3 h-3";

  return (
    <components.MultiValueRemove {...props}>
      <FaXmark className={`${iconSize} text-white`} aria-hidden />
    </components.MultiValueRemove>
  );
};

/* -------------------------------------------------------------------------- */
/*       Custom Multi-Value: limits visible chips, shows "+N more" badge      */
/* -------------------------------------------------------------------------- */

const CustomMultiValue = (props: any) => {
  const maxVisible: number = (props.selectProps as any)?.maxVisibleChips ?? 3;
  const total: number = props.getValue().length;
  const { index } = props;
  const colorProp: SelectColor = (props.selectProps as any)?.colorProp ?? "primary";
  const tokens = colorTokens[colorProp];
  const chipClassName: string = (props.selectProps as any)?.chipClassName ?? "px-2 py-1.5 text-sm";

  // Within limit — render normally
  if (index < maxVisible) {
    return <components.MultiValue {...props} />;
  }

  // First chip beyond limit → show "+N more" badge (rendered once)
  if (index === maxVisible) {
    const hiddenCount = total - maxVisible;
    return (
      <span className={`inline-flex items-center shrink-0 rounded-md font-semibold whitespace-nowrap ${tokens.multiValueBg} ${tokens.multiValueText} ${chipClassName}`}>
        +{hiddenCount}
      </span>
    );
  }

  // All further chips are invisible
  return null;
};

/* -------------------------------------------------------------------------- */
/*              Static Option Checkbox (no animation = no height shift)       */
/* -------------------------------------------------------------------------- */

const StaticCheckbox = ({ checked, color }: { checked: boolean; color: CheckboxColor }) => {
  const bgMap: Record<CheckboxColor, string> = {
    default: "bg-default-600",
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-md border-2 transition-colors duration-150
        ${checked 
          ? `${bgMap[color]} border-transparent` 
          : "border-neutral-300 dark:border-neutral-600 bg-transparent"
        }
      `}
    >
      {/* SVG always in DOM — opacity toggles so box height never shifts */}
      <FaCheck
        className={`w-3 h-3 text-white transition-opacity duration-150 ${checked ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      />
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/*                             Custom Option                                  */
/* -------------------------------------------------------------------------- */

const CustomOption = (props: OptionProps<SelectOption, boolean>) => {
  const { isSelected, isDisabled } = props;
  const showCheckbox = !!((props.selectProps as any)?.showCheckbox);
  const colorProp: CheckboxColor = (props.selectProps as any)?.colorProp ?? "primary";

  return (
    <components.Option {...props}>
      <div className={`flex items-center justify-between w-full gap-2 ${isDisabled ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="min-w-0 flex items-center gap-2 overflow-hidden">
          {showCheckbox && (
            <StaticCheckbox checked={isSelected} color={colorProp} />
          )}
          <span className="whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-200">
            {props.children}
          </span>
        </div>
        {/* Checkmark for single-select */}
        {!showCheckbox && isSelected && (
          <FaCheck className="w-3.5 h-3.5 shrink-0 text-neutral-800 dark:text-neutral-200" aria-hidden />
        )}
      </div>
    </components.Option>
  );
};

/* -------------------------------------------------------------------------- */
/*                              Select Component                              */
/* -------------------------------------------------------------------------- */

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  field,
  form,
  label,
  options,
  placeholder = "",
  isMulti = false,
  isClearable = false,
  isDisabled = false,
  isSearchable = false,
  showCheckbox = false,
  closeMenuOnSelect,
  onInputChange,
  isLoading = false,
  isApiSearch = false,

  variant = "bordered",
  size = "md",
  radius = "md",
  color = "primary",
  labelPlacement = "outside",

  containerClassName = "",
  labelClassName = "",
  errorClassName = "",
}) => {
  const resolvedVariant = labelPlacement === "outlined" ? "bordered" : variant;

  const [isFocused, setIsFocused] = useState(false);
  const [maxVisibleChips, setMaxVisibleChips] = useState<number>(999);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const { name, value } = field;
  const { setFieldValue, setFieldTouched, touched, errors } = form;

  const hasError = !!(touched[name] && errors[name]);
  const errorMsg = hasError ? String(errors[name]) : undefined;

  const normalizedValue = isMulti
    ? options.filter((o) => Array.isArray(value) && value.includes(o.value))
    : options.find((o) => o.value === value) || null;

  const hasValue = isMulti
    ? Array.isArray(normalizedValue) && normalizedValue.length > 0
    : normalizedValue !== null && normalizedValue !== undefined;

  const tokens = colorTokens[color];
  const sz = sizeTokens[size];

  const focusTextColors = {
    default: "text-neutral-800 dark:text-neutral-100",
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };
  const isInside = labelPlacement === "inside";
  const isOutsideLeft = labelPlacement === "outside-left";

  const isOutlined = labelPlacement === "outlined";
  const isFloating = isInside || labelPlacement === "outside";
  // For outlined: show notch/float when focused OR has value OR has placeholder
  const shouldFloat = isFocused || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);

  const radiusClass = resolvedVariant === "underlined" ? "rounded-none" : radiusMap[radius];
  const menuRadiusClass = resolvedVariant === "underlined" ? "rounded-none" : (radius === "full" ? "rounded-xl" : radiusMap[radius]);

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

  const variantConfigs = {
    flat: `border-2 border-transparent ${flatColorClasses[color] || flatColorClasses.default}`,
    bordered: `border-2 ${borderedColorClasses[color] || borderedColorClasses.default}`,
    underlined: `border-b rounded-none relative ${underlinedColorClasses[color] || underlinedColorClasses.default}`,
    faded: `border-2 ${fadedColorClasses[color] || fadedColorClasses.default}`,
  };

  // When labelPlacement="outlined" the fieldset draws the border; wrapper gets no border
  const variantClass = isOutlined ? "bg-transparent border-none" : (variantConfigs[resolvedVariant] ?? variantConfigs.flat);

  // Dynamic layout measurement for multi-select overflow chips
  useLayoutEffect(() => {
    if (!isMulti || !Array.isArray(normalizedValue) || normalizedValue.length === 0) return;

    const updateMeasurements = () => {
      if (!containerRef.current || !measureRef.current) return;
      // Reserve ~120px buffer for right-side indicators, input field cursor, padding, and "+N more" badge
      const availableWidth = containerRef.current.clientWidth - 120;

      const chipNodes = Array.from(measureRef.current.children) as HTMLElement[];
      let currentWidth = 0;
      let count = 0;

      for (let i = 0; i < chipNodes.length; i++) {
        const nodeWidth = chipNodes[i].offsetWidth + 4; // account for gap-1 (4px)
        if (currentWidth + nodeWidth > availableWidth && i > 0) {
          break;
        }
        currentWidth += nodeWidth;
        count++;
      }

      setMaxVisibleChips(count < normalizedValue.length ? count : normalizedValue.length);
    };

    updateMeasurements();

    const observer = new ResizeObserver(() => {
      updateMeasurements();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [isMulti, normalizedValue]);

  const getChipClass = () => {
    if (size === "sm") {
      return isInside
        ? "py-0.5 px-1.5 text-[10px] leading-none"
        : "py-1.5 px-1.5 text-[11px] leading-none";
    } else if (size === "md") {
      return isInside
        ? "py-0.5 px-2 text-xs"
        : "py-2 px-2 text-xs";
    } else {
      return isInside
        ? "py-1 px-2 text-sm"
        : "py-2.5 px-2.5 text-sm";
    }
  };

  // ── Render external label ──────────────────────────────────────────────────
  const renderExternalLabel = () => {
    // For outlined, label is always rendered as the floating label inside the wrapper
    if (!label || isFloating || isOutlined) return null;
    return (
      <label
        htmlFor={name}
        className={`block font-medium select-none transition-colors duration-200 ${isOutsideLeft ? "shrink-0 mb-0" : "mb-1.5"
          } ${sz.labelSize} ${labelClassName} ${
            isFocused && color !== "default"
              ? (color === "primary" ? "text-primary" :
                 color === "secondary" ? "text-secondary" :
                 color === "success" ? "text-success" :
                 color === "warning" ? "text-warning" :
                 color === "danger" ? "text-danger" : "text-primary")
              : isFocused
                ? "text-neutral-800 dark:text-neutral-200"
                : "text-neutral-700 dark:text-neutral-300"
          }`}
      >
        {label}
      </label>
    );
  };

  const handleChange = (selected: MultiValue<SelectOption> | SingleValue<SelectOption>) => {
    if (isMulti) {
      const values = selected ? (selected as MultiValue<SelectOption>).map((s) => s.value) : [];
      setFieldValue(name, values);
    } else {
      const val = selected ? (selected as SingleValue<SelectOption>)?.value ?? null : null;
      setFieldValue(name, val);
    }
  };

  return (
    <div className={`w-full flow-root ${containerClassName}`}>
      <div className={isOutsideLeft ? "flex items-center gap-3 w-full" : "w-full"}>
        {/* Render external label if outside or outside-left/top */}
        {renderExternalLabel()}

        {/* Wrapper container */}
        <div
          ref={containerRef}
          className={`
            relative flex w-full transition-all duration-200 ease-in-out group
            ${isFocused ? "z-40" : "z-30"}
            ${variantClass}
            ${radiusClass}
            ${hasError && !isOutlined ? "!border-red-500 dark:!border-red-500" : ""}
            ${isFocused && !hasError && !isOutlined
              ? resolvedVariant === "bordered" || resolvedVariant === "faded"
                ? (color === "default" ? "!border-neutral-500" :
                   color === "primary" ? "!border-primary" :
                   color === "secondary" ? "!border-secondary" :
                   color === "success" ? "!border-success" :
                   color === "warning" ? "!border-warning" :
                   color === "danger" ? "!border-danger" : "!border-primary")
                : ""
              : ""}
            ${isInside ? sz.insideHeight : `${sz.outsideHeight} ${isFloating && label && !isOutlined ? "mt-6" : ""} ${isOutlined && label ? "mt-[10px]" : ""}`}
            ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
          `}
        >
          {/* ── Outlined Fieldset Border + Legend Notch ────────────────────── */}
          {isOutlined && (
            <fieldset
              className={`
                absolute inset-0 pointer-events-none transition-all duration-200 m-0 p-0
                ${radiusClass}
                ${hasError
                  ? "border-2 border-red-500 dark:border-red-500"
                  : isFocused
                    ? (color === "default" ? "border-2 border-neutral-500" :
                       color === "primary" ? "border-2 border-primary" :
                       color === "secondary" ? "border-2 border-secondary" :
                       color === "success" ? "border-2 border-success" :
                       color === "warning" ? "border-2 border-warning" :
                       color === "danger" ? "border-2 border-danger" : "border-2 border-primary")
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
                  <span>{label}</span>
                </legend>
              )}
            </fieldset>
          )}

          {/* ── Floating Label (outlined + inside + outside labelPlacements) ── */}
          {(isFloating || isOutlined) && label && (
            <motion.label
              htmlFor={name}
              initial={false}
              animate={{
                y: shouldFloat || (isOutlined && (isFocused || hasValue))
                  ? isOutlined
                    ? sz.outlinedFloatY
                    : isInside
                      ? sz.floatY
                      : sz.floatYOutside
                  : isOutlined
                    ? sz.outlinedInitialY
                    : "-50%",
                x: shouldFloat || (isOutlined && (isFocused || hasValue))
                  ? isOutlined
                    ? 0
                    : isInside
                      ? sz.floatX
                      : sz.floatXOutside
                  : 0,
                scale: shouldFloat || (isOutlined && (isFocused || hasValue))
                  ? isOutlined ? 0.75 : sz.floatScale
                  : 1,
              }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className={`
                absolute ${isOutlined ? "left-3" : `left-0 ${sz.px}`} font-medium select-none origin-left pointer-events-none whitespace-nowrap z-10
                top-1/2
                ${sz.textSize} ${labelClassName} transition-colors duration-200
                ${
                  isFocused && color !== "default"
                    ? (color === "primary" ? "text-primary" :
                       color === "secondary" ? "text-secondary" :
                       color === "success" ? "text-success" :
                       color === "warning" ? "text-warning" :
                       color === "danger" ? "text-danger" : "text-primary")
                    : (shouldFloat || (isOutlined && (isFocused || hasValue)))
                      ? isFocused
                        ? "text-neutral-800 dark:text-neutral-200"
                        : "text-neutral-700 dark:text-neutral-300"
                      : "text-neutral-400 dark:text-neutral-500"
                }
              `}
              style={{ transformOrigin: isOutlined ? "left" : "top left" }}
            >
              {label}
            </motion.label>
          )}

          {/* Hidden measuring container for dynamic multi-select chip overflow */}
          {isMulti && Array.isArray(normalizedValue) && normalizedValue.length > 0 && (
            <div
              ref={measureRef}
              aria-hidden="true"
              className="absolute top-0 left-0 invisible pointer-events-none flex gap-1 h-0 overflow-hidden"
            >
              {normalizedValue.map((opt) => (
                <div
                  key={opt.value}
                  className={`inline-flex items-center gap-1 ${sz.textSize === "text-xs" ? "text-xs" : "text-sm"
                    } rounded-md px-2 py-1.5 font-medium whitespace-nowrap`}
                >
                  <span className="leading-normal">{opt.label}</span>
                  <div className="w-3 h-3 ml-0.5" />
                </div>
              ))}
            </div>
          )}

          {/* Central Stack for Select */}
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            {/* react-select */}
            <Select
              {...({ showCheckbox, colorProp: color, maxVisibleChips, chipClassName: getChipClass(), sizeProp: size, labelPlacementProp: labelPlacement } as any)}
              inputId={name}
              name={name}
              options={options}
              value={normalizedValue}
              onChange={handleChange}
              onBlur={() => { setFieldTouched(name, true); setIsFocused(false); }}
              onFocus={() => setIsFocused(true)}
              isMulti={isMulti}
              isClearable={isClearable}
              isDisabled={isDisabled}
              isSearchable={isSearchable}
              closeMenuOnSelect={closeMenuOnSelect ?? (!isMulti)}
              hideSelectedOptions={false}
              menuPortalTarget={typeof document !== "undefined" ? document.body : null}
              menuPosition="fixed"
              placeholder={
                !isFloating && !isOutlined ? placeholder : shouldFloat ? placeholder : ""
              }
              onInputChange={onInputChange}
              isLoading={isLoading}
              filterOption={isApiSearch ? null : undefined}
              components={{
                Option: CustomOption,
                DropdownIndicator: CustomDropdownIndicator,
                ClearIndicator: CustomClearIndicator,
                MultiValueRemove: CustomMultiValueRemove,
                MultiValue: CustomMultiValue,
                IndicatorSeparator: () => null,
              }}
              unstyled
              classNames={{
                container: () => "w-full h-full",

                control: () =>
                  `flex items-center w-full h-full cursor-pointer bg-transparent ${isInside ? sz.insideHeight : sz.outsideHeight} ${sz.px} ${sz.pb}`,

                placeholder: () =>
                  `${sz.textSize} text-neutral-400 dark:text-neutral-500 select-none truncate`,

                singleValue: () =>
                  `${sz.textSize} ${focusTextColors.default}`,

                valueContainer: () => `flex flex-nowrap items-center gap-1 flex-1 min-w-0 overflow-hidden ${isInside && isFloating && shouldFloat ? sz.ptInside : ""}`,

                input: () =>
                  `${sz.textSize} ${focusTextColors.default} outline-none`,

                indicatorsContainer: () => "flex items-center gap-1 shrink-0 pr-1",

                menu: () =>
                  `mt-1.5 border border-neutral-200 dark:border-neutral-700 ${menuRadiusClass} overflow-hidden shadow-xl bg-white dark:bg-content1 z-50`,

                menuList: () => "py-1 px-1 flex flex-col gap-0.5",

                option: ({ isFocused: optFocused, isDisabled }) =>
                  `px-3 py-2 rounded-lg transition-colors duration-150
                  ${isDisabled
                    ? "cursor-not-allowed text-neutral-400 dark:text-neutral-600"
                    : "cursor-pointer text-neutral-800 dark:text-neutral-200"
                  }
                  ${optFocused && !isDisabled
                    ? "bg-neutral-200 dark:bg-neutral-800"
                    : "bg-transparent"
                  }`,

                noOptionsMessage: () =>
                  "px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400",

                loadingMessage: () =>
                  "px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400",

                multiValue: () =>
                  `inline-flex items-center gap-1 ${tokens.multiValueBg} ${tokens.multiValueText} rounded-md font-medium whitespace-nowrap ${getChipClass()}`,

                multiValueLabel: () => "leading-normal",

                multiValueRemove: () =>
                  "ml-0.5 flex items-center justify-center text-white opacity-70 hover:opacity-100 cursor-pointer transition-opacity",

                clearIndicator: () =>
                  "flex items-center justify-center p-1 cursor-pointer",

                dropdownIndicator: () =>
                  "flex items-center justify-center p-1 cursor-pointer",

                menuPortal: () => "!z-[9999]",
              }}
              noOptionsMessage={() => "No data found"}
            />
          </div>

          {/* Underline Animation for Underlined Variant */}
          {resolvedVariant === "underlined" && (
            <motion.div
              className={`absolute bottom-0 left-0 right-0 h-[2px] z-20 ${
                color === "default" ? "bg-neutral-500" :
                color === "primary" ? "bg-primary" :
                color === "secondary" ? "bg-secondary" :
                color === "success" ? "bg-success" :
                color === "warning" ? "bg-warning" :
                color === "danger" ? "bg-danger" : "bg-primary"
              }`}
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
            className={`mt-1.5 text-sm text-red-500 ${errorClassName}`}
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SelectDropdown;
