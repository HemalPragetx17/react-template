/**
 * Radius design tokens — DEFAULT_RADIUS is the single source of truth.
 * Classes map to utilities in src/theme/radius.css (always applied, no Tailwind JIT needed).
 */

export type Radius =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "full";

/** Change this one value to update the default radius across the entire app */
export const DEFAULT_RADIUS: Radius = "md";

export type RadiusCorner = "t" | "r" | "b" | "l";

export const radiusCssVarNames: Record<Radius, string> = {
  none: "--radius-none",
  sm: "--radius-sm",
  md: "--radius-md",
  lg: "--radius-lg",
  xl: "--radius-xl",
  "2xl": "--radius-2xl",
  "3xl": "--radius-3xl",
  "4xl": "--radius-4xl",
  "5xl": "--radius-5xl",
  "6xl": "--radius-6xl",
  "7xl": "--radius-7xl",
  "8xl": "--radius-8xl",
  full: "--radius-full",
};

export const radiusCssVars: Record<Radius, string> = {
  none: "var(--radius-none)",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  "3xl": "var(--radius-3xl)",
  "4xl": "var(--radius-4xl)",
  "5xl": "var(--radius-5xl)",
  "6xl": "var(--radius-6xl)",
  "7xl": "var(--radius-7xl)",
  "8xl": "var(--radius-8xl)",
  full: "var(--radius-full)",
};

export const DEFAULT_RADIUS_CSS_VAR = "var(--radius)";

/** Static class map — must match @layer utilities in radius.css */
const radiusTokenClasses: Record<Radius, string> = {
  none: "rounded-token-none",
  sm: "rounded-token-sm",
  md: "rounded-token-md",
  lg: "rounded-token-lg",
  xl: "rounded-token-xl",
  "2xl": "rounded-token-2xl",
  "3xl": "rounded-token-3xl",
  "4xl": "rounded-token-4xl",
  "5xl": "rounded-token-5xl",
  "6xl": "rounded-token-6xl",
  "7xl": "rounded-token-7xl",
  "8xl": "rounded-token-8xl",
  full: "rounded-token-full",
};

const importantRadiusTokenClasses: Record<Radius, string> = {
  none: "!rounded-token-none",
  sm: "!rounded-token-sm",
  md: "!rounded-token-md",
  lg: "!rounded-token-lg",
  xl: "!rounded-token-xl",
  "2xl": "!rounded-token-2xl",
  "3xl": "!rounded-token-3xl",
  "4xl": "!rounded-token-4xl",
  "5xl": "!rounded-token-5xl",
  "6xl": "!rounded-token-6xl",
  "7xl": "!rounded-token-7xl",
  "8xl": "!rounded-token-8xl",
  full: "!rounded-token-full",
};

const cornerTokenClasses: Record<RadiusCorner, string> = {
  t: "rounded-token-t",
  r: "rounded-token-r",
  b: "rounded-token-b",
  l: "rounded-token-l",
};

/** Sync --radius in CSS to match DEFAULT_RADIUS. Call once at app startup. */
export function syncDefaultRadiusCssVariable(): void {
  if (typeof document === "undefined") return;

  document.documentElement.style.setProperty(
    "--radius",
    `var(${radiusCssVarNames[DEFAULT_RADIUS]})`,
  );
}

export function getRadiusCssVar(radius: Radius = DEFAULT_RADIUS): string {
  return radius === DEFAULT_RADIUS
    ? DEFAULT_RADIUS_CSS_VAR
    : radiusCssVars[radius] ?? DEFAULT_RADIUS_CSS_VAR;
}

export function getRadiusClass(radius: Radius = DEFAULT_RADIUS): string {
  if (radius === DEFAULT_RADIUS) {
    return "rounded-token";
  }

  return radiusTokenClasses[radius] ?? "rounded-token";
}

export function getImportantRadiusClass(radius: Radius = DEFAULT_RADIUS): string {
  if (radius === DEFAULT_RADIUS) {
    return "!rounded-token";
  }

  return importantRadiusTokenClasses[radius] ?? "!rounded-token";
}

export function getCornerRadiusClass(
  corner: RadiusCorner,
  radius: Radius = DEFAULT_RADIUS,
): string {
  if (radius !== DEFAULT_RADIUS) {
    return getRadiusClass(radius);
  }

  return cornerTokenClasses[corner] ?? "rounded-token";
}

export function getFooterRadiusClass(radius: Radius = DEFAULT_RADIUS): string {
  return getCornerRadiusClass("b", radius);
}

export type DrawerPlacement = "left" | "right" | "top" | "bottom";

const drawerCornerMap: Record<DrawerPlacement, RadiusCorner> = {
  left: "r",
  right: "l",
  top: "b",
  bottom: "t",
};

export function getDrawerRadiusClass(
  placement: DrawerPlacement,
  radius: Radius = DEFAULT_RADIUS,
): string {
  return getCornerRadiusClass(drawerCornerMap[placement], radius);
}

/** @deprecated Use getRadiusClass() */
export const radiusClasses: Record<Radius, string> = {
  none: getRadiusClass("none"),
  sm: getRadiusClass("sm"),
  md: getRadiusClass("md"),
  lg: getRadiusClass("lg"),
  xl: getRadiusClass("xl"),
  "2xl": getRadiusClass("2xl"),
  "3xl": getRadiusClass("3xl"),
  "4xl": getRadiusClass("4xl"),
  "5xl": getRadiusClass("5xl"),
  "6xl": getRadiusClass("6xl"),
  "7xl": getRadiusClass("7xl"),
  "8xl": getRadiusClass("8xl"),
  full: getRadiusClass("full"),
};

/** @deprecated Use getImportantRadiusClass() */
export const importantRadiusClasses: Record<Radius, string> = {
  none: getImportantRadiusClass("none"),
  sm: getImportantRadiusClass("sm"),
  md: getImportantRadiusClass("md"),
  lg: getImportantRadiusClass("lg"),
  xl: getImportantRadiusClass("xl"),
  "2xl": getImportantRadiusClass("2xl"),
  "3xl": getImportantRadiusClass("3xl"),
  "4xl": getImportantRadiusClass("4xl"),
  "5xl": getImportantRadiusClass("5xl"),
  "6xl": getImportantRadiusClass("6xl"),
  "7xl": getImportantRadiusClass("7xl"),
  "8xl": getImportantRadiusClass("8xl"),
  full: getImportantRadiusClass("full"),
};
