import React, { forwardRef, useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  isBordered?: boolean;
  isDisabled?: boolean;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  alt?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  const {
    src,
    name,
    icon,
    size = "md",
    radius = "full",
    color = "default",
    isBordered = false,
    isDisabled = false,
    fallback,
    showFallback = false,
    className = "",
    alt,
    ...restProps
  } = props;

  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Size configurations
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  // Radius configurations
  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Color configurations for fallback backgrounds
  const colorClasses = {
    default: "bg-default-200 text-default-foreground dark:bg-default-800",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
  };

  // Ring configurations for bordered avatars
  const ringClasses = {
    default: "ring-default-200 dark:ring-default-700",
    primary: "ring-primary",
    secondary: "ring-secondary",
    success: "ring-success",
    warning: "ring-warning",
    danger: "ring-danger",
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const currentRadiusClass = radiusClasses[radius] || radiusClasses.full;
  const currentColorClass = colorClasses[color] || colorClasses.default;

  const ringStyles = isBordered
    ? `ring-2 ring-offset-2 ${ringClasses[color] || ringClasses.default} ring-offset-white dark:ring-offset-neutral-900`
    : "";

  const disabledStyles = isDisabled
    ? "opacity-50 cursor-not-allowed select-none pointer-events-none"
    : "";

  // Helper to extract initials
  const getInitials = (userName?: string) => {
    if (!userName) return "";
    const parts = userName.split(" ").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const renderFallbackContent = () => {
    if (fallback) return fallback;
    if (name) return <span className="font-semibold select-none">{getInitials(name)}</span>;
    if (icon) return icon;
    return (
      <FaUser className="w-1/2 h-1/2 text-current opacity-85" aria-hidden />
    );
  };

  const shouldShowImage = src && !hasError && !showFallback;

  return (
    <div
      ref={ref}
      className={`
        relative flex items-center justify-center shrink-0 overflow-hidden select-none transition-all duration-250 ease-in-out
        ${currentSizeClass}
        ${currentRadiusClass}
        ${currentColorClass}
        ${ringStyles}
        ${disabledStyles}
        ${className}
      `}
      {...restProps}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover ${currentRadiusClass}`}
        />
      ) : (
        renderFallbackContent()
      )}
    </div>
  );
});

Avatar.displayName = "Avatar";

export default Avatar;
