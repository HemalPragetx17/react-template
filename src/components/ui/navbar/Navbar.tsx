import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { getRadiusClass } from '../shared/radius';

// ─── Types ───────────────────────────────────────────────────────────────────

export type NavbarMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type NavbarPosition = 'static' | 'sticky';
export type NavbarJustify = 'start' | 'center' | 'end';

export type NavbarClassNames = Partial<
  Record<
    | 'base'
    | 'wrapper'
    | 'brand'
    | 'content'
    | 'item'
    | 'toggle'
    | 'toggleIcon'
    | 'menu'
    | 'menuItem',
    string
  >
>;

export interface NavbarProps {
  children?: React.ReactNode;
  height?: string | number;
  position?: NavbarPosition;
  maxWidth?: NavbarMaxWidth;
  parentRef?: React.RefObject<HTMLElement | null>;
  isBordered?: boolean;
  isBlurred?: boolean;
  isMenuOpen?: boolean;
  isMenuDefaultOpen?: boolean;
  shouldHideOnScroll?: boolean;
  motionProps?: HTMLMotionProps<'header'>;
  disableScrollHandler?: boolean;
  disableAnimation?: boolean;
  classNames?: NavbarClassNames;
  className?: string;
  onMenuOpenChange?: (isOpen: boolean) => void;
  onScrollPositionChange?: (position: number) => void;
}

interface NavbarContextValue {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  disableAnimation: boolean;
  classNames: NavbarClassNames;
  height: string | number;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const NavbarContext = createContext<NavbarContextValue | null>(null);

export const useNavbarContext = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('Navbar sub-components must be rendered within a <Navbar> component.');
  }
  return context;
};

// ─── Helper Mappings ────────────────────────────────────────────────────────

const maxWidthClasses: Record<NavbarMaxWidth, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const justifyClasses: Record<NavbarJustify, string> = {
  start: 'justify-start shrink-0',
  center: 'justify-center flex-1 min-w-0 flex-wrap',
  end: 'justify-end shrink-0 ml-auto',
};

// ─── Main Navbar Component ───────────────────────────────────────────────────

export const Navbar: React.FC<NavbarProps> = ({
  children,
  height = '4rem',
  position = 'sticky',
  maxWidth = 'lg',
  parentRef,
  isBordered = false,
  isBlurred = true,
  isMenuOpen: controlledIsMenuOpen,
  isMenuDefaultOpen = false,
  shouldHideOnScroll = false,
  motionProps,
  disableScrollHandler = false,
  disableAnimation = false,
  classNames = {},
  className = '',
  onMenuOpenChange,
  onScrollPositionChange,
}) => {
  const [uncontrolledIsMenuOpen, setUncontrolledIsMenuOpen] = useState(isMenuDefaultOpen);
  const isControlled = controlledIsMenuOpen !== undefined;
  const isMenuOpen = isControlled ? controlledIsMenuOpen : uncontrolledIsMenuOpen;

  const setIsMenuOpen = (value: boolean | ((prev: boolean) => boolean)) => {
    const nextValue = typeof value === 'function' ? value(isMenuOpen) : value;
    if (!isControlled) {
      setUncontrolledIsMenuOpen(nextValue);
    }
    onMenuOpenChange?.(nextValue);
  };

  const [isHidden, setIsHidden] = useState(false);
  const prevScrollY = useRef(0);

  // Scroll handler for hiding navbar on scroll and reporting scroll position
  useEffect(() => {
    if (disableScrollHandler) return;

    const getScrollTarget = (): HTMLElement | Window => {
      if (parentRef && parentRef.current) {
        return parentRef.current;
      }
      return window;
    };

    const getScrollY = (target: HTMLElement | Window): number => {
      if (target === window) {
        return window.scrollY;
      }
      return (target as HTMLElement).scrollTop;
    };

    const handleScroll = () => {
      const target = getScrollTarget();
      const currentScrollY = getScrollY(target);

      onScrollPositionChange?.(currentScrollY);

      if (shouldHideOnScroll && !isMenuOpen) {
        const diff = currentScrollY - prevScrollY.current;
        if (diff > 10 && currentScrollY > 60) {
          setIsHidden(true);
        } else if (diff < -10 || currentScrollY <= 60) {
          setIsHidden(false);
        }
      }
      prevScrollY.current = currentScrollY;
    };

    const target = getScrollTarget();
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [disableScrollHandler, shouldHideOnScroll, isMenuOpen, parentRef, onScrollPositionChange]);

  // Close mobile menu automatically when viewport resizes to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const formattedHeight = typeof height === 'number' ? `${height}px` : height;

  const baseClasses = clsx(
    'w-full z-40 transition-transform duration-300 ease-in-out flex items-center',
    position === 'sticky' && 'sticky top-0',
    position === 'static' && 'relative',
    isBlurred && 'backdrop-blur-md backdrop-saturate-150 bg-white/70 dark:bg-content1/70',
    !isBlurred && 'bg-white dark:bg-content1',
    isBordered && 'border-b border-default-200 dark:border-default-100',
    classNames.base,
    className
  );

  const wrapperClasses = clsx(
    'mx-auto w-full flex items-center px-4 sm:px-6 min-h-full py-1 gap-4',
    maxWidthClasses[maxWidth],
    classNames.wrapper
  );

  return (
    <NavbarContext.Provider
      value={{
        isMenuOpen,
        setIsMenuOpen,
        disableAnimation,
        classNames,
        height: formattedHeight,
      }}
    >
      <motion.header
        animate={{ y: isHidden ? '-100%' : '0%' }}
        transition={{ duration: disableAnimation ? 0 : 0.25, ease: 'easeInOut' }}
        style={{ minHeight: formattedHeight, height: 'auto' }}
        className={baseClasses}
        {...motionProps}
      >
        <div className={wrapperClasses}>{children}</div>
      </motion.header>
    </NavbarContext.Provider>
  );
};

// ─── NavbarBrand Component ───────────────────────────────────────────────────

export type NavbarBrandProps<T extends React.ElementType = 'div'> = {
  children?: React.ReactNode;
  className?: string;
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'className' | 'as'>;

export const NavbarBrand = <T extends React.ElementType = 'div'>({
  children,
  className = '',
  as,
  ...props
}: NavbarBrandProps<T>) => {
  const Component = as || 'div';
  const { classNames } = useNavbarContext();
  return (
    <Component
      className={clsx(
        'flex items-center justify-start gap-2 bg-transparent text-inherit font-bold text-lg cursor-pointer whitespace-nowrap shrink-0',
        classNames.brand,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// ─── NavbarContent Component ─────────────────────────────────────────────────

export interface NavbarContentProps {
  children?: React.ReactNode;
  justify?: NavbarJustify;
  className?: string;
}

export const NavbarContent: React.FC<NavbarContentProps> = ({
  children,
  justify = 'start',
  className = '',
}) => {
  const { classNames } = useNavbarContext();
  return (
    <ul
      className={clsx(
        'flex items-center gap-4 list-none m-0 p-0',
        justifyClasses[justify],
        classNames.content,
        className
      )}
    >
      {children}
    </ul>
  );
};

// ─── NavbarItem Component ────────────────────────────────────────────────────

export interface NavbarItemProps {
  children?: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export const NavbarItem: React.FC<NavbarItemProps> = ({
  children,
  isActive = false,
  className = '',
}) => {
  const { classNames } = useNavbarContext();
  return (
    <li
      className={clsx(
        'relative flex items-center justify-center text-sm font-medium transition-colors cursor-pointer text-default-600 dark:text-default-400 hover:text-foreground',
        isActive && 'text-primary font-semibold',
        classNames.item,
        className
      )}
    >
      {children}
    </li>
  );
};

// ─── NavbarMenuToggle Component ──────────────────────────────────────────────

export interface NavbarMenuToggleProps {
  icon?: React.ReactNode | ((isOpen: boolean | undefined) => React.ReactNode);
  isSelected?: boolean;
  defaultSelected?: boolean;
  srOnlyText?: string;
  onChange?: (isOpen: boolean) => void;
  className?: string;
}

export const NavbarMenuToggle: React.FC<NavbarMenuToggleProps> = ({
  icon,
  isSelected,
  defaultSelected: _defaultSelected = false,
  srOnlyText = 'open/close navigation menu',
  onChange,
  className = '',
}) => {
  const { isMenuOpen, setIsMenuOpen, classNames } = useNavbarContext();

  const activeState = isSelected !== undefined ? isSelected : isMenuOpen;

  const handleToggle = () => {
    const nextState = !activeState;
    setIsMenuOpen(nextState);
    onChange?.(nextState);
  };

  const renderIcon = () => {
    if (typeof icon === 'function') {
      return icon(activeState);
    }
    if (icon) {
      return icon;
    }
    // Default HeroUI style animated hamburger icon
    return (
      <div className={clsx('w-5 h-5 flex flex-col justify-around items-center', classNames.toggleIcon)}>
        <span
          className={clsx(
            'w-full h-0.5 bg-current transition-all duration-300 transform origin-center',
            activeState && 'translate-y-1.5 rotate-45'
          )}
        />
        <span
          className={clsx(
            'w-full h-0.5 bg-current transition-all duration-300',
            activeState && 'opacity-0'
          )}
        />
        <span
          className={clsx(
            'w-full h-0.5 bg-current transition-all duration-300 transform origin-center',
            activeState && '-translate-y-1.5 -rotate-45'
          )}
        />
      </div>
    );
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={srOnlyText}
      aria-expanded={activeState}
      className={clsx(
        `group flex items-center justify-center w-9 h-9 ${getRadiusClass()} p-2 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 focus:outline-none transition-colors cursor-pointer`,
        classNames.toggle,
        className
      )}
    >
      <span className="sr-only">{srOnlyText}</span>
      {renderIcon()}
    </button>
  );
};

// ─── NavbarMenu Component ────────────────────────────────────────────────────

export interface NavbarMenuProps {
  children?: React.ReactNode;
  portalContainer?: HTMLElement;
  motionProps?: HTMLMotionProps<'ul'>;
  className?: string;
}

export const NavbarMenu: React.FC<NavbarMenuProps> = ({
  children,
  portalContainer,
  motionProps,
  className = '',
}) => {
  const { isMenuOpen, disableAnimation, classNames, height } = useNavbarContext();

  const menuContent = (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.ul
          initial={disableAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={disableAnimation ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ top: height }}
          className={clsx(
            'md:hidden fixed left-0 right-0 bottom-0 z-30 flex flex-col gap-3 p-6 bg-white dark:bg-content1 text-foreground backdrop-blur-xl border-t border-default-200 dark:border-default-800 overflow-y-auto list-none m-0 shadow-2xl transition-colors',
            classNames.menu,
            className
          )}
          {...motionProps}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return null;

  const targetContainer = portalContainer || document.body;
  return createPortal(menuContent, targetContainer);
};

// ─── NavbarMenuItem Component ────────────────────────────────────────────────

export interface NavbarMenuItemProps {
  children?: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export const NavbarMenuItem: React.FC<NavbarMenuItemProps> = ({
  children,
  isActive = false,
  className = '',
}) => {
  const { classNames } = useNavbarContext();
  return (
    <li
      className={clsx(
        `w-full text-base font-medium py-1.5 px-3 ${getRadiusClass()} transition-colors text-default-700 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer`,
        isActive && 'text-primary font-semibold bg-primary-50 dark:bg-primary-900/20',
        classNames.menuItem,
        className
      )}
    >
      {children}
    </li>
  );
};

export default Navbar;
