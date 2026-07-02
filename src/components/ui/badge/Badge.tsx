import React, { forwardRef } from "react";

export type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";
export type BadgeColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
export type BadgeVariant = "solid" | "flat" | "faded" | "shadow";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "circle" | "rectangle";

export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content"> {
  content?: React.ReactNode;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  placement?: BadgePlacement;
  shape?: BadgeShape;
  isInvisible?: boolean;
  showOutline?: boolean;
  isOneChar?: boolean;
  children?: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
  const {
    content,
    variant = "solid",
    color = "default",
    size = "md",
    placement = "top-right",
    shape = "rectangle",
    isInvisible = false,
    showOutline = true,
    isOneChar = false,
    children,
    className = "",
    ...restProps
  } = props;

  // Placement positioning classes based on shape
  const placementClasses = {
    rectangle: {
      "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
      "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
      "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
      "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    },
    circle: {
      "top-right": "top-[12%] right-[12%] translate-x-1/2 -translate-y-1/2",
      "top-left": "top-[12%] left-[12%] -translate-x-1/2 -translate-y-1/2",
      "bottom-right": "bottom-[12%] right-[12%] translate-x-1/2 translate-y-1/2",
      "bottom-left": "bottom-[12%] left-[12%] -translate-x-1/2 translate-y-1/2",
    },
  };

  // Size configurations for dots (no content)
  const dotSizeClasses = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4.5 h-4.5",
  };

  // Size configurations for badge with content
  const contentSizeClasses = {
    sm: "h-5 min-w-5 text-[10px] px-1",
    md: "h-6 min-w-6 text-xs px-1.5",
    lg: "h-7 min-w-7 text-sm px-2",
  };

  // Size override configurations for single-character badges
  const oneCharClasses = {
    sm: "w-5 h-5 px-0",
    md: "w-6 h-6 px-0",
    lg: "w-7 h-7 px-0",
  };

  // Variant/Color combination classes
  const variantColorClasses = {
    solid: {
      default: "bg-default-200 text-default-800 dark:bg-default-700 dark:text-default-100",
      primary: "bg-primary text-white",
      secondary: "bg-secondary text-white",
      success: "bg-success text-white",
      warning: "bg-warning text-black",
      danger: "bg-danger text-white",
    },
    flat: {
      default: "bg-default-100 text-default-800 dark:bg-default-800 dark:text-default-200",
      primary: "bg-primary-50 text-primary",
      secondary: "bg-secondary-50 text-secondary",
      success: "bg-success-50 text-success",
      warning: "bg-warning-50 text-warning",
      danger: "bg-danger-50 text-danger",
    },
    faded: {
      default: "bg-default-100 border border-default-200 text-default-800 dark:bg-default-900 dark:border-default-800 dark:text-default-200",
      primary: "bg-neutral-100 border border-primary/30 text-primary dark:bg-neutral-900 dark:border-primary/50",
      secondary: "bg-neutral-100 border border-secondary/30 text-secondary dark:bg-neutral-900 dark:border-secondary/50",
      success: "bg-neutral-100 border border-success/30 text-success dark:bg-neutral-900 dark:border-success/50",
      warning: "bg-neutral-100 border border-warning/40 text-warning dark:bg-neutral-900 dark:border-warning/60",
      danger: "bg-neutral-100 border border-danger/30 text-danger dark:bg-neutral-900 dark:border-danger/50",
    },
    shadow: {
      default: "bg-default-200 text-default-800 shadow-lg shadow-default-400/40",
      primary: "bg-primary text-white shadow-lg shadow-primary/40",
      secondary: "bg-secondary text-white shadow-lg shadow-secondary/40",
      success: "bg-success text-white shadow-lg shadow-success/40",
      warning: "bg-warning text-black shadow-lg shadow-warning/60",
      danger: "bg-danger text-white shadow-lg shadow-danger/40",
    },
  };

  const isDot = content === undefined || content === null;

  const currentPlacementClass = placementClasses[shape]?.[placement] || placementClasses.rectangle["top-right"];
  const currentSizeClass = isDot
    ? dotSizeClasses[size]
    : isOneChar
      ? oneCharClasses[size]
      : contentSizeClasses[size];

  const currentColorClass = variantColorClasses[variant]?.[color] || variantColorClasses.solid.default;
  const outlineClass = showOutline
    ? "ring-2 ring-white dark:ring-neutral-950"
    : "";

  return (
    <div className="relative inline-flex shrink-0">
      {children}
      {!isInvisible && (
        <span
          ref={ref}
          className={`
            absolute flex items-center justify-center rounded-full font-semibold leading-none select-none z-10 box-border
            ${currentPlacementClass}
            ${currentSizeClass}
            ${currentColorClass}
            ${outlineClass}
            ${className}
          `}
          {...restProps}
        >
          {!isDot && content}
        </span>
      )}
    </div>
  );
});

Badge.displayName = "Badge";

export default Badge;
