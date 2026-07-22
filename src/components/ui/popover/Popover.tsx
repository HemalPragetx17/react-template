import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { DEFAULT_RADIUS, getRadiusClass, type Radius } from "../shared/radius";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PopoverPlacement =
    | "top" | "top-start" | "top-end"
    | "bottom" | "bottom-start" | "bottom-end"
    | "left" | "left-start" | "left-end"
    | "right" | "right-start" | "right-end";

export type PopoverColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "foreground";

export type PopoverSize = "sm" | "md" | "lg";

export type PopoverRadius = Radius;

export type PopoverShadow = "none" | "sm" | "md" | "lg";

export type PopoverBackdrop = "transparent" | "opaque" | "blur";

export interface PopoverProps {
    /** The trigger element (button, icon, etc.) that opens the popover */
    trigger: React.ReactNode;
    /** Popover panel content */
    children: React.ReactNode;
    /** Placement of the popover relative to the trigger */
    placement?: PopoverPlacement;
    /** Color theme for the popover panel border/arrow */
    color?: PopoverColor;
    /** Size of the popover typography and padding */
    size?: PopoverSize;
    /** Border radius of the popover panel */
    radius?: Radius;
    /** Shadow strength of the popover panel */
    shadow?: PopoverShadow;
    /** Show an arrow pointing from the panel to the trigger */
    showArrow?: boolean;
    /** Offset in px between trigger and popover panel */
    offset?: number;
    /** Backdrop style behind the popover */
    backdrop?: PopoverBackdrop;
    /** Whether to control open state externally */
    isOpen?: boolean;
    /** Callback when open state changes */
    onOpenChange?: (open: boolean) => void;
    /** Close when clicking outside (default true) */
    closeOnOutsideClick?: boolean;
    /** Additional CSS classes on the popover panel */
    className?: string;
    /** Panel min-width override */
    minWidth?: string;
    /**
     * How the popover is triggered.
     * - "click" (default): toggles on trigger click
     * - "hover": opens on mouseenter and closes on mouseleave — use as a tooltip
     */
    triggerMode?: "click" | "hover";
    /**
     * Open / close delay in ms for hover mode.
     * @default { open: 0, close: 100 }
     */
    delay?: { open?: number; close?: number };
    /** Additional CSS classes on the popover trigger wrapper */
    triggerClassName?: string;
    /** Dependencies that should trigger a repositioning calculation */
    repositionDeps?: any[];
    /** Whether to disable entry/exit animations */
    disableAnimation?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const colorBorderMap: Record<PopoverColor, string> = {
    default: "border-default-200 dark:border-default-800/40",
    primary: "border-primary",
    secondary: "border-secondary",
    success: "border-success",
    warning: "border-warning",
    danger: "border-danger",
    foreground: "border-default-foreground dark:border-default-foreground",
};

const colorBgMap: Record<PopoverColor, string> = {
    default: "bg-white dark:bg-content1 text-black dark:text-white",
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    success: "bg-success text-black",
    warning: "bg-warning text-black",
    danger: "bg-danger text-black",
    foreground: "bg-default-foreground dark:bg-default-foreground text-white dark:text-black",
};

const colorArrowMap: Record<PopoverColor, string> = {
    default: "border-default-200 dark:border-default-800/40",
    primary: "border-primary",
    secondary: "border-secondary",
    success: "border-success",
    warning: "border-warning",
    danger: "border-danger",
    foreground: "border-default-foreground dark:border-default-foreground",
};

const colorArrowBgMap: Record<PopoverColor, string> = {
    default: "bg-white dark:bg-content1",
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    foreground: "bg-default-foreground dark:bg-default-foreground",
};

const sizeClasses: Record<PopoverSize, string> = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
};

const shadowClasses: Record<PopoverShadow, string> = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
};

function getAlignment(placement: PopoverPlacement) {
    if (placement.endsWith("-start")) return "start";
    if (placement.endsWith("-end")) return "end";
    return "center";
}

function getSide(placement: PopoverPlacement): "top" | "bottom" | "left" | "right" {
    if (placement.startsWith("top")) return "top";
    if (placement.startsWith("bottom")) return "bottom";
    if (placement.startsWith("left")) return "left";
    return "right";
}

function computePosition(
    triggerRect: DOMRect,
    panelEl: HTMLElement,
    side: "top" | "bottom" | "left" | "right",
    alignment: "start" | "center" | "end",
    offset: number,
): { top: number; left: number } {
    const { width: pW, height: pH } = panelEl.getBoundingClientRect();
    const { top: tT, left: tL, width: tW, height: tH } = triggerRect;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    if (side === "bottom") {
        top = tT + tH + offset + scrollY;
        if (alignment === "start") left = tL + scrollX;
        else if (alignment === "end") left = tL + tW - pW + scrollX;
        else left = tL + tW / 2 - pW / 2 + scrollX;
    } else if (side === "top") {
        top = tT - pH - offset + scrollY;
        if (alignment === "start") left = tL + scrollX;
        else if (alignment === "end") left = tL + tW - pW + scrollX;
        else left = tL + tW / 2 - pW / 2 + scrollX;
    } else if (side === "left") {
        left = tL - pW - offset + scrollX;
        if (alignment === "start") top = tT + scrollY;
        else if (alignment === "end") top = tT + tH - pH + scrollY;
        else top = tT + tH / 2 - pH / 2 + scrollY;
    } else {
        left = tL + tW + offset + scrollX;
        if (alignment === "start") top = tT + scrollY;
        else if (alignment === "end") top = tT + tH - pH + scrollY;
        else top = tT + tH / 2 - pH / 2 + scrollY;
    }

    return { top, left };
}

const getMotionVariants = (disableAnimation: boolean) => ({
    initial: disableAnimation ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.90, y: -4 },
    animate: disableAnimation
        ? { opacity: 1, scale: 1, y: 0, transition: { duration: 0 } }
        : {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                opacity: { duration: 0.2, ease: "easeOut" },
                scale: { duration: 0.2, ease: "easeOut" },
                y: { type: "spring", stiffness: 400, damping: 28 }
            }
        },
    exit: disableAnimation
        ? { opacity: 1, scale: 1, y: 0, transition: { duration: 0 } }
        : {
            opacity: 0,
            scale: 0.95,
            y: -4,
            transition: {
                opacity: { duration: 0.15, ease: "easeIn" },
                scale: { duration: 0.15, ease: "easeIn" },
                y: { duration: 0.15, ease: "easeIn" }
            }
        },
});

// ─── Component ───────────────────────────────────────────────────────────────

const Popover: React.FC<PopoverProps> = ({
    trigger,
    children,
    placement = "bottom",
    color = "default",
    size = "md",
    radius = DEFAULT_RADIUS,
    shadow = "lg",
    showArrow = false,
    offset = 8,
    backdrop = "transparent",
    isOpen: controlledOpen,
    onOpenChange,
    closeOnOutsideClick = true,
    className = "",
    minWidth,
    triggerClassName = "",
    triggerMode = "click",
    delay = {},
    repositionDeps,
    disableAnimation = false,
}) => {
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldDisable = disableAnimation || prefersReducedMotion;
    const motionVariants = getMotionVariants(shouldDisable);
    const openDelay = delay.open ?? 0;
    const closeDelay = delay.close ?? 100;
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Hover mode never renders a backdrop — force transparent regardless of prop
    const effectiveBackdrop: PopoverBackdrop = triggerMode === "hover" ? "transparent" : backdrop;
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const triggerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    // arrowOffset: px distance from the panel's leading edge (left for top/bottom, top for left/right)
    const [arrowOffset, setArrowOffset] = useState<number>(0);

    const side = getSide(placement);
    const alignment = getAlignment(placement);

    const setOpen = useCallback((val: boolean) => {
        if (controlledOpen === undefined) setInternalOpen(val);
        onOpenChange?.(val);
    }, [controlledOpen, onOpenChange]);

    const toggle = () => setOpen(!open);

    // ── Hover mode handlers ──────────────────────────────────────────────────
    const handleMouseEnter = useCallback(() => {
        if (triggerMode !== "hover") return;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => setOpen(true), openDelay);
    }, [triggerMode, openDelay, setOpen]);

    const handleMouseLeave = useCallback(() => {
        if (triggerMode !== "hover") return;
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = setTimeout(() => setOpen(false), closeDelay);
    }, [triggerMode, closeDelay, setOpen]);

    // Cleanup hover timer on unmount
    useEffect(() => () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current); }, []);

    // Compute panel position + arrow offset on open / resize
    const recompute = useCallback(() => {
        if (!triggerRef.current || !panelRef.current) return;
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const panelRect = panelRef.current.getBoundingClientRect();
        let position = computePosition(triggerRect, panelRef.current, side, alignment, offset);

        // ── Viewport clamping ──────────────────────────────────────────────────
        // Clamp so the panel never overflows the visible viewport area.
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = 8; // px gap from viewport edge
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Horizontal clamp (applies for top/bottom placements)
        const minLeft = margin + scrollX;
        const maxLeft = vw - panelRect.width - margin + scrollX;
        position = { ...position, left: Math.min(Math.max(position.left, minLeft), maxLeft) };

        // Vertical clamp (applies for left/right placements, plus prevents top overflow)
        const minTop = margin + scrollY;
        const maxTop = vh - panelRect.height - margin + scrollY;
        position = { ...position, top: Math.min(Math.max(position.top, minTop), maxTop) };

        setPos(position);

        // ── Arrow offset (points at trigger center relative to clamped panel) ──
        const arrowSize = 12; // w-3 h-3 = 12px
        const half = arrowSize / 2;
        if (side === "top" || side === "bottom") {
            const triggerCenterX = triggerRect.left + triggerRect.width / 2;
            const clampedPanelLeft = position.left - scrollX;
            const raw = triggerCenterX - clampedPanelLeft - half;
            const arrowMargin = Math.min(12, (panelRect.width - arrowSize) / 2);
            setArrowOffset(Math.min(Math.max(raw, arrowMargin), panelRect.width - arrowSize - arrowMargin));
        } else {
            const triggerCenterY = triggerRect.top + triggerRect.height / 2;
            const clampedPanelTop = position.top - scrollY;
            const raw = triggerCenterY - clampedPanelTop - half;
            const arrowMargin = Math.min(12, (panelRect.height - arrowSize) / 2);
            setArrowOffset(Math.min(Math.max(raw, arrowMargin), panelRect.height - arrowSize - arrowMargin));
        }
    }, [side, alignment, offset]);

    useEffect(() => {
        if (!open) return;
        // Slight delay so the panel is mounted before we read its size
        const raf = requestAnimationFrame(recompute);
        window.addEventListener("resize", recompute);
        window.addEventListener("scroll", recompute, true);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", recompute);
            window.removeEventListener("scroll", recompute, true);
        };
    }, [open, recompute, ...(repositionDeps || [])]);

    // Outside click
    useEffect(() => {
        if (!open || !closeOnOutsideClick) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                panelRef.current && !panelRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, closeOnOutsideClick, setOpen]);

    // Arrow static shape classes (no position helpers — those are applied via inline style)
    const arrowBaseClass = `absolute z-10 w-3 h-3 ${colorArrowBgMap[color]} ${colorArrowMap[color]}`;
    const arrowShapeClass = {
        bottom: `${arrowBaseClass} -top-[5px] border-l border-t rotate-45`,
        top:    `${arrowBaseClass} -bottom-[5px] border-r border-b rotate-45`,
        left:   `${arrowBaseClass} -right-[5px] border-t border-r rotate-45`,
        right:  `${arrowBaseClass} -left-[5px] border-b border-l rotate-45`,
    }[side];
    // Inline style places the arrow at the trigger center relative to the panel edge
    const arrowStyle: React.CSSProperties = (side === "top" || side === "bottom")
        ? { left: arrowOffset }
        : { top: arrowOffset };

    const panel = (
        <>
            {/* Backdrop */}
            {open && effectiveBackdrop !== "transparent" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`fixed inset-0 z-[998] ${effectiveBackdrop === "blur" ? "backdrop-blur-sm bg-black/20" : "bg-black/40"}`}
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Panel */}
            {open && (
                <motion.div
                    ref={panelRef}
                    variants={motionVariants}
                    initial="initial"
                    animate="animate"
                    style={{
                        position: "absolute",
                        top: pos?.top ?? 0,
                        left: pos?.left ?? 0,
                        zIndex: 999,
                        minWidth: minWidth,
                    }}
                    onMouseEnter={triggerMode === "hover" ? handleMouseEnter : undefined}
                    onMouseLeave={triggerMode === "hover" ? handleMouseLeave : undefined}
                    className={`
                        ${colorBgMap[color]} ${sizeClasses[size]} ${getRadiusClass(radius)} ${shadowClasses[shadow]} shadow-black/10
                        border ${colorBorderMap[color]}
                        ${className}
                    `}
                >
                    {showArrow && (
                        <span className={arrowShapeClass} style={arrowStyle} />
                    )}
                    {/* Inner wrapper keeps overflow contained without clipping the arrow */}
                    <div className={`overflow-hidden ${getRadiusClass(radius)}`}>
                        {children}
                    </div>
                </motion.div>
            )}
        </>
    );

    return (
        <>
            <div
                ref={triggerRef}
                className={`inline-flex ${triggerClassName}`}
                onClick={triggerMode === "click" ? toggle : undefined}
                onMouseEnter={triggerMode === "hover" ? handleMouseEnter : undefined}
                onMouseLeave={triggerMode === "hover" ? handleMouseLeave : undefined}
            >
                {trigger}
            </div>
            {createPortal(panel, document.body)}
        </>
    );
};

export default Popover;
