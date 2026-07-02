import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { IApplicationState } from "../../store/state/app-state";

const ProgressLoader: React.FC = () => {
    const progressLoading = useSelector(
        (state: IApplicationState) => state.GeneralData.progressLoading
    );

    const [visible, setVisible] = useState(false);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        let timer: any;
        if (progressLoading) {
            setVisible(true);
            setWidth(0);

            timer = setInterval(() => {
                setWidth((prev) => {
                    if (prev >= 85) {
                        clearInterval(timer);
                        return prev;
                    }
                    const diff = (100 - prev) * 0.15;
                    return Math.min(prev + diff, 85);
                });
            }, 200);
        } else {
            if (visible) {
                setWidth(100);
                timer = setTimeout(() => {
                    setVisible(false);
                    setWidth(0);
                }, 300);
            }
        }

        return () => {
            clearInterval(timer);
            clearTimeout(timer);
        };
    }, [progressLoading, visible]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-[10000] pointer-events-none"
                >
                    <motion.div
                        style={{ width: `${width}%` }}
                        transition={{
                            type: "tween",
                            ease: "easeOut",
                            duration: width === 100 ? 0.3 : 0.8,
                        }}
                        className="h-full bg-gradient-to-r from-primary via-primary-600 to-primary shadow-[0_1px_1px_var(--color-primary)]"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProgressLoader;
