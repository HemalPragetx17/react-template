import React from "react";
import clsx from "clsx";
import { getRadiusClass } from "../shared/radius";

export interface SkeletonProps {
  /**
   * Whether the skeleton content is loaded.
   * @default false
   */
  isLoaded?: boolean;
  /**
   * The animation type.
   * @default "shimmer"
   */
  animation?: "shimmer" | "pulse" | "none";
  /**
   * Custom slots styling.
   */
  classNames?: {
    base?: string;
    content?: string;
  };
  children?: React.ReactNode;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  isLoaded = false,
  animation = "shimmer",
  classNames,
  children,
  className,
}) => {
  if (isLoaded) {
    return (
      <div className={clsx("transition-opacity duration-300", classNames?.content)}>
        {children}
      </div>
    );
  }

  const hasChildren = React.Children.count(children) > 0;

  return (
    <div
      className={clsx(
        `relative overflow-hidden select-none pointer-events-none ${getRadiusClass()}`,
        // Base skeleton background color matching HeroUI's default style
        "bg-default-300 dark:bg-default-200",
        // Animations
        animation === "shimmer" && "animate-shimmer",
        animation === "pulse" && "animate-pulse-custom",
        classNames?.base,
        className
      )}
    >
      {hasChildren ? (
        <div className="opacity-0 pointer-events-none">
          {children}
        </div>
      ) : (
        // Provide a default layout helper if no children are supplied
        <div className="h-full w-full min-h-[1rem]" />
      )}
    </div>
  );
};

export default Skeleton;
