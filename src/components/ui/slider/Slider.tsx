import React, { useRef, useState, useEffect } from "react";
import clsx from "clsx";
import Tooltip from "../tooltip/Tooltip";

export interface SliderProps {
  label?: React.ReactNode;
  name?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  value?: number | number[];
  defaultValue?: number | number[];
  onChange?: (value: number | number[]) => void;
  onChangeEnd?: (value: number | number[]) => void;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "foreground";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
  showSteps?: boolean;
  marks?: { value: number; label: string }[];
  formatOptions?: Intl.NumberFormatOptions;
  getValue?: (value: number | number[]) => string;
  className?: string;
  fillOffset?: number;
  showTooltip?: boolean;
  tooltipValueFormatOptions?: Intl.NumberFormatOptions;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  showOutline?: boolean;
  hideValue?: boolean;
  hideThumb?: boolean;
  disableThumbScale?: boolean;
  disableAnimation?: boolean;
}

const colorClasses = {
  default: {
    track: "bg-default-200 dark:bg-default-700",
    fill: "bg-default-700 dark:bg-default-500",
    thumb: "border-default-700 dark:border-default-500 bg-background hover:bg-default-100",
    stepActive: "bg-default-400 dark:bg-default-500",
    stepInactive: "bg-default-300 dark:bg-default-600",
  },
  primary: {
    track: "bg-default-200 dark:bg-default-700",
    fill: "bg-primary",
    thumb: "border-primary bg-background hover:bg-primary-50",
    stepActive: "bg-primary",
    stepInactive: "bg-default-300 dark:bg-default-600",
  },
  secondary: {
    track: "bg-default-200 dark:bg-default-700",
    fill: "bg-secondary",
    thumb: "border-secondary bg-background hover:bg-secondary-50",
    stepActive: "bg-secondary",
    stepInactive: "bg-default-300 dark:bg-default-600",
  },
  success: {
    track: "bg-default-200 dark:bg-default-700",
    fill: "bg-success",
    thumb: "border-success bg-background hover:bg-success-50",
    stepActive: "bg-success",
    stepInactive: "bg-default-300 dark:bg-default-600",
  },
  warning: {
    track: "bg-default-200 dark:bg-default-700",
    fill: "bg-warning",
    thumb: "border-warning bg-background hover:bg-warning-50",
    stepActive: "bg-warning",
    stepInactive: "bg-default-300 dark:bg-default-600",
  },
  danger: {
    track: "bg-default-200 dark:bg-default-700",
    fill: "bg-danger",
    thumb: "border-danger bg-background hover:bg-danger-50",
    stepActive: "bg-danger",
    stepInactive: "bg-default-300 dark:bg-default-600",
  },
  foreground: {
    track: "bg-default-200 dark:bg-default-700",
    fill: "bg-foreground dark:bg-foreground",
    thumb: "border-foreground bg-background hover:bg-neutral-100",
    stepActive: "bg-foreground",
    stepInactive: "bg-default-300 dark:bg-default-600",
  },
};

const sizeClasses = {
  sm: {
    track: "h-1 w-full",
    trackVertical: "w-1 h-full",
    thumb: "w-4 h-4",
    label: "text-xs",
    value: "text-xs",
  },
  md: {
    track: "h-2 w-full",
    trackVertical: "w-2 h-full",
    thumb: "w-5 h-5",
    label: "text-sm",
    value: "text-sm",
  },
  lg: {
    track: "h-3 w-full",
    trackVertical: "w-3 h-full",
    thumb: "w-6 h-6",
    label: "text-base",
    value: "text-base",
  },
};

const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const Slider: React.FC<SliderProps> = ({
  label,
  name,
  minValue = 0,
  maxValue = 100,
  step = 1,
  value: controlledValue,
  defaultValue,
  onChange,
  onChangeEnd,
  color = "primary",
  size = "md",
  radius = "full",
  isDisabled = false,
  orientation = "horizontal",
  showSteps = false,
  marks = [],
  formatOptions,
  getValue,
  className,
  fillOffset,
  showTooltip = false,
  tooltipValueFormatOptions,
  startContent,
  endContent,
  showOutline = false,
  hideValue = false,
  hideThumb = false,
  disableThumbScale = false,
  disableAnimation = false,
}) => {
  const isRange = Array.isArray(controlledValue) || Array.isArray(defaultValue);

  const getInitialValue = () => {
    if (controlledValue !== undefined) return controlledValue;
    if (defaultValue !== undefined) return defaultValue;
    return isRange ? [minValue, maxValue] : minValue;
  };

  const [internalValue, setInternalValue] = useState<number | number[]>(getInitialValue);
  const [isDragging, setIsDragging] = useState(false);
  const activeThumbIndexRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Keep internal value synced if controlled value changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const values = Array.isArray(internalValue) ? internalValue : [internalValue];

  // Helper to format values
  const formatVal = (val: number, options?: Intl.NumberFormatOptions) => {
    const activeOptions = options || formatOptions;
    if (activeOptions) {
      return new Intl.NumberFormat(undefined, activeOptions).format(val);
    }
    return val.toString();
  };

  const getDisplayValue = () => {
    if (getValue) {
      return getValue(internalValue);
    }
    if (isRange) {
      return `${formatVal(values[0])} - ${formatVal(values[1])}`;
    }
    return formatVal(values[0]);
  };

  const snapToStep = (val: number) => {
    const minVal = minValue;
    const maxVal = maxValue;
    const steppedVal = Math.round((val - minVal) / step) * step + minVal;
    return Math.max(minVal, Math.min(maxVal, steppedVal));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    let fraction = 0;

    if (orientation === "horizontal") {
      fraction = (e.clientX - rect.left) / rect.width;
    } else {
      fraction = 1 - (e.clientY - rect.top) / rect.height;
    }

    fraction = Math.max(0, Math.min(1, fraction));
    const targetValue = minValue + fraction * (maxValue - minValue);

    // Determine which thumb is closest
    let closestIndex = 0;
    if (isRange) {
      const dist0 = Math.abs(values[0] - targetValue);
      const dist1 = Math.abs(values[1] - targetValue);
      closestIndex = dist0 < dist1 ? 0 : 1;
    }

    activeThumbIndexRef.current = closestIndex;
    setIsDragging(true);
    updateValue(targetValue, closestIndex);

    trackRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDisabled || activeThumbIndexRef.current === null || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    let fraction = 0;

    if (orientation === "horizontal") {
      fraction = (e.clientX - rect.left) / rect.width;
    } else {
      fraction = 1 - (e.clientY - rect.top) / rect.height;
    }

    fraction = Math.max(0, Math.min(1, fraction));
    const targetValue = minValue + fraction * (maxValue - minValue);

    updateValue(targetValue, activeThumbIndexRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeThumbIndexRef.current !== null) {
      if (onChangeEnd) {
        onChangeEnd(internalValue);
      }
      activeThumbIndexRef.current = null;
    }
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const updateValue = (targetVal: number, index: number) => {
    const snapped = snapToStep(targetVal);

    let nextValues: number[];
    if (isRange) {
      nextValues = [...values];
      nextValues[index] = snapped;

      // Prevent thumbs from crossing
      if (index === 0 && nextValues[0] > nextValues[1]) {
        nextValues[0] = nextValues[1];
      } else if (index === 1 && nextValues[1] < nextValues[0]) {
        nextValues[1] = nextValues[0];
      }
    } else {
      nextValues = [snapped];
    }

    const finalValue = isRange ? nextValues : nextValues[0];

    if (controlledValue === undefined) {
      setInternalValue(finalValue);
    }

    if (onChange) {
      onChange(finalValue);
    }
  };

  const handleMarkClick = (e: React.MouseEvent, markVal: number) => {
    e.stopPropagation();
    if (isDisabled) return;

    let closestIndex = 0;
    if (isRange) {
      const dist0 = Math.abs(values[0] - markVal);
      const dist1 = Math.abs(values[1] - markVal);
      closestIndex = dist0 < dist1 ? 0 : 1;
    }

    updateValue(markVal, closestIndex);
    if (onChangeEnd) {
      const nextValues = [...values];
      nextValues[closestIndex] = snapToStep(markVal);
      onChangeEnd(isRange ? nextValues : nextValues[0]);
    }
  };

  const isVertical = orientation === "vertical";
  const colors = colorClasses[color] || colorClasses.primary;
  const sizes = sizeClasses[size];

  // Calculate percentages for filling
  const getPercentage = (val: number) => {
    return ((val - minValue) / (maxValue - minValue)) * 100;
  };

  const percentage0 = getPercentage(values[0]);
  const percentage1 = isRange ? getPercentage(values[1]) : 0;

  // Custom fill offset logic
  let fillStyle = {};
  if (isVertical) {
    if (fillOffset !== undefined) {
      const offsetPct = getPercentage(fillOffset);
      fillStyle = {
        bottom: `${Math.min(offsetPct, percentage0)}%`,
        height: `${Math.abs(percentage0 - offsetPct)}%`,
      };
    } else {
      fillStyle = isRange
        ? { bottom: `${Math.min(percentage0, percentage1)}%`, height: `${Math.abs(percentage1 - percentage0)}%` }
        : { bottom: "0%", height: `${percentage0}%` };
    }
  } else {
    if (fillOffset !== undefined) {
      const offsetPct = getPercentage(fillOffset);
      fillStyle = {
        left: `${Math.min(offsetPct, percentage0)}%`,
        width: `${Math.abs(percentage0 - offsetPct)}%`,
      };
    } else {
      fillStyle = isRange
        ? { left: `${Math.min(percentage0, percentage1)}%`, width: `${Math.abs(percentage1 - percentage0)}%` }
        : { left: "0%", width: `${percentage0}%` };
    }
  }

  // Calculate standard step points if showSteps is true
  const stepCount = Math.floor((maxValue - minValue) / step);
  const stepPoints = [];
  if (showSteps && stepCount > 0 && stepCount <= 100) {
    for (let i = 1; i < stepCount; i++) {
      stepPoints.push(minValue + i * step);
    }
  }

  return (
    <div
      className={clsx(
        "flex flex-col w-full text-foreground select-none",
        isVertical ? "h-full items-center justify-between" : "w-full",
        isDisabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Hidden native input for forms integration */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={isRange ? JSON.stringify(internalValue) : String(internalValue)}
        />
      )}

      {/* Header (Label & Value) */}
      {(!hideValue || label) && !isVertical && (
        <div className="flex justify-between items-center mb-1.5 w-full">
          {label && <span className={clsx("font-medium text-neutral-700 dark:text-neutral-300", sizes.label)}>{label}</span>}
          {!hideValue && (
            <span className={clsx("font-semibold text-neutral-800 dark:text-neutral-200", sizes.value)}>
              {getDisplayValue()}
            </span>
          )}
        </div>
      )}

      {/* Main Slider Area Wrapper for Start & End Content */}
      <div className={clsx("flex items-center gap-3 w-full", isVertical && "flex-col h-full")}>
        {startContent && <div className="flex shrink-0">{startContent}</div>}

        <div
          className={clsx(
            "relative flex items-center touch-none cursor-pointer grow justify-center",
            isVertical ? "flex-col h-full py-3" : "w-full py-3"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Track Background */}
          <div
            ref={trackRef}
            className={clsx(
              "relative rounded-full",
              isVertical ? sizes.trackVertical : sizes.track,
              colors.track
            )}
          >
            {/* Track Fill */}
            <div
              className={clsx(
                "absolute rounded-full",
                (!disableAnimation && !isDragging) && "transition-all duration-75",
                isVertical ? "w-full left-0" : "h-full top-0",
                colors.fill
              )}
              style={fillStyle}
            />

            {/* Visible Step Dots */}
            {showSteps &&
              stepPoints.map((pt, i) => {
                const pct = getPercentage(pt);
                const isActive = isRange
                  ? pt >= values[0] && pt <= values[1]
                  : fillOffset !== undefined
                    ? (fillOffset <= pt && pt <= values[0]) || (values[0] <= pt && pt <= fillOffset)
                    : pt <= values[0];
                return (
                  <div
                    key={i}
                    className={clsx(
                      "absolute rounded-full -translate-x-1/2",
                      isVertical ? "left-1/2 translate-y-1/2" : "top-1/2 -translate-y-1/2",
                      size === "sm" 
                        ? "w-1 h-1 bg-white/60 dark:bg-black/40" 
                        : size === "md" 
                          ? "w-1.5 h-1.5 bg-white/70 dark:bg-black/50" 
                          : "w-2 h-2 bg-white/80 dark:bg-black/60",
                      isActive ? "bg-white dark:bg-white" : "opacity-40"
                    )}
                    style={isVertical ? { bottom: `${pct}%` } : { left: `${pct}%` }}
                  />
                );
              })}

            {/* Thumbs */}
            {!hideThumb &&
              values.map((val, idx) => {
                const pct = getPercentage(val);
                
                const thumbElem = (
                  <div
                    className={clsx(
                      "border-2 shadow-md outline-none cursor-grab active:cursor-grabbing transition-transform",
                      showOutline ? "ring-2 ring-background border-primary" : "border-2",
                      !disableThumbScale && "hover:scale-115 active:scale-95",
                      sizes.thumb,
                      radiusClasses[radius],
                      colors.thumb
                    )}
                  />
                );

                return (
                  <div
                    key={idx}
                    className={clsx(
                      "absolute -translate-x-1/2 flex items-center justify-center",
                      isVertical ? "translate-y-1/2" : "-translate-y-1/2",
                      "focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
                    )}
                    style={isVertical ? { bottom: `${pct}%`, left: "50%" } : { left: `${pct}%`, top: "50%" }}
                  >
                    {showTooltip ? (
                      <Tooltip
                        repositionDeps={[val]}
                        placement={isVertical ? "right" : "top"}
                        color="foreground"
                        offset={10}
                        showArrow
                        triggerClassName="flex items-center justify-center"
                        isOpen={isDragging && activeThumbIndexRef.current === idx ? true : undefined}
                        content={formatVal(val, tooltipValueFormatOptions)}
                      >
                        {thumbElem}
                      </Tooltip>
                    ) : (
                      thumbElem
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {endContent && <div className="flex shrink-0">{endContent}</div>}
      </div>

      {/* Marks & Labels */}
      {marks.length > 0 && (
        <div
          className={clsx(
            "relative mt-1.5 text-xs text-neutral-500",
            isVertical ? "h-full w-full left-6" : "w-full h-5"
          )}
        >
          {marks.map((mark, i) => {
            const pct = getPercentage(mark.value);
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => handleMarkClick(e, mark.value)}
                className="absolute -translate-x-1/2 text-neutral-400 dark:text-neutral-500 hover:text-foreground dark:hover:text-foreground font-semibold whitespace-nowrap cursor-pointer transition-colors bg-transparent border-none p-0 outline-none"
                style={
                  isVertical
                    ? { bottom: `${pct}%`, left: "0px", transform: "translateY(50%)" }
                    : { left: `${pct}%` }
                }
              >
                {mark.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Slider;
