import type { FieldProps } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaChevronDown } from "react-icons/fa";
import ReactPhoneInput, {
    getCountryCallingCode,
    parsePhoneNumber,
    type Country,
    isPossiblePhoneNumber,
    isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./index.css";

import { DEFAULT_RADIUS, getImportantRadiusClass, type Radius } from "../../shared/radius";
import {
    errorClasses,
    labelClasses,
    labelFloatingClasses,
    type FieldColor,
    getInputDisabledClasses,
    getInputVariantClasses,
    getWrapperBaseClasses,
    getInteractiveBorderClass,
    fieldValueClasses,
    fieldPlaceholderClasses,
    focusBorderColors,
    fieldsetBorderColors,
    getFloatingLabelColorClass,
    getShowOutlinedFloated,
} from "../../shared/fieldStyles";
import { FieldLabelContent } from "../../shared/FieldLabelContent";
import { OutlinedFieldset, OutlinedMotionLabel } from "../../shared/OutlinedFieldLabel";

interface CountrySelectOption {
    value?: Country;
    label?: string;
}

interface CustomCountrySelectProps {
    value?: Country;
    onChange: (value?: Country) => void;
    options: CountrySelectOption[];
    disabled?: boolean;
    buttonClassName?: string;
    dropdownPosition?: "top" | "bottom";
    enableSearch?: boolean;
    searchPlaceholder?: string;
    searchNotFound?: string;
    onDropdownToggle?: (isOpen: boolean) => void;
    onWidthChange?: (width: number) => void;
    dropdownIcon?: boolean;
}

export interface PhoneInputProps extends Partial<FieldProps> {
    label?: string;
    error?: string;
    touched?: boolean;
    containerClassName?: string;
    wrapperClassName?: string;
    inputClassName?: string;
    buttonClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    isRequired?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "flat" | "bordered" | "underlined" | "faded";
    radius?: Radius;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    labelPlacement?: "inside" | "outside" | "outside-left" | "outside-top" | "outlined";
    dropdownPosition?: "top" | "bottom";
    value?: string;
    /** First arg: E.164 phone value (e.g. +12025551234). Second arg: dial code (e.g. +1). */
    onChange?: (value: string | undefined, countryCode?: string) => void;
    /**
     * When true, allows international input (+…) so the country can be inferred while typing.
     * Default false keeps national-only input for the selected/default country.
     */
    autoDetectCountry?: boolean;
    placeholder?: string;
    defaultCountry?: Country;
    disabled?: boolean;
    enableSearch?: boolean;
    searchPlaceholder?: string;
    searchNotFound?: string;
    className?: string;
    validatePhone?: boolean;
    validationType?: "possible" | "valid";
    phoneErrorMessage?: string;
    countryCodeEditable?: boolean;
    dropdownIcon?: boolean;
    limitMaxLength?: boolean;
    [key: string]: any;
}

const CustomCountrySelect: React.FC<CustomCountrySelectProps> = ({
    value,
    onChange,
    options,
    disabled = false,
    buttonClassName = "",
    dropdownPosition,
    enableSearch = false,
    searchPlaceholder = "Search country...",
    searchNotFound = "No country found",
    onDropdownToggle,
    onWidthChange,
    dropdownIcon = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const buttonRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const selectedOptionRef = useRef<HTMLButtonElement>(null);

    const skipNextClose = useRef(false);

    useEffect(() => {
        if (buttonRef.current) {
            onWidthChange?.(buttonRef.current.offsetWidth);
        }
    }, [value, onWidthChange]);

    const toggleOpen = (newOpen: boolean) => {
        setIsOpen(newOpen);
        onDropdownToggle?.(newOpen);
    };

    const [coords, setCoords] = useState<{
        top: number;
        left: number;
        width: number;
        placeAbove: boolean;
    }>({ top: 0, left: 0, width: 280, placeAbove: false });

    const getCoords = useCallback(() => {
        if (!buttonRef.current) return null;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropdownHeight = 300;
        const placeAbove = dropdownPosition === "top" || (spaceBelow < dropdownHeight && rect.top > spaceBelow);
        return {
            top: placeAbove ? rect.top - 6 : rect.bottom + 6,
            left: Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - 300)),
            width: Math.max(280, rect.width + 180),
            placeAbove,
        };
    }, [dropdownPosition]);

    const updateCoords = useCallback(() => {
        const c = getCoords();
        if (c) setCoords(c);
    }, [getCoords]);

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener("resize", updateCoords);
            window.addEventListener("scroll", updateCoords, true);
            return () => {
                window.removeEventListener("resize", updateCoords);
                window.removeEventListener("scroll", updateCoords, true);
            };
        }
    }, [isOpen, updateCoords]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
                selectedOptionRef.current?.scrollIntoView({ block: "nearest" });
            }, 50);
        } else {
            setSearchQuery("");
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Skip the close triggered immediately after the button opens the dropdown
            if (skipNextClose.current) {
                skipNextClose.current = false;
                return;
            }
            const target = event.target as Node;
            if (buttonRef.current?.contains(target)) return;
            if (popoverRef.current?.contains(target)) return;
            toggleOpen(false);
        };

        if (isOpen) {
            document.addEventListener("click", handleClickOutside);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [isOpen]);

    const filteredOptions = options.filter((opt) => {
        if (!opt.value) return false;
        if (!searchQuery.trim()) return true;
        const countryName = opt.label?.toLowerCase() || "";
        const code = opt.value.toLowerCase();
        let callingCode = "";
        try {
            callingCode = getCountryCallingCode(opt.value);
        } catch {
            callingCode = "";
        }
        const query = searchQuery.toLowerCase().trim().replace(/^\+/, "");
        return countryName.includes(query) || code.includes(query) || callingCode.includes(query);
    });

    let selectedCallingCode = "";
    if (value) {
        try {
            selectedCallingCode = getCountryCallingCode(value);
        } catch {
            selectedCallingCode = "";
        }
    }

    return (
        <div ref={buttonRef} className="phone-country-trigger relative h-full shrink-0">
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (disabled) return;
                    // Compute position synchronously before opening so portal renders in correct position immediately
                    const c = getCoords();
                    if (c) setCoords(c);
                    skipNextClose.current = true;
                    toggleOpen(!isOpen);
                }}
                className={`flex items-center gap-2 px-3 h-full select-none cursor-pointer transition-colors focus:outline-none disabled:cursor-not-allowed ${buttonClassName}`}
            >
                {value ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 shadow-sm border border-neutral-200/80 dark:border-neutral-700/80">
                        <img
                            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${value}.svg`}
                            alt={value}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full shrink-0 flex items-center justify-center text-[10px]">🌐</div>
                )}
                {selectedCallingCode && (
                    <span className="text-sm font-normal text-neutral-800 dark:text-neutral-200">
                        +{selectedCallingCode}
                    </span>
                )}
                {dropdownIcon && (
                    <FaChevronDown
                        className={`w-3 h-3 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                )}
            </button>
            <div className="absolute right-0 top-2.5 bottom-2.5 w-[2px] bg-neutral-200 dark:bg-neutral-700/80 pointer-events-none" />

            {isOpen &&
                createPortal(
                    <div
                        ref={popoverRef}
                        style={{
                            position: "fixed",
                            top: coords.placeAbove ? "auto" : `${coords.top}px`,
                            bottom: coords.placeAbove ? `${window.innerHeight - coords.top}px` : "auto",
                            left: `${coords.left}px`,
                            width: `${coords.width}px`,
                            zIndex: 9999,
                        }}
                        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-1.5 flex flex-col gap-1 text-neutral-800 dark:text-neutral-100 max-h-[300px] animate-in fade-in zoom-in-95 duration-150"
                    >
                        {enableSearch && (
                            <div className="p-1 border-b border-neutral-100 dark:border-neutral-700/60">
                                <div className="relative flex items-center">
                                    <svg className="w-3.5 h-3.5 absolute left-2.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder={searchPlaceholder}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-primary text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="overflow-y-auto flex-1 max-h-[230px] pr-0.5 space-y-0.5 custom-scrollbar">
                            {filteredOptions.length === 0 ? (
                                <div className="p-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
                                    {searchNotFound}
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const countryCode = option.value;
                                    let callingCode = "";
                                    if (countryCode) {
                                        try {
                                            callingCode = getCountryCallingCode(countryCode);
                                        } catch {
                                            callingCode = "";
                                        }
                                    }
                                    const isSelected = countryCode === value;

                                    return (
                                        <button
                                            key={countryCode || "ZZ"}
                                            ref={isSelected ? selectedOptionRef : null}
                                            type="button"
                                            onClick={() => {
                                                onChange(countryCode);
                                                toggleOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-100 cursor-pointer text-left ${isSelected
                                                ? "bg-neutral-200 dark:bg-neutral-700/80 text-neutral-800 dark:text-neutral-200 font-medium"
                                                : "hover:bg-neutral-100 dark:hover:bg-neutral-700/60 text-neutral-800 dark:text-neutral-200 active:bg-neutral-200/70 dark:active:bg-neutral-600/50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                                {countryCode ? (
                                                    <img
                                                        src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`}
                                                        alt={option.label}
                                                        className="w-5 h-3.5 object-cover rounded-[2px] shrink-0 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-5 h-3.5 bg-neutral-200 dark:bg-neutral-700 rounded-[2px] shrink-0 flex items-center justify-center text-[8px]">🌐</div>
                                                )}
                                                <span className={`truncate text-sm ${isSelected ? "font-semibold text-neutral-900 dark:text-neutral-100" : "font-normal text-neutral-800 dark:text-neutral-200"}`}>{option.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {callingCode && (
                                                    <span className={`text-sm ${isSelected ? "text-neutral-600 dark:text-neutral-400 font-medium" : "text-neutral-400 dark:text-neutral-500 font-normal"}`}>
                                                        +{callingCode}
                                                    </span>
                                                )}
                                                {isSelected && (
                                                    <svg className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
    field,
    form,
    ...props
}) => {
    const {
        label,
        error,
        touched,
        containerClassName = "",
        wrapperClassName = "",
        inputClassName = "",
        buttonClassName = "",
        labelClassName = "",
        errorClassName = "",
        isRequired = false,
        size = "md",
        variant = "bordered",
        radius = DEFAULT_RADIUS,
        color = "primary",
        labelPlacement = "outside-top",
        dropdownPosition,
        value,
        onChange,
        autoDetectCountry = false,
        initialValueFormat = "national",
        placeholder = "",
        defaultCountry = undefined,
        disabled = false,
        enableSearch = true,
        searchPlaceholder = "Search country...",
        searchNotFound = "No country found",
        className = "",
        validatePhone = false,
        validationType = "possible",
        phoneErrorMessage = "Invalid phone number",
        countryCodeEditable = false,
        dropdownIcon = false,
        limitMaxLength = true,
        ...rest
    } = props;

    // Sanitize non-HTML props so they are not forwarded to native input
    const { ...inputRest } = rest;

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

    const underlineColors = {
        default: "bg-neutral-500",
        primary: "bg-primary",
        secondary: "bg-secondary",
        success: "bg-success",
        warning: "bg-warning",
        danger: "bg-danger",
    };

    const focusBorderMap: Record<string, string> = {
        default: "#737373",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
    };

    const inlineStyles: React.CSSProperties & Record<string, string> = {
        "--color-primary": primaryColorVal,
        "--phone-focus-border": focusBorderMap[color] || focusBorderMap.primary,
    } as any;

    const [isFocused, setIsFocused] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const isEffectivelyFocused = isFocused || isDropdownOpen;
    const [countrySelectWidth, setCountrySelectWidth] = useState(
        size === "sm" ? 95 : size === "lg" ? 110 : 105
    );

    // Validation states
    const [phoneValidationError, setPhoneValidationError] = useState<string | null>(null);
    const [localTouched, setLocalTouched] = useState(false);

    // Formik field resolution
    const fieldName = field?.name || props.name;
    const getNested = (obj: any, path: string) => (path && obj ? path.split('.').reduce((acc, part) => acc?.[part], obj) : undefined);

    const inputValue = value !== undefined ? value : (field?.value ?? "");

    const resolveCountryFromValue = useCallback((val?: string): Country | undefined => {
        if (!val) return undefined;
        try {
            return parsePhoneNumber(val)?.country;
        } catch {
            return undefined;
        }
    }, []);

    const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(() => {
        return resolveCountryFromValue(String(inputValue || "")) || defaultCountry;
    });

    const userSelectedCountryRef = useRef<Country | undefined>(selectedCountry);
    const activeCountryRef = useRef<Country | undefined>(selectedCountry);

    useEffect(() => {
        activeCountryRef.current = selectedCountry;
    }, [selectedCountry]);

    const toCountryCode = useCallback((country?: Country): string | undefined => {
        if (!country) return undefined;
        try {
            return `+${getCountryCallingCode(country)}`;
        } catch {
            return undefined;
        }
    }, []);

    useEffect(() => {
        const countryFromValue = resolveCountryFromValue(String(inputValue || ""));
        if (countryFromValue) {
            userSelectedCountryRef.current = countryFromValue;
            setSelectedCountry(countryFromValue);
            activeCountryRef.current = countryFromValue;
        }
    }, [inputValue, resolveCountryFromValue]);

    // Validation handler
    const validatePhoneNumber = useCallback((val: string | undefined) => {
        if (!validatePhone || !val) {
            return null;
        }
        
        const cleaned = val.trim();
        if (!cleaned || cleaned === "+") {
            return null;
        }

        // If it's just a country calling code prefix and not required, don't show error
        if (!isRequired) {
            const isOnlyPrefix = /^\+\d{1,4}$/.test(cleaned);
            if (isOnlyPrefix) {
                return null;
            }
        }

        try {
            const isValid = validationType === "valid" 
                ? isValidPhoneNumber(cleaned) 
                : isPossiblePhoneNumber(cleaned);
            return isValid ? null : phoneErrorMessage;
        } catch (e) {
            return phoneErrorMessage;
        }
    }, [validatePhone, validationType, phoneErrorMessage, isRequired]);

    // Validation runner for Formik
    useEffect(() => {
        if (!validatePhone || !fieldName || !form) return;

        const validationErr = validatePhoneNumber(inputValue);
        const formError = getNested(form.errors, fieldName);

        if (validationErr) {
            if (formError !== validationErr) {
                form.setFieldError(fieldName, validationErr);
            }
        } else {
            if (formError === phoneErrorMessage) {
                form.setFieldError(fieldName, undefined);
            }
        }
    }, [inputValue, validatePhone, fieldName, form, validatePhoneNumber, phoneErrorMessage]);

    // Validation runner for standalone mode
    useEffect(() => {
        if (!form) {
            const validationErr = validatePhoneNumber(inputValue);
            setPhoneValidationError(validationErr);
        }
    }, [inputValue, form, validatePhoneNumber]);

    // Resolve touched and error states
    const fieldTouched = form ? Boolean(getNested(form.touched, fieldName)) : (touched ?? localTouched);
    const baseError = fieldName && form?.errors ? (getNested(form.errors, fieldName) as string) : error;
    const fieldError = baseError || phoneValidationError || undefined;
    const hasError = Boolean(fieldTouched && fieldError);

    const emitChange = useCallback((val: string | undefined, country?: Country) => {
        const resolvedCountry =
            country ??
            (!countryCodeEditable ? userSelectedCountryRef.current : undefined) ??
            resolveCountryFromValue(val) ??
            selectedCountry ??
            activeCountryRef.current ??
            defaultCountry;

        if (resolvedCountry && resolvedCountry !== selectedCountry) {
            setSelectedCountry(resolvedCountry);
            activeCountryRef.current = resolvedCountry;
        }

        const countryCode = toCountryCode(resolvedCountry);

        if (onChange) {
            onChange(val, countryCode);
        } else if (field?.onChange) {
            field.onChange({
                target: {
                    name: field.name,
                    value: val,
                },
            });
        }
    }, [onChange, field, defaultCountry, selectedCountry, countryCodeEditable, resolveCountryFromValue, toCountryCode]);

    const handleChange = (val: string | undefined) => {
        emitChange(val);
        if (fieldName && form) {
            setTimeout(() => {
                form.validateField(fieldName);
            }, 0);
        }
    };

    const handleCountryChange = (country?: Country) => {
        const targetCountry = countryCodeEditable
            ? (country || defaultCountry)
            : (userSelectedCountryRef.current || country || defaultCountry);

        if (targetCountry && targetCountry !== selectedCountry) {
            setSelectedCountry(targetCountry);
            activeCountryRef.current = targetCountry;
            if (!countryCodeEditable && country) {
                userSelectedCountryRef.current = country;
            }
        }
        const currentValue = inputValue ? String(inputValue) : undefined;
        emitChange(currentValue || undefined, targetCountry);
        if (fieldName && form) {
            setTimeout(() => {
                form.validateField(fieldName);
            }, 0);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        setLocalTouched(true);
        if (fieldName && form) {
            form.setFieldTouched(fieldName, true, true);
            setTimeout(() => {
                form.validateField(fieldName);
            }, 0);
        }
        if (props.onBlur) props.onBlur(e);
        if (field?.onBlur) field.onBlur(e);
    };

    const sizeConfigs = {
        sm: {
            insideHeight: "h-12",
            outsideHeight: "h-10",
            textSize: "text-xs",
            labelSize: "text-[10px]",
            floatY: labelPlacement === "inside" && label ? -20 : -10,
            floatX: labelPlacement === "inside" && label ? -3 : 0,
            initialY: -8,
            outsideFloatY: -41,
            outsideFloatX: -12,
            initialX: 95,
            top: "top-1/2",
            floatScale: 0.83,
            outlinedFloatY: -28.5,
            outlinedInitialY: -8,
            paddingLeft: 12,
        },
        md: {
            insideHeight: "h-14",
            outsideHeight: "h-12",
            textSize: "text-sm",
            labelSize: "text-xs",
            floatY: labelPlacement === "inside" && label ? -23 : -12,
            floatX: labelPlacement === "inside" && label ? 0 : 0,
            initialY: -10,
            outsideFloatY: -47,
            outsideFloatX: -12,
            initialX: 105,
            top: "top-1/2",
            floatScale: 0.85,
            outlinedFloatY: -35,
            outlinedInitialY: -10,
            paddingLeft: 14,
        },
        lg: {
            insideHeight: "h-16",
            outsideHeight: "h-14",
            textSize: "text-base",
            labelSize: "text-sm",
            floatY: labelPlacement === "inside" && label ? -26 : -14,
            floatX: labelPlacement === "inside" && label ? 3 : 0,
            initialY: -12,
            outsideFloatY: -54,
            outsideFloatX: -12,
            initialX: 110,
            top: "top-1/2",
            floatScale: 0.87,
            outlinedFloatY: -41,
            outlinedInitialY: -12,
            paddingLeft: 16,
        },
    };

    const currentSize = sizeConfigs[size] || sizeConfigs.md;
    const wrapperHeight = labelPlacement === "inside" ? currentSize.insideHeight : currentSize.outsideHeight;
    const currentRadiusClass = resolvedVariant === "underlined" ? "!rounded-none" : getImportantRadiusClass(radius);

    const errorBorderClass = hasError ? "!border-red-500 dark:!border-red-500" : "";

    // Variant Configurations
    const variantConfigs = {
        flat: getInputVariantClasses("flat", color as FieldColor),
        bordered: getInputVariantClasses("bordered", color as FieldColor),
        underlined: getInputVariantClasses("underlined", color as FieldColor),
        faded: getInputVariantClasses("faded", color as FieldColor),
    };

    const isOutlined = labelPlacement === "outlined";
    const currentVariantClass = isOutlined
        ? "bg-transparent border-none"
        : (variantConfigs[resolvedVariant] || variantConfigs.flat);

    const wrapperBaseClasses = getWrapperBaseClasses({
        wrapperClassName,
        variant: resolvedVariant,
        isOutlined,
        isActive: isEffectivelyFocused,
        hasError,
    });

    const interactiveBorderClass = getInteractiveBorderClass({
        variant: resolvedVariant,
        isOutlined,
        isActive: isEffectivelyFocused,
        hasError,
        color: color as FieldColor,
    });

    const finalButtonClass = `${errorBorderClass} ${currentRadiusClass} ${buttonClassName}`.trim();

    // IMPORTANT: Memoize countrySelectComponent so its reference stays stable across renders.
    // If this is an inline arrow function, ReactPhoneInput sees a new component type every render
    // → unmounts and remounts CustomCountrySelect → resets isOpen state → dropdown closes immediately.
    const countrySelectComponent = useCallback(
        (selectProps: any) => (
            <CustomCountrySelect
                {...selectProps}
                value={!countryCodeEditable ? (userSelectedCountryRef.current || selectedCountry || selectProps.value) : selectProps.value}
                disabled={disabled}
                buttonClassName={finalButtonClass}
                dropdownPosition={dropdownPosition}
                enableSearch={enableSearch}
                searchPlaceholder={searchPlaceholder}
                searchNotFound={searchNotFound}
                onDropdownToggle={setIsDropdownOpen}
                onWidthChange={setCountrySelectWidth}
                dropdownIcon={dropdownIcon}
                onChange={(c?: Country) => {
                    if (c) {
                        userSelectedCountryRef.current = c;
                        setSelectedCountry(c);
                        activeCountryRef.current = c;
                    }
                    selectProps.onChange(c);
                }}
            />
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [disabled, finalButtonClass, dropdownPosition, enableSearch, searchPlaceholder, searchNotFound, setCountrySelectWidth, selectedCountry, countryCodeEditable, dropdownIcon]
    );
    
    const isOutsideLeft = labelPlacement === "outside-left";
    const isFloating = labelPlacement === "inside" || labelPlacement === "outside";
    const hasValue = String(inputValue).length > 0;
    const shouldFloat = isEffectivelyFocused || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);
    const showOutlinedFloated = getShowOutlinedFloated(isOutlined, label, shouldFloat, isEffectivelyFocused, hasValue);

    const renderExternalLabel = () => {
        if (!label || isFloating || isOutlined) return null;
        return (
            <label
                htmlFor={fieldName}
                className={`${labelClasses} ${isOutsideLeft ? "mb-0 shrink-0" : "mb-2"} ${labelClassName} ${isEffectivelyFocused ? "text-neutral-800 dark:text-neutral-200" : ""}`}
            >
                <FieldLabelContent label={label} isRequired={isRequired} />
            </label>
        );
    };

    return (
        <div className={`phone-input-root phone-input-size-${size} w-full flow-root ${containerClassName}`} style={inlineStyles}>
            <div className={`${isOutsideLeft ? "flex items-center gap-3 w-full" : "w-full"}`}>
                {renderExternalLabel()}

                <div
                    className={`
                        relative w-full group transition-all duration-200 ease-in-out
                        flex items-center ${currentVariantClass} ${currentRadiusClass}
                        ${wrapperBaseClasses} ${interactiveBorderClass}
                        ${labelPlacement === "inside" && shouldFloat ? "phone-input-inside-floating" : ""}
                        ${wrapperHeight}
                        ${labelPlacement === "inside" ? "" : (isFloating && label && !isOutlined ? "mt-6" : "")}
                        ${isOutlined && label ? "mt-[10px]" : ""}
                        ${disabled ? getInputDisabledClasses(resolvedVariant, color as FieldColor) : ""}
                    `}
                >
                    {isOutlined && (
                        <OutlinedFieldset
                            showFloated={showOutlinedFloated}
                            radiusClass={currentRadiusClass}
                            borderClassName={
                                hasError
                                    ? "border-2 border-red-500 dark:border-red-500"
                                    : isEffectivelyFocused
                                        ? `border-2 ${focusBorderColors[color] || "border-primary"}`
                                        : `border-2 ${fieldsetBorderColors[color] || "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500"}`
                            }
                            label={label}
                            isRequired={isRequired}
                            size={size}
                        />
                    )}

                    {isOutlined && label && (
                        <OutlinedMotionLabel
                            htmlFor={fieldName}
                            label={label}
                            isRequired={isRequired}
                            size={size}
                            showFloated={showOutlinedFloated}
                            outlinedFloatY={currentSize.outlinedFloatY}
                            outlinedInitialY={currentSize.outlinedInitialY}
                            textSizeClass={currentSize.textSize}
                            initialX={countrySelectWidth}
                            floatX={0}
                            topClass={currentSize.top}
                            labelClassName={labelClassName}
                            colorClassName={getFloatingLabelColorClass(resolvedVariant, color as FieldColor, showOutlinedFloated, isEffectivelyFocused, hasError)}
                        />
                    )}

                    {isFloating && !isOutlined && label && (
                        <motion.label
                            htmlFor={fieldName}
                            initial={false}
                            animate={{
                                y: shouldFloat
                                    ? (labelPlacement === "inside" ? currentSize.floatY : currentSize.outsideFloatY)
                                    : currentSize.initialY,
                                x: shouldFloat
                                    ? labelPlacement === "inside"
                                        ? countrySelectWidth
                                        : labelPlacement === "outside"
                                            ? -12
                                            : 0
                                    : countrySelectWidth,
                                scale: shouldFloat ? currentSize.floatScale : 1,
                            }}
                            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                            className={`
                                absolute left-3 z-20 ${labelFloatingClasses} ${currentSize.top}
                                transition-colors duration-200
                                ${currentSize.textSize} ${labelClassName} ${getFloatingLabelColorClass(resolvedVariant, color as FieldColor, shouldFloat, isEffectivelyFocused, hasError)}
                            `}
                            style={{ transformOrigin: "top left" }}
                        >
                            <FieldLabelContent label={label} isRequired={isRequired} />
                        </motion.label>
                    )}

                    {/* Phone Input Core Wrapper */}
                    <ReactPhoneInput
                        country={selectedCountry}
                        defaultCountry={countryCodeEditable ? defaultCountry : (selectedCountry || defaultCountry)}
                        value={inputValue}
                        onChange={handleChange}
                        onCountryChange={handleCountryChange}
                        international={autoDetectCountry ? undefined : false}
                        initialValueFormat={initialValueFormat as any}
                        disabled={disabled}
                        limitMaxLength={limitMaxLength}
                        placeholder={(!isFloating && !isOutlined) || shouldFloat ? placeholder : ""}
                        countrySelectComponent={countrySelectComponent}
                        className={`relative z-0 w-full h-full flex items-center ${className}`}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        numberInputProps={{
                            className: `PhoneInputInput phone-input-control px-3 border-none bg-transparent ${fieldValueClasses} ${fieldPlaceholderClasses} ${
                                labelPlacement === "inside" && shouldFloat
                                    ? (size === "sm" ? "mt-3" : size === "lg" ? "mt-5" : "mt-4")
                                    : "h-full"
                            }`,
                            placeholder: (!isFloating && !isOutlined) || shouldFloat ? placeholder : "",
                            disabled: disabled,
                            ...inputRest,
                        }}
                    />

                    {/* Underlined Accent Bar */}
                    {resolvedVariant === "underlined" && (
                        <motion.div
                            className={`absolute bottom-0 left-0 right-0 h-[2px] z-20 ${underlineColors[color] || "bg-primary"}`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isEffectivelyFocused ? 1 : 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            style={{ originX: 0.5 }}
                        />
                    )}
                </div>
            </div>

            {/* Error Message */}
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
};

export default PhoneInput;
