"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRoot } from "react-dom/client";

interface HeartEffect {
  id: string;
  x: number;
  y: number;
  angle: number;
}

let addHeartGlobal: ((x: number, y: number) => void) | null = null;

export const triggerHeartEffect = (x: number, y: number) => {
  if (addHeartGlobal) {
    addHeartGlobal(x, y);
  }
};

export function FloatingHeartEngine() {
  const [hearts, setHearts] = useState<HeartEffect[]>([]);

  const addHeart = useCallback((x: number, y: number) => {
    const newHeart: HeartEffect = {
      id: Math.random().toString(36).substring(7),
      x,
      y,
      angle: Math.random() * 60 - 30, // Random rotation between -30 and 30 deg
    };
    setHearts((prev) => [...prev, newHeart]);

    // Remove heart after animation (1s)
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1000);
  }, []);

  useEffect(() => {
    addHeartGlobal = addHeart;
    return () => {
      addHeartGlobal = null;
    };
  }, [addHeart]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ 
              opacity: 1, 
              scale: 0, 
              x: heart.x, 
              y: heart.y,
              rotate: heart.angle 
            }}
            animate={{ 
              opacity: 0, 
              scale: 1.3, 
              y: heart.y - 100, // drift up
              x: heart.x + (Math.random() * 40 - 20) // slight horizontal drift
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-4xl filter drop-shadow-[0_0_15px_rgba(255,20,147,0.8)]"
            style={{
              color: "#FF1493"
            }}
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
