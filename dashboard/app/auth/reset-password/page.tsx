"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

function ResetPasswordInner() {
  const supabase = createClient();

  const [theme, setTheme] = useState<"cyber" | "brutal">("cyber");
  const isCyber = theme === "cyber";

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-theme");
    if (stored === "brutal" || stored === "cyber") setTheme(stored);
  }, []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("✓ Password updated successfully! Redirecting to Sign In...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (isCyber) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#020817]">
        <div className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl bg-[#050816]/90 border border-[rgba(0,245,255,0.3)] shadow-[0_0_50px_rgba(0,245,255,0.15)]">
          <div className="text-center mb-6">
            <span className="text-3xl">🔑</span>
            <h1 className="text-2xl font-black uppercase text-[#00F5FF] tracking-wider mt-2" style={{ fontFamily: "var(--font-orbitron)" }}>
              NEW PASSWORD
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
              Create a new secure key for your operator account.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#00F5FF] mb-1 font-mono">
                &gt; new_password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 text-sm rounded-lg outline-none bg-[rgba(0,245,255,0.04)] border border-[rgba(0,245,255,0.2)] text-[#E0E8FF] font-mono focus:border-[#00F5FF]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#00F5FF] mb-1 font-mono">
                &gt; confirm_password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 text-sm rounded-lg outline-none bg-[rgba(0,245,255,0.04)] border border-[rgba(0,245,255,0.2)] text-[#E0E8FF] font-mono focus:border-[#00F5FF]"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3.5 text-xs font-black uppercase tracking-widest rounded-lg mt-2 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                fontFamily: "var(--font-orbitron)",
                background: "linear-gradient(135deg, rgba(0,245,255,0.2) 0%, rgba(34,197,94,0.2) 100%)",
                border: "1px solid rgba(0,245,255,0.5)",
                color: "#00F5FF",
                boxShadow: "0 0 20px rgba(0,245,255,0.2)",
              }}
            >
              {loading ? "SAVING..." : "⚡ UPDATE PASSWORD"}
            </motion.button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#FFFEF0]">
      <div className="relative z-10 w-full max-w-md mx-4 p-8 bg-[#FFFCDE] border-4 border-black shadow-[8px_8px_0px_#000]">
        <div className="text-center mb-6">
          <span className="text-3xl">🔑</span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black mt-2">
            NEW PASSWORD
          </h1>
          <p className="text-xs font-bold text-gray-600 mt-1">
            Set your new credentials to access the hub.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-black font-black text-xs text-red-700 shadow-[2px_2px_0px_#000]">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 border-2 border-black font-black text-xs text-green-800 shadow-[2px_2px_0px_#000]">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 text-sm font-semibold outline-none bg-white border-2 border-black focus:shadow-[3px_3px_0px_#000]"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-black mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 text-sm font-semibold outline-none bg-white border-2 border-black focus:shadow-[3px_3px_0px_#000]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-black uppercase tracking-widest border-3 border-black bg-[#00F5FF] text-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {loading ? "SAVING..." : "UPDATE PASSWORD →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#020817" }} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
