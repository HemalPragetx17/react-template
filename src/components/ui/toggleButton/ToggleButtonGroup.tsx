import React from "react";
import clsx from "clsx";
import { type ToggleButtonProps } from "./ToggleButton";

export interface ToggleButtonGroupProps {
  value: any;
  onChange: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  exclusive?: boolean;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  value,
  onChange,
  exclusive = false,
  color = "default",
  size = "md",
  isDisabled = false,
  orientation = "horizontal",
  fullWidth = false,
  children,
  className,
}) => {
  const isVertical = orientation === "vertical";

  // Filter out invalid/empty children
  const validChildren = React.Children.toArray(children).filter(React.isValidElement);

  const handleButtonClick = (
    event: React.MouseEvent<HTMLElement>,
    buttonValue: any
  ) => {
    if (isDisabled) return;

    if (exclusive) {
      // Single selection: toggle off if already selected, otherwise select
      const newValue = value === buttonValue ? null : buttonValue;
      onChange(event, newValue);
    } else {
      // Multi selection: array of values
      const currentValues = Array.isArray(value) ? value : [];
      const index = currentValues.indexOf(buttonValue);
      let newValues: any[];

      if (index > -1) {
        newValues = currentValues.filter((v) => v !== buttonValue);
      } else {
        newValues = [...currentValues, buttonValue];
      }
      onChange(event, newValues);
    }
  };

  return (
    <div
      className={clsx(
        "inline-flex",
        isVertical ? "flex-col" : "flex-row",
        fullWidth && "w-full flex",
        className
      )}
      role="group"
    >
      {validChildren.map((child, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === validChildren.length - 1;

        const buttonProps = child.props as ToggleButtonProps;
        const isSelected = exclusive
          ? value === buttonProps.value
          : Array.isArray(value) && value.includes(buttonProps.value);

        // Compute roundness classes based on position and orientation
        let roundnessClass = "rounded-none";
        if (validChildren.length === 1) {
          roundnessClass = "rounded-lg";
        } else if (isFirst) {
          roundnessClass = isVertical ? "rounded-t-lg rounded-b-none" : "rounded-l-lg rounded-r-none";
        } else if (isLast) {
          roundnessClass = isVertical ? "rounded-b-lg rounded-t-none" : "rounded-r-lg rounded-l-none";
        }

        // Avoid double borders by applying negative margin to sibling buttons
        const borderSpacingClass = isFirst
          ? ""
          : isVertical
            ? "-mt-[1px]"
            : "-ml-[1px]";

        return React.cloneElement(child as React.ReactElement<any>, {
          selected: isSelected,
          color: buttonProps.color || color,
          size: buttonProps.size || size,
          isDisabled: buttonProps.isDisabled || isDisabled,
          fullWidth: buttonProps.fullWidth || (fullWidth && !isVertical),
          className: clsx(
            roundnessClass,
            borderSpacingClass,
            buttonProps.className
          ),
          onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
            handleButtonClick(e, buttonProps.value);
            if (buttonProps.onClick) {
              buttonProps.onClick(e);
            }
          },
        });
      })}
    </div>
  );
};

export default ToggleButtonGroup;
