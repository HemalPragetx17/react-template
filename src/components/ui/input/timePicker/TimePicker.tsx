import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
} from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import Button from "../../button/Button";
import "./index.css";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type PickerVariant = "flat" | "bordered" | "underlined" | "faded";
type PickerSize = "sm" | "md" | "lg";
type PickerRadius = "none" | "sm" | "md" | "lg" | "full";
type PickerColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";
type PickerLabelPlacement = "inside" | "outside" | "outside-left" | "outside-top" | "outlined";

export interface TimePickerProps {
  label?: string;
  placeholder?: string;
  isClearable?: boolean;
  disabled?: boolean;

  // Custom static props if not using Formik
  value?: string; // e.g., "03:30 PM"
  onChange?: (time: string) => void;

  error?: string;
  touched?: boolean;

  // Design Tokens
  variant?: PickerVariant;
  size?: PickerSize;
  radius?: PickerRadius;
  color?: PickerColor;
  labelPlacement?: PickerLabelPlacement;

  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;

  // Pick Mode: "normal" (scroll columns) | "clock" (dial face)
  mode?: "normal" | "clock";

  // Formik integration
  field?: FieldInputProps<any>;
  form?: {
    values: any;
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    setFieldValue?: (field: string, value: any, shouldValidate?: boolean) => void;
    setFieldTouched?: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void;
  };
}

/* -------------------------------------------------------------------------- */
/*                              Tokens & Helpers                              */
/* -------------------------------------------------------------------------- */

const radiusMap: Record<PickerRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const parseTime = (timeStr?: string) => {
  if (!timeStr) {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    return { hour: hours, minute: minutes, ampm };
  }

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    return {
      hour: parseInt(match[1], 10),
      minute: parseInt(match[2], 10),
      ampm: match[3].toUpperCase(),
    };
  }

  return { hour: 12, minute: 0, ampm: "AM" };
};

// Color mapper for design tokens (specifically stroke, fill, and text colors)
const colorMap: Record<
  PickerColor,
  {
    stroke: string;
    fill: string;
    bg: string;
    text: string;
    darkText: string;
    border: string;
    outlineBorder: string;
  }
> = {
  default: {
    stroke: "#a3a3a3",
    fill: "#a3a3a3",
    bg: "bg-neutral-500",
    text: "text-neutral-500",
    darkText: "text-neutral-400",
    border: "!border-neutral-500",
    outlineBorder: "border-neutral-500",
  },
  primary: {
    stroke: "#3b82f6",
    fill: "#3b82f6",
    bg: "bg-primary",
    text: "text-primary",
    darkText: "text-primary",
    border: "!border-primary",
    outlineBorder: "border-primary",
  },
  secondary: {
    stroke: "var(--time-picker-secondary-stroke)",
    fill: "var(--time-picker-secondary-stroke)",
    bg: "bg-secondary",
    text: "text-secondary-700 dark:text-secondary",
    darkText: "text-secondary",
    border: "!border-secondary-700 dark:!border-secondary",
    outlineBorder: "border-secondary-700 dark:border-secondary",
  },
  success: {
    stroke: "#10b981",
    fill: "#10b981",
    bg: "bg-success",
    text: "text-success",
    darkText: "text-success",
    border: "!border-success",
    outlineBorder: "border-success",
  },
  warning: {
    stroke: "#f59e0b",
    fill: "#f59e0b",
    bg: "bg-warning",
    text: "text-warning",
    darkText: "text-warning",
    border: "!border-warning",
    outlineBorder: "border-warning",
  },
  danger: {
    stroke: "#ef4444",
    fill: "#ef4444",
    bg: "bg-danger",
    text: "text-danger",
    darkText: "text-danger",
    border: "!border-danger",
    outlineBorder: "border-danger",
  },
};

/* -------------------------------------------------------------------------- */
/*                               Clock Hand / Dial Math                       */
/* -------------------------------------------------------------------------- */

const CENTER_X = 110;
const CENTER_Y = 110;
const DIAL_RADIUS = 82;

const HOURS_LIST = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES_LIST = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const DRUM_HOURS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: String(i + 1).padStart(2, "0"),
}));

const DRUM_MINUTES = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, "0"),
}));

const DRUM_AMPM = [
  { value: 0, label: "AM" },
  { value: 1, label: "PM" },
];

// Calculate coordinates for numbers around dial
const getNumberCoords = (index: number, radius = DIAL_RADIUS) => {
  const angleDeg = index * 30 - 90; // 30 degrees step, starting from top (270 deg)
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(angleRad),
    y: CENTER_Y + radius * Math.sin(angleRad),
  };
};

/* -------------------------------------------------------------------------- */
/*                           Drum Column Helper Component                     */
/* -------------------------------------------------------------------------- */

interface DrumColumnProps {
  items: { value: number; label: string }[];
  value: number;
  onChange: (val: number) => void;
  color: PickerColor;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

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

const DrumColumn: React.FC<DrumColumnProps> = ({ items, value, onChange, color }) => {
  const {
    containerRef,
    handleScroll,
    handleWheel,
    handleItemClick,
    scrollY,
    PADDING,
  } = useDrumPicker(items, value, onChange);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [containerRef, handleWheel]);

  const colorClassMap: Record<PickerColor, string> = {
    default: "time-picker-chip-default",
    primary: "time-picker-chip-primary",
    secondary: "time-picker-chip-secondary",
    success: "time-picker-chip-success",
    warning: "time-picker-chip-warning",
    danger: "time-picker-chip-danger",
  };

  return (
    <div className="relative flex-1 h-[200px] overflow-hidden select-none drp-drum-fade">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll drp-drum-scroll"
      >
        <div style={{ height: PADDING, flexShrink: 0 }} />

        {items.map((item, idx) => {
          const itemCenter = idx * ITEM_HEIGHT;

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const opacity = useTransform(
            scrollY,
            [
              itemCenter - ITEM_HEIGHT * 2,
              itemCenter - ITEM_HEIGHT,
              itemCenter,
              itemCenter + ITEM_HEIGHT,
              itemCenter + ITEM_HEIGHT * 2,
            ],
            [0.45, 0.75, 1, 0.75, 0.45]
          );

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scale = useTransform(
            scrollY,
            [
              itemCenter - ITEM_HEIGHT * 2,
              itemCenter - ITEM_HEIGHT,
              itemCenter,
              itemCenter + ITEM_HEIGHT,
              itemCenter + ITEM_HEIGHT * 2,
            ],
            [0.92, 0.96, 1, 0.96, 0.92]
          );

          const isSelected = item.value === value;

          return (
            <motion.div
              key={item.value}
              onClick={() => handleItemClick(idx)}
              style={{
                height: ITEM_HEIGHT,
                opacity,
                scale,
              }}
              className="drp-drum-item flex items-center justify-center cursor-pointer"
            >
              <span
                className={`flex items-center justify-center w-[54px] h-[32px] text-sm rounded-lg transition-all ${isSelected
                  ? colorClassMap[color]
                  : "text-neutral-500 dark:text-neutral-400 font-medium hover:text-neutral-700 dark:hover:text-neutral-200"
                  }`}
              >
                {item.label}
              </span>
            </motion.div>
          );
        })}

        <div style={{ height: PADDING, flexShrink: 0 }} />
      </div>
    </div>
  );
};

const applyImportant = (classes: string) => {
  return classes
    .split(" ")
    .map((cls) => {
      if (cls.includes(":")) {
        const parts = cls.split(":");
        const last = parts.pop();
        return [...parts, `!${last}`].join(":");
      }
      return `!${cls}`;
    })
    .join(" ");
};

/* -------------------------------------------------------------------------- */
/*                            TimePicker Component                            */
/* -------------------------------------------------------------------------- */

const TimePicker: React.FC<TimePickerProps> = ({
  field,
  form,
  label,
  placeholder,
  isClearable = false,
  disabled = false,
  value,
  onChange,
  error,
  touched,

  variant = "bordered",
  size = "md",
  radius = "md",
  color = "primary",
  labelPlacement = "outside",

  containerClassName = "",
  labelClassName = "",
  errorClassName = "",

  mode,
}) => {
  const resolvedVariant = labelPlacement === "outlined" ? "bordered" : variant;

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
    secondary: "text-secondary-700 dark:text-secondary",
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
    secondary: "border-secondary-700 dark:border-secondary",
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

  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number | "auto";
    bottom: number | "auto";
    left: number;
    position: "top" | "bottom";
  } | null>(null);

  // Parse current value
  const fieldName = field?.name || "";
  const rawValue = value !== undefined ? value : field?.value;
  const displayString = rawValue || "";

  // Dialog values
  const [tempHour, setTempHour] = useState(12);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempAmpm, setTempAmpm] = useState("AM");
  const [viewMode, setViewMode] = useState<"hours" | "minutes">("hours");

  // Sync temp state with value when opening
  useEffect(() => {
    if (isOpen) {
      const parsed = parseTime(rawValue);
      setTempHour(parsed.hour);
      setTempMinute(parsed.minute);
      setTempAmpm(parsed.ampm);
      setViewMode("hours");
    }
  }, [isOpen, rawValue]);

  // Determine if mobile layout should be active
  const checkMobileLayout = useCallback(() => {
    setIsMobileMode(window.innerWidth < 768);
  }, []);

  // Determine pick mode ("normal" scroll column vs "clock" dial)
  const resolvedMode = mode || (isMobileMode ? "clock" : "normal");

  const dialogHeight = resolvedMode === "normal" ? 264 : 415;
  const dialogWidth = resolvedMode === "normal" ? 260 : 290;

  const updateCoords = useCallback(() => {
    if (!wrapperRef.current || isMobileMode) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = dialogHeight + 10;

    let top: number | "auto" = 0;
    let bottom: number | "auto" = "auto";
    let position: "top" | "bottom" = "bottom";

    if (spaceBelow < dropdownHeight && rect.top > spaceBelow) {
      top = "auto";
      bottom = window.innerHeight - rect.top - 12;
      position = "top";
    } else {
      top = rect.bottom + 6;
      bottom = "auto";
      position = "bottom";
    }

    let left = rect.left;
    if (left + dialogWidth > window.innerWidth) {
      left = window.innerWidth - dialogWidth - 12;
    }
    if (left < 12) left = 12;

    setDropdownCoords({
      top,
      bottom,
      left,
      position,
    });
  }, [isMobileMode, dialogHeight, dialogWidth]);

  useEffect(() => {
    checkMobileLayout();
    window.addEventListener("resize", checkMobileLayout);
    return () => window.removeEventListener("resize", checkMobileLayout);
  }, [checkMobileLayout]);

  useEffect(() => {
    if (isOpen && !isMobileMode) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen, isMobileMode, updateCoords]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        if (isOpen && !isMobileMode) {
          setIsOpen(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobileMode]);

  // Set field touched on close
  const wasOpenedRef = useRef(false);
  useEffect(() => {
    if (isOpen) {
      wasOpenedRef.current = true;
    } else if (wasOpenedRef.current) {
      if (form?.setFieldTouched && fieldName) {
        form.setFieldTouched(fieldName, true);
      }
    }
  }, [isOpen, fieldName, form]);

  const handleSave = () => {
    const formatted = `${String(tempHour).padStart(2, "0")}:${String(tempMinute).padStart(2, "0")} ${tempAmpm}`;
    if (form?.setFieldValue && fieldName) {
      form.setFieldValue(fieldName, formatted);
    } else if (onChange) {
      onChange(formatted);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (form?.setFieldValue && fieldName) {
      form.setFieldValue(fieldName, "");
    } else if (onChange) {
      onChange("");
    }
  };

  // UI calculations
  const hasValue = !!displayString;
  const isOutlined = labelPlacement === "outlined";
  const isFloating = labelPlacement === "inside" || labelPlacement === "outside";
  const shouldFloat = isOpen || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);
  const resolvedPlaceholder = placeholder || (isFloating || isOutlined ? "" : "Select Time");

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

  const startError = fieldName && form?.errors?.[fieldName] ? String(form.errors[fieldName]) : error;
  const startTouched = fieldName && form?.touched?.[fieldName] ? true : touched;
  const hasError = !!(startTouched && startError);

  const variantClass = isOutlined
    ? "bg-transparent border-none"
    : resolvedVariant === "flat"
      ? `border-2 border-transparent ${flatColorClasses[color] || flatColorClasses.default}`
      : resolvedVariant === "bordered"
        ? `border-2 ${borderedColorClasses[color] || borderedColorClasses.default}`
        : resolvedVariant === "underlined"
          ? `border-b rounded-none relative ${underlinedColorClasses[color] || underlinedColorClasses.default}`
          : `border-2 ${fadedColorClasses[color] || fadedColorClasses.default}`;
  const radiusClass = resolvedVariant === "underlined" ? "rounded-none" : radiusMap[radius];
  const isOutsideLeft = labelPlacement === "outside-left";

  // Clock Dial logic
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      if (!dialRef.current) return;
      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const clickX = clientX - rect.left - centerX;
      const clickY = clientY - rect.top - centerY;

      let angleRad = Math.atan2(clickY, clickX);
      let angleDeg = (angleRad * 180) / Math.PI;
      let angleFromTop = angleDeg + 90;
      if (angleFromTop < 0) angleFromTop += 360;

      if (viewMode === "hours") {
        let hour = Math.round(angleFromTop / 30);
        if (hour === 0) hour = 12;
        if (hour > 12) hour = 12;
        setTempHour(hour);
      } else {
        let minute = Math.round(angleFromTop / 6);
        if (minute === 60) minute = 0;
        if (minute > 59) minute = 59;
        setTempMinute(minute);
      }
    },
    [viewMode]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleInteraction(e.clientX, e.clientY);
    setIsDragging(true);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches[0]) {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleInteraction(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Auto-advance to minutes view after choosing hours
      if (viewMode === "hours") {
        setTimeout(() => {
          setViewMode("minutes");
        }, 300);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleInteraction, viewMode]);

  // Hand math (Calculated exactly relative to dial CENTER_X/CENTER_Y)
  const handAngle = viewMode === "hours" ? tempHour * 30 - 90 : tempMinute * 6 - 90;
  const handRad = (handAngle * Math.PI) / 180;
  const handX = CENTER_X + DIAL_RADIUS * Math.cos(handRad);
  const handY = CENTER_Y + DIAL_RADIUS * Math.sin(handRad);
  const isMultipleOfFive = viewMode === "minutes" ? tempMinute % 5 === 0 : true;

  // Active stroke details
  const activeColor = colorMap[color] || colorMap.primary;

  const renderOutsideLabel = () => {
    if (!label || isFloating || isOutlined) return null;
    return (
      <label
        htmlFor={fieldName}
        className={`block font-medium select-none transition-colors duration-200 ${isOutsideLeft ? "shrink-0 mb-0" : "mb-1.5"
          } ${sz.labelSize} ${labelClassName} ${
            isOpen && color !== "default"
              ? (focusTextColors[color] || "text-primary")
              : isOpen
                ? "text-neutral-800 dark:text-neutral-200"
                : "text-neutral-700 dark:text-neutral-300"
          }`}
      >
        {label}
      </label>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                            Dial / Clock Picker UI                          */
  /* -------------------------------------------------------------------------- */
  const renderClockPicker = () => {
    return (
      <div
        className="flex flex-col bg-white dark:bg-content1 select-none font-sans border border-neutral-100 dark:border-neutral-800 shadow-xl rounded-2xl overflow-hidden"
        style={{ width: 290, height: 415 }}
      >
        {/* Header Display (Light-First colors) */}
        <div className="flex flex-col px-6 py-4 bg-neutral-50 dark:bg-neutral-950 shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold tracking-wider uppercase mb-1">
            Select Time
          </span>
          <div className="flex items-center justify-start gap-4 mt-1">
            {/* Time numbers */}
            <div className="flex items-center">
              <span
                onClick={() => setViewMode("hours")}
                className={`text-[46px] leading-none font-semibold cursor-pointer transition-colors ${viewMode === "hours"
                  ? `${activeColor.text} dark:${activeColor.darkText}`
                  : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                  }`}
              >
                {String(tempHour).padStart(2, "0")}
              </span>
              <span className="text-[46px] leading-none text-neutral-400 dark:text-neutral-600 mx-1.5 select-none">:</span>
              <span
                onClick={() => setViewMode("minutes")}
                className={`text-[46px] leading-none font-semibold cursor-pointer transition-colors ${viewMode === "minutes"
                  ? `${activeColor.text} dark:${activeColor.darkText}`
                  : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                  }`}
              >
                {String(tempMinute).padStart(2, "0")}
              </span>
            </div>

            {/* AM/PM Toggle */}
            <div className="flex flex-col justify-center select-none text-[13px] leading-tight font-bold border-l border-neutral-200 dark:border-neutral-800 pl-3.5 ml-1.5">
              <span
                onClick={() => setTempAmpm("AM")}
                className={`cursor-pointer py-0.5 transition-colors ${tempAmpm === "AM"
                  ? `${activeColor.text} dark:${activeColor.darkText} font-bold scale-105`
                  : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                  }`}
              >
                AM
              </span>
              <span
                onClick={() => setTempAmpm("PM")}
                className={`cursor-pointer py-0.5 transition-colors ${tempAmpm === "PM"
                  ? `${activeColor.text} dark:${activeColor.darkText} font-bold scale-105`
                  : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                  }`}
              >
                PM
              </span>
            </div>
          </div>
        </div>

        {/* Dial Face */}
        <div className="relative flex-1 flex items-center justify-center p-3 bg-white dark:bg-content1">
          {/* View Toggle Arrows inside dial face */}
          <div className="absolute top-2 right-4 flex items-center gap-1.5 z-10">
            <Button
              color="default"
              size="xs"
              variant="flat"
              radius="full"
              isIconOnly
              disabled={viewMode === "hours"}
              onClick={() => setViewMode("hours")}
            >
              <FaChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              color="default"
              size="xs"
              variant="flat"
              radius="full"
              isIconOnly
              disabled={viewMode === "minutes"}
              onClick={() => setViewMode("minutes")}
            >
              <FaChevronRight className="w-3 h-3" />
            </Button>
          </div>

          {/* Corrected w-[220px] h-[220px] boundary circles */}
          <div
            ref={dialRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            className="relative w-[220px] h-[220px] rounded-full bg-neutral-100 dark:bg-neutral-800 cursor-pointer flex items-center justify-center touch-none select-none"
          >
            {/* Clock ticks / center point */}
            <div
              className="absolute w-1.5 h-1.5 rounded-full z-20 pointer-events-none"
              style={{ backgroundColor: activeColor.stroke }}
            />

            {/* Hand Line & Pointer SVG overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {/* Hand Line */}
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={handX}
                y2={handY}
                stroke={activeColor.stroke}
                strokeWidth="2.2"
              />
              {/* Central small joint pivot */}
              <circle cx={CENTER_X} cy={CENTER_Y} r="4" fill={activeColor.stroke} />

              {/* Hand tip bubble */}
              {isMultipleOfFive ? (
                <circle
                  cx={handX}
                  cy={handY}
                  r="14.5"
                  fill={activeColor.stroke}
                />
              ) : (
                <>
                  <circle
                    cx={handX}
                    cy={handY}
                    r="14.5"
                    fill={activeColor.stroke}
                    fillOpacity="0.3"
                  />
                  <circle
                    cx={handX}
                    cy={handY}
                    r="3"
                    fill={activeColor.stroke}
                  />
                </>
              )}
            </svg>

            {/* Numbers Dial container */}
            <div className="absolute inset-0 pointer-events-none">
              <AnimatePresence mode="wait">
                {viewMode === "hours" ? (
                  <motion.div
                    key="hours-dial"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.16 }}
                    className="absolute inset-0"
                  >
                    {HOURS_LIST.map((hr, idx) => {
                      const coords = getNumberCoords(idx);
                      const isSelected = tempHour === hr;
                      return (
                        <span
                          key={`hr-${hr}`}
                          className={`absolute text-xs font-semibold select-none flex items-center justify-center w-6 h-6 transition-colors duration-100 ${isSelected
                            ? "text-white z-20 font-bold"
                            : "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                            }`}
                          style={{
                            left: `${coords.x}px`,
                            top: `${coords.y}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          {hr}
                        </span>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="minutes-dial"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.16 }}
                    className="absolute inset-0"
                  >
                    {MINUTES_LIST.map((min, idx) => {
                      const coords = getNumberCoords(idx);
                      const isSelected = tempMinute === parseInt(min, 10);
                      return (
                        <span
                          key={`min-${min}`}
                          className={`absolute text-[11px] font-semibold select-none flex items-center justify-center w-6 h-6 transition-colors duration-100 ${isSelected
                            ? "text-white z-20 font-bold"
                            : "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                            }`}
                          style={{
                            left: `${coords.x}px`,
                            top: `${coords.y}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          {min}
                        </span>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-4 pt-2.5 pb-3.5 bg-neutral-50 dark:bg-neutral-950 shrink-0 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            variant="flat"
            color="danger"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            size="sm"
            onClick={handleSave}
          >
            OK
          </Button>
        </div>
      </div>
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                            Normal / List Picker UI                         */
  /* -------------------------------------------------------------------------- */
  const renderNormalPicker = () => {
    return (
      <div
        className="flex flex-col bg-white dark:bg-content1 select-none font-sans border border-neutral-100 dark:border-neutral-800 shadow-xl rounded-xl overflow-hidden"
        style={{ width: 260, height: 264 }}
      >
        {/* Core Drum Selector Columns */}
        <div className="relative h-[200px] shrink-0 flex justify-center bg-white dark:bg-content1 px-3 py-0">
          {/* Centered Pointer block overlay across all columns */}
          <div className="pointer-events-none absolute left-3 right-3 h-[36px] top-[82px] border-y border-neutral-200 dark:border-neutral-800" />

          {/* Hours Column */}
          <DrumColumn items={DRUM_HOURS} value={tempHour} onChange={setTempHour} color={color} />
          {/* Divider */}
          <div className="w-[1px] h-full bg-neutral-100 dark:bg-neutral-800 shrink-0 pointer-events-none" />
          {/* Minutes Column */}
          <DrumColumn items={DRUM_MINUTES} value={tempMinute} onChange={setTempMinute} color={color} />
          {/* Divider */}
          <div className="w-[1px] h-full bg-neutral-100 dark:bg-neutral-800 shrink-0 pointer-events-none" />
          {/* AM/PM Column */}
          <DrumColumn
            items={DRUM_AMPM}
            value={tempAmpm === "AM" ? 0 : 1}
            onChange={(val) => setTempAmpm(val === 0 ? "AM" : "PM")}
            color={color}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-4 pt-2.5 pb-3.5 bg-neutral-50 dark:bg-neutral-950 shrink-0 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            variant="flat"
            color="danger"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            size="sm"
            onClick={handleSave}
          >
            OK
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full flow-root ${containerClassName}`} ref={wrapperRef}>
      <div className={isOutsideLeft ? "flex items-center gap-3 w-full" : "w-full"}>
        {renderOutsideLabel()}

        <div
          className={`
            relative flex items-center justify-between w-full transition-all duration-200 ease-in-out select-none box-border group
            ${variantClass}
            ${radiusClass}
            ${sz.wrapperPadding}
            ${labelPlacement === "inside"
              ? sz.insideHeight
              : `${sz.outsideHeight} ${isFloating && label && !isOutlined ? "mt-6" : ""} ${isOutlined && label ? "mt-[10px]" : ""}`
            }
            ${hasError && !isOutlined ? "!border-danger" : ""}
            ${isOpen && !hasError && !isOutlined
              ? resolvedVariant === "bordered" || resolvedVariant === "faded"
                ? applyImportant(focusBorderColors[color] || "border-primary")
                : ""
              : ""
            }
            ${disabled ? "opacity-50 cursor-default" : "cursor-pointer"}
          `}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
        >
          {/* Outlined Fieldset Border + Legend Notch */}
          {isOutlined && (
            <fieldset
              className={`
                absolute inset-0 pointer-events-none transition-all duration-200 m-0 p-0
                ${radiusClass}
                ${hasError
                  ? "border-2 border-red-500 dark:border-red-500"
                  : isOpen
                    ? `border-2 ${focusBorderColors[color] || "border-primary"}`
                    : `border-2 ${fieldsetBorderColors[color] || "border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-500"}`
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
                  <span>{label}</span>
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
                y:
                  shouldFloat || (isOutlined && (isOpen || hasValue))
                    ? isOutlined
                      ? sz.outlinedFloatY
                      : labelPlacement === "inside"
                        ? sz.floatY
                        : sz.floatYOutside
                    : isOutlined
                      ? sz.outlinedInitialY
                      : sz.initialY,
                x:
                  shouldFloat || (isOutlined && (isOpen || hasValue))
                    ? isOutlined
                      ? 0
                      : labelPlacement === "inside"
                        ? sz.floatX
                        : sz.floatXOutside
                    : sz.initialX,
                scale:
                  shouldFloat || (isOutlined && (isOpen || hasValue))
                    ? isOutlined
                      ? 0.75
                      : sz.floatScale
                    : 1,
              }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className={`
                absolute left-3 top-1/2 z-10 font-medium pointer-events-none origin-left transition-colors duration-200
                ${sz.textSize} ${labelClassName} ${
                  isOpen && color !== "default"
                    ? (focusTextColors[color] || "text-primary")
                    : shouldFloat || (isOutlined && (isOpen || hasValue))
                      ? isOpen
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
                  block font-medium select-none mb-0.5 text-default-500
                  ${sz.labelSize} ${labelClassName}
                `}
              >
                {label}
              </span>
            )}

            <div className="flex-1 min-w-0 truncate pr-2">
              {!displayString ? (
                <span className={`text-neutral-400 truncate select-none ${sz.textSize}`}>
                  {(!isFloating || shouldFloat) && resolvedPlaceholder ? resolvedPlaceholder : "\u200b"}
                </span>
              ) : (
                <span className={`text-neutral-800 dark:text-neutral-100 truncate select-none ${sz.textSize}`}>
                  {displayString}
                </span>
              )}
            </div>
          </div>

          {/* Action icon: Clear or Clock */}
          <div className="flex items-center justify-center shrink-0 ml-1">
            {isClearable && hasValue && !disabled ? (
              <Button
                color="default"
                size="xs"
                variant="flat"
                radius="full"
                isIconOnly
                tabIndex={-1}
                onClick={handleClear}
              >
                <FaXmark className="w-3.5 h-3.5" aria-hidden />
              </Button>
            ) : (
              <FaClock className={`w-4 h-4 transition-colors ${isOpen && color !== "default" ? (focusTextColors[color] || "text-primary") : "text-neutral-600 dark:text-neutral-350 group-hover:text-neutral-800 dark:group-hover:text-neutral-100"}`} />
            )}
          </div>

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

      {/* Popover / Modal rendering */}
      {!disabled &&
        createPortal(
          <AnimatePresence>
            {isOpen &&
              (isMobileMode ? (
                /* Mobile Modal */
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
                  {/* Backdrop Click */}
                  <div className="absolute inset-0" onClick={handleCancel} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.93, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.93, y: 15 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="relative overflow-hidden rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 z-10"
                  >
                    {resolvedMode === "normal" ? renderNormalPicker() : renderClockPicker()}
                  </motion.div>
                </div>
              ) : (
                /* Desktop Popover */
                dropdownCoords && (
                  <motion.div
                    ref={popoverRef}
                    initial={{
                      opacity: 0,
                      y: dropdownCoords.position === "bottom" ? -10 : 10,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: dropdownCoords.position === "bottom" ? -10 : 10,
                      scale: 0.96,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 28,
                    }}
                    className="fixed z-[99999] bg-white dark:bg-content1 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                      width: dialogWidth,
                      height: dialogHeight,
                      top: dropdownCoords.top,
                      bottom: dropdownCoords.bottom,
                      left: dropdownCoords.left,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {resolvedMode === "normal" ? renderNormalPicker() : renderClockPicker()}
                  </motion.div>
                )
              ))}
          </AnimatePresence>,
          document.body
        )}

      {/* Error Message */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`mt-1.5 text-sm text-red-500 ${errorClassName}`}
          >
            {startError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

TimePicker.displayName = "TimePicker";

export default TimePicker;
