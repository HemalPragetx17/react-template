import React from "react";
import { FaChevronRight, FaHome } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { Routing } from "../../../routes/routing";
import { sidebarRoutes } from "../../../shared/constants/sidebar-data";

// Global config toggle for the breadcrumbs system
// To disable breadcrumbs throughout the app, simply set this to false
export const SHOW_SYSTEM_BREADCRUMBS = true;

export interface BreadcrumbsProps {
    /**
     * The size of the breadcrumbs text and spacing.
     * @default "md"
     */
    size?: "sm" | "md" | "lg";
    /**
     * The color theme of the breadcrumbs.
     * @default "default"
     */
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    /**
     * The visual style variant of the breadcrumbs container.
     * @default "light"
     */
    variant?: "solid" | "bordered" | "light";
    /**
     * The underline behavior of the breadcrumbs links.
     * @default "hover"
     */
    underline?: "none" | "hover" | "always" | "active" | "focus";
    /**
     * The border radius of the breadcrumbs container (applicable to solid and bordered variants).
     * @default "md"
     */
    radius?: "none" | "sm" | "md" | "lg" | "full";
    /**
     * Optional static items to display. If provided, dynamic generation from path is skipped.
     */
    items?: BreadcrumbItem[];
    /**
     * Custom separator between breadcrumbs.
     */
    separator?: React.ReactNode;
    /**
     * Whether the breadcrumbs are disabled.
     * @default false
     */
    isDisabled?: boolean;
    /**
     * Content to render at the start of the breadcrumbs container.
     */
    startContent?: React.ReactNode;
    /**
     * Content to render at the end of the breadcrumbs container.
     */
    endContent?: React.ReactNode;
}

export interface BreadcrumbItem {
    label: string;
    path: string;
    isLast: boolean;
    isClickable: boolean;
    startContent?: React.ReactNode;
    endContent?: React.ReactNode;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    size = "md",
    color = "default",
    variant = "light",
    underline = "hover",
    radius = "md",
    items: staticItems,
    separator,
    isDisabled = false,
    startContent,
    endContent,
}) => {
    const { pathname } = useLocation();

    // If breadcrumbs are disabled globally, render nothing
    if (!SHOW_SYSTEM_BREADCRUMBS) {
        return null;
    }

    // Do not show breadcrumbs on auth pages (if they somehow use MainLayout) or home root
    if (!staticItems && (pathname === Routing.Login || pathname === Routing.ForgotPassword || pathname === "/")) {
        return null;
    }

    // Build the items list dynamically
    const items: BreadcrumbItem[] = staticItems ? [...staticItems] : [];

    if (!staticItems) {
        // Always start with "Home" linking to Dashboard
        items.push({
            label: "Home",
            path: Routing.Dashboard,
            isLast: pathname === Routing.Dashboard,
            isClickable: pathname !== Routing.Dashboard,
        });

        // Helper to format string to Clean Title Case (e.g. "sub-category" -> "Sub Category")
        const formatSegmentLabel = (segment: string): string => {
            return segment
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        };

        // Find the current route in sidebarRoutes dynamically to build hierarchy
        let foundInSidebar = false;

        for (const menu of sidebarRoutes) {
            if (menu.route === pathname) {
                if (menu.route !== Routing.Dashboard) {
                    items.push({
                        label: menu.name,
                        path: menu.route,
                        isLast: true,
                        isClickable: false,
                    });
                }
                foundInSidebar = true;
                break;
            }

            if (menu.childs) {
                const child = menu.childs.find((c) => c.route === pathname);
                if (child) {
                    // Found as a child under menu (e.g. Master)
                    items.push({
                        label: menu.name,
                        path: menu.route || "",
                        isLast: false,
                        isClickable: !!menu.route && menu.route !== pathname && (!menu.childs || menu.childs.length === 0),
                    });
                    items.push({
                        label: child.name,
                        path: child.route,
                        isLast: true,
                        isClickable: false,
                    });
                    foundInSidebar = true;
                    break;
                }
            }
        }

        // Fallback: Dynamically generate from path segments if not registered in sidebar (e.g. /dashboard/demo-form)
        if (!foundInSidebar) {
            const prefix = import.meta.env.VITE_PATH_PREFIX || "";
            const cleanPrefix = prefix.replace(/^\/|\/$/g, "");
            const segments = pathname
                .split("/")
                .filter(Boolean)
                .filter((seg) => seg !== cleanPrefix);

            let accumulatedPath = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;

            segments.forEach((segment, idx) => {
                accumulatedPath += `/${segment}`;

                // Skip adding "Dashboard" segment if Home already exists
                if (segment.toLowerCase() === "dashboard") {
                    return;
                }

                const label = formatSegmentLabel(segment);
                const isLast = idx === segments.length - 1;

                items.push({
                    label,
                    path: accumulatedPath,
                    isLast,
                    isClickable: !isLast,
                });
            });
        }
    }

    // ── Style Mappings ──

    const sizeClasses = {
        sm: {
            container: "text-xs px-1.5 py-1 gap-1",
            list: "space-x-1",
            separator: "h-3 w-3",
            separatorMargin: "mx-1",
            strokeWidth: 2,
            icon: "w-3 h-3",
            gap: "gap-1",
        },
        md: {
            container: "text-sm px-2 py-1.5 gap-1.5",
            list: "space-x-1.5",
            separator: "h-3.5 w-3.5",
            separatorMargin: "mx-1.5",
            strokeWidth: 2,
            icon: "w-3.5 h-3.5",
            gap: "gap-1.5",
        },
        lg: {
            container: "text-base px-2.5 py-2 gap-2",
            list: "space-x-2",
            separator: "h-4 w-4",
            separatorMargin: "mx-2",
            strokeWidth: 2,
            icon: "w-4 h-4",
            gap: "gap-2",
        },
    }[size];

    const radiusClasses = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
    }[radius];

    type BreadcrumbColor = NonNullable<BreadcrumbsProps["color"]>;

    const colorStyles: Record<BreadcrumbColor, {
        link: string;
        active: string;
        separator: string;
        bordered: string;
        solid: string;
    }> = {
        default: {
            link: "text-default-600 dark:text-default-700",
            active: "text-foreground dark:text-foreground font-bold",
            separator: "text-default-400 dark:text-default-600",
            bordered: "border border-default-200 dark:border-default-700 bg-transparent",
            solid: "bg-default-100 dark:bg-default-200",
        },
        primary: {
            link: "text-primary dark:text-primary-400",
            active: "text-primary dark:text-primary-400 font-bold",
            separator: "text-primary-300 dark:text-primary-700",
            bordered: "border border-primary-200 dark:border-primary-800 bg-transparent",
            solid: "bg-primary-50 dark:bg-primary-50",
        },
        secondary: {
            link: "text-secondary dark:text-secondary-400",
            active: "text-secondary dark:text-secondary-400 font-bold",
            separator: "text-secondary-300 dark:text-secondary-700",
            bordered: "border border-secondary-200 dark:border-secondary-800 bg-transparent",
            solid: "bg-secondary-50 dark:bg-secondary-50",
        },
        success: {
            link: "text-success dark:text-success-400",
            active: "text-success dark:text-success-400 font-bold",
            separator: "text-success-300 dark:text-success-700",
            bordered: "border border-success-200 dark:border-success-800 bg-transparent",
            solid: "bg-success-50 dark:bg-success-50",
        },
        warning: {
            link: "text-warning dark:text-warning-400",
            active: "text-warning dark:text-warning-400 font-bold",
            separator: "text-warning-300 dark:text-warning-700",
            bordered: "border border-warning-200 dark:border-warning-800 bg-transparent",
            solid: "bg-warning-50 dark:bg-warning-50",
        },
        danger: {
            link: "text-danger dark:text-danger-400",
            active: "text-danger dark:text-danger-400 font-bold",
            separator: "text-danger-300 dark:text-danger-700",
            bordered: "border border-danger-200 dark:border-danger-800 bg-transparent",
            solid: "bg-danger-50 dark:bg-danger-50",
        },
    };

    const currentColor = colorStyles[color];
    const linkColorClasses = currentColor.link;
    const separatorColorClasses = currentColor.separator;
    const activeColorClasses = currentColor.active;

    const variantClasses = {
        light: "bg-transparent p-0",
        solid: `${currentColor.solid} inline-flex items-center max-w-fit`,
        bordered: `${currentColor.bordered} inline-flex items-center max-w-fit`,
    }[variant];

    const underlineClasses = {
        none: "no-underline",
        hover: "hover:underline underline-offset-4",
        always: "underline underline-offset-4",
        active: "active:underline underline-offset-4",
        focus: "focus:underline underline-offset-4",
    }[underline];

    const linkInteractionClasses = "transition-opacity hover:opacity-80 active:opacity-disabled cursor-pointer";

    return (
        <nav
            aria-label="Breadcrumbs"
            className={`mb-5 select-none animate-fade-in transition-all duration-200 ${variantClasses} ${variant !== "light" ? radiusClasses : ""} ${sizeClasses.container} ${isDisabled ? "opacity-disabled pointer-events-none" : ""}`}
        >
            <ol className={`flex items-center ${sizeClasses.list}`}>
                {startContent && (
                    <li className="flex items-center shrink-0">
                        {startContent}
                    </li>
                )}
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    const isItemDisabled = isDisabled && !isLast;
                    const canClick = item.isClickable && !isDisabled;

                    // Determine the item separator element
                    const showSeparator = idx > 0 || (idx === 0 && startContent !== undefined);

                    return (
                        <li key={idx} className="flex items-center">
                            {showSeparator && (
                                <span className={`shrink-0 flex items-center justify-center ${sizeClasses.separatorMargin}`}>
                                    {separator !== undefined ? (
                                        <span className={separatorColorClasses}>{separator}</span>
                                    ) : (
                                        <FaChevronRight
                                            className={`${sizeClasses.separator} ${separatorColorClasses}`}
                                            aria-hidden
                                        />
                                    )}
                                </span>
                            )}

                            {isLast ? (
                                <span className={`${activeColorClasses} flex items-center cursor-default ${sizeClasses.gap}`}>
                                    {item.startContent}
                                    {item.label === "Home" && !item.startContent && (
                                        <FaHome className={sizeClasses.icon} aria-hidden />
                                    )}
                                    {item.label}
                                    {item.endContent}
                                </span>
                            ) : canClick ? (
                                <Link
                                    to={item.path}
                                    className={`flex items-center ${linkColorClasses} ${linkInteractionClasses} ${underlineClasses} ${sizeClasses.gap}`}
                                >
                                    {item.startContent}
                                    {item.label === "Home" && !item.startContent && (
                                        <FaHome className={sizeClasses.icon} aria-hidden />
                                    )}
                                    {item.label}
                                    {item.endContent}
                                </Link>
                            ) : (
                                <span className={`flex items-center ${isItemDisabled ? `${linkColorClasses} opacity-50 cursor-not-allowed select-none` : linkColorClasses} ${sizeClasses.gap}`}>
                                    {item.startContent}
                                    {item.label === "Home" && !item.startContent && (
                                        <FaHome className={sizeClasses.icon} aria-hidden />
                                    )}
                                    {item.label}
                                    {item.endContent}
                                </span>
                            )}
                        </li>
                    );
                })}
                {endContent && (
                    <>
                        <li className="flex items-center shrink-0">
                            <span className={`shrink-0 flex items-center justify-center ${sizeClasses.separatorMargin}`}>
                                {separator !== undefined ? (
                                    <span className={separatorColorClasses}>{separator}</span>
                                ) : (
                                    <FaChevronRight
                                        className={`${sizeClasses.separator} ${separatorColorClasses}`}
                                        aria-hidden
                                    />
                                )}
                            </span>
                        </li>
                        <li className="flex items-center shrink-0">
                            {endContent}
                        </li>
                    </>
                )}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
