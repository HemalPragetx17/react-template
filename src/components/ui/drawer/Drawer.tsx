import React, { createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import clsx from "clsx";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DrawerPlacement = "top" | "right" | "bottom" | "left";
export type DrawerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
export type DrawerBackdrop = "transparent" | "opaque" | "blur";
export type DrawerRadius = "none" | "sm" | "md" | "lg";
export type DrawerShadow = "none" | "sm" | "md" | "lg";
export type DrawerScrollBehavior = "inside" | "outside";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  backdrop?: DrawerBackdrop;
  radius?: DrawerRadius;
  shadow?: DrawerShadow;
  isDismissable?: boolean;
  isKeyboardDismissDisabled?: boolean;
  closeButton?: boolean;
  scrollBehavior?: DrawerScrollBehavior;
  className?: string;
  motionProps?: HTMLMotionProps<"div">;
}

interface DrawerContextValue {
  isOpen: boolean;
  onClose: () => void;
  placement: DrawerPlacement;
  size: DrawerSize;
  backdrop: DrawerBackdrop;
  radius: DrawerRadius;
  shadow: DrawerShadow;
  isDismissable: boolean;
  isKeyboardDismissDisabled: boolean;
  closeButton: boolean;
  scrollBehavior: DrawerScrollBehavior;
  drawerClassName?: string;
  motionProps?: HTMLMotionProps<"div">;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const DrawerContext = createContext<DrawerContextValue | null>(null);

export const useDrawerContext = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer sub-components must be rendered within a <Drawer> component.");
  }
  return context;
};

// ─── Constants & Class Mappings ──────────────────────────────────────────────

const backdropClasses = {
  transparent: "bg-transparent",
  opaque: "bg-black/50",
  blur: "bg-black/30 backdrop-blur-md",
};

const shadowClasses = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-2xl",
};

const getRadiusClasses = (radius: DrawerRadius, placement: DrawerPlacement): string => {
  if (radius === "none") return "rounded-none";

  const map: Record<DrawerPlacement, Record<Exclude<DrawerRadius, "none">, string>> = {
    left: {
      sm: "rounded-r-sm",
      md: "rounded-r-md",
      lg: "rounded-r-2xl",
    },
    right: {
      sm: "rounded-l-sm",
      md: "rounded-l-md",
      lg: "rounded-l-2xl",
    },
    top: {
      sm: "rounded-b-sm",
      md: "rounded-b-md",
      lg: "rounded-b-2xl",
    },
    bottom: {
      sm: "rounded-t-sm",
      md: "rounded-t-md",
      lg: "rounded-t-2xl",
    },
  };
  return map[placement][radius];
};

// Size classes mapping:
// Left/Right control width, Top/Bottom control height
const sizeClasses: Record<DrawerPlacement, Record<DrawerSize, string>> = {
  left: {
    xs: "w-full max-w-xs h-full",
    sm: "w-full max-w-sm h-full",
    md: "w-full max-w-md h-full",
    lg: "w-full max-w-lg h-full",
    xl: "w-full max-w-xl h-full",
    "2xl": "w-full max-w-2xl h-full",
    "3xl": "w-full max-w-3xl h-full",
    "4xl": "w-full max-w-4xl h-full",
    "5xl": "w-full max-w-5xl h-full",
    full: "w-screen max-w-full h-full",
  },
  right: {
    xs: "w-full max-w-xs h-full",
    sm: "w-full max-w-sm h-full",
    md: "w-full max-w-md h-full",
    lg: "w-full max-w-lg h-full",
    xl: "w-full max-w-xl h-full",
    "2xl": "w-full max-w-2xl h-full",
    "3xl": "w-full max-w-3xl h-full",
    "4xl": "w-full max-w-4xl h-full",
    "5xl": "w-full max-w-5xl h-full",
    full: "w-screen max-w-full h-full",
  },
  top: {
    xs: "w-full h-[20rem] max-h-full",
    sm: "w-full h-[24rem] max-h-full",
    md: "w-full h-[28rem] max-h-full",
    lg: "w-full h-[32rem] max-h-full",
    xl: "w-full h-[36rem] max-h-full",
    "2xl": "w-full h-[42rem] max-h-full",
    "3xl": "w-full h-[48rem] max-h-full",
    "4xl": "w-full h-[56rem] max-h-full",
    "5xl": "w-full h-[64rem] max-h-full",
    full: "w-full h-screen max-h-full",
  },
  bottom: {
    xs: "w-full h-[20rem] max-h-full",
    sm: "w-full h-[24rem] max-h-full",
    md: "w-full h-[28rem] max-h-full",
    lg: "w-full h-[32rem] max-h-full",
    xl: "w-full h-[36rem] max-h-full",
    "2xl": "w-full h-[42rem] max-h-full",
    "3xl": "w-full h-[48rem] max-h-full",
    "4xl": "w-full h-[56rem] max-h-full",
    "5xl": "w-full h-[64rem] max-h-full",
    full: "w-full h-screen max-h-full",
  },
};

const containerPlacementClasses = {
  left: "justify-start",
  right: "justify-end",
  top: "items-start",
  bottom: "items-end",
};

// ─── Animation Variants ──────────────────────────────────────────────────────

const panelVariants = {
  initial: (placement: DrawerPlacement) => {
    switch (placement) {
      case "left": return { x: "-100%" };
      case "right": return { x: "100%" };
      case "top": return { y: "-100%" };
      case "bottom": return { y: "100%" };
    }
  },
  animate: {
    x: 0,
    y: 0,
    transition: { type: "spring" as const, stiffness: 350, damping: 32 }
  },
  exit: (placement: DrawerPlacement) => {
    switch (placement) {
      case "left": return { x: "-100%", transition: { duration: 0.2, ease: "easeIn" as const } };
      case "right": return { x: "100%", transition: { duration: 0.2, ease: "easeIn" as const } };
      case "top": return { y: "-100%", transition: { duration: 0.2, ease: "easeIn" as const } };
      case "bottom": return { y: "100%", transition: { duration: 0.2, ease: "easeIn" as const } };
    }
  }
};

// ─── Main Drawer Component ───────────────────────────────────────────────────

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  onOpenChange,
  children,
  placement = "right",
  size = "md",
  backdrop = "opaque",
  radius = "lg",
  shadow = "lg",
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  closeButton = true,
  scrollBehavior = "inside",
  className = "",
  motionProps,
}) => {
  // Call onOpenChange whenever open state updates
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Listen to keyboard Escape dismiss trigger
  useEffect(() => {
    if (isKeyboardDismissDisabled || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, isKeyboardDismissDisabled]);

  return (
    <AnimatePresence>
      {isOpen && (
        <DrawerContext.Provider
          value={{
            isOpen,
            onClose,
            placement,
            size,
            backdrop,
            radius,
            shadow,
            isDismissable,
            isKeyboardDismissDisabled,
            closeButton,
            scrollBehavior,
            drawerClassName: className,
            motionProps,
          }}
        >
          {children}
        </DrawerContext.Provider>
      )}
    </AnimatePresence>
  );
};

// ─── DrawerContent Component ─────────────────────────────────────────────────

export interface DrawerContentProps {
  children: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  className?: string;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  children,
  className = "",
}) => {
  const {
    onClose,
    placement,
    size,
    backdrop,
    radius,
    shadow,
    isDismissable,
    closeButton,
    scrollBehavior,
    drawerClassName,
    motionProps,
  } = useDrawerContext();

  const renderedChildren = typeof children === "function" ? children(onClose) : children;

  const content = (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          if (isDismissable) onClose();
        }}
        className={clsx(
          "fixed inset-0 transition-opacity",
          backdropClasses[backdrop]
        )}
      />

      {/* Panel Container (pointer-events-none to let clicks pass through to backdrop) */}
      <div
        className={clsx(
          "fixed inset-0 flex pointer-events-none",
          containerPlacementClasses[placement],
          scrollBehavior === "outside" ? "overflow-y-auto" : "overflow-hidden"
        )}
      >
        {/* Drawer Panel */}
        {(() => {
          const {
            variants,
            initial,
            animate,
            exit,
            transition,
            className: motionClassName,
            onClick: motionOnClick,
            ...restMotionProps
          } = motionProps || {};

          return (
            <motion.div
              custom={placement}
              variants={variants || panelVariants}
              initial={initial !== undefined ? initial : "initial"}
              animate={animate !== undefined ? animate : "animate"}
              exit={exit !== undefined ? exit : "exit"}
              transition={transition}
              {...restMotionProps}
              onClick={(e) => {
                e.stopPropagation();
                motionOnClick?.(e as any);
              }}
              className={clsx(
                "relative flex flex-col bg-white dark:bg-content1 pointer-events-auto text-neutral-900 dark:text-neutral-100 overflow-hidden",
                "border border-neutral-200/80 dark:border-neutral-800/80",
                shadowClasses[shadow],
                getRadiusClasses(radius, placement),
                sizeClasses[placement][size],
                scrollBehavior === "inside" ? "h-full" : "h-fit",
                drawerClassName,
                className,
                motionClassName
              )}
            >
              {/* Close Button */}
              {closeButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors z-30"
                  aria-label="Close drawer"
                >
                  <FaXmark className="w-5 h-5" aria-hidden />
                </button>
              )}

              {renderedChildren}
            </motion.div>
          );
        })()}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

// ─── DrawerHeader Component ──────────────────────────────────────────────────

export interface DrawerHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={clsx(
        "px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 font-semibold text-lg flex items-center shrink-0 pr-12",
        className
      )}
    >
      {children}
    </div>
  );
};

// ─── DrawerBody Component ────────────────────────────────────────────────────

export interface DrawerBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerBody: React.FC<DrawerBodyProps> = ({
  children,
  className = "",
}) => {
  const { scrollBehavior } = useDrawerContext();

  return (
    <div
      className={clsx(
        "px-6 py-4 flex-1 min-h-0",
        scrollBehavior === "inside" && "overflow-y-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

// ─── DrawerFooter Component ──────────────────────────────────────────────────

export interface DrawerFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={clsx(
        "px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 shrink-0 bg-white dark:bg-content1",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Drawer;
