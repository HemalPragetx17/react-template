import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, forwardRef, useContext, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { getRadiusClass } from "../shared/radius";

export type AccordionVariant = "light" | "shadow" | "bordered" | "splitted";
export type AccordionSelectionMode = "single" | "multiple";

export interface AccordionContextType {
  variant: AccordionVariant;
  selectionMode: AccordionSelectionMode;
  expandedKeys: Set<React.Key>;
  toggleKey: (key: React.Key) => void;
  isDisabledGlobal?: boolean;
  hideIndicatorGlobal?: boolean;
  itemClasses?: {
    base?: string;
    heading?: string;
    trigger?: string;
    title?: string;
    subtitle?: string;
    content?: string;
    indicator?: string;
    startContent?: string;
  };
}

export const AccordionContext = createContext<AccordionContextType | null>(null);

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelectionChange"> {
  children?: React.ReactNode;
  variant?: AccordionVariant;
  selectionMode?: AccordionSelectionMode;
  selectedKeys?: "all" | Iterable<React.Key>;
  defaultSelectedKeys?: "all" | Iterable<React.Key>;
  onSelectionChange?: (keys: Set<React.Key>) => void;
  isDisabled?: boolean;
  hideIndicator?: boolean;
  itemClasses?: AccordionContextType["itemClasses"];
  showDivider?: boolean;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>((props, ref) => {
  const {
    children,
    variant = "light",
    selectionMode = "single",
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    isDisabled = false,
    hideIndicator = false,
    itemClasses,
    showDivider = true,
    className = "",
    ...restProps
  } = props;

  const [expandedKeys, setExpandedKeys] = useState<Set<React.Key>>(() => {
    if (defaultSelectedKeys === "all") {
      return new Set<React.Key>();
    } else if (defaultSelectedKeys) {
      return new Set<React.Key>(defaultSelectedKeys);
    }
    return new Set<React.Key>();
  });

  const activeKeys = selectedKeys !== undefined
    ? new Set<React.Key>(selectedKeys === "all" ? [] : selectedKeys)
    : expandedKeys;

  const toggleKey = (key: React.Key) => {
    if (isDisabled) return;
    const newKeys = new Set<React.Key>(activeKeys);
    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      if (selectionMode === "single") {
        newKeys.clear();
      }
      newKeys.add(key);
    }
    if (selectedKeys === undefined) {
      setExpandedKeys(newKeys);
    }
    onSelectionChange?.(newKeys);
  };

  const contextValue: AccordionContextType = {
    variant,
    selectionMode,
    expandedKeys: activeKeys,
    toggleKey,
    isDisabledGlobal: isDisabled,
    hideIndicatorGlobal: hideIndicator,
    itemClasses,
  };

  // Clone children to inject key and position indices
  const count = React.Children.count(children);
  const renderedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      const key = child.key !== null && child.key !== undefined ? child.key : String(index);
      return React.cloneElement(child as React.ReactElement<any>, {
        itemKey: key,
        isLast: index === count - 1,
        showDivider: showDivider && variant !== "splitted",
      });
    }
    return child;
  });

  // Base container classes depending on variant
  const containerClasses = {
    light: "w-full flex flex-col",
    shadow: `w-full flex flex-col bg-white dark:bg-content1 shadow-lg border border-neutral-100 dark:border-neutral-800/50 ${getRadiusClass()} px-6 py-2`,
    bordered: `w-full flex flex-col border-2 border-neutral-200 dark:border-neutral-800 ${getRadiusClass()} px-6 py-2`,
    splitted: "w-full flex flex-col gap-3",
  };

  const currentContainerClass = containerClasses[variant] || containerClasses.light;

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={`${currentContainerClass} ${className}`}
        {...restProps}
      >
        {renderedChildren}
      </div>
    </AccordionContext.Provider>
  );
});

Accordion.displayName = "Accordion";

export interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  startContent?: React.ReactNode;
  indicator?: React.ReactNode | ((props: { isExpanded: boolean; isDisabled: boolean }) => React.ReactNode);
  isDisabled?: boolean;
  hideIndicator?: boolean;
  keepContentMounted?: boolean;
  classNames?: AccordionContextType["itemClasses"];
  itemKey?: React.Key; // Injected by parent
  isLast?: boolean; // Injected by parent
  showDivider?: boolean; // Injected by parent
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>((props, ref) => {
  const {
    title,
    subtitle,
    startContent,
    indicator,
    isDisabled = false,
    hideIndicator = false,
    keepContentMounted = false,
    classNames,
    className = "",
    children,
    itemKey,
    isLast,
    showDivider,
    ...restProps
  } = props;

  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion component.");
  }

  const {
    variant,
    expandedKeys,
    toggleKey,
    isDisabledGlobal,
    hideIndicatorGlobal,
    itemClasses: contextItemClasses,
  } = context;

  const actualKey = itemKey !== undefined ? itemKey : "";
  const isExpanded = expandedKeys.has(actualKey);
  const disabled = isDisabled || isDisabledGlobal;
  const shouldHideIndicator = hideIndicator || hideIndicatorGlobal;

  // Merge style classes: context < item-level
  const baseClass = classNames?.base || contextItemClasses?.base || "";
  const headingClass = classNames?.heading || contextItemClasses?.heading || "";
  const triggerClass = classNames?.trigger || contextItemClasses?.trigger || "";
  const titleClass = classNames?.title || contextItemClasses?.title || "";
  const subtitleClass = classNames?.subtitle || contextItemClasses?.subtitle || "";
  const contentClass = classNames?.content || contextItemClasses?.content || "";
  const indicatorClass = classNames?.indicator || contextItemClasses?.indicator || "";
  const startContentClass = classNames?.startContent || contextItemClasses?.startContent || "";

  // Splitted card background
  const splittedClass = variant === "splitted"
    ? `bg-white dark:bg-content1 shadow-md border border-neutral-100 dark:border-neutral-800/50 ${getRadiusClass()} px-6 py-2`
    : "";

  // Divider lines
  const dividerClass = showDivider && !isLast && variant !== "splitted"
    ? "border-b-2 border-neutral-200 dark:border-neutral-800"
    : "";

  return (
    <div
      ref={ref}
      className={`
        w-full transition-all duration-300
        ${splittedClass}
        ${dividerClass}
        ${baseClass}
        ${className}
      `}
      {...restProps}
    >
      <div className={`w-full flex flex-col ${headingClass}`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => toggleKey(actualKey)}
          className={`
            flex w-full py-4 text-left focus:outline-none select-none items-center justify-between
            disabled:opacity-50 disabled:cursor-not-allowed group transition
            ${variant !== "splitted" ? "hover:opacity-80" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rounded-xl px-2 -mx-2"}
            ${triggerClass}
          `}
        >
          <div className="flex flex-1 items-center gap-3 overflow-hidden">
            {startContent && (
              <div className={`shrink-0 flex items-center justify-center ${startContentClass}`}>
                {startContent}
              </div>
            )}
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className={`font-semibold text-neutral-900 dark:text-neutral-100 text-base transition-colors ${isExpanded ? "text-primary dark:text-primary" : ""} ${titleClass}`}>
                {title}
              </span>
              {subtitle && (
                <span className={`text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-0.5 ${subtitleClass}`}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {!shouldHideIndicator && (
            <span className={`shrink-0 ml-3 transition-transform duration-300 ${indicatorClass}`}>
              {indicator !== undefined ? (
                typeof indicator === "function" ? (
                  indicator({ isExpanded, isDisabled: !!disabled })
                ) : (
                  indicator
                )
              ) : (
                <FaChevronRight
                  className="w-5 h-5 text-neutral-500 dark:text-neutral-400 inline-block origin-center transition-transform duration-300 ease-in-out"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                  aria-hidden
                />
              )}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {(isExpanded || keepContentMounted) && (
          <motion.div
            initial={isExpanded ? { height: 0, opacity: 0 } : false}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              height: {
                duration: 0.25,
                ease: [0.04, 0.62, 0.23, 0.98],
              },
              opacity: {
                duration: 0.2,
              },
            }}
            className="overflow-hidden"
          >
            <div className={`pb-4 text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed ${contentClass}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AccordionItem.displayName = "AccordionItem";
