import React from "react";
import clsx from "clsx";

export interface ToggleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: any;
  selected?: boolean;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  isDisabled?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const colorClasses = {
  default: {
    selected: "bg-default-200 dark:bg-default-200 text-default-foreground border-default-400 dark:border-default-300",
    unselected: "hover:bg-default-50 text-default-600 dark:text-default-400 hover:text-default-800 dark:hover:text-default-200 dark:hover:bg-default-100/50 border-default-200 dark:border-default-100/30",
  },
  primary: {
    selected: "bg-primary-50 dark:bg-primary-950/40 text-primary dark:text-primary-400 border-primary/40 dark:border-primary/30",
    unselected: "hover:bg-default-50 text-default-600 dark:text-default-400 hover:text-primary dark:hover:text-primary-450 dark:hover:bg-primary/10 border-default-200 dark:border-default-100/30",
  },
  secondary: {
    selected: "bg-secondary-50 dark:bg-secondary-950/40 text-secondary dark:text-secondary-400 border-secondary/40 dark:border-secondary/30",
    unselected: "hover:bg-default-50 text-default-600 dark:text-default-400 hover:text-secondary dark:hover:text-secondary-450 dark:hover:bg-secondary/10 border-default-200 dark:border-default-100/30",
  },
  success: {
    selected: "bg-success-50 dark:bg-success-950/40 text-success dark:text-success-400 border-success/40 dark:border-success/30",
    unselected: "hover:bg-default-50 text-default-600 dark:text-default-400 hover:text-success dark:hover:text-success-450 dark:hover:bg-success/10 border-default-200 dark:border-default-100/30",
  },
  warning: {
    selected: "bg-warning-50 dark:bg-warning-950/40 text-warning dark:text-warning-400 border-warning/40 dark:border-warning/30",
    unselected: "hover:bg-default-50 text-default-600 dark:text-default-400 hover:text-warning dark:hover:text-warning-450 dark:hover:bg-warning/10 border-default-200 dark:border-default-100/30",
  },
  danger: {
    selected: "bg-danger-50 dark:bg-danger-950/40 text-danger dark:text-danger-400 border-danger/40 dark:border-danger/30",
    unselected: "hover:bg-default-50 text-default-600 dark:text-default-400 hover:text-danger dark:hover:text-danger-450 dark:hover:bg-danger/10 border-default-200 dark:border-default-100/30",
  },
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs gap-1.5 h-8",
  md: "px-4 py-2 text-sm gap-2 h-10",
  lg: "px-5 py-2.5 text-base gap-2.5 h-12",
};

const ToggleButton: React.FC<ToggleButtonProps> = ({
  value,
  selected = false,
  color = "default",
  size = "md",
  isDisabled = false,
  fullWidth = false,
  children,
  className,
  onClick,
  ...props
}) => {
  const activeColor = colorClasses[color] || colorClasses.default;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={clsx(
        "inline-flex items-center justify-center font-semibold border transition-all duration-200 select-none outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-focus",
        "disabled:opacity-50 disabled:pointer-events-none",
        sizeClasses[size],
        selected ? [activeColor.selected, "relative z-10"] : activeColor.unselected,
        fullWidth && "w-full",
        className
      )}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default ToggleButton;
