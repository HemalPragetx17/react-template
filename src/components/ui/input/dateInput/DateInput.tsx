import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { getIn } from "formik";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaCalendar,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import Button from "../../button/Button";
import { DEFAULT_RADIUS, getRadiusClass, type Radius } from "../../shared/radius";
import {
  fieldPlaceholderClasses,
  fieldValueClasses,
  errorClasses,
  focusBorderColors,
  focusTextColors,
  fieldsetBorderColors,
  getInputVariantClasses,
  getInteractiveBorderClass,
  getWrapperBaseClasses,
  labelClasses,
  labelFloatingClasses,
  inputDisabledWrapperClasses,
  stripInteractiveFieldClasses,
  underlineColors,
  type FieldColor,
} from "../../shared/fieldStyles";
import { FieldLabelContent } from "../../shared/FieldLabelContent";
import "./index.css";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type PickerVariant = "flat" | "bordered" | "underlined" | "faded";
type PickerSize = "sm" | "md" | "lg";
type PickerColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";
type PickerLabelPlacement = "inside" | "outside" | "outside-left" | "outside-top" | "outlined";

export interface DateInputProps {
  label?: string;
  placeholder?: string;
  selectsRange?: boolean;
  isClearable?: boolean;
  disabled?: boolean;
  endDateName?: string;

  // Custom static props if not using Formik
  value?: any;
  onChange?: ((dateOrRange: any) => void) | any;
  onRangeChange?: (startDate: Date | null, endDate: Date | null) => void;

  error?: string;
  touched?: boolean;

  // Premium HeroUI-style tokens
  variant?: PickerVariant;
  size?: PickerSize;
  radius?: Radius;
  color?: PickerColor;
  labelPlacement?: PickerLabelPlacement;

  containerClassName?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  isRequired?: boolean;
  enableMonthYearPicker?: boolean;
  /** Earliest selectable date (Date, ISO string, or null) */
  minDate?: Date | string | null;
  /** Latest selectable date (Date, ISO string, or null) */
  maxDate?: Date | string | null;

  // Formik integration
  field?: FieldInputProps<any>;
  form?: {
    values: any;
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    setFieldValue?: (field: string, value: any, shouldValidate?: boolean) => void;
    setFieldTouched?: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void;
    setValues?: (values: any, shouldValidate?: boolean) => void;
  };
}

/* -------------------------------------------------------------------------- */
/*                              Tokens & Helpers                              */
/* -------------------------------------------------------------------------- */

const monthOptions = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

const yearOptions = Array.from({ length: 60 }, (_, index) => {
  const year = new Date().getFullYear() - 40 + index;
  return { value: year, label: String(year) };
});

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toLocalYYYYMMDD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isSameDate(a: Date | null, b: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateDisplay(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayRange(start: Date | null, end: Date | null): string {
  if (!start && !end) return "";
  if (start && !end) return formatDateDisplay(start);
  return `${formatDateDisplay(start)} – ${formatDisplayRange(end, null)}`;
}

/* -------------------------------------------------------------------------- */
/*                              Subcomponents                                 */
/* -------------------------------------------------------------------------- */

function CalendarIcon({ colorClass, disabled }: { colorClass?: string; disabled?: boolean }) {
  const idleClass = disabled
    ? "text-neutral-600 dark:text-neutral-350"
    : "text-neutral-600 dark:text-neutral-350 group-hover:text-neutral-800 dark:group-hover:text-neutral-100";
  return (
    <FaCalendar className={`w-4 h-4 shrink-0 transition-colors ${colorClass || idleClass}`} aria-hidden />
  );
}

function ClearIcon({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <Button
      color="default"
      size="xs"
      variant="flat"
      radius="full"
      isIconOnly
      tabIndex={-1}
      onClick={onClick}
    >
      <FaXmark className="w-3.5 h-3.5" aria-hidden />
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*                         iOS Drum-Roll Picker Hook                          */
/* -------------------------------------------------------------------------- */

const ITEM_HEIGHT = 44; // px — height of each row in the drum
const VISIBLE_ITEMS = 7; // must be odd so center = selected — 7 rows covers calendar date grid
const DRUM_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 308px
/** Matches `--drp-calendar-width` in dateInput/index.css */
const CALENDAR_POPOVER_WIDTH = 300;
const CALENDAR_POPOVER_HEIGHT = 372;

/**
 * useDrumPicker
 * - Trackpad: native scroll + CSS scroll-snap
 * - Mouse wheel: exactly one item per notch (passive:false wheel handler)
 * - Scroll-end: instant snap (no spring); spring reserved for click only
 */
function useDrumPicker<T extends { value: number; label: string }>(
  items: T[],
  currentValue: number,
  onChange: (value: number) => void,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticRef = useRef(false);
  const lastEmittedRef = useRef<number | null>(null);
  const scrollY = useMotionValue(0);
  const PADDING = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

  const indexToScrollTop = useCallback((idx: number) => idx * ITEM_HEIGHT, []);

  const scrollTopToIndex = useCallback(
    (scrollTop: number) => Math.round(scrollTop / ITEM_HEIGHT),
    [],
  );

  const snapToIndex = useCallback(
    (idx: number) => {
      const el = containerRef.current;
      if (!el) return -1;

      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      const target = indexToScrollTop(clamped);

      programmaticRef.current = true;
      el.scrollTop = target;
      scrollY.set(target);
      programmaticRef.current = false;

      return clamped;
    },
    [indexToScrollTop, scrollY, items.length],
  );

  const animateToIndex = useCallback(
    (idx: number) => {
      const el = containerRef.current;
      if (!el) return;

      const target = indexToScrollTop(idx);
      programmaticRef.current = true;

      animate(scrollY, target, {
        type: "spring",
        stiffness: 140,
        damping: 24,
        mass: 0.8,
        restDelta: 0.2,
        restSpeed: 0.2,
        onUpdate: (v) => {
          if (el) el.scrollTop = v;
        },
        onComplete: () => {
          programmaticRef.current = false;
        },
      });
    },
    [indexToScrollTop, scrollY],
  );

  const emitChange = useCallback(
    (idx: number) => {
      const item = items[idx];
      if (!item || item.value === currentValue) return;
      lastEmittedRef.current = item.value;
      onChange(item.value);
    },
    [items, currentValue, onChange],
  );

  /* Sync scroll position only for external value changes (break onChange loop). */
  useEffect(() => {
    if (lastEmittedRef.current === currentValue) {
      lastEmittedRef.current = null;
      return;
    }

    const idx = items.findIndex((it) => it.value === currentValue);
    if (idx === -1) return;

    const el = containerRef.current;
    if (!el) return;

    if (scrollTopToIndex(el.scrollTop) === idx) return;

    programmaticRef.current = true;
    el.scrollTop = indexToScrollTop(idx);
    scrollY.set(indexToScrollTop(idx));
    programmaticRef.current = false;
  }, [currentValue, items, indexToScrollTop, scrollTopToIndex, scrollY]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    scrollY.set(el.scrollTop);
    if (programmaticRef.current) return;

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

    scrollTimerRef.current = setTimeout(() => {
      if (programmaticRef.current) return;

      const idx = Math.max(
        0,
        Math.min(scrollTopToIndex(el.scrollTop), items.length - 1),
      );

      snapToIndex(idx);
      emitChange(idx);
    }, 80);
  }, [scrollY, scrollTopToIndex, items.length, snapToIndex, emitChange]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const el = containerRef.current;
      if (!el) return;

      const isLineOrPage =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE ||
        e.deltaMode === WheelEvent.DOM_DELTA_PAGE;
      const isLargePixelDelta =
        e.deltaMode === WheelEvent.DOM_DELTA_PIXEL && Math.abs(e.deltaY) >= 40;

      /* Trackpad: small pixel deltas — let native scroll + CSS snap handle it. */
      if (!isLineOrPage && !isLargePixelDelta) return;

      e.preventDefault();

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIdx = scrollTopToIndex(el.scrollTop);
      const nextIdx = Math.max(
        0,
        Math.min(currentIdx + direction, items.length - 1),
      );

      snapToIndex(nextIdx);
      emitChange(nextIdx);
    },
    [scrollTopToIndex, items.length, snapToIndex, emitChange],
  );

  const handleItemClick = useCallback(
    (idx: number) => {
      animateToIndex(idx);
      emitChange(idx);
    },
    [animateToIndex, emitChange],
  );

  return {
    containerRef,
    handleScroll,
    handleWheel,
    handleItemClick,
    scrollY,
    PADDING,
  };
}

/* -------------------------------------------------------------------------- */
/*                           DateInput Component                       */
/* -------------------------------------------------------------------------- */

const LazyDatePicker = React.lazy(async () => {
  await import("react-datepicker/dist/react-datepicker.css");
  const mod = await import("react-datepicker");
  return { default: mod.default };
});

const DateInput = React.forwardRef<HTMLDivElement, DateInputProps>(({
  field,
  form,
  label,
  placeholder,
  selectsRange = false,
  isClearable = false,
  disabled = false,
  value,
  onChange,
  onRangeChange,
  error,
  touched,
  endDateName,

  variant = "bordered",
  size = "md",
  radius = DEFAULT_RADIUS,
  color = "primary",
  labelPlacement = "outside-top",

  containerClassName = "",
  wrapperClassName = "",
  labelClassName = "",
  errorClassName = "",
  isRequired = false,

  enableMonthYearPicker = true,
  minDate,
  maxDate,
}, ref) => {
  const resolvedVariant = labelPlacement === "outlined" ? "bordered" : variant;

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number | "auto";
    bottom: number | "auto";
    left: number;
    position: "top" | "bottom";
  } | null>(null);

  const updateCoords = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 400; // calendar popover height + margin

    let top: number | "auto" = 0;
    let bottom: number | "auto" = "auto";
    let position: "top" | "bottom" = "bottom";

    if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
      top = "auto";
      bottom = window.innerHeight - rect.top - 16;
      position = "top";
    } else {
      top = rect.bottom + 6;
      bottom = "auto";
      position = "bottom";
    }

    const popoverWidth = CALENDAR_POPOVER_WIDTH;
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) left = 12;

    setDropdownCoords({
      top,
      bottom,
      left,
      position,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen, updateCoords]);

  // Field Name extraction
  const fieldName = field?.name || "";

  // Resolved values
  const parseDate = (val: any): Date | null => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const resolvedValue = value !== undefined ? value : field?.value;

  const startDate = selectsRange
    ? endDateName
      ? parseDate(resolvedValue)
      : Array.isArray(resolvedValue)
        ? parseDate(resolvedValue[0])
        : null
    : parseDate(resolvedValue);

  const endDate = selectsRange
    ? endDateName
      ? parseDate(form?.values?.[endDateName])
      : Array.isArray(resolvedValue)
        ? parseDate(resolvedValue[1])
        : null
    : null;

  const resolvedMinDate = parseDate(minDate);
  const resolvedMaxDate = parseDate(maxDate);

  const hasValue = selectsRange ? !!(startDate && endDate) : !!startDate;
  const displayString = selectsRange
    ? formatDisplayRange(startDate, endDate)
    : formatDateDisplay(startDate);

  const isOutlined = labelPlacement === "outlined";
  const isFloating = labelPlacement === "inside" || labelPlacement === "outside";
  const shouldFloat = isOpen || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);
  const resolvedPlaceholder = placeholder || (isFloating || isOutlined ? "" : "Select Date");

  const sizeConfigs = {
    sm: {
      wrapperPadding: labelPlacement === "inside" && label ? "py-1 px-2.5" : "py-1.5 px-2.5",
      textSize: "text-xs",
      labelSize: "text-[10px]",
      insideHeight: "h-12",
      outsideHeight: "h-10",
      floatY: labelPlacement === "inside" && label ? -20 : -10,
      floatX: labelPlacement === "inside" && label ? -2 : 0,
      initialY: -8,
      initialX: -1,
      floatYOutside: -41,
      floatXOutside: -14,
      floatScale: 0.83,
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
      initialX: 1,
      floatYOutside: -47,
      floatXOutside: -14,
      floatScale: 0.85,
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
      floatX: labelPlacement === "inside" && label ? 4 : 0,
      initialY: -12,
      initialX: 5,
      floatYOutside: -54,
      floatXOutside: -14,
      floatScale: 0.87,
      outlinedFloatY: -41,
      outlinedInitialY: -12,
    },
  };

  const sz = sizeConfigs[size] || sizeConfigs.md;

  // Determine Formik errors / touched state safely
  const formError = fieldName ? getIn(form?.errors, fieldName) : undefined;
  const formTouched = fieldName ? getIn(form?.touched, fieldName) : undefined;

  const startError = formError ? String(formError) : error;
  const startTouched = formTouched ? true : touched;

  const formEndError = endDateName ? getIn(form?.errors, endDateName) : undefined;
  const formEndTouched = endDateName ? getIn(form?.touched, endDateName) : undefined;

  const endError = formEndError ? String(formEndError) : undefined;
  const endTouched = formEndTouched ? true : false;

  // Since it's a range picker, if either field is touched, we treat the whole component as touched.
  const isTouched = selectsRange ? (startTouched || endTouched) : startTouched;

  const fieldError = isTouched ? (startError || endError) : undefined;
  const hasError = !!fieldError;

  // Track if the picker has been opened to set touched when closed
  const wasOpenedRef = useRef(false);
  useEffect(() => {
    if (isOpen) {
      wasOpenedRef.current = true;
    } else if (wasOpenedRef.current) {
      wasOpenedRef.current = false;
      if (form?.setFieldTouched && fieldName) {
        form.setFieldTouched(fieldName, true);
        if (endDateName) {
          form.setFieldTouched(endDateName, true);
        }
      }
    }
  }, [isOpen, fieldName, endDateName, form]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        calendarRef.current &&
        !calendarRef.current.contains(target)
      ) {
        if (isOpen) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Date selection change event
  const handleDateChange = (dates: any) => {
    const isOutOfRange = (date: Date | null) => {
      if (!date) return false;
      const clean = stripTime(date);
      if (resolvedMinDate && clean < stripTime(resolvedMinDate)) return true;
      if (resolvedMaxDate && clean > stripTime(resolvedMaxDate)) return true;
      return false;
    };

    if (selectsRange) {
      const [start, end] = Array.isArray(dates) ? dates : [dates, null];
      const cleanStart = start ? stripTime(start) : null;
      const cleanEnd = end ? stripTime(end) : null;

      if (isOutOfRange(cleanStart) || isOutOfRange(cleanEnd)) return;

      if (endDateName) {
        const formattedStart = cleanStart ? toLocalYYYYMMDD(cleanStart) : null;
        const formattedEnd = cleanEnd ? toLocalYYYYMMDD(cleanEnd) : null;

        if (form?.setValues) {
          form.setValues({
            ...form.values,
            [fieldName]: formattedStart,
            [endDateName]: formattedEnd,
          });
        } else if (form?.setFieldValue && fieldName) {
          form.setFieldValue(fieldName, formattedStart);
          form.setFieldValue(endDateName, formattedEnd);
        }
        onRangeChange?.(cleanStart, cleanEnd);
        if (onChange) onChange([formattedStart, formattedEnd]);

        if (cleanStart && cleanEnd) {
          if (form?.setFieldTouched) {
            form.setFieldTouched(fieldName, true, false);
            form.setFieldTouched(endDateName, true, false);
          }
          setTimeout(() => setIsOpen(false), 80);
        }
      } else {
        const valArr = [
          cleanStart ? toLocalYYYYMMDD(cleanStart) : null,
          cleanEnd ? toLocalYYYYMMDD(cleanEnd) : null,
        ];

        if (form?.setFieldValue && fieldName) {
          form.setFieldValue(fieldName, valArr);
        }
        onRangeChange?.(cleanStart, cleanEnd);
        if (onChange) onChange(valArr);

        if (cleanStart && cleanEnd) {
          if (form?.setFieldTouched && fieldName) {
            form.setFieldTouched(fieldName, true, false);
          }
          setTimeout(() => setIsOpen(false), 80);
        }
      }
    } else {
      const singleDate = Array.isArray(dates) ? dates[0] : dates;
      const cleanDate = singleDate ? stripTime(singleDate) : null;
      if (isOutOfRange(cleanDate)) return;
      const valStr = cleanDate ? toLocalYYYYMMDD(cleanDate) : "";

      if (form?.setFieldValue && fieldName) {
        form.setFieldValue(fieldName, valStr);
        if (form.setFieldTouched) {
          form.setFieldTouched(fieldName, true, false);
        }
      } else if (field?.onChange) {
        const syntheticEvent = {
          target: { name: fieldName, value: valStr },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        field.onChange(syntheticEvent);
      }
      if (onChange) onChange(valStr);

      setTimeout(() => setIsOpen(false), 80);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectsRange) {
      if (endDateName) {
        if (form?.setValues) {
          form.setValues({
            ...form.values,
            [fieldName]: null,
            [endDateName]: null,
          });
          if (form.setFieldTouched) {
            form.setFieldTouched(fieldName, true, false);
            form.setFieldTouched(endDateName, true, false);
          }
        } else if (form?.setFieldValue && fieldName) {
          form.setFieldValue(fieldName, null);
          form.setFieldValue(endDateName, null);
          if (form.setFieldTouched) {
            form.setFieldTouched(fieldName, true, false);
            form.setFieldTouched(endDateName, true, false);
          }
        }
        onRangeChange?.(null, null);
        if (onChange) onChange([null, null]);
      } else {
        if (form?.setFieldValue && fieldName) {
          form.setFieldValue(fieldName, []);
          if (form.setFieldTouched) {
            form.setFieldTouched(fieldName, true, false);
          }
        }
        onRangeChange?.(null, null);
        if (onChange) onChange([]);
      }
    } else {
      if (form?.setFieldValue && fieldName) {
        form.setFieldValue(fieldName, "");
        if (form.setFieldTouched) {
          form.setFieldTouched(fieldName, true, false);
        }
      } else if (field?.onChange) {
        const syntheticEvent = {
          target: { name: fieldName, value: "" },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        field.onChange(syntheticEvent);
      }
      if (onChange) onChange("");
    }
  };

  const variantClass = isOutlined
    ? "bg-transparent border-none"
    : disabled
      ? stripInteractiveFieldClasses(getInputVariantClasses(resolvedVariant, color as FieldColor))
      : getInputVariantClasses(resolvedVariant, color as FieldColor);
  const radiusClass =
    resolvedVariant === "underlined" ? "rounded-none" : getRadiusClass(radius);

  const wrapperBaseClasses = disabled
    ? stripInteractiveFieldClasses(getWrapperBaseClasses({
        wrapperClassName,
        variant: resolvedVariant,
        isOutlined,
        isActive: isOpen,
        hasError,
      }))
    : getWrapperBaseClasses({
        wrapperClassName,
        variant: resolvedVariant,
        isOutlined,
        isActive: isOpen,
        hasError,
      });

  const interactiveBorderClass = getInteractiveBorderClass({
    variant: resolvedVariant,
    isOutlined,
    isActive: isOpen,
    hasError,
    color: color as FieldColor,
  });

  const isOutsideLeft = labelPlacement === "outside-left";

  const renderOutsideLabel = () => {
    if (!label || isFloating || isOutlined) return null;
    return (
      <label
        htmlFor={fieldName}
        className={`${labelClasses} ${isOutsideLeft ? "mb-0 shrink-0" : "mb-2"} ${labelClassName}`}
      >
        <FieldLabelContent label={label} isRequired={isRequired} />
      </label>
    );
  };

  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* CUSTOM HEADER */
  /* -------------------------------------------------------------------------- */

  const renderHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
    changeMonth,
    changeYear,
  }: any) => {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const viewedMonthStart = new Date(currentYear, currentMonth, 1);

    const isPrevMonthDisabled =
      prevMonthButtonDisabled ||
      (!!resolvedMinDate &&
        viewedMonthStart <=
          new Date(resolvedMinDate.getFullYear(), resolvedMinDate.getMonth(), 1));

    const isNextMonthDisabled =
      nextMonthButtonDisabled ||
      (!!resolvedMaxDate &&
        viewedMonthStart >=
          new Date(resolvedMaxDate.getFullYear(), resolvedMaxDate.getMonth(), 1));

    const monthYearLabel = `${date.toLocaleString("en-US", {
      month: "short",
    })} ${currentYear}`;

    return (
      <div className="relative flex flex-col bg-white dark:bg-content1">
        {/* HEADER ROW */}
        <div className="relative flex items-center justify-between w-full px-3 pt-4 pb-3">
          {/* LEFT */}
          <div className="flex items-center justify-center w-9 h-9">
            <AnimatePresence mode="wait">
              {!showMonthYearPicker && (
                <motion.button
                  key="prev-btn"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={() => {
                    if (!isPrevMonthDisabled) decreaseMonth();
                  }}
                  disabled={isPrevMonthDisabled}
                  aria-disabled={isPrevMonthDisabled}
                  className="
                  flex items-center justify-center
                  w-9 h-9
                  rounded-full
                  border border-default-200
                  bg-default-50
                  text-default-600
                  hover:bg-default-100
                  disabled:opacity-40
                  disabled:pointer-events-none
                  disabled:cursor-not-allowed
                  disabled:hover:bg-default-50
                  transition-colors
                "
                >
                  <FaChevronLeft className="w-4 h-4" aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* MONTH YEAR BUTTON */}
          <div className="relative flex-1 flex justify-center">
            {enableMonthYearPicker ? (
              <>
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMonthYearPicker((prev) => !prev);
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 24,
                  }}
                  className={`
                    inline-flex items-center justify-center gap-2
                    px-4 py-2
                    rounded-full border border-default-200
                    transition-all duration-300 ease-out
                    ${showMonthYearPicker
                      ? "bg-default-100 shadow-none"
                      : "bg-default-50 shadow-sm hover:bg-default-100"
                    }
                  `}
                >
                  <motion.span
                    key={monthYearLabel}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 26,
                    }}
                    className={fieldValueClasses}
                  >
                    {monthYearLabel}
                  </motion.span>

                  <motion.div
                    className="w-3.5 h-3.5 flex items-center justify-center"
                    animate={{
                      rotate: showMonthYearPicker ? 180 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 320,
                      damping: 24,
                    }}
                  >
                    <FaChevronDown className="w-3.5 h-3.5" aria-hidden />
                  </motion.div>
                </motion.button>

                {/* DRUM OVERLAY */}
                <AnimatePresence>
                  {showMonthYearPicker && (
                    <motion.div
                      key="drum-overlay"
                      initial={{
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 28,
                      }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "calc(100% + 8px)",
                        x: "-50%",
                        zIndex: 50,
                      }}
                    >
                      <DrumOverlay
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        onMonthChange={(m) => {
                          changeMonth(m);
                        }}
                        onYearChange={(y) => {
                          changeYear(y);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div
                className={`
                  inline-flex items-center justify-center
                  px-4 py-2
                  rounded-full
                  border border-default-200
                  bg-default-50
                `}
              >
                <span className={fieldValueClasses}>{monthYearLabel}</span>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-center w-9 h-9">
            <AnimatePresence mode="wait">
              {!showMonthYearPicker && (
                <motion.button
                  key="next-btn"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={() => {
                    if (!isNextMonthDisabled) increaseMonth();
                  }}
                  disabled={isNextMonthDisabled}
                  aria-disabled={isNextMonthDisabled}
                  className="
                  flex items-center justify-center
                  w-9 h-9
                  rounded-full
                  border border-default-200
                  bg-default-50
                  text-default-600
                  hover:bg-default-100
                  disabled:opacity-40
                  disabled:pointer-events-none
                  disabled:cursor-not-allowed
                  disabled:hover:bg-default-50
                  transition-colors
                "
                >
                  <FaChevronRight className="w-4 h-4" aria-hidden />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const getDayClass = (date: Date) => {
    const stateClasses: string[] = [];
    const cleanDate = stripTime(date);
    const isBeforeMin = resolvedMinDate ? cleanDate < stripTime(resolvedMinDate) : false;
    const isAfterMax = resolvedMaxDate ? cleanDate > stripTime(resolvedMaxDate) : false;

    if (isBeforeMin || isAfterMax) {
      return "drp-day--disabled";
    }

    if (selectsRange) {
      if (startDate && isSameDate(cleanDate, startDate)) stateClasses.push("drp-day--range-start");
      if (endDate && isSameDate(cleanDate, endDate)) stateClasses.push("drp-day--range-end");
      if (startDate && endDate && cleanDate > startDate && cleanDate < endDate) {
        stateClasses.push("drp-day--in-range");
      }

      if (startDate && endDate) {
        const rangeStart = stripTime(startDate);
        const rangeEnd = stripTime(endDate);
        if (cleanDate >= rangeStart && cleanDate <= rangeEnd) {
          const prevDay = new Date(cleanDate);
          prevDay.setDate(prevDay.getDate() - 1);
          const nextDay = new Date(cleanDate);
          nextDay.setDate(nextDay.getDate() + 1);
          const prevInRange = stripTime(prevDay) >= rangeStart && stripTime(prevDay) <= rangeEnd;
          const nextInRange = stripTime(nextDay) >= rangeStart && stripTime(nextDay) <= rangeEnd;

          if (!prevInRange || cleanDate.getDay() === 0) {
            stateClasses.push("drp-day--range-row-start");
          }
          if (!nextInRange || cleanDate.getDay() === 6) {
            stateClasses.push("drp-day--range-row-end");
          }
        }
      }
    } else {
      if (isSameDate(cleanDate, startDate)) stateClasses.push("drp-day--selected-single");
    }
    return [fieldValueClasses, ...stateClasses].join(" ");
  };

  return (
    <div
      className={`w-full flow-root ${containerClassName}`}
      ref={(node) => {
        wrapperRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
    >
      <div
        className={isOutsideLeft ? "flex items-center gap-3 w-full" : "w-full"}
      >
        {renderOutsideLabel()}

        <div
          className={`
            relative flex items-center justify-between w-full transition-all duration-200 ease-in-out select-none box-border ${disabled ? "" : "group"}
            ${variantClass}
            ${radiusClass}
            ${wrapperBaseClasses}
            ${sz.wrapperPadding}
            ${labelPlacement === "inside" ? sz.insideHeight : `${sz.outsideHeight} ${isFloating && label && !isOutlined ? "mt-6" : ""} ${isOutlined && label ? "mt-[10px]" : ""}`}
            ${interactiveBorderClass}
            ${disabled ? inputDisabledWrapperClasses : "cursor-pointer"}
          `}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
        >
          {/* ── Outlined Fieldset Border + Legend Notch ────────────────────── */}
          {isOutlined && (
            <fieldset
              className={`
                absolute inset-0 pointer-events-none transition-all duration-200 m-0 p-0
                ${radiusClass}
                ${hasError
                  ? "border-2 border-red-500 dark:border-red-500"
                  : isOpen
                    ? `border-2 ${focusBorderColors[color] || "border-primary"}`
                    : `border-2 ${disabled
                        ? stripInteractiveFieldClasses(fieldsetBorderColors[color] || "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500")
                        : fieldsetBorderColors[color] || "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500"}`
                }
              `}
            >
              {label && (
                <legend
                  className={`
                    ml-2 font-medium transition-all duration-200 ease-out block whitespace-nowrap overflow-hidden invisible
                    ${shouldFloat || isOpen || hasValue ? "max-w-full px-1" : "max-w-0 px-0"}
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

          {/* Floating Label */}
          {(isFloating || isOutlined) && label && (
            <motion.label
              htmlFor={fieldName}
              initial={false}
              animate={{
                y: shouldFloat || (isOutlined && (isOpen || hasValue))
                  ? isOutlined
                    ? sz.outlinedFloatY
                    : labelPlacement === "inside"
                      ? sz.floatY
                      : sz.floatYOutside
                  : isOutlined
                    ? sz.outlinedInitialY
                    : sz.initialY,
                x: shouldFloat || (isOutlined && (isOpen || hasValue))
                  ? isOutlined
                    ? 0
                    : labelPlacement === "inside"
                      ? sz.floatX
                      : sz.floatXOutside
                  : sz.initialX,
                scale: shouldFloat || (isOutlined && (isOpen || hasValue))
                  ? isOutlined ? 0.75 : sz.floatScale
                  : 1,
              }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className={`
                absolute left-3 top-1/2 z-10 ${labelFloatingClasses} transition-colors duration-200
                ${sz.textSize} ${labelClassName} ${
                  isOpen && color !== "default"
                    ? (focusTextColors[color] || "text-primary")
                    : (shouldFloat || (isOutlined && (isOpen || hasValue)))
                      ? isOpen
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

          {/* Central Stack: Label + Value */}
          <div
            className={`
              flex flex-col flex-1 min-w-0 justify-center
              ${labelPlacement === "inside" && isFloating && shouldFloat ? (size === "sm" ? "mt-3" : size === "lg" ? "mt-5" : "mt-4") : ""}
            `}
          >
            {labelPlacement === "inside" && !isFloating && label && (
              <span
                className={`
                  ${labelFloatingClasses} mb-0.5 text-default-500
                  ${sz.labelSize} ${labelClassName}
                `}
              >
                <FieldLabelContent label={label} isRequired={isRequired} />
              </span>
            )}

            <div
              className={`
                flex-1 min-w-0 truncate pr-2
              `}
            >
              {!displayString ? (
                <span
                  className={`${fieldPlaceholderClasses} truncate select-none`}
                >
                  {((!isFloating || shouldFloat) && resolvedPlaceholder) ? resolvedPlaceholder : "\u200b"}
                </span>
              ) : (
                <span
                  className={`text-neutral-800 dark:text-neutral-200 truncate select-none ${fieldValueClasses}`}
                >
                  {displayString}
                </span>
              )}
            </div>
          </div>

          {/* Action icon: Clear or Calendar */}
          <div className="flex items-center justify-center shrink-0 ml-1">
            {isClearable && hasValue && !disabled ? (
              <ClearIcon onClick={handleClear} />
            ) : (
              <CalendarIcon
                disabled={disabled}
                colorClass={isOpen && color !== "default" ? (focusTextColors[color] || "text-primary") : ""}
              />
            )}
          </div>

          {/* Dropdown Calendar Portal Wrapper */}
          {createPortal(
            isOpen && !disabled && dropdownCoords ? (
              <motion.div
                ref={calendarRef}
                initial={{
                  opacity: 0,
                  y: dropdownCoords.position === "bottom" ? -10 : 10,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                }}
                className={`fixed z-[99999] bg-background border border-default-200 rounded-xl shadow-xl overflow-hidden drp-calendar-wrapper--${color}`}
                style={{
                  width: CALENDAR_POPOVER_WIDTH,
                  height: CALENDAR_POPOVER_HEIGHT,
                  top: dropdownCoords.top,
                  bottom: dropdownCoords.bottom,
                  left: dropdownCoords.left,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Suspense fallback={null}>
                  <LazyDatePicker
                    {...({
                      selected: startDate,
                      onChange: handleDateChange,
                      startDate: startDate,
                      endDate: endDate,
                      selectsRange: selectsRange,
                      minDate: resolvedMinDate || undefined,
                      maxDate: resolvedMaxDate || undefined,
                      shouldCloseOnSelect: false,
                      inline: true,
                      calendarClassName:
                        "drp-calendar !border-none !rounded-xl !shadow-none",
                      dayClassName: getDayClass,
                      renderCustomHeader: renderHeader,
                      fixedHeight: true,
                    } as any)}
                  />
                </Suspense>
              </motion.div>
            ) : null,
            document.body
          )}

          {/* Underline Animation for Underlined Variant */}
          {resolvedVariant === "underlined" && (
            <motion.div
              className={`absolute bottom-0 left-0 right-0 h-[2px] z-20 ${hasError ? "bg-danger" : (underlineColors[color] || "bg-primary")}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isOpen ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ originX: 0.5 }}
            />
          )}
        </div>
      </div>

      {/* Error Message */}
      {hasError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={`${errorClasses} ${errorClassName}`}
        >
          {fieldError}
        </motion.p>
      )}
    </div>
  );
});

DateInput.displayName = "DateInput";

export default DateInput;

/* -------------------------------------------------------------------------- */
/*                           DrumOverlay Component                            */
/* -------------------------------------------------------------------------- */

/**
 * DrumOverlay
 * Renders two side-by-side iOS-style drum columns (month | year).
 * - Fixed selection band sits at the vertical centre (pointer-events: none)
 * - Month and year lists scroll independently behind it
 * - Fade masks at top/bottom created via CSS (see index.css .drp-drum-*)
 */
interface DrumOverlayProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

/* -------------------------------------------------------------------------- */
/* DRUM OVERLAY */
/* -------------------------------------------------------------------------- */

const DrumOverlay: React.FC<DrumOverlayProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
  onYearChange,
}) => {
  const {
    containerRef: monthRef,
    handleScroll: handleMonthScroll,
    handleWheel: handleMonthWheel,
    handleItemClick: handleMonthClick,
    scrollY: monthScrollY,
    PADDING,
  } = useDrumPicker(monthOptions, currentMonth, onMonthChange);

  const {
    containerRef: yearRef,
    handleScroll: handleYearScroll,
    handleWheel: handleYearWheel,
    handleItemClick: handleYearClick,
    scrollY: yearScrollY,
  } = useDrumPicker(yearOptions, currentYear, onYearChange);

  return (
    <div
      className="
        relative
        overflow-hidden
        bg-default-100
        border-0
        shadow-none
      "
      style={{
        width: CALENDAR_POPOVER_WIDTH,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ACTIVE CENTER BAND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-2 right-2"
        style={{
          top: "50%",
          height: ITEM_HEIGHT - 4,
          transform: "translateY(-50%)",
          zIndex: 0,
          borderRadius: "var(--radius)",

          background: "color-mix(in srgb, var(--color-background) 85%, transparent)",
          backdropFilter: "blur(10px)",
          border: "1px solid color-mix(in srgb, var(--color-background) 75%, transparent)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      />

      {/* DRUMS */}
      <div
        className="flex"
        style={{
          height: DRUM_HEIGHT,
        }}
      >
        {/* MONTH */}
        <DrumColumn
          items={monthOptions}
          selectedValue={currentMonth}
          containerRef={monthRef}
          onScroll={handleMonthScroll}
          onWheel={handleMonthWheel}
          onItemClick={handleMonthClick}
          scrollY={monthScrollY}
          padding={PADDING}
          align="center"
        />

        {/* YEAR */}
        <DrumColumn
          items={yearOptions}
          selectedValue={currentYear}
          containerRef={yearRef}
          onScroll={handleYearScroll}
          onWheel={handleYearWheel}
          onItemClick={handleYearClick}
          scrollY={yearScrollY}
          padding={PADDING}
          align="center"
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           DrumColumn Component                             */
/* -------------------------------------------------------------------------- */

interface DrumColumnProps {
  items: { value: number; label: string }[];
  selectedValue: number;
  containerRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  onWheel: (e: WheelEvent) => void;
  onItemClick: (idx: number) => void;
  scrollY: ReturnType<typeof useMotionValue<number>>;
  padding: number;
  align: "left" | "center" | "right";
}

const DrumColumn: React.FC<DrumColumnProps> = ({
  items,
  selectedValue,
  containerRef,
  onScroll,
  onWheel,
  onItemClick,
  scrollY,
  padding,
  align,
}) => {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [containerRef, onWheel]);

  return (
    /* Outer wrapper: clips content + applies fade mask via CSS class */
    <div className="relative flex-1 overflow-hidden drp-drum-fade">
      {/* Scrollable list — CSS scroll-snap for trackpad; wheel handler for mouse */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="drp-drum-scroll h-full overflow-y-scroll"
      >
        {/* Top padding spacer so first item can reach centre */}
        <div style={{ height: padding, flexShrink: 0 }} />

        {items.map((item, idx) => {
          /**
           * Per-item animated transforms driven by scrollY MotionValue.
           * scrollY tracks live scrollTop, so these update on every scroll frame.
           *
           * itemCenter  = exact scrollTop where this item is centred
           * offset      = distance of item from the current centre (in px)
           * We map |offset| → opacity and scale so items physically recede.
           */
          const itemCenter = idx * ITEM_HEIGHT;

          // useTransform requires a MotionValue — derive opacity + scale live
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const opacity = useTransform(
            scrollY,
            [
              itemCenter - ITEM_HEIGHT * 3,
              itemCenter - ITEM_HEIGHT,
              itemCenter,
              itemCenter + ITEM_HEIGHT,
              itemCenter + ITEM_HEIGHT * 3,
            ],
            [0.25, 0.55, 1, 0.55, 0.25],
          );
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scale = useTransform(
            scrollY,
            [
              itemCenter - ITEM_HEIGHT * 2,
              itemCenter,
              itemCenter + ITEM_HEIGHT * 2,
            ],
            [0.88, 1, 0.88],
          );

          const isSelected = item.value === selectedValue;

          return (
            <motion.div
              key={item.value}
              onClick={() => onItemClick(idx)}
              style={{
                height: ITEM_HEIGHT,
                opacity,
                scale,
              }}
              className={`
                drp-drum-item relative z-10 flex items-center cursor-pointer px-4
                ${align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center"}
                ${fieldValueClasses}
                ${isSelected ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-700 dark:text-neutral-200"}
              `}
            >
              {item.label}
            </motion.div>
          );
        })}

        {/* Bottom padding spacer so last item can reach centre */}
        <div style={{ height: padding, flexShrink: 0 }} />
      </div>
    </div>
  );
};
