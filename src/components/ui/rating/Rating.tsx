import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { FaStar } from "react-icons/fa6";

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  count?: number;
  onChange?: (value: number) => void;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  customIcon?: (isActive: boolean, isHalf: boolean) => React.ReactNode;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  allowHalf?: boolean;
  name?: string;
  className?: string;
}

const colorClasses = {
  default: "text-default-700 dark:text-default-200",
  primary: "text-primary dark:text-primary-400",
  secondary: "text-secondary dark:text-secondary-400",
  success: "text-success dark:text-success-400",
  warning: "text-warning dark:text-warning",
  danger: "text-danger dark:text-danger-400",
};

const sizeClasses = {
  sm: "w-4 h-4 text-base flex items-center justify-center",
  md: "w-6 h-6 text-2xl flex items-center justify-center",
  lg: "w-8 h-8 text-3xl flex items-center justify-center",
};

const sizeWidths = {
  sm: "16px",
  md: "24px",
  lg: "32px",
};

const Rating: React.FC<RatingProps> = ({
  value: controlledValue,
  defaultValue,
  count = 5,
  onChange,
  color = "primary",
  size = "md",
  icon,
  customIcon,
  isDisabled = false,
  isReadOnly = false,
  allowHalf = false,
  name,
  className,
}) => {
  const getInitialValue = () => {
    if (controlledValue !== undefined) return controlledValue;
    if (defaultValue !== undefined) return defaultValue;
    return 0;
  };

  const [value, setValue] = useState<number>(getInitialValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  const activeValue = hoverValue !== null ? hoverValue : value;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (isDisabled || isReadOnly) return;

    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element.
      const isLeftHalf = x < rect.width / 2;
      setHoverValue(index + (isLeftHalf ? 0.5 : 1));
    } else {
      setHoverValue(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (isDisabled || isReadOnly) return;
    setHoverValue(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (isDisabled || isReadOnly) return;

    let newValue = index + 1;
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      newValue = index + (x < rect.width / 2 ? 0.5 : 1);
    }

    if (controlledValue === undefined) {
      setValue(newValue);
    }

    if (onChange) {
      onChange(newValue);
    }
  };

  const renderIcon = (index: number) => {
    // Calculate precise fill percentage for the star
    let fillPercent = 0;
    if (activeValue >= index + 1) {
      fillPercent = 100;
    } else if (activeValue > index) {
      fillPercent = (activeValue - index) * 100;
    }

    if (customIcon) {
      return customIcon(activeValue > index, activeValue - index === 0.5);
    }

    const baseIcon = icon || <FaStar className="w-full h-full" />;

    return (
      <div className="relative inline-flex items-center justify-center select-none w-full h-full">
        {/* Empty Background Star */}
        <div className="text-default-200 dark:text-neutral-800 transition-colors duration-150 w-full h-full flex items-center justify-center">
          {baseIcon}
        </div>
        
        {/* Filled Highlight Star Overlay */}
        {fillPercent > 0 && (
          <div
            className="absolute top-0 left-0 overflow-hidden h-full pointer-events-none"
            style={{ width: `${fillPercent}%` }}
          >
            <div
              className={clsx(colorClasses[color], "h-full flex items-center justify-center shrink-0")}
              style={{ width: sizeWidths[size] }}
            >
              {baseIcon}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "inline-flex items-center gap-1.5",
        isDisabled && "opacity-45 pointer-events-none",
        !isReadOnly && !isDisabled && "cursor-pointer",
        className
      )}
      onMouseLeave={handleMouseLeave}
    >
      {name && <input type="hidden" name={name} value={value} />}
      
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            "transition-transform duration-100",
            !isReadOnly && !isDisabled && "hover:scale-115 active:scale-95",
            sizeClasses[size]
          )}
          onMouseMove={(e) => handleMouseMove(e, index)}
          onClick={(e) => handleClick(e, index)}
        >
          {renderIcon(index)}
        </div>
      ))}
    </div>
  );
};

export default Rating;
