import React, { createContext, useContext } from "react";
import clsx from "clsx";

// Create a context to share card settings with sub-components
interface CardContextProps {
  isFooterBlurred?: boolean;
  disableAnimation?: boolean;
  classNames?: Partial<Record<"base" | "header" | "body" | "footer", string>>;
}

const CardContext = createContext<CardContextProps>({});

const shadowClasses = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-xl",
};

const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-2xl",
  full: "rounded-full",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: "none" | "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  isHoverable?: boolean;
  isPressable?: boolean;
  isBlurred?: boolean;
  isFooterBlurred?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  disableAnimation?: boolean;
  disableRipple?: boolean;
  allowTextSelectionOnPress?: boolean;
  classNames?: Partial<Record<"base" | "header" | "body" | "footer", string>>;
  onPress?: (e: any) => void;
}

export const Card: React.FC<CardProps> = ({
  shadow = "md",
  radius = "lg",
  isHoverable = false,
  isPressable = false,
  isBlurred = false,
  isFooterBlurred = false,
  isDisabled = false,
  fullWidth = false,
  disableAnimation = false,
  disableRipple = false,
  allowTextSelectionOnPress = false,
  classNames,
  className,
  children,
  onClick,
  onPress,
  onKeyDown,
  ...props
}) => {
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const rippleIdRef = React.useRef(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    if (isPressable && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      if (onPress) {
        onPress(e);
      } else if (onClick) {
        const clickEvent = e as unknown as React.MouseEvent<HTMLDivElement>;
        onClick(clickEvent);
      }
    }
    if (onKeyDown) onKeyDown(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return;

    if (isPressable && !disableRipple) {
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
        }, 1500);
      }
    }

    if (onPress) onPress(e);
    if (onClick) onClick(e);
  };

  const interactiveClasses = clsx(
    isPressable && [
      "cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
      !allowTextSelectionOnPress && "select-none",
      !disableAnimation && "transition-all active:scale-[0.98] duration-200"
    ],
    isHoverable && [
      "hover:z-10",
      !disableAnimation && "transition-transform-shadow duration-300 hover:-translate-y-1 hover:shadow-2xl"
    ]
  );

  return (
    <CardContext.Provider value={{ isFooterBlurred, disableAnimation, classNames }}>
      <div
        role={isPressable ? "button" : undefined}
        tabIndex={isPressable && !isDisabled ? 0 : undefined}
        aria-disabled={isDisabled ? true : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={clsx(
          "flex flex-col relative box-border overflow-hidden text-foreground",
          !isBlurred 
            ? "bg-content1 border border-default-100 dark:border-default-800/40" 
            : "backdrop-blur-xl bg-white/20 dark:bg-black/30 border border-white/20 dark:border-default-100/10",
          shadowClasses[shadow],
          radiusClasses[radius],
          isDisabled && "opacity-60 pointer-events-none select-none",
          fullWidth ? "w-full" : "w-fit",
          interactiveClasses,
          classNames?.base,
          className
        )}
        {...props}
      >
        {children}
        {/* Ripple Elements */}
        {isPressable && !disableRipple && ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-current opacity-25 pointer-events-none animate-card-ripple scale-0"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </div>
    </CardContext.Provider>
  );
};

// ── Card Header ──────────────────────────────────────────────────────────────
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  const context = useContext(CardContext);
  const hasPadding = className && /\bp[xytrbl]?-/.test(className);

  return (
    <div
      className={clsx(
        "flex w-full justify-start items-center z-10 shrink-0",
        !hasPadding && "p-4",
        context.classNames?.header,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ── Card Body ────────────────────────────────────────────────────────────────
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({
  className,
  children,
  ...props
}) => {
  const context = useContext(CardContext);
  const hasPadding = className && /\bp[xytrbl]?-/.test(className);

  return (
    <div
      className={clsx(
        "flex flex-1 flex-col place-content-inherit align-items-inherit w-full overflow-y-auto break-words z-10",
        !hasPadding && "p-5",
        context.classNames?.body,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// ── Card Footer ──────────────────────────────────────────────────────────────
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  isBlurred?: boolean;
  children?: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  isBlurred: localIsBlurred,
  className,
  children,
  ...props
}) => {
  const context = useContext(CardContext);
  const shouldBlur = localIsBlurred ?? context.isFooterBlurred;
  const hasPadding = className && /\bp[xytrbl]?-/.test(className);

  return (
    <div
      className={clsx(
        "flex w-full items-center z-10 shrink-0",
        !hasPadding && "p-4",
        shouldBlur && [
          "absolute bottom-0 left-0 right-0 border-t border-white/20 dark:border-default-100/20 bg-white/50 dark:bg-black/50 text-default-foreground dark:text-white backdrop-blur-md overflow-hidden",
        ],
        context.classNames?.footer,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
