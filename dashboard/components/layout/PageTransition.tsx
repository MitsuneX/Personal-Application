"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

const variants = {
  hidden:  { opacity: 0, x: 20, filter: "blur(4px)" },
  enter:   { opacity: 1, x: 0,  filter: "blur(0px)" },
  exit:    { opacity: 0, x: -20, filter: "blur(4px)" },
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3,
        }}
        className="w-full min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
