"use client";

import { useState, useEffect } from "react";

export function useAmbientColor(imageUrl?: string | null, fallbackColor = "rgba(0, 245, 255, 0.2)") {
  const [ambientColor, setAmbientColor] = useState<string>(fallbackColor);

  useEffect(() => {
    if (!imageUrl) {
      setAmbientColor(fallbackColor);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          // Filter out very dark or white pixels for vibrant glow
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (avg > 25 && avg < 235) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }

        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setAmbientColor(`rgba(${r}, ${g}, ${b}, 0.35)`);
        } else {
          setAmbientColor(fallbackColor);
        }
      } catch {
        setAmbientColor(fallbackColor);
      }
    };

    img.onerror = () => {
      setAmbientColor(fallbackColor);
    };
  }, [imageUrl, fallbackColor]);

  return ambientColor;
}
