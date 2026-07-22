import React from "react";
import clsx from "clsx";

export interface SpinnerProps {
  /**
   * The color theme of the spinner.
   * @default "primary"
   */
  color?: "current" | "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  /**
   * The size of the spinner.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * The visual variant style of the spinner.
   * @default "default"
   */
  variant?: "default" | "simple" | "gradient" | "spinner" | "wave" | "dots";
  /**
   * Optional text label to display below the spinner.
   */
  label?: string;
  /**
   * The color of the label text.
   * @default matches spinner's color
   */
  labelColor?: "current" | "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  /**
   * Additional CSS classes to apply to the container.
   */
  className?: string;
}

const colorClasses = {
  current: "text-current",
  default: "text-default-600 dark:text-default-600",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const labelColorClasses = {
  current: "text-current",
  default: "text-default-600 dark:text-default-600",
  primary: "text-primary",
  secondary: "text-secondary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const sizeClasses = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const circleBorderClasses = {
  sm: "spinner-border-sm",
  md: "spinner-border-md",
  lg: "spinner-border-lg",
};

const dotSizeClasses = {
  sm: "spinner-dot-sm",
  md: "spinner-dot-md",
  lg: "spinner-dot-lg",
};

const dotGapClasses = {
  sm: "spinner-dot-gap-sm",
  md: "spinner-dot-gap-md",
  lg: "spinner-dot-gap-lg",
};

const barSizeClasses = {
  sm: "spinner-bar-sm",
  md: "spinner-bar-md",
  lg: "spinner-bar-lg",
};

const labelSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const maskStyles = {
  sm: {
    maskImage: "radial-gradient(closest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
    WebkitMaskImage: "radial-gradient(closest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
  },
  md: {
    maskImage: "radial-gradient(closest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
    WebkitMaskImage: "radial-gradient(closest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
  },
  lg: {
    maskImage: "radial-gradient(closest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
    WebkitMaskImage: "radial-gradient(closest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
  },
};

const Spinner: React.FC<SpinnerProps> = ({
  color = "primary",
  size = "md",
  variant = "default",
  label,
  labelColor,
  className,
}) => {
  const activeLabelColor = labelColor || color;

  const renderSpinner = () => {
    switch (variant) {
      case "simple":
        return (
          <div className={clsx("relative", sizeClasses[size])}>
            <svg className="animate-spin w-full h-full text-current" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={size === "sm" ? 2 : size === "md" ? 3 : 4}
                fill="none"
              />
              <circle
                className="opacity-75"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={size === "sm" ? 2 : size === "md" ? 3 : 4}
                strokeDashoffset="60"
                strokeDasharray="100"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        );

      case "gradient":
        return (
          <div className={clsx("relative", sizeClasses[size])}>
            <span
              className="absolute block w-full h-full rounded-full border-0 spinner-gradient-circle animate-spinner-spin-gradient"
              style={maskStyles[size]}
            />
          </div>
        );

      case "spinner":
        return (
          <div className={clsx("relative", sizeClasses[size])}>
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className={clsx("absolute block rounded-full spinner-bar-animation", barSizeClasses[size])}
                style={{
                  animationDelay: `${-1.2 + i * 0.1}s`,
                  transform: `rotate(${i * 30}deg) translate(140%)`,
                }}
              />
            ))}
          </div>
        );

      case "wave":
        return (
          <div className={clsx("flex items-center justify-center translate-y-[20%]", sizeClasses[size], dotGapClasses[size])}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={clsx("block rounded-full spinner-dot animate-spinner-sway", dotSizeClasses[size])}
                style={{
                  animationDelay: `${(i - 2) * 0.16}s`,
                }}
              />
            ))}
          </div>
        );

      case "dots":
        return (
          <div className={clsx("flex items-center justify-center", dotGapClasses[size])}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={clsx("block rounded-full spinner-dot animate-spinner-blink", dotSizeClasses[size])}
                style={{
                  animationDelay: `${(i - 2) * 0.2}s`,
                }}
              />
            ))}
          </div>
        );

      case "default":
      default:
        return (
          <div className={clsx("relative", sizeClasses[size])}>
            <span
              className={clsx(
                "absolute block w-full h-full rounded-full border-solid border-t-transparent border-l-transparent border-r-transparent border-b-current spinner-circle-default-1 animate-spinner-spin-ease",
                circleBorderClasses[size]
              )}
            />
            <span
              className={clsx(
                "absolute block w-full h-full rounded-full border-dotted border-t-transparent border-l-transparent border-r-transparent border-b-current opacity-75 spinner-circle-default-2 animate-spinner-spin-linear",
                circleBorderClasses[size]
              )}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={clsx(
        "inline-flex flex-col items-center justify-center gap-2",
        colorClasses[color],
        className
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spinner-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinner-sway {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-120%); }
        }
        @keyframes spinner-blink {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes spinner-fade-out {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
        .animate-spinner-spin-ease {
          animation-name: spinner-spin !important;
          animation-duration: 0.8s !important;
          animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
          animation-iteration-count: infinite !important;
        }
        .animate-spinner-spin-linear {
          animation-name: spinner-spin !important;
          animation-duration: 0.8s !important;
          animation-timing-function: linear !important;
          animation-iteration-count: infinite !important;
        }
        .animate-spinner-spin-gradient {
          animation-name: spinner-spin !important;
          animation-duration: 1s !important;
          animation-timing-function: linear !important;
          animation-iteration-count: infinite !important;
        }
        .animate-spinner-sway {
          animation-name: spinner-sway !important;
          animation-duration: 1.2s !important;
          animation-timing-function: ease-in-out !important;
          animation-iteration-count: infinite !important;
        }
        .animate-spinner-blink {
          animation-name: spinner-blink !important;
          animation-duration: 1.4s !important;
          animation-timing-function: ease-in-out !important;
          animation-iteration-count: infinite !important;
          animation-fill-mode: both !important;
        }
        .spinner-border-sm { border-width: 2px !important; }
        .spinner-border-md { border-width: 3px !important; }
        .spinner-border-lg { border-width: 4px !important; }
        .spinner-circle-default-1 {
          border-top-color: transparent !important;
          border-left-color: transparent !important;
          border-right-color: transparent !important;
          border-bottom-color: currentColor !important;
        }
        .spinner-circle-default-2 {
          border-top-color: transparent !important;
          border-left-color: transparent !important;
          border-right-color: transparent !important;
          border-bottom-color: currentColor !important;
        }
        .spinner-gradient-circle {
          background: linear-gradient(to bottom, transparent, transparent, currentColor) !important;
        }
        .spinner-dot-sm { width: 5px !important; height: 5px !important; }
        .spinner-dot-md { width: 7px !important; height: 7px !important; }
        .spinner-dot-lg { width: 9px !important; height: 9px !important; }
        .spinner-dot-gap-sm { gap: 4px !important; }
        .spinner-dot-gap-md { gap: 6px !important; }
        .spinner-dot-gap-lg { gap: 8px !important; }
        .spinner-dot {
          background-color: currentColor !important;
        }
        .spinner-bar-sm {
          width: 5px !important;
          height: 1.5px !important;
          left: 7.5px !important;
          top: 9.25px !important;
        }
        .spinner-bar-md {
          width: 8px !important;
          height: 2.5px !important;
          left: 12px !important;
          top: 14.75px !important;
        }
        .spinner-bar-lg {
          width: 10px !important;
          height: 3px !important;
          left: 15px !important;
          top: 18.5px !important;
        }
        .spinner-bar-animation {
          background-color: currentColor !important;
          animation-name: spinner-fade-out !important;
          animation-duration: 1.2s !important;
          animation-timing-function: linear !important;
          animation-iteration-count: infinite !important;
        }
      `}} />
      {renderSpinner()}
      {label && (
        <span className={clsx("font-normal select-none mt-1", labelSizeClasses[size], labelColorClasses[activeLabelColor])}>
          {label}
        </span>
      )}
    </div>
  );
};

export default Spinner;
