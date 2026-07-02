import React from "react";
import Popover, { type PopoverProps } from "../popover/Popover";

export interface TooltipProps extends Omit<PopoverProps, "trigger" | "children" | "triggerMode"> {
  /** The content to show inside the tooltip */
  content: React.ReactNode;
  /** The element that triggers the tooltip on hover */
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  color = "foreground",
  size = "md",
  radius = "md",
  shadow = "md",
  showArrow = true,
  offset = 8,
  className = "",
  delay = { open: 0, close: 100 },
  ...props
}) => {
  return (
    <Popover
      trigger={children}
      placement={placement}
      color={color}
      size={size}
      radius={radius}
      shadow={shadow}
      showArrow={showArrow}
      offset={offset}
      triggerMode="hover"
      delay={delay}
      className={className}
      {...props}
    >
      <div className="px-2.5 py-1 text-xs font-medium">
        {content}
      </div>
    </Popover>
  );
};

export default Tooltip;
