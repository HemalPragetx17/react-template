import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface AnimatedExpandProps {
  expanded: boolean;
  colSpan: number;
  children: React.ReactNode;
}

const accordionTransition = {
  height: {
    duration: 0.25,
    ease: [0.04, 0.62, 0.23, 0.98] as [number, number, number, number],
  },
  opacity: {
    duration: 0.2,
  },
};

const AnimatedExpand: React.FC<AnimatedExpandProps> = ({ expanded, colSpan, children }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0 border-none">
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={accordionTransition}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
};

export default AnimatedExpand;
