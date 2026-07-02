import React from "react";
import { FaXmark } from "react-icons/fa6";
import clsx from "clsx";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "dot";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  onClose?: () => void;
  isDisabled?: boolean;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: "px-2 h-6 text-[10px]",
  md: "px-3 h-7 text-xs",
  lg: "px-4 h-8 text-sm",
};

const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const baseClasses =
  "relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap transition-all duration-200 select-none";

const variantColorClasses: Record<string, Record<string, string>> = {
  solid: {
    default:   "border-2 border-default-600 bg-default-600 text-default-foreground",
    primary:   "border-2 border-primary bg-primary text-primary-foreground",
    secondary: "border-2 border-secondary bg-secondary text-secondary-foreground",
    success:   "border-2 border-success bg-success text-success-foreground",
    warning:   "border-2 border-warning bg-warning text-warning-foreground",
    danger:    "border-2 border-danger bg-danger text-danger-foreground",
  },
  bordered: {
    default:   "border-2 border-default-400 dark:border-default-500 bg-transparent text-default-800 dark:text-default-800",
    primary:   "border-2 border-primary bg-transparent text-primary",
    secondary: "border-2 border-secondary bg-transparent text-secondary",
    success:   "border-2 border-success bg-transparent text-success",
    warning:   "border-2 border-warning bg-transparent text-warning",
    danger:    "border-2 border-danger bg-transparent text-danger",
  },
  light: {
    default:   "border-2 border-transparent bg-transparent text-default-800 dark:text-default-800",
    primary:   "border-2 border-transparent bg-transparent text-primary",
    secondary: "border-2 border-transparent bg-transparent text-secondary",
    success:   "border-2 border-transparent bg-transparent text-success",
    warning:   "border-2 border-transparent bg-transparent text-warning",
    danger:    "border-2 border-transparent bg-transparent text-danger",
  },
  flat: {
    default:   "border-2 border-transparent bg-default-100 dark:bg-default-200 text-default-800 dark:text-default-800",
    primary:   "border-2 border-transparent bg-primary-100 text-primary",
    secondary: "border-2 border-transparent bg-secondary-100 text-secondary",
    success:   "border-2 border-transparent bg-success-100 text-success",
    warning:   "border-2 border-transparent bg-warning-100 text-warning",
    danger:    "border-2 border-transparent bg-danger-100 text-danger",
  },
  faded: {
    default:   "border-2 border-default-600/20 bg-default-100 text-default-800 dark:text-default-800",
    primary:   "border-2 border-primary-200 bg-primary-50 text-primary",
    secondary: "border-2 border-secondary-200 bg-secondary-50 text-secondary",
    success:   "border-2 border-success-200 bg-success-50 text-success",
    warning:   "border-2 border-warning-200 bg-warning-50 text-warning",
    danger:    "border-2 border-danger-200 bg-danger-50 text-danger",
  },
  shadow: {
    default:   "border-2 border-default-600 shadow-lg shadow-[color-mix(in_srgb,var(--color-default-600)_40%,transparent)] bg-default-600 text-default-foreground",
    primary:   "border-2 border-primary shadow-lg shadow-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] bg-primary text-primary-foreground",
    secondary: "border-2 border-secondary shadow-lg shadow-[color-mix(in_srgb,var(--color-secondary)_40%,transparent)] bg-secondary text-secondary-foreground",
    success:   "border-2 border-success shadow-lg shadow-[color-mix(in_srgb,var(--color-success)_40%,transparent)] bg-success text-success-foreground",
    warning:   "border-2 border-warning shadow-lg shadow-[color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-warning text-warning-foreground",
    danger:    "border-2 border-danger shadow-lg shadow-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-danger text-danger-foreground",
  },
  dot: {
    default:   "border-2 border-default-600/20 bg-transparent text-default-800 dark:text-default-800",
    primary:   "border-2 border-primary/20 bg-transparent text-primary",
    secondary: "border-2 border-secondary/20 bg-transparent text-secondary",
    success:   "border-2 border-success/20 bg-transparent text-success",
    warning:   "border-2 border-warning/20 bg-transparent text-warning",
    danger:    "border-2 border-danger/20 bg-transparent text-danger",
  },
};

const dotColorClasses: Record<string, string> = {
  default: "bg-default-600",
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const Chip: React.FC<ChipProps> = ({
  variant = "solid",
  color = "primary",
  size = "md",
  radius = "full",
  startContent,
  endContent,
  onClose,
  isDisabled = false,
  children,
  className,
  ...props
}) => {
  const comboClasses = variantColorClasses[variant]?.[color] || variantColorClasses.solid.default;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose();
  };

  return (
    <div
      className={clsx(
        baseClasses,
        comboClasses,
        sizeClasses[size],
        radiusClasses[radius],
        isDisabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      <div className={clsx("flex items-center gap-1.5", variant === "dot" ? "pl-0 pr-1" : "px-1")}>
        {variant === "dot" && (
          <span className={clsx("w-1.5 h-1.5 rounded-full ml-1", dotColorClasses[color])} />
        )}
        
        {startContent && (
          <span className="inline-flex items-center justify-center">
            {startContent}
          </span>
        )}
        
        <span className="flex-1 font-medium">
          {children}
        </span>
        
        {endContent && !onClose && (
          <span className="inline-flex items-center justify-center">
            {endContent}
          </span>
        )}
        
        {onClose && (
          <button
            type="button"
            onClick={handleClose}
            className={clsx(
              "p-0.5 rounded-full hover:bg-black/10 transition-colors inline-flex items-center justify-center outline-none",
              size === "sm" ? "w-3.5 h-3.5" : size === "md" ? "w-4 h-4" : "w-4.5 h-4.5"
            )}
            aria-label="Close chip"
          >
            {endContent || (
              <FaXmark className="w-full h-full" aria-hidden />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Chip;
