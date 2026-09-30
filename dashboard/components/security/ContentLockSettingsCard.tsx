"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { PROTECTED_SCOPES } from "./ContentLockConstants";
import { useToast } from "@/components/ui/ToastProvider";

export function ContentLockSettingsCard() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { contentLock, updateContentLockConfig, lockContent, unlockContent } = useDashboardStore();
  const toast = useToast();

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  // Form states for configuration
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    contentLock.protectedScopes || []
  );
  const [lockMethod, setLockMethod] = useState<"PIN" | "PASSWORD">(
    contentLock.method || "PIN"
  );
  const [currentCredential, setCurrentCredential] = useState("");
  const [newCredential, setNewCredential] = useState("");
  const [confirmCredential, setConfirmCredential] = useState("");
  const [hintText, setHintText] = useState(contentLock.hint || "");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Disable lock form states
  const [disableCredential, setDisableCredential] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);
  const [disableError, setDisableError] = useState("");

  const openConfigModal = () => {
    setSelectedScopes(contentLock.protectedScopes || []);
    setLockMethod(contentLock.method || "PIN");
    setCurrentCredential("");
    setNewCredential("");
    setConfirmCredential("");
    setHintText(contentLock.hint || "");
    setFormError("");
    setIsConfigModalOpen(true);
  };

  const handleToggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(selectedScopes.filter((id) => id !== scopeId));
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // If setting up for first time or changing credential
    const isChangingCredential = newCredential.trim().length > 0;

    if (!contentLock.enabled && !isChangingCredential) {
      setFormError(`Please set a ${lockMethod === "PIN" ? "PIN (4-8 digits)" : "Password (min 6 chars)"}.`);
      return;
    }

    if (isChangingCredential) {
      if (newCredential !== confirmCredential) {
        setFormError("New credentials do not match.");
        return;
      }
      if (lockMethod === "PIN" && !/^\d{4,8}$/.test(newCredential)) {
        setFormError("PIN must be 4 to 8 numeric digits.");
        return;
      }
      if (lockMethod === "PASSWORD" && newCredential.length < 6) {
        setFormError("Password must be at least 6 characters.");
        return;
      }
      if (contentLock.enabled && !currentCredential.trim()) {
        setFormError("Please enter your current credential to authorize this change.");
        return;
      }
    } else if (contentLock.enabled && !currentCredential.trim()) {
      // Just changing scopes/hint
      setFormError("Please enter your current credential to verify identity.");
      return;
    }

    if (selectedScopes.length === 0) {
      setFormError("Please select at least one area to protect.");
      return;
    }

    setIsSaving(true);

    const payload: any = {
      enabled: true,
      method: lockMethod,
      protectedScopes: selectedScopes,
      hint: hintText.trim() || null,
    };

    if (isChangingCredential) {
      payload.credential = newCredential;
    }

    if (contentLock.enabled) {
      payload.currentCredential = currentCredential;
    }

    const res = await updateContentLockConfig(payload);
    setIsSaving(false);

    if (res.success) {
      toast.success(contentLock.enabled ? "Content Lock settings updated!" : "Content Lock enabled!");
      setIsConfigModalOpen(false);
    } else {
      setFormError(res.error || "Failed to update content lock configuration.");
    }
  };

  const handleDisableLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCredential.trim()) {
      setDisableError("Please enter your current credential or account login password.");
      return;
    }

    setIsDisabling(true);
    setDisableError("");

    const res = await updateContentLockConfig({
      enabled: false,
      currentCredential: disableCredential,
    });

    setIsDisabling(false);

    if (res.success) {
      toast.success("Content Lock disabled successfully.");
      setIsDisableModalOpen(false);
      setDisableCredential("");
    } else {
      setDisableError(res.error || "Verification failed. Could not disable content lock.");
    }
  };

  const handleManualLockToggle = async () => {
    if (contentLock.isUnlocked) {
      await lockContent();
      toast.info("Protected modules locked.");
    }
  };

  return (
    <>
      <div
        className="p-6 rounded-2xl border-adaptive-unique relative overflow-hidden transition-all duration-200"
        style={{
          backgroundColor: isCyber ? "rgba(10,15,44,0.6)" : "#FFFFFF",
          boxShadow: isCyber ? "none" : "4px 4px 0px 0px #000000",
        }}
      >
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-4" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB" }}>
          <div>
            <h2 className="text-base font-black uppercase tracking-wider flex items-center gap-2" style={{ color: isCyber ? "#00F5FF" : "#000" }}>
              <span>🔐</span>
              <span>Content Security & Locks</span>
            </h2>
            <p className="text-xs font-mono theme-text-muted mt-0.5">
              Protect personal sections (Notepad, Characters, Games, Favourites, Misc) with a secure PIN or password.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {contentLock.enabled && (
              <button
                type="button"
                onClick={handleManualLockToggle}
                className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: contentLock.isUnlocked
                    ? isCyber ? "rgba(245,158,11,0.15)" : "#FEF3C7"
                    : isCyber ? "rgba(16,185,129,0.15)" : "#D1FAE5",
                  borderColor: contentLock.isUnlocked
                    ? isCyber ? "#F59E0B" : "#D97706"
                    : isCyber ? "#10B981" : "#059669",
                  color: contentLock.isUnlocked
                    ? isCyber ? "#F59E0B" : "#B45309"
                    : isCyber ? "#10B981" : "#047857",
                }}
              >
                {contentLock.isUnlocked ? "🔒 Lock Now" : "🔓 Unlocked"}
              </button>
            )}

            <button
              type="button"
              onClick={openConfigModal}
              className="px-4 py-2 text-xs font-black rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: isCyber ? "rgba(0, 245, 255, 0.15)" : "#FFE17D",
                border: isCyber ? "1px solid rgba(0, 245, 255, 0.4)" : "2px solid #000000",
                color: isCyber ? "#00F5FF" : "#000000",
                boxShadow: isCyber ? "none" : "3px 3px 0px #000000",
              }}
            >
              <span>⚙️</span>
              <span>{contentLock.enabled ? "Manage Locks" : "Configure Lock"}</span>
            </button>
          </div>
        </div>

        {/* Status Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          {/* Status */}
          <div
            className="p-3.5 rounded-xl border flex flex-col gap-1"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB",
              borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">
              Security Status
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  contentLock.enabled ? "bg-emerald-400 animate-pulse" : "bg-gray-400"
                }`}
              />
              <span className="text-xs font-mono font-bold theme-text-primary">
                {contentLock.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Protected Areas Count */}
          <div
            className="p-3.5 rounded-xl border flex flex-col gap-1"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB",
              borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">
              Protected Areas
            </span>
            <span className="text-xs font-mono font-bold theme-text-primary">
              {contentLock.enabled ? `${contentLock.protectedScopes.length} Sections` : "None"}
            </span>
          </div>

          {/* Method */}
          <div
            className="p-3.5 rounded-xl border flex flex-col gap-1"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB",
              borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">
              Lock Method
            </span>
            <span className="text-xs font-mono font-bold theme-text-primary">
              {contentLock.enabled ? (contentLock.method === "PIN" ? "🔢 PIN Code" : "🔑 Password") : "—"}
            </span>
          </div>

          {/* Recovery Hint */}
          <div
            className="p-3.5 rounded-xl border flex flex-col gap-1"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F9FAFB",
              borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E5E7EB",
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider theme-text-secondary">
              Security Hint
            </span>
            <span className="text-xs font-mono font-bold theme-text-primary">
              {contentLock.hasHint ? "💡 Configured" : "None"}
            </span>
          </div>
        </div>

        {/* Protected Scopes Badges */}
        {contentLock.enabled && contentLock.protectedScopes.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-mono theme-text-secondary block mb-2 font-bold uppercase tracking-wider">
              Currently Protected Scopes:
            </span>
            <div className="flex flex-wrap gap-2">
              {contentLock.protectedScopes.map((scopeId) => {
                const def = PROTECTED_SCOPES.find((s) => s.id === scopeId);
                return (
                  <span
                    key={scopeId}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                      isCyber
                        ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-300"
                        : "bg-[#FFF9D2] border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                    }`}
                  >
                    <span>{def?.icon || "🔒"}</span>
                    <span>{def?.label || scopeId}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Disable Button */}
        {contentLock.enabled && (
          <div className="mt-4 pt-4 border-t flex justify-end" style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#E5E7EB" }}>
            <button
              type="button"
              onClick={() => {
                setDisableError("");
                setDisableCredential("");
                setIsDisableModalOpen(true);
              }}
              className="text-xs font-bold text-red-500 hover:text-red-400 hover:underline cursor-pointer"
            >
              Disable Content Lock
            </button>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg p-6 sm:p-7 rounded-2xl relative max-h-[90vh] overflow-y-auto ${
                isCyber
                  ? "bg-[#0c1122] border border-cyan-500/50 shadow-[0_0_40px_rgba(0,245,255,0.2)] text-slate-100"
                  : "bg-[#FFFDF0] border-4 border-black shadow-[8px_8px_0px_#000] text-black"
              }`}
            >
              <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-700/50">
                <h3 className={`text-base font-bold flex items-center gap-2 ${isCyber ? "font-mono text-cyan-300" : "text-black"}`}>
                  <span>⚙️</span>
                  <span>{contentLock.enabled ? "Configure Content Locks" : "Enable Content Lock"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm hover:opacity-70"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div
                  className={`p-3 mb-4 rounded-xl text-xs font-bold ${
                    isCyber
                      ? "bg-red-500/20 border border-red-500/50 text-red-300"
                      : "bg-red-100 border-2 border-black text-red-700"
                  }`}
                >
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveConfig} className="space-y-5">
                {/* 1. Protected Areas Selection */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-2">
                    1. Select Protected Modules:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PROTECTED_SCOPES.map((scope) => {
                      const isChecked = selectedScopes.includes(scope.id);
                      return (
                        <div
                          key={scope.id}
                          onClick={() => handleToggleScope(scope.id)}
                          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-2.5 ${
                            isChecked
                              ? isCyber
                                ? "bg-cyan-500/15 border-cyan-400 text-cyan-200"
                                : "bg-[#FFE17D] border-2 border-black shadow-[2px_2px_0px_#000]"
                              : isCyber
                              ? "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                              : "bg-white border-2 border-gray-300 text-gray-700"
                          }`}
                        >
                          <span className="text-lg">{scope.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs flex items-center justify-between">
                              <span>{scope.label}</span>
                              <span>{isChecked ? "✓" : "○"}</span>
                            </div>
                            <p className="text-[10px] opacity-70 mt-0.5 leading-tight">
                              {scope.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Lock Method */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-2">
                    2. Lock Method:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLockMethod("PIN")}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                        lockMethod === "PIN"
                          ? isCyber
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,245,255,0.2)]"
                            : "bg-black text-white border-black"
                          : isCyber
                          ? "bg-slate-900 border-slate-800 text-slate-400"
                          : "bg-white border-2 border-black text-black"
                      }`}
                    >
                      <span>🔢</span>
                      <span>PIN Code (4-8 digits)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLockMethod("PASSWORD")}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                        lockMethod === "PASSWORD"
                          ? isCyber
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,245,255,0.2)]"
                            : "bg-black text-white border-black"
                          : isCyber
                          ? "bg-slate-900 border-slate-800 text-slate-400"
                          : "bg-white border-2 border-black text-black"
                      }`}
                    >
                      <span>🔑</span>
                      <span>Password (min 6 chars)</span>
                    </button>
                  </div>
                </div>

                {/* 3. Current Credential (if modifying existing lock) */}
                {contentLock.enabled && (
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-1">
                      Current {contentLock.method === "PIN" ? "PIN" : "Password"} (Verification):
                    </label>
                    <input
                      type={contentLock.method === "PIN" ? "tel" : "password"}
                      value={currentCredential}
                      onChange={(e) => setCurrentCredential(e.target.value)}
                      placeholder={`Enter current ${contentLock.method}`}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono ${
                        isCyber
                          ? "bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400"
                          : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                      }`}
                    />
                  </div>
                )}

                {/* 4. New Credential */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-1">
                      {contentLock.enabled ? `New ${lockMethod} (Optional)` : `Create ${lockMethod}:`}
                    </label>
                    <input
                      type={lockMethod === "PIN" ? "tel" : "password"}
                      value={newCredential}
                      onChange={(e) => setNewCredential(e.target.value)}
                      placeholder={lockMethod === "PIN" ? "1234" : "••••••••"}
                      className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono ${
                        isCyber
                          ? "bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400"
                          : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-1">
                      Confirm {lockMethod}:
                    </label>
                    <input
                      type={lockMethod === "PIN" ? "tel" : "password"}
                      value={confirmCredential}
                      onChange={(e) => setConfirmCredential(e.target.value)}
                      placeholder="Repeat credential"
                      className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono ${
                        isCyber
                          ? "bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400"
                          : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                      }`}
                    />
                  </div>
                </div>

                {/* 5. Optional Hint */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-1">
                    Optional Recovery Hint:
                  </label>
                  <input
                    type="text"
                    value={hintText}
                    onChange={(e) => setHintText(e.target.value)}
                    placeholder="e.g. My favorite arcade cabinet year"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${
                      isCyber
                        ? "bg-slate-950 border border-slate-700 text-slate-100 focus:border-cyan-400"
                        : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                    }`}
                  />
                  <p className="text-[10px] opacity-60 mt-1">
                    This hint can be shown if you forget your credential. Never write your actual PIN or password here.
                  </p>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold rounded-xl border opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      isCyber
                        ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,245,255,0.4)]"
                        : "bg-[#00F5FF] hover:bg-[#FFE17D] text-black border-2 border-black shadow-[3px_3px_0px_#000]"
                    }`}
                  >
                    {isSaving ? "Saving Settings..." : "Save Lock Configuration"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disable Lock Modal */}
      <AnimatePresence>
        {isDisableModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-2xl relative ${
                isCyber
                  ? "bg-[#0e1424] border border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)] text-slate-100"
                  : "bg-[#FFFDF0] border-4 border-black shadow-[8px_8px_0px_#000] text-black"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-red-500 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Disable Content Lock</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDisableModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs mb-4 opacity-80">
                To disable Content Lock, please verify your current content lock credential or account login password.
              </p>

              {disableError && (
                <div className="p-2.5 mb-3 rounded-lg text-xs font-bold bg-red-500/20 border border-red-500/50 text-red-300">
                  {disableError}
                </div>
              )}

              <form onSubmit={handleDisableLock} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold mb-1">
                    Current Credential / Login Password:
                  </label>
                  <input
                    type="password"
                    required
                    value={disableCredential}
                    onChange={(e) => setDisableCredential(e.target.value)}
                    placeholder="Enter current PIN, password, or login password"
                    className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none ${
                      isCyber
                        ? "bg-slate-950 border border-slate-700 text-slate-100 focus:border-red-400"
                        : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000]"
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDisableModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold rounded-lg border opacity-70 hover:opacity-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDisabling}
                    className="px-4 py-2 text-xs font-black rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all shadow-md"
                  >
                    {isDisabling ? "Verifying..." : "Disable Content Lock"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
