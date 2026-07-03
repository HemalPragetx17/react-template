import React, { createContext, useContext, useState } from "react";
import Popover, { type PopoverPlacement } from "../popover/Popover";
import { getRadiusClass } from "../shared/radius";

// ─── Dropdown Context ────────────────────────────────────────────────────────
interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closeOnSelect: boolean;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used within a Dropdown component");
  }
  return context;
};

// ─── Dropdown Component ──────────────────────────────────────────────────────
export interface DropdownProps {
  children: React.ReactNode;
  placement?: PopoverPlacement;
  showArrow?: boolean;
  closeOnSelect?: boolean;
  disableAnimation?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  placement = "bottom-start",
  showArrow = false,
  closeOnSelect = true,
  disableAnimation = false,
  isOpen: isOpenProp,
  onOpenChange,
}) => {
  const [isOpenState, setIsOpenState] = useState(false);
  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : isOpenState;
  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setIsOpenState(open);
    }
    onOpenChange?.(open);
  };

  // Find trigger and menu in children
  let triggerChild: React.ReactNode = null;
  let menuChild: React.ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === DropdownTrigger) {
        triggerChild = child;
      } else if (child.type === DropdownMenu) {
        menuChild = child;
      }
    }
  });

  if (!triggerChild || !menuChild) {
    return null;
  }

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, closeOnSelect }}>
      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement={placement}
        showArrow={showArrow}
        offset={8}
        trigger={triggerChild}
        disableAnimation={disableAnimation}
        className="p-1 min-w-[200px]"
      >
        {menuChild}
      </Popover>
    </DropdownContext.Provider>
  );
};

// ─── DropdownTrigger ─────────────────────────────────────────────────────────
export interface DropdownTriggerProps {
  children: React.ReactNode;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({ children }) => {
  return <>{children}</>;
};

// ─── DropdownMenu ────────────────────────────────────────────────────────────
export interface DropdownMenuProps {
  children: React.ReactNode;
  ariaLabel?: string;
  variant?: "solid" | "flat" | "bordered" | "faded" | "light" | "shadow";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  disabledKeys?: string[];
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: Set<string> | string[];
  onSelectionChange?: (keys: Set<string>) => void;
  className?: string;
}

interface MenuContextType {
  variant: "solid" | "flat" | "bordered" | "faded" | "light" | "shadow";
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  disabledKeys: Set<string>;
  selectionMode: "none" | "single" | "multiple";
  selectedKeys: Set<string>;
  onSelect: (key: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  variant = "flat",
  color = "default",
  disabledKeys = [],
  selectionMode = "none",
  selectedKeys = new Set(),
  onSelectionChange,
  className = "",
}) => {
  const { setIsOpen, closeOnSelect } = useDropdown();
  const disabledSet = new Set(disabledKeys);
  const selectedSet = new Set(
    selectedKeys instanceof Set ? Array.from(selectedKeys) : selectedKeys
  );

  const handleSelect = (key: string) => {
    if (disabledSet.has(key)) return;

    if (selectionMode !== "none") {
      const nextSelected = new Set(selectedSet);
      if (selectionMode === "single") {
        nextSelected.clear();
        nextSelected.add(key);
      } else {
        if (nextSelected.has(key)) {
          nextSelected.delete(key);
        } else {
          nextSelected.add(key);
        }
      }
      onSelectionChange?.(nextSelected);
    }

    if (closeOnSelect && selectionMode !== "multiple") {
      setIsOpen(false);
    }
  };

  const renderChildren = (childrenNode: React.ReactNode): React.ReactNode => {
    return React.Children.map(childrenNode, (child) => {
      if (!React.isValidElement(child)) return child;

      if (child.type === DropdownItem) {
        const rawKey = child.key;
        // Strip out any react internal prefixing like .$ or .$.
        const cleanKey = rawKey ? String(rawKey).replace(/^\.?\$\.?/, "") : "";
        return React.cloneElement(child, {
          itemKey: cleanKey,
        } as any);
      }

      if (child.type === DropdownSection) {
        return React.cloneElement(child, {
          children: renderChildren(child.props.children),
        } as any);
      }

      return child;
    });
  };

  return (
    <MenuContext.Provider
      value={{
        variant,
        color,
        disabledKeys: disabledSet,
        selectionMode,
        selectedKeys: selectedSet,
        onSelect: handleSelect,
      }}
    >
      <ul className={`flex flex-col gap-0.5 p-1 list-none focus:outline-none ${className}`} role="menu">
        {renderChildren(children)}
      </ul>
    </MenuContext.Provider>
  );
};

// ─── DropdownItem ────────────────────────────────────────────────────────────
export interface DropdownItemProps {
  key?: string;
  itemKey?: string;
  children: React.ReactNode;
  description?: string;
  variant?: "solid" | "flat" | "bordered" | "faded" | "light" | "shadow";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  showDivider?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const itemColorMap: Record<
  string,
  Record<string, { hover: string; selected: string }>
> = {
  default: {
    solid: {
      hover: "hover:bg-default-200 dark:hover:bg-default-800 hover:text-foreground",
      selected: "bg-default-200 dark:bg-default-800 text-foreground"
    },
    flat: {
      hover: "hover:bg-default-100 dark:hover:bg-default-200 hover:text-foreground",
      selected: "bg-default-100 dark:bg-default-200 text-foreground"
    },
    bordered: {
      hover: "hover:border-default-400 hover:bg-default-100 dark:hover:bg-default-200 hover:text-foreground border-2 border-transparent",
      selected: "border-default-400 bg-default-100 dark:bg-default-200 text-foreground border-2"
    },
    faded: {
      hover: "hover:bg-default-100 dark:hover:bg-default-200 hover:text-foreground border border-transparent",
      selected: "bg-default-100 dark:bg-default-200 text-foreground border border-default-200"
    },
    light: {
      hover: "hover:bg-default-100/50 dark:hover:bg-default-200/50 hover:text-foreground",
      selected: "bg-default-100/50 dark:bg-default-200/50 text-foreground"
    },
    shadow: {
      hover: "hover:bg-default-200 dark:hover:bg-default-700 hover:text-foreground hover:shadow-md hover:shadow-default/20",
      selected: "bg-default-200 dark:bg-default-700 text-foreground shadow-md shadow-default/20"
    }
  },
  primary: {
    solid: {
      hover: "hover:bg-primary hover:text-white dark:hover:text-white",
      selected: "bg-primary text-white"
    },
    flat: {
      hover: "hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary dark:hover:text-primary-400",
      selected: "bg-primary-50 dark:bg-primary-950/20 text-primary dark:text-primary-400"
    },
    bordered: {
      hover: "hover:border-primary hover:text-primary hover:bg-primary-50/50 dark:hover:bg-primary-950/10 border-2 border-transparent",
      selected: "border-primary text-primary bg-primary-50/50 dark:bg-primary-950/10 border-2"
    },
    faded: {
      hover: "hover:bg-default-100 dark:hover:bg-default-200 hover:text-primary hover:border-default-200 border border-transparent",
      selected: "bg-default-100 dark:bg-default-200 text-primary border border-default-200"
    },
    light: {
      hover: "hover:text-primary hover:bg-primary-50/30 dark:hover:bg-primary-950/10",
      selected: "text-primary bg-primary-50/30 dark:bg-primary-950/10"
    },
    shadow: {
      hover: "hover:bg-primary hover:text-white dark:hover:text-white hover:shadow-lg hover:shadow-primary/30",
      selected: "bg-primary text-white shadow-lg shadow-primary/30"
    }
  },
  secondary: {
    solid: {
      hover: "hover:bg-secondary hover:text-white dark:hover:text-white",
      selected: "bg-secondary text-white"
    },
    flat: {
      hover: "hover:bg-secondary-50 dark:hover:bg-secondary-950/20 hover:text-secondary dark:hover:text-secondary-400",
      selected: "bg-secondary-50 dark:bg-secondary-950/20 text-secondary dark:text-secondary-400"
    },
    bordered: {
      hover: "hover:border-secondary hover:text-secondary hover:bg-secondary-50/50 dark:hover:bg-secondary-950/10 border-2 border-transparent",
      selected: "border-secondary text-secondary bg-secondary-50/50 dark:bg-secondary-950/10 border-2"
    },
    faded: {
      hover: "hover:bg-default-100 dark:hover:bg-default-200 hover:text-secondary hover:border-default-200 border border-transparent",
      selected: "bg-default-100 dark:bg-default-200 text-secondary border border-default-200"
    },
    light: {
      hover: "hover:text-secondary hover:bg-secondary-50/30 dark:hover:bg-secondary-950/10",
      selected: "text-secondary bg-secondary-50/30 dark:bg-secondary-950/10"
    },
    shadow: {
      hover: "hover:bg-secondary hover:text-white dark:hover:text-white hover:shadow-lg hover:shadow-secondary/30",
      selected: "bg-secondary text-white shadow-lg shadow-secondary/30"
    }
  },
  success: {
    solid: {
      hover: "hover:bg-success hover:text-black dark:hover:text-black",
      selected: "bg-success text-black"
    },
    flat: {
      hover: "hover:bg-success-50 dark:hover:bg-success-950/20 hover:text-success dark:hover:text-success-400",
      selected: "bg-success-50 dark:bg-success-950/20 text-success dark:text-success-400"
    },
    bordered: {
      hover: "hover:border-success hover:text-success hover:bg-success-50/50 dark:hover:bg-success-950/10 border-2 border-transparent",
      selected: "border-success text-success bg-success-50/50 dark:bg-success-950/10 border-2"
    },
    faded: {
      hover: "hover:bg-default-100 dark:hover:bg-default-200 hover:text-success hover:border-default-200 border border-transparent",
      selected: "bg-default-100 dark:bg-default-200 text-success border border-default-200"
    },
    light: {
      hover: "hover:text-success hover:bg-success-50/30 dark:hover:bg-success-950/10",
      selected: "text-success bg-success-50/30 dark:bg-success-950/10"
    },
    shadow: {
      hover: "hover:bg-success hover:text-black dark:hover:text-black hover:shadow-lg hover:shadow-success/30",
      selected: "bg-success text-black shadow-lg shadow-success/30"
    }
  },
  warning: {
    solid: {
      hover: "hover:bg-warning hover:text-black dark:hover:text-black",
      selected: "bg-warning text-black"
    },
    flat: {
      hover: "hover:bg-warning-50 dark:hover:bg-warning-950/20 hover:text-warning dark:hover:text-warning-400",
      selected: "bg-warning-50 dark:bg-warning-950/20 text-warning dark:text-warning-400"
    },
    bordered: {
      hover: "hover:border-warning hover:text-warning hover:bg-warning-50/50 dark:hover:bg-warning-950/10 border-2 border-transparent",
      selected: "border-warning text-warning bg-warning-50/50 dark:bg-warning-950/10 border-2"
    },
    faded: {
      hover: "hover:bg-default-100 dark:hover:bg-default-200 hover:text-warning hover:border-default-200 border border-transparent",
      selected: "bg-default-100 dark:bg-default-200 text-warning border border-warning"
    },
    light: {
      hover: "hover:text-warning hover:bg-warning-50/30 dark:hover:bg-warning-950/10",
      selected: "text-warning bg-warning-50/30 dark:bg-warning-950/10"
    },
    shadow: {
      hover: "hover:bg-warning hover:text-black dark:hover:text-black hover:shadow-lg hover:shadow-warning/30",
      selected: "bg-warning text-black shadow-lg shadow-warning/30"
    }
  },
  danger: {
    solid: {
      hover: "hover:bg-danger hover:text-white dark:hover:text-white",
      selected: "bg-danger text-white"
    },
    flat: {
      hover: "hover:bg-danger-50 dark:hover:bg-danger-950/20 hover:text-danger dark:hover:text-danger-400",
      selected: "bg-danger-50 dark:bg-danger-950/20 text-danger dark:text-danger-400"
    },
    bordered: {
      hover: "hover:border-danger hover:text-danger hover:bg-danger-50/50 dark:hover:bg-danger-950/10 border-2 border-transparent",
      selected: "border-danger text-danger bg-danger-50/50 dark:bg-danger-950/10 border-2"
    },
    faded: {
      hover: "hover:bg-default-100 dark:hover:bg-default-200 hover:text-danger hover:border-default-200 border border-transparent",
      selected: "bg-default-100 dark:bg-default-200 text-danger border border-default-200"
    },
    light: {
      hover: "hover:text-danger hover:bg-danger-50/30 dark:hover:bg-danger-950/10",
      selected: "text-danger bg-danger-50/30 dark:bg-danger-950/10"
    },
    shadow: {
      hover: "hover:bg-danger hover:text-white dark:hover:text-white hover:shadow-lg hover:shadow-danger/30",
      selected: "bg-danger text-white shadow-lg shadow-danger/30"
    }
  }
};

export const DropdownItem: React.FC<DropdownItemProps> = ({
  itemKey = "",
  children,
  description,
  variant: itemVariant,
  color: itemColor,
  startContent,
  endContent,
  showDivider = false,
  className = "",
  onClick,
}) => {
  const menuContext = useContext(MenuContext);
  if (!menuContext) {
    throw new Error("DropdownItem must be used inside a DropdownMenu");
  }

  const activeVariant = itemVariant || menuContext.variant;
  const activeColor = itemColor || menuContext.color;
  const isSelected = menuContext.selectedKeys.has(itemKey);
  const isDisabled = menuContext.disabledKeys.has(itemKey);

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
    menuContext.onSelect(itemKey);
  };

  const normalTextColorMap: Record<string, string> = {
    default: "text-neutral-800 dark:text-neutral-200",
    primary: "text-primary dark:text-primary-400",
    secondary: "text-secondary dark:text-secondary-400",
    success: "text-success dark:text-success-400",
    warning: "text-warning dark:text-warning-400",
    danger: "text-danger dark:text-danger-400",
  };

  const normalTextColor = itemColor ? (normalTextColorMap[itemColor] || normalTextColorMap.default) : normalTextColorMap.default;

  const config = itemColorMap[activeColor]?.[activeVariant] || itemColorMap.default.flat;
  const colorStyles = isSelected
    ? config.selected
    : `bg-transparent ${normalTextColor} ${config.hover}`;

  const disabledStyles = isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer";

  return (
    <>
      <li
        role="menuitem"
        onClick={handleClick}
        className={`
          flex items-center justify-between px-3 py-2 text-sm ${getRadiusClass()} transition-colors select-none gap-2
          ${colorStyles} ${disabledStyles} ${className}
        `}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {startContent && <span className="shrink-0">{startContent}</span>}
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-inherit truncate">{children}</span>
            {description && (
              <span className="text-xs opacity-60 mt-0.5 truncate">{description}</span>
            )}
          </div>
        </div>

        {isSelected && (
          <span className="shrink-0 text-inherit font-bold">✓</span>
        )}
        {!isSelected && endContent && (
          <span className="shrink-0 opacity-60 text-xs">{endContent}</span>
        )}
      </li>
      {showDivider && <hr className="my-1 border-default-200 dark:border-default-800/40" />}
    </>
  );
};

// ─── DropdownSection ─────────────────────────────────────────────────────────
export interface DropdownSectionProps {
  title?: string;
  children: React.ReactNode;
  showDivider?: boolean;
}

export const DropdownSection: React.FC<DropdownSectionProps> = ({
  title,
  children,
  showDivider = false,
}) => {
  return (
    <>
      <li role="presentation" className="p-1">
        {title && (
          <div className="px-3 py-1 text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            {title}
          </div>
        )}
        <ul className="flex flex-col gap-0.5 list-none">
          {children}
        </ul>
      </li>
      {showDivider && <hr className="my-1 border-default-200 dark:border-default-800/40" />}
    </>
  );
};
