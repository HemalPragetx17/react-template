import type { FieldInputProps, FormikErrors, FormikTouched } from "formik";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { errorClasses, fieldPlaceholderClasses, fieldValueClasses, getInteractiveBorderClass, getWrapperBaseClasses, labelClasses, labelFloatingClasses, type FieldColor } from "../../shared/fieldStyles";
import { FieldLabelContent } from "../../shared/FieldLabelContent";
import "../timePicker/index.css";

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
type PickerLabelPlacement =
  | "inside"
  | "outside"
  | "outside-left"
  | "outside-top"
  | "outlined";

export interface DateTimePickerProps {
  label?: string;
  placeholder?: string;
  isClearable?: boolean;
  disabled?: boolean;

  value?: Date | string | null;
  onChange?: (value: Date | null) => void;

  error?: string;
  touched?: boolean;

  variant?: PickerVariant;
  size?: PickerSize;
  radius?: Radius;
  color?: PickerColor;
  labelPlacement?: PickerLabelPlacement;
  /** "normal" = drum scroll (default) | "clock" = analog clock dial */
  timeMode?: "normal" | "clock";

  containerClassName?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  isRequired?: boolean;

  // Formik
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
/*                               Tokens & Helpers                             */
/* -------------------------------------------------------------------------- */

const colorMap: Record<
  PickerColor,
  { text: string; border: string; bg: string; chip: string; stroke: string }
> = {
  default: {
    text: "text-neutral-500",
    border: "!border-neutral-500",
    bg: "bg-neutral-500",
    chip: "time-picker-chip-default",
    stroke: "#a3a3a3",
  },
  primary: {
    text: "text-primary",
    border: "!border-primary",
    bg: "bg-primary",
    chip: "time-picker-chip-primary",
    stroke: "#3b82f6",
  },
  secondary: {
    text: "text-secondary-700 dark:text-secondary",
    border: "!border-secondary-700 dark:!border-secondary",
    bg: "bg-secondary",
    chip: "time-picker-chip-secondary",
    stroke: "#8b5cf6",
  },
  success: {
    text: "text-success",
    border: "!border-success",
    bg: "bg-success",
    chip: "time-picker-chip-success",
    stroke: "#10b981",
  },
  warning: {
    text: "text-warning",
    border: "!border-warning",
    bg: "bg-warning",
    chip: "time-picker-chip-warning",
    stroke: "#f59e0b",
  },
  danger: {
    text: "text-danger",
    border: "!border-danger",
    bg: "bg-danger",
    chip: "time-picker-chip-danger",
    stroke: "#ef4444",
  },
};

/* -------------------------------------------------------------------------- */
/*                              Date / Time Helpers                           */
/* -------------------------------------------------------------------------- */

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: MONTHS_SHORT[i],
}));

const yearOptions = Array.from({ length: 60 }, (_, i) => {
  const y = new Date().getFullYear() - 40 + i;
  return { value: y, label: String(y) };
});

const formatDisplay = (date: Date | null): string => {
  if (!date) return "";
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hh = String(hours).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} ${hh}:${minutes} ${ampm}`;
};

const parseInput = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/* -------------------------------------------------------------------------- */
/*                           iOS Drum-Roll Hook                               */
/* -------------------------------------------------------------------------- */

const ITEM_H = 44;   // height of each drum item (px)
const VISIBLE = 5;   // number of visible drum rows

/**
 * useDrumPicker
 * - Trackpad: native scroll + CSS scroll-snap
 * - Mouse wheel: exactly one item per notch (passive:false wheel handler)
 * - Scroll-end: instant snap (no spring); spring reserved for click only
 */
function useDrumPicker<T extends { value: number; label: string }>(
  items: T[],
  currentValue: number,
  onChange: (value: number) => void
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticRef = useRef(false);
  const lastEmittedRef = useRef<number | null>(null);
  const scrollY = useMotionValue(0);
  const PADDING = ((VISIBLE - 1) / 2) * ITEM_H;

  const indexToScrollTop = useCallback((idx: number) => idx * ITEM_H, []);
  const scrollTopToIndex = useCallback(
    (scrollTop: number) => Math.round(scrollTop / ITEM_H),
    []
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
    [indexToScrollTop, scrollY, items.length]
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
        onUpdate: (v) => { if (el) el.scrollTop = v; },
        onComplete: () => { programmaticRef.current = false; },
      });
    },
    [indexToScrollTop, scrollY]
  );

  const emitChange = useCallback(
    (idx: number) => {
      const item = items[idx];
      if (!item || item.value === currentValue) return;
      lastEmittedRef.current = item.value;
      onChange(item.value);
    },
    [items, currentValue, onChange]
  );

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

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (programmaticRef.current) return;

      const idx = Math.max(0, Math.min(scrollTopToIndex(el.scrollTop), items.length - 1));
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

      if (!isLineOrPage && !isLargePixelDelta) return;

      e.preventDefault();

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIdx = scrollTopToIndex(el.scrollTop);
      const nextIdx = Math.max(0, Math.min(currentIdx + direction, items.length - 1));

      snapToIndex(nextIdx);
      emitChange(nextIdx);
    },
    [scrollTopToIndex, items.length, snapToIndex, emitChange]
  );

  const handleItemClick = useCallback(
    (idx: number) => {
      animateToIndex(idx);
      emitChange(idx);
    },
    [animateToIndex, emitChange]
  );

  return { containerRef, handleScroll, handleWheel, handleItemClick, scrollY, PADDING };
}

/* -------------------------------------------------------------------------- */
/*                  DrumColumn — shared between time & month/year             */
/* -------------------------------------------------------------------------- */

interface TimeColProps {
  items: { value: number; label: string }[];
  value: number;
  onChange: (val: number) => void;
  color: PickerColor;
}

const TimeColumn: React.FC<TimeColProps> = ({ items, value, onChange, color }) => {
  const { containerRef, handleScroll, handleWheel, handleItemClick, scrollY, PADDING } =
    useDrumPicker(items, value, onChange);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [containerRef, handleWheel]);

  return (
    <div className="relative flex-1 overflow-hidden select-none" style={{ height: ITEM_H * VISIBLE }}>
      {/* Top/bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-white dark:from-neutral-900 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
      {/* Center rail */}
      <div
        className="pointer-events-none absolute inset-x-1 z-10 border-t border-b border-neutral-200 dark:border-neutral-700"
        style={{ top: PADDING, height: ITEM_H }}
      />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="drp-drum-scroll h-full overflow-y-scroll"
      >
        <div style={{ height: PADDING }} />
        {items.map((item, idx) => {
          const itemCenter = idx * ITEM_H;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const opacity = useTransform(
            scrollY,
            [itemCenter - ITEM_H * 2, itemCenter - ITEM_H, itemCenter, itemCenter + ITEM_H, itemCenter + ITEM_H * 2],
            [0.3, 0.6, 1, 0.6, 0.3]
          );
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scale = useTransform(
            scrollY,
            [itemCenter - ITEM_H * 2, itemCenter - ITEM_H, itemCenter, itemCenter + ITEM_H, itemCenter + ITEM_H * 2],
            [0.87, 0.93, 1, 0.93, 0.87]
          );
          const isSelected = item.value === value;
          return (
            <motion.div
              key={item.value}
              onClick={() => handleItemClick(idx)}
              style={{ height: ITEM_H, opacity, scale }}
              className="drp-drum-item flex items-center justify-center cursor-pointer"
            >
              <span
                className={`flex items-center justify-center w-[52px] h-[34px] ${fieldValueClasses} ${getRadiusClass()} transition-all ${isSelected
                  ? colorMap[color].chip
                  : "text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100"
                  }`}
              >
                {item.label}
              </span>
            </motion.div>
          );
        })}
        <div style={{ height: PADDING }} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*               MonthYearDrum — exact same look as DateInput                 */
/* -------------------------------------------------------------------------- */

const MY_ITEM_H = 44;
const MY_VISIBLE = 7;

interface MonthYearDrumProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

interface DateInputDrumColProps {
  items: { value: number; label: string }[];
  selectedValue: number;
  containerRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  onWheel: (e: WheelEvent) => void;
  onItemClick: (idx: number) => void;
  scrollY: ReturnType<typeof useMotionValue<number>>;
  padding: number;
}

function useMYDrumPicker<T extends { value: number; label: string }>(
  items: T[],
  currentValue: number,
  onChange: (value: number) => void
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticRef = useRef(false);
  const lastEmittedRef = useRef<number | null>(null);
  const scrollY = useMotionValue(0);
  const PADDING = ((MY_VISIBLE - 1) / 2) * MY_ITEM_H;

  const indexToScrollTop = useCallback((idx: number) => idx * MY_ITEM_H, []);
  const scrollTopToIndex = useCallback(
    (scrollTop: number) => Math.round(scrollTop / MY_ITEM_H),
    []
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
    [indexToScrollTop, scrollY, items.length]
  );

  const animateToIndex = useCallback(
    (idx: number) => {
      const el = containerRef.current;
      if (!el) return;

      const target = indexToScrollTop(idx);
      programmaticRef.current = true;

      animate(scrollY, target, {
        type: "spring", stiffness: 140, damping: 24, mass: 0.8,
        restDelta: 0.2, restSpeed: 0.2,
        onUpdate: (v) => { if (el) el.scrollTop = v; },
        onComplete: () => { programmaticRef.current = false; },
      });
    },
    [indexToScrollTop, scrollY]
  );

  const emitChange = useCallback(
    (idx: number) => {
      const item = items[idx];
      if (!item || item.value === currentValue) return;
      lastEmittedRef.current = item.value;
      onChange(item.value);
    },
    [items, currentValue, onChange]
  );

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

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (programmaticRef.current) return;

      const idx = Math.max(0, Math.min(scrollTopToIndex(el.scrollTop), items.length - 1));
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

      if (!isLineOrPage && !isLargePixelDelta) return;

      e.preventDefault();

      const direction = e.deltaY > 0 ? 1 : -1;
      const currentIdx = scrollTopToIndex(el.scrollTop);
      const nextIdx = Math.max(0, Math.min(currentIdx + direction, items.length - 1));

      snapToIndex(nextIdx);
      emitChange(nextIdx);
    },
    [scrollTopToIndex, items.length, snapToIndex, emitChange]
  );

  const handleItemClick = useCallback(
    (idx: number) => {
      animateToIndex(idx);
      emitChange(idx);
    },
    [animateToIndex, emitChange]
  );

  return { containerRef, handleScroll, handleWheel, handleItemClick, scrollY, PADDING };
}

const DateInputDrumCol: React.FC<DateInputDrumColProps> = ({
  items, selectedValue, containerRef, onScroll, onWheel, onItemClick, scrollY, padding,
}) => {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [containerRef, onWheel]);

  return (
    <div className="relative flex-1 overflow-hidden drp-drum-fade">
      <div className="drp-drum-scroll h-full overflow-y-scroll" ref={containerRef} onScroll={onScroll}>
        <div style={{ height: padding, flexShrink: 0 }} />
        {items.map((item, idx) => {
          const itemCenter = idx * MY_ITEM_H;
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const opacity = useTransform(
            scrollY,
            [itemCenter - MY_ITEM_H * 3, itemCenter - MY_ITEM_H, itemCenter, itemCenter + MY_ITEM_H, itemCenter + MY_ITEM_H * 3],
            [0.25, 0.55, 1, 0.55, 0.25]
          );
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const scale = useTransform(
            scrollY,
            [itemCenter - MY_ITEM_H * 2, itemCenter, itemCenter + MY_ITEM_H * 2],
            [0.88, 1, 0.88]
          );
          const isSelected = item.value === selectedValue;
          return (
            <motion.div
              key={item.value}
              onClick={() => onItemClick(idx)}
              style={{ height: MY_ITEM_H, opacity, scale }}
              className={`drp-drum-item relative z-10 flex items-center justify-center cursor-pointer px-4
                ${fieldValueClasses}
                ${isSelected ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-700 dark:text-neutral-200"}`}
            >
              {item.label}
            </motion.div>
          );
        })}
        <div style={{ height: padding, flexShrink: 0 }} />
      </div>
    </div>
  );
};

const MonthYearDrum: React.FC<MonthYearDrumProps> = ({
  currentMonth, currentYear, onMonthChange, onYearChange,
}) => {
  const {
    containerRef: monthRef, handleScroll: handleMonthScroll,
    handleWheel: handleMonthWheel, handleItemClick: handleMonthClick,
    scrollY: monthScrollY, PADDING,
  } = useMYDrumPicker(monthOptions, currentMonth, onMonthChange);

  const {
    containerRef: yearRef, handleScroll: handleYearScroll,
    handleWheel: handleYearWheel, handleItemClick: handleYearClick,
    scrollY: yearScrollY,
  } = useMYDrumPicker(yearOptions, currentYear, onYearChange);

  const drumHeight = MY_ITEM_H * MY_VISIBLE;

  return (
    <div
      className="relative overflow-hidden bg-default-100 dark:bg-neutral-800"
      style={{ width: 284 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* center selection band */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-2 right-2 z-0"
        style={{
          top: "50%",
          height: MY_ITEM_H - 4,
          transform: "translateY(-50%)",
          borderRadius: "var(--radius)",
          background: "color-mix(in srgb, var(--color-background, white) 85%, transparent)",
          backdropFilter: "blur(10px)",
          border: "1px solid color-mix(in srgb, var(--color-background, white) 75%, transparent)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      />
      <div className="flex" style={{ height: drumHeight }}>
        <DateInputDrumCol
          items={monthOptions}
          selectedValue={currentMonth}
          containerRef={monthRef}
          onScroll={handleMonthScroll}
          onWheel={handleMonthWheel}
          onItemClick={handleMonthClick}
          scrollY={monthScrollY}
          padding={PADDING}
        />
        <DateInputDrumCol
          items={yearOptions}
          selectedValue={currentYear}
          containerRef={yearRef}
          onScroll={handleYearScroll}
          onWheel={handleYearWheel}
          onItemClick={handleYearClick}
          scrollY={yearScrollY}
          padding={PADDING}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          MiniCalendar component                            */
/* -------------------------------------------------------------------------- */

interface MiniCalendarProps {
  viewDate: Date;
  selected: Date | null;
  onSelectDate: (d: Date) => void;
  color: PickerColor;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  viewDate,
  selected,
  onSelectDate,
  color,
  onMonthChange,
  onYearChange,
}) => {
  const [showMY, setShowMY] = useState(false);
  const [localView, setLocalView] = useState(viewDate);

  useEffect(() => { setLocalView(viewDate); }, [viewDate]);

  const year = localView.getFullYear();
  const month = localView.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (day: number) =>
    !!selected &&
    selected.getFullYear() === year &&
    selected.getMonth() === month &&
    selected.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const handleMonthChange = (m: number) => {
    const nd = new Date(year, m, 1);
    setLocalView(nd);
    onMonthChange(m);
  };

  const handleYearChange = (y: number) => {
    const nd = new Date(y, month, 1);
    setLocalView(nd);
    onYearChange(y);
  };

  const activeColor = colorMap[color];

  return (
    <div className="flex flex-col w-full min-w-[284px]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 pt-3 pb-2">
        <AnimatePresence mode="wait">
          {!showMY && (
            <motion.button
              key="prev"
              type="button"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                const nd = new Date(localView);
                nd.setMonth(nd.getMonth() - 1);
                setLocalView(nd);
                onMonthChange(nd.getMonth());
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-default-200 bg-default-50 text-default-600 hover:bg-default-100 transition-colors"
            >
              <FaChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
        {!showMY && <div className="w-9" />}

        {/* Month/Year button — centered */}
        <div className="relative flex-1 flex justify-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); setShowMY((v) => !v); }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-default-200 transition-all
              ${showMY ? "bg-default-100 shadow-none" : "bg-default-50 shadow-sm hover:bg-default-100"}`}
          >
            <motion.span
              key={`${MONTHS_SHORT[month]}-${year}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className={fieldValueClasses}
            >
              {MONTHS_SHORT[month]} {year}
            </motion.span>
            <motion.div
              className="w-3.5 h-3.5 flex items-center justify-center"
              animate={{ rotate: showMY ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
            >
              <FaChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </motion.button>

          {/* MonthYear Drum Overlay */}
          <AnimatePresence>
            {showMY && (
              <motion.div
                key="my-drum"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "calc(100% + 8px)",
                  x: "-50%",
                  zIndex: 50,
                }}
              >
                <MonthYearDrum
                  currentMonth={month}
                  currentYear={year}
                  onMonthChange={handleMonthChange}
                  onYearChange={handleYearChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!showMY && <div className="w-9" />}
        <AnimatePresence mode="wait">
          {!showMY && (
            <motion.button
              key="next"
              type="button"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                const nd = new Date(localView);
                nd.setMonth(nd.getMonth() + 1);
                setLocalView(nd);
                onMonthChange(nd.getMonth());
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-default-200 bg-default-50 text-default-600 hover:bg-default-100 transition-colors"
            >
              <FaChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Day headers + grid — hidden when drum is open */}
      {!showMY && (
        <>
          <div className="grid grid-cols-7 px-2 pb-1">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={`d-${day}`}
                  type="button"
                  onClick={() => onSelectDate(new Date(year, month, day))}
                  className={`flex items-center justify-center h-9 w-full rounded-full ${fieldValueClasses} transition-all
                    ${sel
                      ? `${activeColor.bg} text-white`
                      : tod
                        ? `border-2 ${activeColor.border} ${activeColor.text} bg-transparent`
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Spacer when drum is open, so the popover height is stable */}
      {showMY && (
        <div style={{ height: MY_ITEM_H * MY_VISIBLE + 16 }} />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          Clock Dial (analog mode)                          */
/* -------------------------------------------------------------------------- */

const CENTER = 110;
const DIAL_R = 82;
const HOURS_LIST = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES_DIAL = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function getCoords(index: number, radius = DIAL_R) {
  const angle = (index * 30 - 90) * (Math.PI / 180);
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

interface ClockDialProps {
  hour: number;
  minute: number;
  ampm: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onAmpmChange: (a: number) => void;
  color: PickerColor;
}

const ClockDial: React.FC<ClockDialProps> = ({
  hour, minute, ampm, onHourChange, onMinuteChange, onAmpmChange, color,
}) => {
  const [phase, setPhase] = useState<"hour" | "minute">("hour");
  const [isDragging, setIsDragging] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  const activeColor = colorMap[color] || colorMap.primary;

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

      if (phase === "hour") {
        let h = Math.round(angleFromTop / 30);
        if (h === 0) h = 12;
        if (h > 12) h = 12;
        onHourChange(h);
      } else {
        let m = Math.round(angleFromTop / 6);
        if (m === 60) m = 0;
        if (m > 59) m = 59;
        onMinuteChange(m);
      }
    },
    [phase, onHourChange, onMinuteChange]
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
      if (phase === "hour") {
        setTimeout(() => {
          setPhase("minute");
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
  }, [isDragging, handleInteraction, phase]);

  const handAngle = phase === "hour" ? hour * 30 - 90 : minute * 6 - 90;
  const handRad = (handAngle * Math.PI) / 180;
  const handX = CENTER + DIAL_R * Math.cos(handRad);
  const handY = CENTER + DIAL_R * Math.sin(handRad);
  const isMultipleOfFive = phase === "minute" ? minute % 5 === 0 : true;

  return (
    <div className="flex flex-col items-center pt-4 pb-2 px-4 gap-3 select-none font-sans relative">
      {/* Time Header Display */}
      <div className="flex flex-col items-center w-full px-2 mb-1">
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold tracking-wider uppercase mb-1 self-start">
          Select Time
        </span>
        <div className="flex items-center justify-start w-full gap-3 mt-1">
          {/* Time digits */}
          <div className="flex items-center">
            <span
              onClick={() => setPhase("hour")}
              className={`text-[40px] leading-none font-semibold cursor-pointer transition-colors ${phase === "hour"
                ? `${activeColor.text}`
                : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                }`}
            >
              {String(hour).padStart(2, "0")}
            </span>
            <span className="text-[40px] leading-none text-neutral-400 dark:text-neutral-600 mx-1 select-none">:</span>
            <span
              onClick={() => setPhase("minute")}
              className={`text-[40px] leading-none font-semibold cursor-pointer transition-colors ${phase === "minute"
                ? `${activeColor.text}`
                : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                }`}
            >
              {String(minute).padStart(2, "0")}
            </span>
          </div>

          {/* AM/PM Toggle */}
          <div className="flex flex-col justify-center text-[13px] leading-tight font-bold border-l border-neutral-200 dark:border-neutral-800 pl-3 ml-1">
            <span
              onClick={() => onAmpmChange(0)}
              className={`cursor-pointer py-0.5 transition-colors ${ampm === 0
                ? `${activeColor.text} font-bold scale-105`
                : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                }`}
            >
              AM
            </span>
            <span
              onClick={() => onAmpmChange(1)}
              className={`cursor-pointer py-0.5 transition-colors ${ampm === 1
                ? `${activeColor.text} font-bold scale-105`
                : "text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300"
                }`}
            >
              PM
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-[1px] bg-neutral-100 dark:bg-neutral-800" />

      {/* Clock Face container */}
      <div className="relative flex items-center justify-center p-2">
        {/* Toggle Arrows at top right of dial */}
        <div className="absolute -top-2 right-1 flex items-center gap-1 z-10">
          <Button
            color="default"
            size="xs"
            variant="flat"
            radius="full"
            isIconOnly
            disabled={phase === "hour"}
            onClick={() => setPhase("hour")}
          >
            <FaChevronLeft className="w-3 h-3" />
          </Button>
          <Button
            color="default"
            size="xs"
            variant="flat"
            radius="full"
            isIconOnly
            disabled={phase === "minute"}
            onClick={() => setPhase("minute")}
          >
            <FaChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {/* Dial Box */}
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
              x1={CENTER}
              y1={CENTER}
              x2={handX}
              y2={handY}
              stroke={activeColor.stroke}
              strokeWidth="2.2"
            />
            {/* Central small joint pivot */}
            <circle cx={CENTER} cy={CENTER} r="4" fill={activeColor.stroke} />

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
          <div className="absolute inset-0 pointer-events-none animate-none">
            <AnimatePresence mode="wait">
              {phase === "hour" ? (
                <motion.div
                  key="hours-dial"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.16 }}
                  className="absolute inset-0 animate-none"
                >
                  {HOURS_LIST.map((hr, idx) => {
                    const coords = getCoords(idx);
                    const isSelected = hour === hr;
                    return (
                      <span
                        key={`hr-${hr}`}
                        className={`absolute text-xs font-semibold select-none flex items-center justify-center w-6 h-6 transition-colors duration-100 ${isSelected
                          ? "text-white z-20 font-bold"
                          : "text-neutral-700 dark:text-neutral-300"
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
                  className="absolute inset-0 animate-none"
                >
                  {MINUTES_DIAL.map((min, idx) => {
                    const coords = getCoords(idx);
                    const isSelected = minute === parseInt(min, 10);
                    return (
                      <span
                        key={`min-${min}`}
                        className={`absolute text-[11px] font-semibold select-none flex items-center justify-center w-6 h-6 transition-colors duration-100 ${isSelected
                          ? "text-white z-20 font-bold"
                          : "text-neutral-700 dark:text-neutral-300"
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
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                          DateTimePicker Component                          */
/* -------------------------------------------------------------------------- */

const DRUM_HOURS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1).padStart(2, "0") }));
const DRUM_MINUTES = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, "0") }));
const DRUM_AMPM = [{ value: 0, label: "AM" }, { value: 1, label: "PM" }];

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  placeholder = "",
  isClearable = false,
  disabled = false,
  value,
  onChange,
  error,
  touched,
  variant = "bordered",
  size = "md",
  radius = DEFAULT_RADIUS,
  color = "primary",
  labelPlacement = "outside-top",
  timeMode = "normal",
  containerClassName = "",
  wrapperClassName = "",
  labelClassName = "",
  errorClassName = "",
  isRequired = false,
  field,
  form,
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
  const fieldName = field?.name || "";
  const rawValue = value !== undefined ? value : field?.value;
  const parsedValue = useMemo(() => parseInput(rawValue), [rawValue]);

  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number | "auto"; bottom: number | "auto"; left: number;
  } | null>(null);

  // Draft state
  const [draftDate, setDraftDate] = useState<Date | null>(null);
  const [draftHour, setDraftHour] = useState(12);
  const [draftMinute, setDraftMinute] = useState(0);
  const [draftAmpm, setDraftAmpm] = useState(0); // 0=AM,1=PM
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const viewDate = useMemo(() => new Date(viewYear, viewMonth, 1), [viewYear, viewMonth]);

  // Sync draft from committed value
  useEffect(() => {
    if (parsedValue) {
      const h = parsedValue.getHours();
      setDraftDate(parsedValue);
      setDraftHour(h % 12 || 12);
      setDraftMinute(parsedValue.getMinutes());
      setDraftAmpm(h >= 12 ? 1 : 0);
      setViewMonth(parsedValue.getMonth());
      setViewYear(parsedValue.getFullYear());
    } else {
      setDraftDate(null);
      const now = new Date();
      setDraftHour(now.getHours() % 12 || 12);
      setDraftMinute(0);
      setDraftAmpm(now.getHours() >= 12 ? 1 : 0);
    }
  }, [parsedValue]);

  // Position popover
  const updateCoords = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropH = timeMode === "clock" ? 520 : 430;
    let top: number | "auto" = 0;
    let bottom: number | "auto" = "auto";
    if (spaceBelow < dropH && rect.top > spaceBelow) {
      top = "auto";
      bottom = window.innerHeight - rect.top + 6;
    } else {
      top = rect.bottom + 6;
    }
    const popoverWidth = timeMode === "clock" ? 534 : 524;
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) left = 12;
    setCoords({ top, bottom, left });
  }, [timeMode]);

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

  // Click outside
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        wrapperRef.current && !wrapperRef.current.contains(t) &&
        popoverRef.current && !popoverRef.current.contains(t)
      ) setIsOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const triggerChange = (date: Date | null) => {
    if (form?.setFieldValue && fieldName) form.setFieldValue(fieldName, date);
    else onChange?.(date);
  };

  const handleConfirm = () => {
    const base = draftDate || new Date();
    base.setHours(0, 0, 0, 0);
    const result = new Date(base.getTime());
    let h = draftHour % 12;
    if (draftAmpm === 1) h += 12;
    result.setHours(h, draftMinute, 0, 0);
    triggerChange(result);
    if (form?.setFieldTouched && fieldName) form.setFieldTouched(fieldName, true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (parsedValue) {
      const h = parsedValue.getHours();
      setDraftDate(parsedValue);
      setDraftHour(h % 12 || 12);
      setDraftMinute(parsedValue.getMinutes());
      setDraftAmpm(h >= 12 ? 1 : 0);
    } else {
      setDraftDate(null);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerChange(null);
    if (form?.setFieldTouched && fieldName) form.setFieldTouched(fieldName, true);
  };

  const displayValue = formatDisplay(parsedValue);
  const hasValue = !!parsedValue;

  const startError = fieldName && form?.errors?.[fieldName] ? String(form.errors[fieldName]) : error;
  const startTouched = fieldName && form?.touched?.[fieldName] ? true : touched;
  const hasError = !!(startTouched && startError);
  const radiusClass = resolvedVariant === "underlined" ? "rounded-none" : getRadiusClass(radius);
  const isOutlined = labelPlacement === "outlined";
  const isFloating = labelPlacement === "inside" || labelPlacement === "outside";
  const isOutsideLeft = labelPlacement === "outside-left";
  const shouldFloat = isOpen || hasValue || (isFloating && !!placeholder) || (isOutlined && !!placeholder);

  const variantClass = isOutlined
    ? "bg-transparent border-none"
    : resolvedVariant === "flat"
      ? `border-2 border-transparent ${flatColorClasses[color] || flatColorClasses.default}`
      : resolvedVariant === "bordered"
        ? `border-2 ${borderedColorClasses[color] || borderedColorClasses.default}`
        : resolvedVariant === "underlined"
          ? `border-b rounded-none relative ${underlinedColorClasses[color] || underlinedColorClasses.default}`
          : `border-2 ${fadedColorClasses[color] || fadedColorClasses.default}`;

  const wrapperBaseClasses = getWrapperBaseClasses({
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

  const sizeConfigs = {
    sm: { wrapperPadding: labelPlacement === "inside" && label ? "py-1 px-2.5" : "py-1.5 px-2.5", textSize: "text-xs", labelSize: "text-[10px]", insideHeight: "h-12", outsideHeight: "h-10", floatY: -20, floatX: -2, initialY: -8, initialX: 0, floatYOutside: -41, floatXOutside: -14, floatScale: 0.83, outlinedFloatY: -28.5, outlinedInitialY: -8 },
    md: { wrapperPadding: labelPlacement === "inside" && label ? "py-1.5 px-3" : "py-2.5 px-3", textSize: "text-sm", labelSize: "text-xs", insideHeight: "h-14", outsideHeight: "h-12", floatY: -22, floatX: 0, initialY: -10, initialX: 0, floatYOutside: -46, floatXOutside: -14, floatScale: 0.85, outlinedFloatY: -35, outlinedInitialY: -10 },
    lg: { wrapperPadding: labelPlacement === "inside" && label ? "py-2 px-4" : "py-3.5 px-4", textSize: "text-base", labelSize: "text-sm", insideHeight: "h-16", outsideHeight: "h-14", floatY: -25, floatX: 4, initialY: -12, initialX: 0, floatYOutside: -52, floatXOutside: -14, floatScale: 0.87, outlinedFloatY: -41, outlinedInitialY: -12 },
  };
  const sz = sizeConfigs[size] || sizeConfigs.md;

  const renderOutsideLabel = () => {
    if (!label || isFloating || isOutlined) return null;

    return (
      <label
        htmlFor={fieldName}
        className={`${labelClasses} ${isOutsideLeft ? "mb-0 shrink-0 mr-3 self-center" : "mb-2"} ${labelClassName} ${hasError ? "text-danger" : ""}`}
      >
        <FieldLabelContent label={label} isRequired={isRequired} />
      </label>
    );
  };

  const renderFloatingLabel = () => {
    if (!label || (!isFloating && !isOutlined)) return null;
    let animateProps: any;
    if (isOutlined) {
      animateProps = shouldFloat ? { y: sz.outlinedFloatY, x: 0, scale: 0.75 } : { y: sz.outlinedInitialY, x: 0, scale: 1 };
    } else if (labelPlacement === "outside") {
      animateProps = shouldFloat ? { y: sz.floatYOutside, x: sz.floatXOutside, scale: sz.floatScale } : { y: sz.initialY, x: sz.initialX, scale: 1 };
    } else {
      animateProps = shouldFloat ? { y: sz.floatY, x: sz.floatX, scale: sz.floatScale } : { y: sz.initialY, x: sz.initialX, scale: 1 };
    }
    return (
      <motion.label
        htmlFor={fieldName}
        initial={false}
        animate={animateProps}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: isOutlined ? "left" : "top left" }}
        className={`absolute left-3 top-1/2 z-10 ${labelFloatingClasses} transition-colors duration-200 ${sz.textSize
          } ${labelClassName} ${
            hasError
              ? "text-danger"
              : isOpen && color !== "default"
                ? (focusTextColors[color] || "text-primary")
                : shouldFloat
                  ? isOpen
                    ? "text-neutral-800 dark:text-neutral-200"
                    : "text-neutral-700 dark:text-neutral-300"
                  : "text-neutral-400 dark:text-neutral-500"
          } ${isOutlined ? "bg-white dark:bg-content1 px-1" : ""}`}
      >
        <FieldLabelContent label={label} isRequired={isRequired} />
      </motion.label>
    );
  };

  const renderPopover = () => {
    if (!coords) return null;
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dtp-popover"
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.6 }}
            style={{
              position: "fixed",
              top: coords.top !== "auto" ? coords.top : "auto",
              bottom: coords.bottom !== "auto" ? coords.bottom : "auto",
              left: coords.left,
              zIndex: 99999,
            }}
            className="bg-white dark:bg-content1 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
          >
            <div className="flex">
              {/* Left: Calendar */}
              <div className="border-r border-neutral-200 dark:border-neutral-700">
                <MiniCalendar
                  viewDate={viewDate}
                  selected={draftDate}
                  onSelectDate={(d) => {
                    setDraftDate(d);
                    setViewMonth(d.getMonth());
                    setViewYear(d.getFullYear());
                  }}
                  color={color}
                  onMonthChange={(m) => setViewMonth(m)}
                  onYearChange={(y) => setViewYear(y)}
                />
              </div>

              {/* Right: Time Picker */}
              <div className="flex flex-col justify-between" style={{ width: timeMode === "clock" ? 250 : 240 }}>
                {timeMode === "clock" ? (
                  <ClockDial
                    hour={draftHour}
                    minute={draftMinute}
                    ampm={draftAmpm}
                    onHourChange={setDraftHour}
                    onMinuteChange={setDraftMinute}
                    onAmpmChange={setDraftAmpm}
                    color={color}
                  />
                ) : (
                  <div className="flex pt-4 pb-2 px-3 justify-center items-center w-full" style={{ height: ITEM_H * VISIBLE + 48 }}>
                    <TimeColumn items={DRUM_HOURS} value={draftHour} onChange={setDraftHour} color={color} />
                    <div className="w-[1px] h-[80%] bg-neutral-200 dark:bg-neutral-800 shrink-0 pointer-events-none mx-2" />
                    <TimeColumn items={DRUM_MINUTES} value={draftMinute} onChange={setDraftMinute} color={color} />
                    <div className="w-[1px] h-[80%] bg-neutral-200 dark:bg-neutral-800 shrink-0 pointer-events-none mx-2" />
                    <TimeColumn items={DRUM_AMPM} value={draftAmpm} onChange={setDraftAmpm} color={color} />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
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
                onClick={handleConfirm}
              >
                OK
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      <div className={`relative ${isOutsideLeft ? "flex flex-row items-start gap-3" : ""}`}>
        {renderOutsideLabel()}
        <div className={isOutsideLeft ? "flex-1" : "w-full"}>
          <div
            ref={wrapperRef}
            id={fieldName || undefined}
            onClick={() => { if (!disabled) setIsOpen((o) => !o); }}
            className={`
              relative flex items-center w-full
              ${variantClass}
              ${radiusClass}
              ${wrapperBaseClasses}
              ${sz.wrapperPadding}
              ${labelPlacement === "inside" ? sz.insideHeight : `${sz.outsideHeight} ${isFloating && label && !isOutlined ? "mt-6" : ""} ${isOutlined && label ? "mt-[10px]" : ""}`}
              transition-all duration-200
              ${interactiveBorderClass}
              ${disabled ? "opacity-50 cursor-default" : "cursor-pointer"}
            `}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !disabled) setIsOpen((o) => !o); }}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            {renderFloatingLabel()}

            <div className={`flex-1 flex items-center overflow-hidden ${labelPlacement === "inside" && label && shouldFloat ? (size === "sm" ? "mt-3" : size === "lg" ? "mt-5" : "mt-4") : ""}`}>
              {!hasValue ? (
                <span className={`${fieldPlaceholderClasses} truncate select-none`}>
                  {((!label || labelPlacement !== "inside" || shouldFloat) ? placeholder || "\u200b" : "\u200b")}
                </span>
              ) : (
                <span className={`text-neutral-800 dark:text-neutral-200 truncate select-none ${fieldValueClasses}`}>
                  {displayValue}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
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
                <FaCalendar className={`w-4 h-4 transition-colors ${isOpen && color !== "default" ? (focusTextColors[color] || "text-primary") : "text-neutral-600 dark:text-neutral-350 group-hover:text-neutral-800 dark:group-hover:text-neutral-100"}`} />
              )}
            </div>

            {isOutlined && (
              <fieldset className={`absolute inset-0 pointer-events-none border-2 transition-colors duration-200 m-0 p-0 ${radiusClass} ${isOpen && !hasError ? applyImportant(focusBorderColors[color] || "border-primary") : hasError ? "border-danger" : (fieldsetBorderColors[color] || "border-neutral-300 dark:border-neutral-700")
                }`}>
                {label && (
                  <legend
                    className={`ml-2 font-medium select-none transition-all duration-200 block whitespace-nowrap overflow-hidden invisible ${shouldFloat ? "max-w-full px-1" : "max-w-0 px-0"
                      }`}
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
      </div>

      {hasError && (
        <motion.p
          key="err"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`${errorClasses} ${errorClassName}`}
        >
          {startError}
        </motion.p>
      )}

      {renderPopover()}
    </div>
  );
};

DateTimePicker.displayName = "DateTimePicker";
export default DateTimePicker;
