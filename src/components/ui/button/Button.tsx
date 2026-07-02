import React from "react";
import clsx from "clsx";
import { useSelector } from "react-redux";
import type { IApplicationState } from "../../../store/state/app-state";
import Spinner from "../spinner/Spinner";


interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isIconOnly?: boolean;
  isLoading?: boolean;
  spinner?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const sizeClasses = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const iconOnlySizeClasses = {
  xs: "w-6 h-6 p-0 justify-center aspect-square",
  sm: "w-9 h-9 p-0 justify-center aspect-square",
  md: "w-10 h-10 p-0 justify-center aspect-square",
  lg: "w-12 h-12 p-0 justify-center aspect-square",
};

const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

const baseClasses =
  "z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu active:scale-[0.97] cursor-pointer outline-solid outline-transparent [&>svg]:max-w-[theme(spacing.8)] transition-all duration-200 motion-reduce:transition-none border-2";

const variantColorClasses: Record<string, Record<string, string>> = {
  solid: {
    default: "border-transparent bg-default text-default-foreground hover:opacity-90",
    primary: "border-transparent bg-primary text-primary-foreground hover:opacity-90",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:opacity-90",
    success: "border-transparent bg-success text-success-foreground hover:opacity-90",
    warning: "border-transparent bg-warning text-warning-foreground hover:opacity-90",
    danger: "border-transparent bg-danger text-danger-foreground hover:opacity-90",
  },
  bordered: {
    default: "border-default-300 bg-transparent text-default-foreground hover:bg-default-100",
    primary: "border-primary bg-transparent text-primary hover:bg-primary-50",
    secondary: "border-secondary bg-transparent text-secondary hover:bg-secondary-50",
    success: "border-success bg-transparent text-success hover:bg-success-50",
    warning: "border-warning bg-transparent text-warning hover:bg-warning-50",
    danger: "border-danger bg-transparent text-danger hover:bg-danger-50",
  },
  light: {
    default: "border-transparent bg-transparent text-default-foreground hover:bg-default-100",
    primary: "border-transparent bg-transparent text-primary hover:bg-primary-50",
    secondary: "border-transparent bg-transparent text-secondary hover:bg-secondary-50",
    success: "border-transparent bg-transparent text-success hover:bg-success-50",
    warning: "border-transparent bg-transparent text-warning hover:bg-warning-50",
    danger: "border-transparent bg-transparent text-danger hover:bg-danger-50",
  },
  flat: {
    default: "border-transparent bg-default-100 text-default-foreground hover:bg-default-200",
    primary: "border-transparent bg-primary-50 text-primary hover:bg-primary-100",
    secondary: "border-transparent bg-secondary-50 text-secondary hover:bg-secondary-100",
    success: "border-transparent bg-success-50 text-success hover:bg-success-100",
    warning: "border-transparent bg-warning-50 text-warning hover:bg-warning-100",
    danger: "border-transparent bg-danger-50 text-danger hover:bg-danger-100",
  },
  faded: {
    default: "border-default-200 bg-default-50 text-default-foreground hover:border-default-400 hover:bg-default-100",
    primary: "border-default-200 bg-default-50 text-primary hover:border-primary hover:bg-primary-50",
    secondary: "border-default-200 bg-default-50 text-secondary hover:border-secondary hover:bg-secondary-50",
    success: "border-default-200 bg-default-50 text-success hover:border-success hover:bg-success-50",
    warning: "border-default-200 bg-default-50 text-warning hover:border-warning hover:bg-warning-50",
    danger: "border-default-200 bg-default-50 text-danger hover:border-danger hover:bg-danger-50",
  },
  shadow: {
    default: "border-transparent shadow-lg shadow-[color-mix(in_srgb,var(--color-default)_40%,transparent)] bg-default text-default-foreground hover:opacity-90",
    primary: "border-transparent shadow-lg shadow-[color-mix(in_srgb,var(--color-primary)_40%,transparent)] bg-primary text-primary-foreground hover:opacity-90",
    secondary: "border-transparent shadow-lg shadow-[color-mix(in_srgb,var(--color-secondary)_40%,transparent)] bg-secondary text-secondary-foreground hover:opacity-90",
    success: "border-transparent shadow-lg shadow-[color-mix(in_srgb,var(--color-success)_40%,transparent)] bg-success text-success-foreground hover:opacity-90",
    warning: "border-transparent shadow-lg shadow-[color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-warning text-warning-foreground hover:opacity-90",
    danger: "border-transparent shadow-lg shadow-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-danger text-danger-foreground hover:opacity-90",
  },
  ghost: {
    default: "border-default bg-transparent text-default-foreground hover:bg-default hover:text-default-foreground",
    primary: "border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
    secondary: "border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-secondary-foreground",
    success: "border-success bg-transparent text-success hover:bg-success hover:text-success-foreground",
    warning: "border-warning bg-transparent text-warning hover:bg-warning hover:text-warning-foreground",
    danger: "border-danger bg-transparent text-danger hover:bg-danger hover:text-danger-foreground",
  },
};

const Button: React.FC<ButtonProps> = ({
  variant = "solid",
  color = "primary",
  size = "md",
  radius = "md",
  startContent,
  endContent,
  isIconOnly = false,
  isLoading = false,
  spinner,
  fullWidth = false,
  children,
  className,
  disabled,
  type = "button",
  onClick,
  ...props
}) => {
  const globalFormLoading = useSelector((state: IApplicationState) => state.GeneralData?.formLoading);
  const isCurrentlyLoading = isLoading || (type === "submit" && globalFormLoading);

  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const rippleIdRef = React.useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isCurrentlyLoading) return;

    const isKeyboardClick = e.clientX === 0 && e.clientY === 0;
    if (!isKeyboardClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const id = rippleIdRef.current++;
      setRipples((prev) => [...prev, { id, x, y, size }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const comboClasses = variantColorClasses[variant]?.[color] || variantColorClasses.solid.primary;

  return (
    <button
      type={type}
      disabled={disabled || isCurrentlyLoading}
      onClick={handleClick}
      className={clsx(
        baseClasses,
        "inline-flex items-center gap-2 font-medium transition-all duration-200",
        "outline-none focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",

        comboClasses,
        radiusClasses[radius],
        isIconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],

        fullWidth && "w-full",

        className
      )}
      {...props}
    >
      {isCurrentlyLoading ? (
        isIconOnly ? (
          spinner !== undefined ? spinner : (
            <Spinner size={size === "lg" ? "md" : "sm"} color="current" />
          )
        ) : (
          <>
            {spinner !== undefined ? spinner : (
              <Spinner size={size === "lg" ? "md" : "sm"} color="current" />
            )}
            <span className="relative z-10">{children}</span>
            {endContent}
          </>
        )
      ) : (
        <>
          {startContent}
          <span className="relative z-10">{children}</span>
          {endContent}
        </>
      )}

      {/* Ripple Elements */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-current opacity-25 pointer-events-none animate-ripple scale-0"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  );
};

export default Button;