"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = "cyber" | "brutal";
type AuthMode = "signin" | "signup";
type ToastType = "error" | "success" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

// ─── Cyber Background Particles ────────────────────────────────────────────────

function CyberParticle({ index }: { index: number }) {
  const size = 2 + (index % 3);
  const left = ((index * 137.5) % 100).toFixed(1);
  const delay = (index * 0.4) % 5;
  const duration = 8 + (index % 6);
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${left}%`,
        bottom: "-10px",
        width: size,
        height: size,
        backgroundColor: index % 3 === 0 ? "#00F5FF" : index % 3 === 1 ? "#22C55E" : "#BF5FFF",
        boxShadow: `0 0 ${size * 3}px currentColor`,
        animation: `float-up ${duration}s ${delay}s infinite linear`,
        opacity: 0.6,
      }}
    />
  );
}

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastNotification({
  toast,
  isCyber,
  onDismiss,
}: {
  toast: Toast;
  isCyber: boolean;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = { error: "⛔", success: "✅", info: "📡" };

  if (isCyber) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer select-none"
        onClick={() => onDismiss(toast.id)}
        style={{
          background: "rgba(5, 8, 22, 0.95)",
          border: `1px solid ${toast.type === "error" ? "#EF4444" : toast.type === "success" ? "#22C55E" : "#00F5FF"}`,
          boxShadow: `0 0 20px ${toast.type === "error" ? "rgba(239,68,68,0.3)" : toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(0,245,255,0.3)"}`,
          fontFamily: "var(--font-jetbrains-mono)",
          color: toast.type === "error" ? "#EF4444" : toast.type === "success" ? "#22C55E" : "#00F5FF",
          minWidth: "280px",
        }}
      >
        <span className="text-lg">{icons[toast.type]}</span>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60">{toast.type}_SIGNAL</p>
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer select-none"
      onClick={() => onDismiss(toast.id)}
      style={{
        background: toast.type === "error" ? "#FFE4E4" : toast.type === "success" ? "#E4FFE4" : "#FFF9C4",
        border: "3px solid #000",
        boxShadow: "4px 4px 0px #000",
        color: "#1A1A1A",
        minWidth: "280px",
        fontFamily: "inherit",
      }}
    >
      <span className="text-lg">{icons[toast.type]}</span>
      <p className="text-sm font-black">{toast.message}</p>
    </motion.div>
  );
}

// ─── Main Login Page ───────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // ── Theme ──
  const [theme, setTheme] = useState<Theme>("cyber");
  const isCyber = theme === "cyber";

  // Sync with global theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("dashboard-theme");
    if (stored === "brutal" || stored === "cyber") setTheme(stored);
  }, []);

  // ── Auth state ──
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Animation: cursor blink ──
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(iv);
  }, []);

  // ── Toast helpers ──
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Auth handlers ──
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast("error", "Email and password are required.");
      return;
    }
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const msg =
            error.message.includes("Invalid login credentials")
              ? "Invalid credentials. Check your email & password."
              : error.message.includes("Email not confirmed")
              ? "Please confirm your email before signing in."
              : error.message;
          addToast("error", msg);
        } else {
          addToast("success", "Access granted. Initializing secure session...");
          const next = searchParams.get("next") ?? "/";
          setTimeout(() => router.push(next), 800);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        });
        if (error) {
          addToast("error", error.message);
        } else {
          addToast("success", "Account created! Check your email to confirm.");
        }
      }
    } catch {
      addToast("error", "An unexpected error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Cyber Mode Render ────────────────────────────────────────────────────────

  if (isCyber) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #020817 0%, #050B1F 50%, #070E26 100%)" }}
      >
        {/* Toast Stack */}
        <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2">
          <AnimatePresence>{toasts.map((t) => <ToastNotification key={t.id} toast={t} isCyber onDismiss={dismissToast} />)}</AnimatePresence>
        </div>

        {/* CSS animations */}
        <style>{`
          @keyframes float-up {
            0% { transform: translateY(0) scale(1); opacity: 0.6; }
            100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
          }
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
          @keyframes grid-drift {
            0% { transform: translateY(0) translateX(0); }
            100% { transform: translateY(60px) translateX(30px); }
          }
          @keyframes neon-pulse {
            0%, 100% { box-shadow: 0 0 15px rgba(0,245,255,0.4), 0 0 30px rgba(0,245,255,0.15); }
            50% { box-shadow: 0 0 25px rgba(0,245,255,0.7), 0 0 50px rgba(0,245,255,0.3); }
          }
          @keyframes cyber-shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Moving neon grid background */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,245,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "grid-drift 8s ease-in-out infinite alternate",
          }}
        />

        {/* Scanline sweep */}
        <div
          className="absolute left-0 right-0 h-[2px] pointer-events-none opacity-10"
          style={{
            background: "linear-gradient(90deg, transparent, #00F5FF, transparent)",
            animation: "scanline 6s linear infinite",
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }, (_, i) => (
          <CyberParticle key={i} index={i} />
        ))}

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#00F5FF] opacity-60" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#00F5FF] opacity-60" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#00F5FF] opacity-60" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#00F5FF] opacity-60" />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme("brutal")}
          className="absolute top-5 right-5 z-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded border transition-all hover:scale-105"
          style={{
            background: "rgba(0,0,0,0.6)",
            borderColor: "rgba(0,245,255,0.3)",
            color: "#00F5FF",
            fontFamily: "var(--font-jetbrains-mono)",
          }}
        >
          ⚡ Switch → Brutal
        </button>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md mx-4"
          style={{
            animation: "neon-pulse 3s ease-in-out infinite",
          }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "rgba(5, 8, 22, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(0,245,255,0.35)",
              boxShadow: "0 0 40px rgba(0,245,255,0.1), inset 0 0 40px rgba(0,245,255,0.03)",
            }}
          >
            {/* Card top accent bar */}
            <div
              className="h-0.5 w-full"
              style={{
                background: "linear-gradient(90deg, transparent, #00F5FF, #22C55E, #BF5FFF, transparent)",
              }}
            />

            <div className="p-8">
              {/* Header */}
              <div className="mb-8 text-center">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
                  style={{
                    background: "rgba(0,245,255,0.08)",
                    border: "1px solid rgba(0,245,255,0.2)",
                    color: "#00F5FF",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  NEXUS_SECURE_GATEWAY
                </div>

                <h1
                  className="text-3xl font-black mb-2"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    background: "linear-gradient(135deg, #00F5FF 0%, #22C55E 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {mode === "signin" ? "AUTHENTICATE" : "REGISTER"}
                </h1>
                <p
                  className="text-xs opacity-50"
                  style={{ color: "#94A3B8", fontFamily: "var(--font-jetbrains-mono)" }}
                >
                  {mode === "signin"
                    ? "> enter credentials to access secure dashboard"
                    : "> create a new operator account"}
                  {cursor && (
                    <span className="inline-block w-2 h-3.5 bg-green-400 ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-lg overflow-hidden mb-6 p-0.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,245,255,0.15)" }}>
                {(["signin", "signup"] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-200"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      background: mode === m ? "rgba(0,245,255,0.12)" : "transparent",
                      color: mode === m ? "#00F5FF" : "#64748B",
                      border: mode === m ? "1px solid rgba(0,245,255,0.3)" : "1px solid transparent",
                    }}
                  >
                    {m === "signin" ? "// SIGN_IN" : "// SIGN_UP"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: "#00F5FF", fontFamily: "var(--font-jetbrains-mono)", opacity: 0.7 }}
                  >
                    &gt; email_address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="operator@nexus.io"
                    className="w-full px-4 py-3 text-sm rounded-lg outline-none transition-all duration-200 focus:ring-1 focus:ring-[rgba(0,245,255,0.5)]"
                    style={{
                      background: "rgba(0,245,255,0.04)",
                      border: "1px solid rgba(0,245,255,0.2)",
                      color: "#E0E8FF",
                      fontFamily: "var(--font-jetbrains-mono)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,245,255,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(0,245,255,0.2)")}
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: "#00F5FF", fontFamily: "var(--font-jetbrains-mono)", opacity: 0.7 }}
                  >
                    &gt; password_key
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 text-sm rounded-lg outline-none transition-all duration-200 focus:ring-1 focus:ring-[rgba(0,245,255,0.5)]"
                    style={{
                      background: "rgba(0,245,255,0.04)",
                      border: "1px solid rgba(0,245,255,0.2)",
                      color: "#E0E8FF",
                      fontFamily: "var(--font-jetbrains-mono)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,245,255,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(0,245,255,0.2)")}
                  />
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3.5 text-sm font-black uppercase tracking-widest rounded-lg transition-all duration-200 mt-2 flex items-center justify-center gap-2"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    background: loading
                      ? "rgba(0,245,255,0.1)"
                      : "linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(34,197,94,0.15) 100%)",
                    border: "1px solid rgba(0,245,255,0.4)",
                    color: loading ? "rgba(0,245,255,0.4)" : "#00F5FF",
                    boxShadow: loading ? "none" : "0 0 20px rgba(0,245,255,0.2), inset 0 0 10px rgba(0,245,255,0.05)",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {mode === "signin" ? "AUTHENTICATING..." : "REGISTERING..."}
                    </>
                  ) : (
                    <>
                      {mode === "signin" ? "⚡ INITIATE ACCESS" : "🛸 CREATE ACCOUNT"}
                    </>
                  )}
                </motion.button>
              </form>

              {/* Footer */}
              <p
                className="text-center text-[10px] mt-5 opacity-30"
                style={{ color: "#94A3B8", fontFamily: "var(--font-jetbrains-mono)" }}
              >
                NEXUS_XEON v2.6 :: SECURE_ENCLAVE :: ALL_ACCESS_MONITORED
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Brutal Mode Render ───────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: "#FFFEF0" }}
    >
      {/* Toast Stack */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>{toasts.map((t) => <ToastNotification key={t.id} toast={t} isCyber={false} onDismiss={dismissToast} />)}</AnimatePresence>
      </div>

      {/* Retro grid background */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#000 1px, transparent 1px),
            linear-gradient(90deg, #000 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Hazard stripe corners */}
      <div
        className="absolute top-0 left-0 w-full h-4"
        style={{
          background: "repeating-linear-gradient(45deg, #FFD700 0px, #FFD700 10px, #000 10px, #000 20px)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-4"
        style={{
          background: "repeating-linear-gradient(-45deg, #FFD700 0px, #FFD700 10px, #000 10px, #000 20px)",
        }}
      />

      {/* Theme toggle */}
      <button
        onClick={() => setTheme("cyber")}
        className="absolute top-8 right-5 z-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-none border-2 border-black active:translate-y-0.5 active:translate-x-0.5"
        style={{
          background: "#00F5FF",
          boxShadow: "3px 3px 0px #000",
          color: "#000",
          transition: "all 0.1s",
        }}
      >
        ⚡ Switch → Cyber
      </button>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Offset shadow block */}
        <div
          className="absolute inset-0 rounded-none"
          style={{
            background: "#000",
            transform: "translate(8px, 8px)",
          }}
        />

        <div
          className="relative rounded-none"
          style={{
            background: "#FFFCDE",
            border: "4px solid #000",
          }}
        >
          {/* Warning stripe top header */}
          <div
            className="flex items-center justify-center py-3 border-b-4 border-black"
            style={{
              background: "repeating-linear-gradient(45deg, #FFD700 0px, #FFD700 12px, #000 12px, #000 24px)",
            }}
          >
            <span
              className="bg-white font-black text-sm uppercase tracking-widest px-3 py-0.5 border-2 border-black"
              style={{ letterSpacing: "0.2em" }}
            >
              ⚠️ NEXUS XEON ACCESS GATE ⚠️
            </span>
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="mb-7 text-center">
              <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">
                {mode === "signin" ? "SIGN IN" : "SIGN UP"}
              </h1>
              <p className="text-sm font-bold text-gray-600">
                {mode === "signin"
                  ? "Enter your credentials to access the hub."
                  : "Create your Nexus Xeon operator account."}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-0 mb-6 border-2 border-black">
              {(["signin", "signup"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-2.5 text-sm font-black uppercase tracking-wider transition-all duration-100"
                  style={{
                    background: mode === m ? "#FFD700" : "#FFFFFF",
                    color: "#000",
                    borderRight: m === "signin" ? "2px solid #000" : "none",
                  }}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="operator@nexus.io"
                  className="w-full px-4 py-3 text-sm font-semibold outline-none transition-all duration-100"
                  style={{
                    background: "#FFFFFF",
                    border: "2.5px solid #000",
                    color: "#1A1A1A",
                    boxShadow: "none",
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = "3px 3px 0px #000")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 text-sm font-semibold outline-none transition-all duration-100"
                  style={{
                    background: "#FFFFFF",
                    border: "2.5px solid #000",
                    color: "#1A1A1A",
                    boxShadow: "none",
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = "3px 3px 0px #000")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={loading ? {} : { x: 3, y: 3 }}
                className="w-full py-4 text-sm font-black uppercase tracking-widest mt-2 border-2 border-black transition-all duration-100 flex items-center justify-center gap-2"
                style={{
                  background: loading ? "#E5E5E5" : "#FFD700",
                  color: "#000",
                  boxShadow: loading ? "none" : "5px 5px 0px #000",
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.15em",
                }}
                onMouseDown={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.boxShadow = "2px 2px 0px #000";
                    (e.target as HTMLElement).style.transform = "translate(3px, 3px)";
                  }
                }}
                onMouseUp={(e) => {
                  if (!loading) {
                    (e.target as HTMLElement).style.boxShadow = "5px 5px 0px #000";
                    (e.target as HTMLElement).style.transform = "translate(0, 0)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    {mode === "signin" ? "VERIFYING..." : "REGISTERING..."}
                  </>
                ) : (
                  mode === "signin" ? "▶ ACCESS THE HUB" : "🛸 CREATE ACCOUNT"
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div
              className="text-center text-[10px] font-black uppercase tracking-widest mt-6 py-2 border-t-2 border-black"
              style={{ color: "#666" }}
            >
              NEXUS XEON v2.6 — ALL ACCESS LOGGED
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
