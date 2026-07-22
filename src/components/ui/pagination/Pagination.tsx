/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useLayoutEffect, useRef, useMemo } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

// ─── Pagination Types ────────────────────────────────────────────────────────

export type PaginationItemValue = number | "dots-prev" | "dots-next" | "prev" | "next";

export type PaginationItemRenderProps = {
  ref?: React.Ref<any>;
  value: PaginationItemValue;
  index: number;
  activePage: number;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  isNext: boolean;
  isPrevious: boolean;
  className: string;
  onNext: () => void;
  onPrevious: () => void;
  setPage: (page: number) => void;
};

export interface PaginationProps {
  variant?: "flat" | "bordered" | "light" | "faded";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  total?: number;
  dotsJump?: number;
  initialPage?: number;
  page?: number;
  siblings?: number;
  boundaries?: number;
  loop?: boolean;
  isCompact?: boolean;
  isDisabled?: boolean;
  showShadow?: boolean;
  showControls?: boolean;
  disableCursorAnimation?: boolean;
  disableAnimation?: boolean;
  renderItem?: (props: PaginationItemRenderProps) => React.ReactNode;
  getItemAriaLabel?: (page: string) => string;
  classNames?: Partial<Record<
    | "base"
    | "wrapper"
    | "prev"
    | "next"
    | "item"
    | "cursor"
    | "forwardIcon"
    | "ellipsis"
    | "chevronNext",
    string
  >>;
  onChange?: (page: number) => void;
}

// ─── Range Helper ────────────────────────────────────────────────────────────

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

const getPaginationRange = (
  activePage: number,
  total: number,
  siblings: number = 1,
  boundaries: number = 1
): Array<number | "dots-prev" | "dots-next"> => {
  const totalNumbers = siblings * 2 + 3 + boundaries * 2;

  if (total <= totalNumbers) {
    return range(1, total);
  }

  const leftSiblingIndex = Math.max(activePage - siblings, 1);
  const rightSiblingIndex = Math.min(activePage + siblings, total);

  const shouldShowLeftDots = leftSiblingIndex > boundaries + 2;
  const shouldShowRightDots = rightSiblingIndex < total - (boundaries + 1);

  const firstPages = range(1, boundaries);
  const lastPages = range(total - boundaries + 1, total);

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = boundaries + siblings * 2 + 2;
    const leftRange = range(1, leftItemCount);
    return [...leftRange, "dots-next", ...lastPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = boundaries + siblings * 2 + 2;
    const rightRange = range(total - rightItemCount + 1, total);
    return [...firstPages, "dots-prev", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [...firstPages, "dots-prev", ...middleRange, "dots-next", ...lastPages];
  }

  return range(1, total);
};

// ─── Pagination Item Component ───────────────────────────────────────────────

interface InternalPaginationItemProps {
  value: PaginationItemValue;
  index: number;
  activePage: number;
  isActive: boolean;
  isDisabled: boolean;
  loop: boolean;
  total: number;
  dotsJump: number;
  variant: "flat" | "bordered" | "light" | "faded";
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  size: "sm" | "md" | "lg";
  radius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  disableAnimation: boolean;
  disableCursorAnimation: boolean;
  layoutId: string;
  isCompactItem: boolean;
  isFirstBlockItem: boolean;
  isLastBlockItem: boolean;
  classNames?: any;
  setPage: (page: number) => void;
  renderItem?: (props: PaginationItemRenderProps) => React.ReactNode;
  getItemAriaLabel?: (page: string) => string;
  itemRef?: (el: HTMLButtonElement | null) => void;
}

const InternalPaginationItem: React.FC<InternalPaginationItemProps> = ({
  value,
  index,
  activePage,
  isActive,
  isDisabled,
  loop,
  total,
  dotsJump,
  variant,
  color,
  size,
  radius,
  disableAnimation,
  disableCursorAnimation,
  isCompactItem,
  isFirstBlockItem,
  isLastBlockItem,
  classNames = {},
  setPage,
  renderItem,
  getItemAriaLabel,
  itemRef,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Click handler
  const handlePageChange = () => {
    if (isDisabled) return;
    if (value === "prev") {
      if (activePage > 1) {
        setPage(activePage - 1);
      } else if (loop) {
        setPage(total);
      }
    } else if (value === "next") {
      if (activePage < total) {
        setPage(activePage + 1);
      } else if (loop) {
        setPage(1);
      }
    } else if (value === "dots-prev") {
      setPage(Math.max(activePage - dotsJump, 1));
    } else if (value === "dots-next") {
      setPage(Math.min(activePage + dotsJump, total));
    } else if (typeof value === "number") {
      setPage(value);
    }
  };

  // Styles Map
  const sizeClasses = {
    sm: "w-8 h-8 text-xs min-w-[2rem]",
    md: "w-9 h-9 text-sm min-w-[2.25rem]",
    lg: "w-10 h-10 text-base min-w-[2.5rem]",
  };

  const radiusClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const activeColorCursorClasses: Record<string, string> = {
    default: "bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-900",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  // Active text color that matches the cursor background
  const activeTextClasses: Record<string, string> = {
    default: "text-white dark:text-neutral-900",
    primary: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    success: "text-success-foreground",
    warning: "text-warning-foreground",
    danger: "text-danger-foreground",
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "flat":
        return "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200";
      case "bordered":
        return "bg-transparent border border-neutral-200 hover:bg-neutral-100 text-neutral-800 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-200";
      case "light":
        return "bg-transparent hover:bg-neutral-100 text-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-200";
      case "faded":
        return "bg-neutral-50/50 border border-neutral-200 hover:bg-neutral-100 text-neutral-800 dark:bg-neutral-800/30 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-200";
    }
  };

  const isControlDisabled = (() => {
    if (isDisabled) return true;
    if (value === "prev" && activePage === 1 && !loop) return true;
    if (value === "next" && activePage === total && !loop) return true;
    return false;
  })();

  // ── Compact radius: only left/right edges get curved corners ──────────────
  const itemRadiusClass = (() => {
    if (isCompactItem) {
      if (isFirstBlockItem) {
        return {
          full: "rounded-l-full",
          "2xl": "rounded-l-2xl",
          xl: "rounded-l-xl",
          lg: "rounded-l-lg",
          md: "rounded-l-md",
          sm: "rounded-l-sm",
          none: "rounded-none",
        }[radius] ?? "rounded-none";
      }
      if (isLastBlockItem) {
        return {
          full: "rounded-r-full",
          "2xl": "rounded-r-2xl",
          xl: "rounded-r-xl",
          lg: "rounded-r-lg",
          md: "rounded-r-md",
          sm: "rounded-r-sm",
          none: "rounded-none",
        }[radius] ?? "rounded-none";
      }
      return "rounded-none";
    }
    return radiusClasses[radius] ?? "rounded-xl";
  })();

  const showAnimatedCursor = isActive && !disableAnimation && !disableCursorAnimation;
  const showStaticActive = isActive && (disableAnimation || disableCursorAnimation);

  const itemClass = clsx(
    "relative flex items-center justify-center font-medium select-none outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-focus",
    sizeClasses[size],
    itemRadiusClass,
    isControlDisabled ? "opacity-35 cursor-not-allowed pointer-events-none" : "cursor-pointer",
    // Active state: if animated cursor, just set text color; if static, set full bg+text
    showAnimatedCursor
      ? [activeTextClasses[color], "z-10 bg-transparent"]
      : showStaticActive
      ? [activeColorCursorClasses[color], classNames.cursor]
      : getVariantClasses(),
    value === "prev" && classNames.prev,
    value === "next" && classNames.next,
    typeof value === "number" && classNames.item,
    (value === "dots-prev" || value === "dots-next") && classNames.ellipsis
  );

  const onNext = () => {
    if (activePage < total) setPage(activePage + 1);
    else if (loop) setPage(1);
  };
  const onPrevious = () => {
    if (activePage > 1) setPage(activePage - 1);
    else if (loop) setPage(total);
  };

  const renderProps: PaginationItemRenderProps = {
    value,
    index,
    activePage,
    isActive,
    isFirst: value === 1,
    isLast: value === total,
    isNext: value === activePage + 1,
    isPrevious: value === activePage - 1,
    className: itemClass,
    onNext,
    onPrevious,
    setPage,
  };

  if (renderItem) {
    return <>{renderItem(renderProps)}</>;
  }

  const renderContent = () => {
    if (value === "prev") {
      return <FaChevronLeft className={clsx("w-3 h-3", classNames.chevronNext)} />;
    }
    if (value === "next") {
      return <FaChevronRight className={clsx("w-3 h-3", classNames.chevronNext)} />;
    }
    if (value === "dots-prev") {
      return isHovered ? (
        <FaAngleDoubleLeft className={clsx("w-3.5 h-3.5 text-neutral-500", classNames.forwardIcon)} />
      ) : (
        <span className="leading-none">...</span>
      );
    }
    if (value === "dots-next") {
      return isHovered ? (
        <FaAngleDoubleRight className={clsx("w-3.5 h-3.5 text-neutral-500", classNames.forwardIcon)} />
      ) : (
        <span className="leading-none">...</span>
      );
    }
    return <span className="z-10 relative">{value}</span>;
  };

  return (
    <motion.button
      ref={itemRef}
      layout={!disableAnimation}
      type="button"
      className={itemClass}
      onClick={handlePageChange}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={getItemAriaLabel ? getItemAriaLabel(String(value)) : undefined}
      aria-current={isActive ? "page" : undefined}
      disabled={isControlDisabled}
      transition={
        disableAnimation
          ? { duration: 0 }
          : { layout: { type: "spring", stiffness: 350, damping: 28 } }
      }
    >
      {renderContent()}
    </motion.button>
  );
};

// ─── Main Pagination Component ───────────────────────────────────────────────

export const Pagination: React.FC<PaginationProps> = ({
  variant = "flat",
  color = "default",
  size = "md",
  radius = "xl",
  total = 1,
  dotsJump = 5,
  initialPage = 1,
  page,
  siblings = 1,
  boundaries = 1,
  loop = false,
  isCompact = false,
  isDisabled = false,
  showShadow = false,
  showControls = false,
  disableCursorAnimation = false,
  disableAnimation = false,
  renderItem,
  getItemAriaLabel,
  classNames = {},
  onChange,
}) => {
  // ─── State Management ──────────────────────────────────────────────────────

  const [activePageInternal, setActivePageInternal] = useState(initialPage);

  const activePage = page !== undefined ? page : activePageInternal;

  const setPage = (nextPage: number) => {
    const boundedPage = Math.max(1, Math.min(nextPage, total));
    if (page === undefined) {
      setActivePageInternal(boundedPage);
    }
    onChange?.(boundedPage);
  };

  // Generate range values
  const pageRange = useMemo(() => {
    return getPaginationRange(activePage, total, siblings, boundaries);
  }, [activePage, total, siblings, boundaries]);

  // Build the full items list including optional prev/next controls
  const itemsList: PaginationItemValue[] = useMemo(() => {
    const list: PaginationItemValue[] = [];
    if (showControls) list.push("prev");
    pageRange.forEach((val) => list.push(val));
    if (showControls) list.push("next");
    return list;
  }, [pageRange, showControls]);

  // Dynamic layout offset positioning variables
  const itemRefs = useRef<Map<PaginationItemValue, HTMLButtonElement>>(new Map());
  const [cursorOffset, setCursorOffset] = useState(0);
  const [cursorWidth, setCursorWidth] = useState(0);

  // Measure and align absolute sliding background indicator relative to active DOM node
  useLayoutEffect(() => {
    const updatePosition = () => {
      const activeEl = itemRefs.current.get(activePage);
      if (activeEl) {
        setCursorOffset(activeEl.offsetLeft);
        setCursorWidth(activeEl.offsetWidth);
      }
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
    };
  }, [activePage, itemsList]);

  // Stable layout ID for the shared cursor animation (optional but kept for reference)
  const layoutId = React.useId() + "-pagination-cursor";

  // ─── Style Mappings ────────────────────────────────────────────────────────

  const shadowClasses: Record<string, string> = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
    full: "shadow-md",
  };

  const radiusClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const activeColorCursorClasses: Record<string, string> = {
    default: "bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-900",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  const slots = {
    base: clsx(
      "flex items-center select-none justify-start w-fit",
      isDisabled && "opacity-50 pointer-events-none",
      classNames.base
    ),
    wrapper: clsx(
      "flex flex-nowrap items-center bg-transparent relative",
      isCompact
        ? [
            "gap-0 border border-neutral-200 dark:border-neutral-800 divide-x divide-neutral-200/50 dark:divide-neutral-700/50 overflow-hidden",
            radiusClasses[radius],
            showShadow && shadowClasses[radius],
          ]
        : "gap-1.5",
      classNames.wrapper
    ),
  };

  if (total <= 0) return null;

  // For compact mode, we need to know which items are at the edges of the whole list
  // (excluding prev/next controls which are always at idx 0 and idx last)
  const firstPageIdx = showControls ? 1 : 0;
  const lastPageIdx = showControls ? itemsList.length - 2 : itemsList.length - 1;

  return (
    <nav className={slots.base} role="navigation" aria-label="pagination navigation">
      <div className={slots.wrapper}>
        {/* Absolute Background Cursor Overlay */}
        {!disableAnimation && !disableCursorAnimation && (
          <motion.span
            className={clsx(
              "absolute z-0 transition-none",
              activeColorCursorClasses[color],
              isCompact ? "rounded-none" : radiusClasses[radius],
              classNames.cursor
            )}
            style={{
              top: 0,
              bottom: 0,
            }}
            animate={{
              x: cursorOffset,
              width: cursorWidth,
              scale: [null, 0.90, 1], // Transition smoothly from current scale, shrink by 10%, then return to 1
            }}
            transition={
              disableAnimation
                ? { duration: 0 }
                : {
                    x: { type: "spring", stiffness: 350, damping: 28 },
                    width: { type: "spring", stiffness: 350, damping: 28 },
                    scale: { duration: 0.2, ease: "easeInOut" }
                  }
            }
          />
        )}

        {itemsList.map((itemValue, idx) => {
          const isActive = typeof itemValue === "number" && itemValue === activePage;

          // For compact mode: only the very first and last PAGE items (not controls) get edge radius
          const isFirstBlockItem = isCompact
            ? idx === firstPageIdx
            : idx === 0;
          const isLastBlockItem = isCompact
            ? idx === lastPageIdx
            : idx === itemsList.length - 1;

          return (
            <InternalPaginationItem
              key={itemValue}
              value={itemValue}
              index={idx}
              activePage={activePage}
              isActive={isActive}
              isDisabled={isDisabled}
              loop={loop}
              total={total}
              dotsJump={dotsJump}
              variant={variant}
              color={color}
              size={size}
              radius={radius}
              disableAnimation={disableAnimation}
              disableCursorAnimation={disableCursorAnimation}
              layoutId={layoutId}
              isCompactItem={isCompact}
              isFirstBlockItem={isFirstBlockItem}
              isLastBlockItem={isLastBlockItem}
              classNames={classNames}
              setPage={setPage}
              renderItem={renderItem}
              getItemAriaLabel={getItemAriaLabel}
              itemRef={(el) => {
                if (el) {
                  itemRefs.current.set(itemValue, el);
                } else {
                  itemRefs.current.delete(itemValue);
                }
              }}
            />
          );
        })}
      </div>
    </nav>
  );
};

Pagination.displayName = "Pagination";
