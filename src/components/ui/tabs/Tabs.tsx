import React, { useState, useId } from "react";
import { motion } from "framer-motion";
import { DEFAULT_RADIUS, radiusClasses, type Radius } from "../shared/radius";

export interface TabItem {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
    icon?: React.ReactNode;
    /** Optional count badge displayed to the right of the label */
    count?: number;
    disabled?: boolean;
}

export interface TabProps {
    key?: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    disabled?: boolean;
    isDisabled?: boolean;
    count?: number;
    icon?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = () => null;
Tab.displayName = "Tab";

export interface TabsProps {
    /**
     * Array of tab items with id, label, content, and optional disabled state.
     */
    items?: TabItem[];
    /**
     * React children representing Tab elements.
     */
    children?: React.ReactNode;
    /**
     * The visual style variant of the tabs.
     * @default "solid"
     */
    variant?: "solid" | "bordered" | "light" | "underlined";
    /**
     * The color theme of the tabs.
     * @default "primary"
     */
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    /**
     * The size of the tab buttons.
     * @default "md"
     */
    size?: "sm" | "md" | "lg";
    /**
     * The border radius of the tab buttons container/items.
     * @default "md"
     */
    radius?: Radius;
    /**
     * Optional custom key to control active state from parent.
     */
    activeKey?: string;
    /**
     * Controlled key of selected tab.
     */
    selectedKey?: string;
    /**
     * Default selected tab key.
     */
    defaultSelectedKey?: string;
    /**
     * Callback triggered when tab selection changes.
     */
    onChange?: (key: string) => void;
    /**
     * Callback triggered when tab selection changes (HeroUI compatibility).
     */
    onSelectionChange?: (key: string) => void;
    /**
     * Additional CSS classes for the container.
     */
    className?: string;
    /**
     * Position of the tabs container relative to the content panel.
     * @default "top"
     */
    placement?: "top" | "bottom" | "start" | "end";
    /**
     * Whether the tabs orientation is vertical.
     * If true, it invalidates the placement prop and displays tabs vertically on the left.
     * @default false
     */
    isVertical?: boolean;
    /**
     * Whether all tabs are disabled.
     * @default false
     */
    isDisabled?: boolean;
    /**
     * Keys of tabs that should be disabled.
     */
    disabledKeys?: string[];
    /**
     * Whether the underline variant stretches to the full width of its container.
     * @default false
     */
    isFullUnderline?: boolean;
}

const getCleanKey = (childKey: string | null | undefined, index: number): string => {
    if (childKey === null || childKey === undefined) {
        return String(index);
    }
    const keyStr = String(childKey);
    const lastSegment = keyStr.split(":").pop() || "";
    const clean = lastSegment.replace(/^\$/, "").replace(/^\./, "");
    return clean || String(index);
};

export const Tabs: React.FC<TabsProps> = ({
    items,
    children,
    variant = "solid",
    color = "primary",
    size = "md",
    radius = DEFAULT_RADIUS,
    activeKey: controlledActiveKey,
    selectedKey,
    defaultSelectedKey,
    onChange,
    onSelectionChange,
    className = "",
    placement = "top",
    isVertical = false,
    isDisabled = false,
    disabledKeys,
    isFullUnderline = false,
}) => {
    const uniqueId = useId();

    // Construct resolvedItems from items or children
    const resolvedItems: TabItem[] = [];
    if (items) {
        resolvedItems.push(...items);
    } else if (children) {
        React.Children.forEach(children, (child, index) => {
            if (React.isValidElement(child)) {
                const childProps = child.props as any;
                const key = childProps.id || getCleanKey(child.key, index);
                resolvedItems.push({
                    id: key,
                    label: childProps.title || "",
                    content: childProps.children,
                    icon: childProps.icon,
                    count: childProps.count,
                    disabled: childProps.disabled || childProps.isDisabled,
                });
            }
        });
    }

    const activeKeyControlled = selectedKey !== undefined
        ? selectedKey
        : (controlledActiveKey !== undefined ? controlledActiveKey : undefined);

    const [internalActiveKey, setInternalActiveKey] = useState<string>(() => {
        if (activeKeyControlled !== undefined) {
            return activeKeyControlled;
        }
        if (defaultSelectedKey !== undefined) {
            return defaultSelectedKey;
        }
        return resolvedItems.length > 0 ? resolvedItems[0].id : "";
    });

    const activeKey = activeKeyControlled !== undefined ? activeKeyControlled : internalActiveKey;

    const handleTabClick = (item: TabItem) => {
        if (isDisabled || item.disabled || disabledKeys?.includes(item.id)) return;
        if (activeKeyControlled === undefined) {
            setInternalActiveKey(item.id);
        }
        if (onChange) {
            onChange(item.id);
        }
        if (onSelectionChange) {
            onSelectionChange(item.id);
        }
    };

    // Determine the resolved layout placement (isVertical overrides placement to "start")
    const resolvedPlacement = isVertical ? "start" : placement;
    const isVerticalLayout = isVertical || resolvedPlacement === "start" || resolvedPlacement === "end";

    // ── Style Mappings ──

    const sizeClasses = {
        sm: {
            container: "gap-1",
            tab: "text-xs px-3 py-1.5",
        },
        md: {
            container: "gap-1.5",
            tab: "text-sm px-4 py-2",
        },
        lg: {
            container: "gap-2",
            tab: "text-base px-5 py-2.5",
        },
    }[size];

    const currentRadiusClass = radiusClasses[radius] ?? radiusClasses[DEFAULT_RADIUS];

    // Build the tab list container styles
    const getTabListClasses = () => {
        const base = isVerticalLayout ? "flex flex-col" : "flex items-center";

        // When disabled, the container has an opacity-like look or light background
        // As per the image: inactive tabs / container backgrounds are identical gray/light gray across all color options.
        // The container background is neutral-100 (light) or neutral-800 (dark) for solid, bordered, and light variants.
        const baseContainerBg = "bg-neutral-100 dark:bg-neutral-800/80";

        if (variant === "underlined") {
            if (isVerticalLayout) {
                const borderSide = resolvedPlacement === "end" ? "border-l-2" : "border-r-2";
                return `${base} bg-transparent ${borderSide} border-neutral-200 dark:border-neutral-800 h-full w-full`;
            }
            return `${base} bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 ${isFullUnderline ? "w-full" : "w-fit"}`;
        }

        if (variant === "solid") {
            // Add a transparent 2px border to match the visual footprint and height of the bordered variant perfectly
            return `${base} ${baseContainerBg} p-1 border-2 border-transparent w-fit`;
        }

        if (variant === "light") {
            // Light variant has a transparent container background
            return `${base} bg-transparent p-1 border-2 border-transparent w-fit`;
        }

        if (variant === "bordered") {
            // Bordered variant has transparent container background with border
            return `${base} bg-transparent border-2 border-neutral-200 dark:border-neutral-800 p-1 w-fit`;
        }

        return base;
    };

    // Colors mapping for active button label text color
    const getActiveTextClass = () => {
        if (variant === "underlined") {
            return {
                default:   "text-neutral-900 dark:text-white font-semibold",
                primary:   "text-primary dark:text-primary-400 font-semibold",
                secondary: "text-secondary dark:text-secondary-400 font-semibold",
                success:   "text-success dark:text-success-400 font-semibold",
                warning:   "text-warning dark:text-warning-400 font-semibold",
                danger:    "text-danger dark:text-danger-400 font-semibold",
            }[color];
        }

        // As per the image, success and warning variants have dark/black text (text-neutral-950/text-neutral-900) when active.
        // Primary, Secondary, Danger have white text when active.
        return {
            default:   "text-default-foreground font-semibold",
            primary:   "text-primary-foreground font-semibold",
            secondary: "text-secondary-foreground font-semibold",
            success:   "text-success-foreground font-semibold",
            warning:   "text-warning-foreground font-semibold",
            danger:    "text-danger-foreground font-semibold",
        }[color];
    };

    // Colors mapping for active sliding indicator background/accent
    const getIndicatorClass = () => {
        if (variant === "underlined") {
            if (isVerticalLayout) {
                const alignment = resolvedPlacement === "end" ? "left-0" : "right-0";
                return {
                    default: `absolute ${alignment} top-0 bottom-0 w-[2px] bg-default-900 dark:bg-white z-0`,
                    primary: `absolute ${alignment} top-0 bottom-0 w-[2px] bg-primary dark:bg-primary-400 z-0`,
                    secondary: `absolute ${alignment} top-0 bottom-0 w-[2px] bg-secondary dark:bg-secondary-400 z-0`,
                    success: `absolute ${alignment} top-0 bottom-0 w-[2px] bg-success dark:bg-success-400 z-0`,
                    warning: `absolute ${alignment} top-0 bottom-0 w-[2px] bg-warning dark:bg-warning-400 z-0`,
                    danger: `absolute ${alignment} top-0 bottom-0 w-[2px] bg-danger dark:bg-danger-400 z-0`,
                }[color];
            }
            return {
                default: "absolute -bottom-[2px] left-0 right-0 h-[2px] bg-default-900 dark:bg-white z-10",
                primary: "absolute -bottom-[2px] left-0 right-0 h-[2px] bg-primary dark:bg-primary-400 z-10",
                secondary: "absolute -bottom-[2px] left-0 right-0 h-[2px] bg-secondary dark:bg-secondary-400 z-10",
                success: "absolute -bottom-[2px] left-0 right-0 h-[2px] bg-success dark:bg-success-400 z-10",
                warning: "absolute -bottom-[2px] left-0 right-0 h-[2px] bg-warning dark:bg-warning-400 z-10",
                danger: "absolute -bottom-[2px] left-0 right-0 h-[2px] bg-danger dark:bg-danger-400 z-10",
            }[color];
        }

        // For solid, light, and bordered, the indicator determines the background color of the active tab.
        return {
            default: variant === "solid"
                ? "absolute inset-0 bg-white dark:bg-neutral-700 shadow-sm z-0"
                : "absolute inset-0 bg-white dark:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-600/80 shadow-sm z-0",
            primary:   "absolute inset-0 bg-primary z-0",
            secondary: "absolute inset-0 bg-secondary z-0",
            success:   "absolute inset-0 bg-success z-0",
            warning:   "absolute inset-0 bg-warning z-0",
            danger:    "absolute inset-0 bg-danger z-0",
        }[color];
    };

    const inactiveTextClass = "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300";
    const activeTextClass = getActiveTextClass();
    const indicatorClass = getIndicatorClass();

    /**
     * Badge classes change based on:
     *  - isActive + variant: colored-bg tabs (solid/bordered) → white badge
     *  - inactive or underlined/light → theme-palette colored subtle badge
     */
    const getCountBadgeClass = (isActive: boolean): string => {
        // On solid/bordered active tabs the bg is the color — use white/transparent badge
        if (isActive && (variant === "solid" || variant === "bordered" || variant === "light")) {
            return "bg-white/25 text-white";
        }
        // On light active tabs the bg is a tinted pastel — use themed text+bg
        if (isActive && variant === "underlined") {
            return ({
                default: "bg-default-400 text-white",
                primary: "bg-primary-400 text-white",
                secondary: "bg-secondary-400 text-white",
                success: "bg-success-400 text-white",
                warning: "bg-warning-400 text-white",
                danger: "bg-danger-400 text-white",
            } as const)[color];
        }
        // Inactive tabs (all variants) and active underlined — muted neutral
        return "bg-default-300 dark:bg-default-700 text-default-600 dark:text-default-300";
    };

    // Set overall container flex orientation
    const containerClasses = {
        top: "flex flex-col gap-4",
        bottom: "flex flex-col-reverse gap-4",
        start: "flex flex-row gap-6 items-start",
        end: "flex flex-row-reverse gap-6 items-start",
    }[resolvedPlacement];

    const activeContent = resolvedItems.find((item) => item.id === activeKey)?.content;

    return (
        <div className={`w-full ${containerClasses} ${className}`}>
            {/* Tabs List */}
            <div className={isVerticalLayout ? "shrink-0 min-w-[140px]" : "w-full"}>
                <div
                    role="tablist"
                    className={`${getTabListClasses()} ${variant !== "underlined" ? currentRadiusClass : ""} ${sizeClasses.container}`}
                >
                    {resolvedItems.map((item) => {
                        const isActive = item.id === activeKey;
                        const isTabDisabled = isDisabled || item.disabled || disabledKeys?.includes(item.id);

                        return (
                            <button
                                key={item.id}
                                role="tab"
                                aria-selected={isActive}
                                disabled={isTabDisabled}
                                onClick={() => handleTabClick(item)}
                                className={`
                                    relative select-none outline-none font-medium flex items-center justify-center cursor-pointer
                                    disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-300
                                    ${sizeClasses.tab} ${variant !== "underlined" ? currentRadiusClass : "rounded-none"}
                                    ${isActive ? activeTextClass : inactiveTextClass}
                                    ${isVerticalLayout ? "w-full text-left" : ""}
                                `}
                            >
                                {/* Active sliding indicator using Framer Motion */}
                                {isActive && (
                                    <motion.div
                                        layoutId={`activeTabIndicator-${uniqueId}`}
                                        className={`${indicatorClass} ${variant !== "underlined" ? currentRadiusClass : ""}`}
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                                    <span>{item.label}</span>
                                    {item.count !== undefined && (
                                        <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[11px] font-semibold rounded-full transition-colors duration-300 ${getCountBadgeClass(isActive)}`}>
                                            {item.count}
                                        </span>
                                    )}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Panel */}
            <div
                role="tabpanel"
                className="w-full flex-grow transition-all duration-300 animate-fade-in"
            >
                {activeContent}
            </div>
        </div>
    );
};

export default Tabs;
