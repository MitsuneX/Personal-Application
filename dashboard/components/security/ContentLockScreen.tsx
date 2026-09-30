"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { ProtectedScopeDefinition } from "./ContentLockConstants";

interface ContentLockScreenProps {
  scope: ProtectedScopeDefinition;
}

export function ContentLockScreen({ scope }: ContentLockScreenProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { contentLock, unlockContent, recoverContentLock } = useDashboardStore();

  const [inputVal, setInputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

  // Recovery modal state
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [newMethod, setNewMethod] = useState<"PIN" | "PASSWORD">(contentLock.method || "PIN");
  const [newCredential, setNewCredential] = useState("");
  const [confirmCredential, setConfirmCredential] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownRemaining === null || cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const handleUnlock = async (credentialToVerify?: string) => {
    const cred = credentialToVerify !== undefined ? credentialToVerify : inputVal;
    if (!cred.trim()) {
      setErrorMsg(`Please enter your ${contentLock.method === "PIN" ? "PIN" : "Password"}.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const result = await unlockContent(cred);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || "Incorrect credential.");
      if (result.remainingSeconds && result.remainingSeconds > 0) {
        setCooldownRemaining(result.remainingSeconds);
      }
      setInputVal("");
    }
  };

  const handleKeypadPress = (val: string) => {
    if (cooldownRemaining && cooldownRemaining > 0) return;
    if (inputVal.length < 8) {
      const next = inputVal + val;
      setInputVal(next);
      setErrorMsg("");
      // Auto submit if 4 or 6 digits in PIN mode
      if (contentLock.method === "PIN" && (next.length === 4 || next.length === 6)) {
        // slight delay for visual feedback of dot
        setTimeout(() => {
          handleUnlock(next);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setInputVal((prev) => prev.slice(0, -1));
    setErrorMsg("");
  };

  const handleClear = () => {
    setInputVal("");
    setErrorMsg("");
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPassword.trim()) {
      setRecoveryError("Please enter your account login password.");
      return;
    }
    if (!newCredential.trim()) {
      setRecoveryError("Please enter a new PIN or password.");
      return;
    }
    if (newCredential !== confirmCredential) {
      setRecoveryError("New credentials do not match.");
      return;
    }
    if (newMethod === "PIN" && !/^\d{4,8}$/.test(newCredential)) {
      setRecoveryError("PIN must be 4 to 8 numeric digits.");
      return;
    }
    if (newMethod === "PASSWORD" && newCredential.length < 6) {
      setRecoveryError("Password must be at least 6 characters.");
      return;
    }

    setIsRecovering(true);
    setRecoveryError("");

    const res = await recoverContentLock({
      loginPassword,
      newCredential,
      newMethod,
    });

    setIsRecovering(false);

    if (res.success) {
      setIsRecoveryOpen(false);
      setLoginPassword("");
      setNewCredential("");
      setConfirmCredential("");
    } else {
      setRecoveryError(res.error || "Recovery failed. Please check your password.");
    }
  };

  const isLockedOut = Boolean(cooldownRemaining && cooldownRemaining > 0);

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`w-full max-w-md p-6 sm:p-8 rounded-2xl relative transition-all duration-200 ${
          isCyber
            ? "bg-[#0c101c]/90 border border-cyan-500/40 shadow-[0_0_35px_rgba(0,245,255,0.15)] text-slate-100"
            : "bg-[#FFFDF0] border-4 border-black shadow-[8px_8px_0px_#000] text-black"
        }`}
      >
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 border transition-transform duration-200 hover:scale-105 ${
              isCyber
                ? "bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_20px_rgba(0,245,255,0.3)] text-cyan-400"
                : "bg-[#FFE17D] border-3 border-black shadow-[3px_3px_0px_#000] text-black"
            }`}
          >
            🔒
          </div>

          <span
            className={`text-xs font-mono tracking-widest uppercase font-bold px-3 py-1 rounded-full mb-2 ${
              isCyber
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "bg-black text-white"
            }`}
          >
            {isCyber ? "AUTHENTICATION REQUIRED" : "PROTECTED CONTENT"}
          </span>

          <h2
            className={`text-2xl font-bold tracking-tight ${
              isCyber ? "font-mono text-cyan-300 drop-shadow-[0_0_10px_rgba(0,245,255,0.4)]" : "text-black"
            }`}
          >
            {scope.label} Locked
          </h2>
          <p className={`text-xs mt-1 max-w-xs ${isCyber ? "text-slate-400" : "text-gray-600 font-medium"}`}>
            {scope.description}
          </p>
        </div>

        {/* Lockout / Cooldown Notice */}
        {isLockedOut && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-xl text-center text-xs font-mono font-bold ${
              isCyber
                ? "bg-red-500/15 border border-red-500/40 text-red-400"
                : "bg-red-200 border-2 border-black text-red-900 shadow-[2px_2px_0px_#000]"
            }`}
          >
            ⚠️ Too many failed attempts. Cooldown: {cooldownRemaining}s
          </motion.div>
        )}

        {/* Error message */}
        {errorMsg && !isLockedOut && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-2.5 rounded-lg text-center text-xs font-bold ${
              isCyber
                ? "bg-red-500/20 border border-red-500/50 text-red-300"
                : "bg-red-100 border-2 border-black text-red-700"
            }`}
          >
            {errorMsg}
          </motion.div>
        )}

        {/* PIN MODE */}
        {contentLock.method === "PIN" ? (
          <div className="flex flex-col items-center">
            {/* PIN Dots Display */}
            <div className="flex items-center gap-3 my-4">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const filled = idx < inputVal.length;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-150 ${
                      filled
                        ? isCyber
                          ? "bg-cyan-400 shadow-[0_0_12px_#00F5FF] scale-110"
                          : "bg-black scale-110"
                        : isCyber
                        ? "bg-slate-800 border border-slate-700"
                        : "bg-white border-2 border-black"
                    }`}
                  />
                );
              })}
            </div>

            {/* Keyboard input listener hidden / accessible */}
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              value={inputVal}
              disabled={isLockedOut || isSubmitting}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, "").slice(0, 8);
                setInputVal(clean);
                if (clean.length === 4 || clean.length === 6) {
                  handleUnlock(clean);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUnlock();
              }}
              className="sr-only"
              aria-label="Enter PIN"
            />

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] my-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isLockedOut || isSubmitting}
                  onClick={() => handleKeypadPress(String(num))}
                  className={`h-12 rounded-xl text-lg font-bold font-mono transition-all duration-150 active:scale-95 disabled:opacity-40 ${
                    isCyber
                      ? "bg-slate-900/80 hover:bg-cyan-950/40 text-slate-100 border border-slate-800 hover:border-cyan-500/50 shadow-sm"
                      : "bg-white hover:bg-[#FFE17D] text-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                disabled={isLockedOut || isSubmitting || inputVal.length === 0}
                onClick={handleClear}
                className={`h-12 rounded-xl text-xs font-bold uppercase transition-all duration-150 active:scale-95 disabled:opacity-30 ${
                  isCyber
                    ? "bg-slate-900/40 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    : "bg-gray-100 hover:bg-gray-200 text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                }`}
              >
                Clear
              </button>

              <button
                type="button"
                disabled={isLockedOut || isSubmitting}
                onClick={() => handleKeypadPress("0")}
                className={`h-12 rounded-xl text-lg font-bold font-mono transition-all duration-150 active:scale-95 disabled:opacity-40 ${
                  isCyber
                    ? "bg-slate-900/80 hover:bg-cyan-950/40 text-slate-100 border border-slate-800 hover:border-cyan-500/50"
                    : "bg-white hover:bg-[#FFE17D] text-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                }`}
              >
                0
              </button>

              <button
                type="button"
                disabled={isLockedOut || isSubmitting || inputVal.length === 0}
                onClick={handleBackspace}
                className={`h-12 rounded-xl text-lg font-bold transition-all duration-150 active:scale-95 disabled:opacity-30 flex items-center justify-center ${
                  isCyber
                    ? "bg-slate-900/40 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    : "bg-gray-100 hover:bg-gray-200 text-black border-2 border-black shadow-[2px_2px_0px_#000]"
                }`}
                aria-label="Backspace"
              >
                ⌫
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              disabled={isLockedOut || isSubmitting || inputVal.length < 4}
              onClick={() => handleUnlock()}
              className={`w-full max-w-[280px] mt-4 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-150 disabled:opacity-40 ${
                isCyber
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_20px_rgba(0,245,255,0.4)] hover:brightness-110 active:scale-98"
                  : "bg-[#00F5FF] text-black border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#FFE17D] active:translate-x-1 active:translate-y-1 active:shadow-none"
              }`}
            >
              {isSubmitting ? "Verifying..." : "Unlock Section"}
            </button>
          </div>
        ) : (
          /* PASSWORD MODE */
          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label
                htmlFor="content-lock-password"
                className={`block text-xs font-mono uppercase font-bold mb-1.5 ${
                  isCyber ? "text-cyan-400" : "text-black"
                }`}
              >
                Enter Content Password
              </label>
              <input
                id="content-lock-password"
                type="password"
                autoFocus
                disabled={isLockedOut || isSubmitting}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock();
                }}
                placeholder="••••••••••••"
                className={`w-full px-4 py-3 rounded-xl text-sm font-mono tracking-wider outline-none transition-all ${
                  isCyber
                    ? "bg-slate-900 border border-cyan-500/40 text-cyan-200 placeholder:text-slate-600 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,245,255,0.3)]"
                    : "bg-white border-3 border-black text-black placeholder:text-gray-400 focus:bg-[#FFF9D2] shadow-[3px_3px_0px_#000]"
                }`}
              />
            </div>

            <button
              type="button"
              disabled={isLockedOut || isSubmitting || !inputVal.trim()}
              onClick={() => handleUnlock()}
              className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-150 disabled:opacity-40 ${
                isCyber
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_20px_rgba(0,245,255,0.4)] hover:brightness-110 active:scale-98"
                  : "bg-[#00F5FF] text-black border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-[#FFE17D] active:translate-x-1 active:translate-y-1 active:shadow-none"
              }`}
            >
              {isSubmitting ? "Verifying..." : "Unlock Section"}
            </button>
          </div>
        )}

        {/* Hint & Recovery Actions */}
        <div className="mt-6 pt-5 border-t border-dashed flex flex-col items-center gap-3 border-slate-700/50">
          {/* Hint reveal */}
          {showHint ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`w-full p-3 rounded-xl text-xs text-center ${
                isCyber
                  ? "bg-slate-900/80 border border-amber-500/40 text-amber-300"
                  : "bg-amber-100 border-2 border-black text-black shadow-[2px_2px_0px_#000]"
              }`}
            >
              <div className="font-bold uppercase tracking-wider mb-0.5">💡 Security Hint:</div>
              <div className="italic">
                {contentLock.hint ? `"${contentLock.hint}"` : "No hint was configured."}
              </div>
            </motion.div>
          ) : (
            contentLock.hasHint && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className={`text-xs font-mono underline hover:opacity-80 transition-opacity ${
                  isCyber ? "text-cyan-400" : "text-blue-700 font-bold"
                }`}
              >
                💡 Show Hint
              </button>
            )
          )}

          {/* Forgot Credential / Use Login Password */}
          <button
            type="button"
            onClick={() => {
              setIsRecoveryOpen(true);
              setRecoveryError("");
            }}
            className={`text-xs font-mono tracking-wide transition-opacity hover:underline ${
              isCyber ? "text-slate-400 hover:text-slate-200" : "text-gray-700 font-bold"
            }`}
          >
            Forgot {contentLock.method === "PIN" ? "PIN" : "Password"}? Use Account Password
          </button>
        </div>
      </motion.div>

      {/* Recovery Modal */}
      <AnimatePresence>
        {isRecoveryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-2xl relative ${
                isCyber
                  ? "bg-[#0d121f] border border-cyan-500/50 shadow-[0_0_40px_rgba(0,245,255,0.2)] text-slate-100"
                  : "bg-[#FFFDF0] border-4 border-black shadow-[8px_8px_0px_#000] text-black"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className={`text-lg font-bold ${
                    isCyber ? "font-mono text-cyan-300" : "text-black"
                  }`}
                >
                  🔑 Account Verification
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRecoveryOpen(false)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isCyber
                      ? "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                      : "border-2 border-black hover:bg-red-400 text-black shadow-[2px_2px_0px_#000]"
                  }`}
                >
                  ✕
                </button>
              </div>

              <p className={`text-xs mb-4 ${isCyber ? "text-slate-400" : "text-gray-700"}`}>
                Verify your identity using your master account login password to securely reset your content lock.
              </p>

              {recoveryError && (
                <div
                  className={`p-2.5 mb-3 rounded-lg text-xs font-bold ${
                    isCyber
                      ? "bg-red-500/20 border border-red-500/50 text-red-300"
                      : "bg-red-100 border-2 border-black text-red-700"
                  }`}
                >
                  {recoveryError}
                </div>
              )}

              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold mb-1">
                    Account Login Password:
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your dashboard login password"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${
                      isCyber
                        ? "bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400"
                        : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/40">
                  <button
                    type="button"
                    onClick={() => {
                      setNewMethod("PIN");
                      setNewCredential("");
                      setConfirmCredential("");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      newMethod === "PIN"
                        ? isCyber
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "bg-black text-white border-black"
                        : isCyber
                        ? "bg-slate-900 border-slate-800 text-slate-400"
                        : "bg-white border-black text-black"
                    }`}
                  >
                    Reset to PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewMethod("PASSWORD");
                      setNewCredential("");
                      setConfirmCredential("");
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      newMethod === "PASSWORD"
                        ? isCyber
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                          : "bg-black text-white border-black"
                        : isCyber
                        ? "bg-slate-900 border-slate-800 text-slate-400"
                        : "bg-white border-black text-black"
                    }`}
                  >
                    Reset to Password
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold mb-1">
                    New {newMethod === "PIN" ? "PIN (4-8 digits)" : "Password (min 6 chars)"}:
                  </label>
                  <input
                    type={newMethod === "PIN" ? "tel" : "password"}
                    required
                    value={newCredential}
                    onChange={(e) => setNewCredential(e.target.value)}
                    placeholder={newMethod === "PIN" ? "1234" : "••••••••"}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono ${
                      isCyber
                        ? "bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400"
                        : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold mb-1">
                    Confirm New {newMethod}:
                  </label>
                  <input
                    type={newMethod === "PIN" ? "tel" : "password"}
                    required
                    value={confirmCredential}
                    onChange={(e) => setConfirmCredential(e.target.value)}
                    placeholder="Repeat new credential"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono ${
                      isCyber
                        ? "bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400"
                        : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                    }`}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryOpen(false)}
                    className={`w-1/2 py-2.5 rounded-xl text-xs font-bold uppercase ${
                      isCyber
                        ? "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700"
                        : "bg-gray-200 hover:bg-gray-300 text-black border-2 border-black"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecovering}
                    className={`w-1/2 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                      isCyber
                        ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,245,255,0.4)]"
                        : "bg-[#00F5FF] hover:bg-[#FFE17D] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
                    }`}
                  >
                    {isRecovering ? "Verifying..." : "Reset & Unlock"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
