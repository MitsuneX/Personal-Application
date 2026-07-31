"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";

export function FocusWidget() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { aiTools, links } = useDashboardStore();

  const [focusInput, setFocusInput] = useState("");
  const [focusList, setFocusList] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: "1", text: "Complete game daily missions", done: false },
    { id: "2", text: "Watch Japanese drama episode", done: true },
    { id: "3", text: "Evaluate new AI platform templates", done: false },
  ]);

  const handleAddFocus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusInput.trim()) return;
    setFocusList([...focusList, { id: Date.now().toString(), text: focusInput.trim(), done: false }]);
    setFocusInput("");
  };

  const toggleFocus = (id: string) => {
    setFocusList(focusList.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  // Recent AI Platform Launched
  const recentAi = aiTools && aiTools.length > 0
    ? [...aiTools].sort((a, b) => (b.launchCount ?? 0) - (a.launchCount ?? 0))[0]
    : null;

  // Recent Links Added
  const recentLink = links && links.length > 0
    ? links[links.length - 1]
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Today's Focus Checklist */}
      <motion.div
        className="rounded-2xl p-5 border flex flex-col justify-between"
        style={{
          backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.1)" : "4px 4px 0 #000",
        }}
      >
        <div>
          <h3
            className="font-black text-sm uppercase tracking-wider mb-3 theme-text-primary flex items-center gap-1.5"
            style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
          >
            <span>🎯</span> {isCyber ? "TODAYS.FOCUS" : "Today's Focus"}
          </h3>
          <form onSubmit={handleAddFocus} className="flex gap-2 mb-3.5">
            <input
              type="text"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              placeholder="Add key target..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl outline-none border transition-all"
              style={{
                backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#FFFFFF",
                borderColor: isCyber ? "rgba(255,255,255,0.12)" : "#000000",
                color: isCyber ? "#F8FAFC" : "#1A1A1A",
              }}
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border"
              style={{
                backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#FF6B35",
                color: isCyber ? "#00F5FF" : "#FFFFFF",
                borderColor: isCyber ? "#00F5FF" : "#000000",
              }}
            >
              +
            </button>
          </form>

          <ul className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
            {focusList.map((item) => (
              <li
                key={item.id}
                onClick={() => toggleFocus(item.id)}
                className="flex items-center gap-2 cursor-pointer select-none text-xs"
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0"
                  style={{
                    backgroundColor: item.done
                      ? isCyber ? "rgba(0,245,255,0.2)" : "#2E7D32"
                      : "transparent",
                    borderColor: item.done
                      ? isCyber ? "#00F5FF" : "#2E7D32"
                      : isCyber ? "rgba(255,255,255,0.3)" : "#000000",
                  }}
                >
                  {item.done && <span className="text-[10px] text-white">✓</span>}
                </div>
                <span
                  className={`transition-all ${item.done ? "line-through opacity-50" : ""}`}
                  style={{ color: isCyber ? "#F8FAFC" : "#334155" }}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Storage & Resource Analytics */}
      <motion.div
        className="rounded-2xl p-5 border flex flex-col justify-between"
        style={{
          backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.1)" : "4px 4px 0 #000",
        }}
      >
        <div>
          <h3
            className="font-black text-sm uppercase tracking-wider mb-3.5 theme-text-primary flex items-center gap-1.5"
            style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
          >
            <span>📈</span> {isCyber ? "METRIC.STORAGE" : "Storage & Metrics"}
          </h3>
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="theme-text-secondary">AI Core Launches</span>
                <span className="font-mono font-bold" style={{ color: isCyber ? "#00F5FF" : "#1A1A1A" }}>
                  Active Pool
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "74%",
                    backgroundColor: isCyber ? "#BF5FFF" : "#6B21A8",
                    boxShadow: isCyber ? "0 0 8px #BF5FFF" : "none",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="theme-text-secondary">Personal Database Scopes</span>
                <span className="font-mono font-bold" style={{ color: isCyber ? "#39FF14" : "#1A1A1A" }}>
                  100% Isolated
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "100%",
                    backgroundColor: isCyber ? "#39FF14" : "#2E7D32",
                    boxShadow: isCyber ? "0 0 8px #39FF14" : "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity Quick Launch */}
      <motion.div
        className="rounded-2xl p-5 border flex flex-col justify-between"
        style={{
          backgroundColor: isCyber ? "rgba(10,15,30,0.85)" : "#FFFFFF",
          borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
          borderWidth: isCyber ? "1px" : "2.5px",
          boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.1)" : "4px 4px 0 #000",
        }}
      >
        <div>
          <h3
            className="font-black text-sm uppercase tracking-wider mb-3 theme-text-primary flex items-center gap-1.5"
            style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit" }}
          >
            <span>⚡</span> {isCyber ? "QUICK.LAUNCH" : "Quick Launch"}
          </h3>
          <div className="space-y-2">
            {recentAi ? (
              <div className="p-2 rounded-xl border flex items-center justify-between text-xs"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                  borderColor: isCyber ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                }}>
                <div className="min-w-0">
                  <p className="theme-text-primary font-bold truncate">{recentAi.name}</p>
                  <p className="theme-text-muted text-[10px]">Most launched AI</p>
                </div>
                <a
                  href={recentAi.launchUrl || recentAi.websiteUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#00F5FF",
                    color: isCyber ? "#00F5FF" : "#000000",
                    borderColor: isCyber ? "#00F5FF" : "#000000",
                  }}
                >
                  Open ↗
                </a>
              </div>
            ) : (
              <p className="text-xs theme-text-muted italic">No AI launches recorded</p>
            )}

            {recentLink ? (
              <div className="p-2 rounded-xl border flex items-center justify-between text-xs"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                  borderColor: isCyber ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                }}>
                <div className="min-w-0">
                  <p className="theme-text-primary font-bold truncate">{recentLink.title}</p>
                  <p className="theme-text-muted text-[10px] truncate">{recentLink.url}</p>
                </div>
                <a
                  href={recentLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95"
                  style={{
                    backgroundColor: isCyber ? "rgba(57,255,20,0.12)" : "#39FF14",
                    color: isCyber ? "#39FF14" : "#000000",
                    borderColor: isCyber ? "#39FF14" : "#000000",
                  }}
                >
                  Open ↗
                </a>
              </div>
            ) : (
              <p className="text-xs theme-text-muted italic">No bookmarks recorded</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
