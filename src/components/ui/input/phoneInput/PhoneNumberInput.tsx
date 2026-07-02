import type { FieldProps } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import _ from 'lodash';
import React from 'react';
import RPI from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import "./index.css";

// @ts-ignore
const PhoneInput = (RPI.default || RPI) as any;

interface PhoneNumberInputProps extends Partial<FieldProps> {
    label?: string;
    error?: string;
    touched?: boolean;
    containerClassName?: string;
    inputClassName?: string;
    buttonClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    size?: "sm" | "md" | "lg";
    variant?: "flat" | "bordered" | "underlined" | "faded";
    radius?: "none" | "sm" | "md" | "lg" | "full";
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    labelPlacement?: "inside" | "outside" | "outside-left" | "outside-top" | "outlined";
    dropdownPosition?: "top" | "bottom";
    countryCodeEditable?: boolean;
    value?: any;
    onChange?: (value: any, country?: any, e?: any, formattedValue?: string) => void;
    singleBorder?: boolean;
    placeholder?: string;

    // React-Phone-Input-2 specific props
    onlyCountries?: string[];
    preferredCountries?: string[];
    excludeCountries?: string[];
    inputProps?: object;
    disabled?: boolean;
    disableDropdown?: boolean;
    disableCountryCode?: boolean;
    enableAreaCodes?: boolean;
    enableTerritories?: boolean;
    enableLongNumbers?: boolean | number;
    enableSearch?: boolean;
    disableSearchIcon?: boolean;
    defaultMask?: string;
    alwaysDefaultMask?: boolean;
    prefix?: string;
    searchPlaceholder?: string;
    searchNotFound?: string;
    copyNumbersOnly?: boolean;
    renderStringAsFlag?: string;
    autocompleteSearch?: boolean;
    jumpCursorToEnd?: boolean;
    priority?: object;
    enableClickOutside?: boolean;
    showDropdown?: boolean;
    defaultErrorMessage?: string;
    specialLabel?: string;
    disableInitialCountryGuess?: boolean;
    disableCountryGuess?: boolean;

    [key: string]: any;
}

const getContainingBlockRect = (element: HTMLElement | null) => {
    if (!element) return null;
    let parent = element.parentElement;
    while (parent) {
        const style = window.getComputedStyle(parent);
        if (
            style.transform !== 'none' ||
            style.perspective !== 'none' ||
            style.filter !== 'none' ||
            style.backdropFilter !== 'none' ||
            style.willChange === 'transform' ||
            style.willChange === 'perspective' ||
            style.willChange === 'filter'
        ) {
            const rect = parent.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
                bottom: rect.bottom,
            };
        }
        parent = parent.parentElement;
    }
    return null;
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
    field,
    form,
    ...props
}) => {
    const {
        label,
        error,
        touched,
        containerClassName,
        inputClassName,
        buttonClassName,
        labelClassName,
        errorClassName,
        size = "md",
        variant = "bordered",
        radius = "md",
        color = "primary",
        labelPlacement = "outside",
        dropdownPosition,
        value,
        countryCodeEditable = false,
        onChange,
        singleBorder = false,
        placeholder = "",
        disabled = false,
        ...rest
    } = props;

    const resolvedVariant = labelPlacement === "outlined" ? "bordered" : variant;

    const colorMap = {
        default: "#737373", // neutral-500
        primary: "#0072f5", // primary / blue
        secondary: "#9b5de5", // secondary / purple
        success: "#17c964", // success / green
        warning: "#f5a524", // warning / yellow
        danger: "#f31260", // danger / red
    };
    const primaryColorVal = colorMap[color] || colorMap.primary;


    const bgMap = {
        default: "",
        primary: "#e6f1fe",
        secondary: "#f4edfd",
        success: "#e7faf0",
        warning: "#fefce8",
        danger: "#fee7ef",
    };

    const bgHoverMap = {
        default: "",
        primary: "#cce3fd",
        secondary: "#ebdcfb",
        success: "#cef7e2",
        warning: "#fef9c3",
        danger: "#fdd0df",
    };

    const darkBgMap = {
        default: "",
        primary: "rgba(0, 114, 245, 0.15)",
        secondary: "rgba(155, 93, 229, 0.15)",
        success: "rgba(23, 201, 100, 0.15)",
        warning: "rgba(245, 165, 36, 0.15)",
        danger: "rgba(243, 18, 96, 0.15)",
    };

    const darkBgHoverMap = {
        default: "",
        primary: "rgba(0, 114, 245, 0.25)",
        secondary: "rgba(155, 93, 229, 0.25)",
        success: "rgba(23, 201, 100, 0.25)",
        warning: "rgba(245, 165, 36, 0.25)",
        danger: "rgba(243, 18, 96, 0.25)",
    };

    const underlineColors = {
        default: "bg-neutral-500",
        primary: "bg-primary",
        secondary: "bg-secondary",
        success: "bg-success",
        warning: "bg-warning",
        danger: "bg-danger",
    };

    const focusTextColors = {
        default: "!text-neutral-800 dark:!text-neutral-100",
        primary: "!text-primary",
        secondary: "!text-secondary",
        success: "!text-success",
        warning: "!text-warning",
        danger: "!text-danger",
    };

    const [autoDropdownPosition, setAutoDropdownPosition] = React.useState<"top" | "bottom">("bottom");
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [dropdownStyles, setDropdownStyles] = React.useState<React.CSSProperties>({});
    const [isFocused, setIsFocused] = React.useState(false);
    const [activeDialCode, setActiveDialCode] = React.useState<string>("");

    const inlineStyles: React.CSSProperties & Record<string, string> = {
        ...dropdownStyles,
        "--color-primary": primaryColorVal,
    } as any;

    if (color !== "default") {
        if (bgMap[color]) inlineStyles["--phone-bg-light"] = bgMap[color];
        if (bgHoverMap[color]) inlineStyles["--phone-bg-light-hover"] = bgHoverMap[color];
        if (darkBgMap[color]) inlineStyles["--phone-bg-dark"] = darkBgMap[color];
        if (darkBgHoverMap[color]) inlineStyles["--phone-bg-dark-hover"] = darkBgHoverMap[color];
    }

    const updateDropdownCoords = React.useCallback(() => {
        if (!containerRef.current) return;
        const flagDropdown = containerRef.current.querySelector('.flag-dropdown') as HTMLElement;
        if (!flagDropdown) return;

        const rect = flagDropdown.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 260; // Max height is 250px + 10px margin

        const containingRect = getContainingBlockRect(flagDropdown);

        let top: number | 'auto' = 0;
        let bottom = 'auto';
        let left = rect.left;

        if (containingRect) {
            left = rect.left - containingRect.left;
            if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
                bottom = `${containingRect.bottom - rect.top + 6}px`;
                top = 'auto';
                setAutoDropdownPosition("top");
            } else {
                top = rect.bottom - containingRect.top + 6;
                setAutoDropdownPosition("bottom");
            }
        } else {
            if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
                bottom = `${window.innerHeight - rect.top + 6}px`;
                top = 'auto';
                setAutoDropdownPosition("top");
            } else {
                top = rect.bottom + 6;
                setAutoDropdownPosition("bottom");
            }
        }

        setDropdownStyles({
            '--dropdown-fixed-top': top === 'auto' ? 'auto' : `${top}px`,
            '--dropdown-fixed-bottom': bottom,
            '--dropdown-fixed-left': `${left}px`,
        } as React.CSSProperties);
    }, []);

    React.useEffect(() => {
        if (isDropdownOpen) {
            updateDropdownCoords();
            
            // Periodically check coordinates during modal transition animation
            const interval = setInterval(updateDropdownCoords, 50);

            window.addEventListener('scroll', updateDropdownCoords, true);
            window.addEventListener('resize', updateDropdownCoords);
            return () => {
                clearInterval(interval);
                window.removeEventListener('scroll', updateDropdownCoords, true);
                window.removeEventListener('resize', updateDropdownCoords);
            };
        }
    }, [isDropdownOpen, updateDropdownCoords]);

    const finalDropdownPosition = dropdownPosition || autoDropdownPosition;

    React.useEffect(() => {
        if (!containerRef.current) return;

        const flagDropdown = containerRef.current.querySelector('.flag-dropdown');
        if (!flagDropdown) return;

        const observer = new MutationObserver(() => {
            setIsDropdownOpen(flagDropdown.classList.contains('open'));
        });

        observer.observe(flagDropdown, {
            attributes: true,
            attributeFilter: ['class'],
        });

        // Initial check
        setIsDropdownOpen(flagDropdown.classList.contains('open'));

        // For tabIndex change in phone Input
        const selectedFlagDiv = containerRef.current.querySelector('.selected-flag');
        if (selectedFlagDiv) {
            selectedFlagDiv.setAttribute("tabIndex", '1');
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    // Prevent selection and cursor from entering the country code prefix when countryCodeEditable is false
    React.useEffect(() => {
        if (countryCodeEditable) return;
        if (!containerRef.current) return;

        const inputEl = containerRef.current.querySelector('input');
        if (!inputEl) return;

        const getPrefixLength = (val: string): number => {
            const match = val.match(/^\+\d+/);
            if (!match) return 0;
            const dialCode = match[0];
            if (val.startsWith(dialCode + " ")) return dialCode.length + 1;
            if (val.startsWith(dialCode + "-")) return dialCode.length + 1;
            if (val.startsWith(dialCode + ")")) return dialCode.length + 1;
            return dialCode.length;
        };

        const adjustSelection = () => {
            const val = inputEl.value;
            const prefixLength = getPrefixLength(val);
            if (prefixLength > 0 && inputEl.selectionStart !== null && inputEl.selectionStart < prefixLength) {
                const currentEnd = inputEl.selectionEnd ?? val.length;
                inputEl.setSelectionRange(prefixLength, Math.max(currentEnd, prefixLength));
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Intercept Ctrl+A or Cmd+A (Select All)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                const val = inputEl.value;
                const prefixLength = getPrefixLength(val);
                inputEl.setSelectionRange(prefixLength, val.length);
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            // Intercept double click and triple click (Select All local number)
            if (e.detail === 2 || e.detail === 3) {
                e.preventDefault();
                const val = inputEl.value;
                const prefixLength = getPrefixLength(val);
                inputEl.setSelectionRange(prefixLength, val.length);
            }
        };

        const handleMouseUp = () => {
            adjustSelection();
        };

        const handleSelectionChange = () => {
            if (document.activeElement !== inputEl) return;
            adjustSelection();
        };

        inputEl.addEventListener('keydown', handleKeyDown);
        inputEl.addEventListener('mousedown', handleMouseDown);
        inputEl.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            inputEl.removeEventListener('keydown', handleKeyDown);
            inputEl.removeEventListener('mousedown', handleMouseDown);
            inputEl.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [countryCodeEditable]);

    // Extract field name for accessing error and touched state from form
    const fieldName = field?.name || props.name;

    // Determine error and touched state - prioritize Formik form data
    const fieldError = fieldName && form?.errors ? _.get(form.errors, fieldName) as string : error;
    const fieldTouched = fieldName && form?.touched ? Boolean(_.get(form.touched, fieldName)) : touched;
    const hasError = Boolean(fieldTouched && fieldError);

    // Prioritize explicitly passed value prop, fallback to Formik field value
    const inputValue = value !== undefined ? value : (field?.value ?? "");

    const handleChange = (val: string, country: any, e: any, formattedValue: string) => {
        if (country?.dialCode) {
            setActiveDialCode(country.dialCode);
        }

        if (onChange) {
            onChange(val, country, e, formattedValue);
        } else if (field?.onChange) {
            const syntheticEvent = {
                target: {
                    name: field.name,
                    value: val,
                }
            };
            field.onChange(syntheticEvent);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        if (props.onBlur) props.onBlur(e);
        if (field?.onBlur) field.onBlur(e);
    };

    // Size configurations matching Input.tsx
    const sizeConfigs = {
        sm: {
            textSize: "text-xs",
            labelSize: "text-[10px]",
            floatY: -18,
            floatX: singleBorder ? 75 : 86,
            initialY: -8,
            outsideFloatY: -41,
            outsideFloatX: 0,
            initialX: singleBorder ? 100 : 110,
            top: "top-1/2",
            floatScale: 0.83,
            outlinedFloatY: -28.5,
            outlinedInitialY: -8,
            paddingLeft: 12,
        },
        md: {
            textSize: "text-sm",
            labelSize: "text-xs",
            floatY: -21,
            floatX: singleBorder ? 77 : 87,
            initialY: -10,
            initialX: singleBorder ? 110 : 120,
            outsideFloatY: -47,
            outsideFloatX: 0,
            top: "top-1/2",
            floatScale: 0.85,
            outlinedFloatY: -35,
            outlinedInitialY: -10,
            paddingLeft: 14,
        },
        lg: {
            textSize: "text-base",
            labelSize: "text-sm",
            floatY: -25,
            floatX: singleBorder ? 79 : 89,
            initialY: -12,
            initialX: singleBorder ? 115 : 125,
            outsideFloatY: -54,
            outsideFloatX: 0,
            top: "top-1/2",
            floatScale: 0.87,
            outlinedFloatY: -41,
            outlinedInitialY: -12,
            paddingLeft: 16,
        },
    };

    const currentSize = sizeConfigs[size] || sizeConfigs.md;

    // Radius Configurations matching Input.tsx (using standard Tailwind values)
    const radiusConfigs = {
        none: "!rounded-none",
        sm: "!rounded-sm",
        md: "!rounded-md",
        lg: "!rounded-lg",
        full: "!rounded-full",
    };

    const currentRadiusClass = resolvedVariant === "underlined" ? "!rounded-none" : (radiusConfigs[radius] || radiusConfigs.md);

    // Merge standard classes with the dynamic border-radius utility class
    const finalInputClass = `${singleBorder ? "!rounded-none" : currentRadiusClass} ${focusTextColors.default} ${inputClassName}`.trim();
    const finalButtonClass = `${singleBorder ? "!rounded-none" : currentRadiusClass} ${buttonClassName}`.trim();

    const isOutlined = labelPlacement === "outlined";
    const isOutsideLeft = labelPlacement === "outside-left";
    const isFloating = labelPlacement === "inside" || labelPlacement === "outside";
    const hasValue = String(inputValue).length > 0 && String(inputValue) !== activeDialCode;
    const shouldFloat = isFocused || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);

    // Build the dynamic container class names
    const containerClasses = `
        react-tel-input
        phone-input-size-${size}
        phone-input-variant-${resolvedVariant}
        phone-input-placement-${labelPlacement}
        phone-input-dropdown-${finalDropdownPosition}
        ${shouldFloat ? "phone-input-should-float" : ""}
        ${singleBorder ? `phone-input-single-border ${currentRadiusClass}` : ""}
        ${isOutlined ? "h-full w-full" : ""}
        ${hasError ? "phone-input-has-error" : ""}
        ${disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}
        ${containerClassName}
    `.trim().replace(/\s+/g, ' ');

    const renderExternalLabel = () => {
        if (!label || isFloating || isOutlined) return null;
        return (
            <label
                htmlFor={fieldName}
                className={`block font-medium select-none transition-colors duration-200 ${isOutsideLeft ? "mb-0 shrink-0" : "mb-1.5"
                    } ${currentSize.labelSize} ${labelClassName} ${
                    isFocused && color !== "default"
                        ? "text-[var(--color-primary,#2196f3)]"
                        : isFocused
                            ? "text-neutral-800 dark:text-neutral-200"
                            : "text-neutral-700 dark:text-neutral-300"
                }`}
            >
                {label}
            </label>
        );
    };

    return (
        <div ref={containerRef} className="w-full flow-root" style={inlineStyles}>
            <div className={`${isOutsideLeft ? "flex items-center gap-3 w-full" : "w-full"}`}>
                {renderExternalLabel()}

                <div 
                    className={`
                        relative w-full group
                        ${isOutlined ? "bg-transparent border-none" : ""}
                        ${isOutlined ? (size === "sm" ? "h-10" : size === "lg" ? "h-14" : "h-12") : ""}
                        ${labelPlacement === "inside" ? "" : (isFloating && label && !isOutlined ? "mt-6" : "")}
                        ${isOutlined && label ? "mt-[10px]" : ""}
                    `}
                >
                    {/* ── Outlined Fieldset Border + Legend Notch ────────────────────── */}
                    {isOutlined && (
                        <fieldset
                            className={`
                                absolute top-0 bottom-0 right-0 pointer-events-none transition-all duration-200 m-0 p-0
                                ${singleBorder ? "left-0" : "left-[82px]"}
                                ${currentRadiusClass}
                                ${hasError
                                    ? "border-2 border-red-500 dark:border-red-500"
                                    : isFocused
                                        ? "border-2 border-[var(--color-primary,#2196f3)]"
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

                    {(isFloating || isOutlined) && label && (
                        <motion.label
                            htmlFor={fieldName}
                            initial={false}
                            animate={{
                                y: shouldFloat || (isOutlined && (isFocused || hasValue))
                                    ? isOutlined
                                        ? currentSize.outlinedFloatY
                                        : (labelPlacement === "inside" ? currentSize.floatY : currentSize.outsideFloatY)
                                    : isOutlined
                                        ? currentSize.outlinedInitialY
                                        : currentSize.initialY,
                                x: shouldFloat || (isOutlined && (isFocused || hasValue))
                                    ? labelPlacement === "inside"
                                        ? (singleBorder ? (58 + (currentSize.paddingLeft || 14)) : (70 + (currentSize.paddingLeft || 14)))
                                        : labelPlacement === "outside"
                                            ? -12
                                            : isOutlined
                                                ? (singleBorder ? 0 : 82)
                                                : (singleBorder ? 0 : 70)
                                    : currentSize.initialX,
                                scale: shouldFloat || (isOutlined && (isFocused || hasValue))
                                    ? isOutlined ? 0.75 : currentSize.floatScale
                                    : 1,
                            }}
                            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                            className={`
                                absolute left-3 font-medium ${currentSize.top} z-20 pointer-events-none origin-left transition-colors duration-200
                                ${currentSize.textSize} ${labelClassName} ${
                                    isFocused && color !== "default"
                                        ? "text-[var(--color-primary,#2196f3)]"
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

                    <PhoneInput
                        {...(field || {})}
                        {...rest}
                        placeholder={placeholder}
                        countryCodeEditable={countryCodeEditable}
                        value={inputValue}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        containerClass={containerClasses}
                        inputClass={finalInputClass}
                        buttonClass={finalButtonClass}
                    />

                    {resolvedVariant === "underlined" && (
                        <motion.div
                            className={`absolute bottom-0 left-0 right-0 h-[2px] z-20 ${
                                hasError ? "bg-red-500" : (underlineColors[color] || "bg-primary")
                            }`}
                            initial={false}
                            animate={{ scaleX: (isFocused || hasError) ? 1 : 0 }}
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
                        {fieldError}
                    </motion.p>
                )}
            </AnimatePresence>

        </div>
    );
};

export default PhoneNumberInput;
