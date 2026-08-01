"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { useContextMenu } from "@/hooks/useContextMenu";

const TARGET_AI_OPTIONS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Midjourney",
  "Stable Diffusion",
  "v0 / Replit",
  "Cursor / Windsurf",
  "Other",
];

const AI_COLORS: Record<string, { cyber: string; brutal: string }> = {
  ChatGPT: { cyber: "#10a37f", brutal: "#E8F5E9" },
  Claude: { cyber: "#d9775f", brutal: "#FDF2E9" },
  Gemini: { cyber: "#1a73e8", brutal: "#E8F0FE" },
  Midjourney: { cyber: "#bf5fff", brutal: "#F3E5F5" },
  "Stable Diffusion": { cyber: "#ff4b4b", brutal: "#FFEBEE" },
  "v0 / Replit": { cyber: "#f1502f", brutal: "#FFF3E0" },
  "Cursor / Windsurf": { cyber: "#00e5ff", brutal: "#E0F7FA" },
  Other: { cyber: "#94a3b8", brutal: "#F1F5F9" },
};

function PromptVaultPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { savedPrompts, addSavedPrompt, deleteSavedPrompt } = useDashboardStore();
  const { confirm } = useConfirm();
  const { openContextMenu } = useContextMenu();

  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterAI, setFilterAI] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetAI, setTargetAI] = useState("ChatGPT");
  const [promptText, setPromptText] = useState("");

  const filteredPrompts = savedPrompts
    .filter((p) => filterAI === "all" || p.targetAI === filterAI)
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.promptText.toLowerCase().includes(q) || p.targetAI.toLowerCase().includes(q);
    });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !promptText) return;

    const newPrompt = {
      id: editId || "prompt-" + Date.now(),
      title,
      targetAI,
      promptText,
    };

    await addSavedPrompt(newPrompt);
    setModalOpen(false);

    // Reset Form
    setEditId(null);
    setTitle("");
    setTargetAI("ChatGPT");
    setPromptText("");
  };

  const handleCloseModal = () => {
    setEditId(null);
    setTitle("");
    setTargetAI("ChatGPT");
    setPromptText("");
    setModalOpen(false);
  };

  return (
    <>
      {/* Page Header */}
      <motion.div
        className="mb-8 p-6 rounded-2xl relative overflow-hidden"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #050816, rgba(0,245,255,0.06))"
            : "linear-gradient(135deg, #FFF9E6, #FFF5E4)",
          border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "3px solid #000",
          boxShadow: isCyber ? "0 0 30px rgba(0,245,255,0.15)" : "6px 6px 0 #000",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-black text-3xl font-mono tracking-wide" style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#E0F7FA" : "#003366" }}>
              {isCyber ? "PROMPT::VAULT" : "⚡ AI Prompt Vault"}
            </h1>
            <p className="text-xs theme-text-secondary mt-1">
              Curate, store, and copy optimized prompts for large language models and generation agents.
            </p>
          </div>
          <button
            onClick={() => {
              setEditId(null);
              setTitle("");
              setTargetAI("ChatGPT");
              setPromptText("");
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide self-start sm:self-auto transition-all transform hover:scale-105 active:scale-95"
            style={{
              background: isCyber
                ? "linear-gradient(135deg, #00F5FF, #bf5fff)"
                : "#2EC4B6",
              color: "#fff",
              border: isCyber ? "none" : "2px solid #000",
              boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.5)" : "3px 3px 0 #000",
            }}
          >
            + Add Prompt
          </button>
        </div>
      </motion.div>

      {/* Search + Filter Bar */}
      {savedPrompts.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isCyber ? "SEARCH // title, prompt text, target AI..." : "Search by title, content, or AI..."}
              className="w-full px-4 py-2.5 text-xs font-bold rounded-xl outline-none border transition-all"
              style={{
                backgroundColor: isCyber ? "rgba(5,8,22,0.7)" : "#FAFAFA",
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                borderWidth: isCyber ? "1px" : "2px",
                color: isCyber ? "#E0F7FA" : "#111",
                boxShadow: isCyber ? "none" : "3px 3px 0 #000",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100 transition-opacity"
              >✕</button>
            )}
          </div>

          <FilterDropdown
            label="Filter Target AI"
            icon="⚡"
            value={filterAI}
            onChange={(val) => setFilterAI(val)}
            options={[
              { id: "all", label: "All Target AIs", icon: "🌐" },
              ...TARGET_AI_OPTIONS.map((opt) => ({ id: opt, label: opt })),
            ]}
          />

          <span className="text-xs font-mono theme-text-muted shrink-0">
            {filteredPrompts.length}/{savedPrompts.length} prompts
          </span>
        </div>
      )}

      {/* Prompts Bento Grid */}
      {filteredPrompts.length === 0 ? (
        <motion.div
          className="text-center py-12 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: isCyber ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            border: isCyber ? "1px dashed rgba(0,245,255,0.2)" : "2px dashed #000",
          }}
        >
          <span className="text-4xl">⚡</span>
          <h2 className="font-black text-lg theme-text-primary mt-2">
            {savedPrompts.length === 0 ? "No prompts stored yet" : "No matching prompts found"}
          </h2>
          <p className="theme-text-muted text-xs mt-1">
            {savedPrompts.length === 0 ? "Click the add prompt button above to curate your first AI template." : "Try switching your Target AI filter."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredPrompts.map((prompt) => {
            const colors = AI_COLORS[prompt.targetAI] || AI_COLORS.Other;
            const badgeBg = isCyber ? `${colors.cyber}15` : colors.brutal;
            const badgeText = isCyber ? colors.cyber : "#000";
            const badgeBorder = isCyber ? `1px solid ${colors.cyber}30` : "2px solid #000";

            return (
              <motion.div
                key={prompt.id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openContextMenu(
                    e,
                    [
                      {
                        id: "copy",
                        label: "Copy Prompt Text",
                        icon: "📋",
                        onClick: () => handleCopy(prompt.id, prompt.promptText),
                      },
                      {
                        id: "edit",
                        label: "Edit Prompt",
                        icon: "✏️",
                        onClick: () => {
                          setEditId(prompt.id);
                          setTitle(prompt.title);
                          setTargetAI(prompt.targetAI);
                          setPromptText(prompt.promptText);
                          setModalOpen(true);
                        },
                      },
                      {
                        id: "delete",
                        label: "Delete Prompt",
                        icon: "🗑️",
                        danger: true,
                        divider: true,
                        onClick: () => {
                          confirm({
                            title: "Delete AI Prompt",
                            message: `Are you sure you want to delete prompt "${prompt.title}"?`,
                            confirmText: "Delete Prompt",
                            variant: "danger",
                            itemPreview: { title: prompt.title, description: prompt.promptText, icon: "🤖", category: prompt.targetAI },
                            successToast: `✓ Prompt "${prompt.title}" deleted.`,
                            onConfirm: async () => { await deleteSavedPrompt(prompt.id); },
                          });
                        },
                      },
                    ],
                    prompt.title
                  );
                }}
                className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden transition-all duration-300 cursor-context-menu"
                style={{
                  background: isCyber ? "rgba(10,15,30,0.6)" : "#F0FAFA",
                  border: isCyber ? "1px solid rgba(0,245,255,0.15)" : "2px solid #000",
                  boxShadow: isCyber ? "0 4px 20px rgba(0,0,0,0.2)" : "4px 4px 0 #000",
                }}
                whileHover={{
                  y: -3,
                  boxShadow: isCyber ? "0 8px 30px rgba(0,245,255,0.2)" : "6px 6px 0 #000",
                  borderColor: isCyber ? "#00F5FF" : "#000",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-sm theme-text-primary leading-snug truncate flex-1" title={prompt.title}>
                    {prompt.title}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditId(prompt.id);
                        setTitle(prompt.title);
                        setTargetAI(prompt.targetAI);
                        setPromptText(prompt.promptText);
                        setModalOpen(true);
                      }}
                      className="opacity-30 hover:opacity-100 hover:text-cyan-400 transition-all p-0.5 rounded text-xs"
                      title="Edit Prompt"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        confirm({
                          title: "Delete AI Prompt",
                          message: `Are you sure you want to delete prompt "${prompt.title}"?`,
                          confirmText: "Delete Prompt",
                          variant: "danger",
                          itemPreview: {
                            title: prompt.title,
                            subtitle: `Target AI: ${prompt.targetAI || "General"}`,
                            description: prompt.promptText,
                            icon: "📝",
                            category: prompt.targetAI,
                          },
                          successToast: `✓ Prompt "${prompt.title}" deleted.`,
                          onConfirm: async () => {
                            await deleteSavedPrompt(prompt.id);
                          },
                        });
                      }}
                      className="opacity-30 hover:opacity-100 hover:text-red-500 transition-all p-0.5 rounded"
                      title="Delete Prompt"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Target AI Badge */}
                <div className="self-start">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: badgeBg,
                      color: badgeText,
                      border: badgeBorder,
                    }}
                  >
                    {prompt.targetAI}
                  </span>
                </div>

                {/* Prompt Text Box with expand/collapse */}
                <div className="relative">
                  <div
                    className="p-3 rounded-lg text-xs font-mono select-all transition-all overflow-hidden"
                    style={{
                      maxHeight: expandedId === prompt.id ? "400px" : "120px",
                      overflowY: expandedId === prompt.id ? "auto" : "hidden",
                      backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#FFF",
                      border: isCyber ? "1px solid rgba(255,255,255,0.06)" : "1px solid #CCC",
                      color: isCyber ? "#E2E8F0" : "#333",
                      lineHeight: 1.6,
                    }}
                  >
                    {prompt.promptText}
                  </div>
                  {prompt.promptText.length > 200 && (
                    <button
                      onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
                      className="mt-1 text-[10px] font-black uppercase tracking-wider transition-opacity opacity-60 hover:opacity-100"
                      style={{ color: isCyber ? "#00F5FF" : "#6B7280" }}
                    >
                      {expandedId === prompt.id ? "▲ Collapse" : "▼ Expand"}
                    </button>
                  )}
                  {/* Character count */}
                  <span
                    className="absolute top-2 right-2 text-[9px] font-mono opacity-40 pointer-events-none"
                    style={{ color: isCyber ? "#00F5FF" : "#888" }}
                  >
                    {prompt.promptText.length}c
                  </span>
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(prompt.id, prompt.promptText)}
                  className="w-full py-2 rounded-xl font-bold text-xs font-mono tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: copiedId === prompt.id
                      ? (isCyber ? "rgba(57,255,20,0.15)" : "#E8F5E9")
                      : (isCyber ? "rgba(0,245,255,0.1)" : "#FFFDEB"),
                    color: copiedId === prompt.id
                      ? (isCyber ? "#39FF14" : "#2E7D32")
                      : (isCyber ? "#00F5FF" : "#000"),
                    border: isCyber
                      ? `1px solid ${copiedId === prompt.id ? "#39FF14" : "rgba(0,245,255,0.3)"}`
                      : "2px solid #000",
                    boxShadow: isCyber ? "none" : (copiedId === prompt.id ? "none" : "2px 2px 0 #000"),
                  }}
                >
                  {copiedId === prompt.id ? (
                    <>
                      <span>✓</span> COPIED!
                    </>
                  ) : (
                    <>
                      <span>📋</span> COPY PROMPT
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add Prompt Modal */}
      <Modal isOpen={modalOpen} onClose={handleCloseModal}>
        <div className="p-1">
          <h2
            className="font-black text-xl font-mono mb-4 text-center"
            style={{
              color: isCyber ? "#00F5FF" : "#003366",
              textShadow: isCyber ? "0 0 10px rgba(0,245,255,0.3)" : "none",
            }}
          >
            {editId ? (isCyber ? "EDIT_PROMPT::UPDATE" : "⚡ Edit AI Prompt") : (isCyber ? "NEW_PROMPT::CREATE" : "⚡ Add Prompt to Vault")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 theme-text-secondary">PROMPT TITLE</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Code Refactor Assistant"
                className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-all"
                style={{
                  backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#fff",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                  color: isCyber ? "#fff" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 theme-text-secondary">TARGET AI MODEL / ENGINE</label>
              <select
                value={targetAI}
                onChange={(e) => setTargetAI(e.target.value)}
                className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none transition-all cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "#050816" : "#fff",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                  color: isCyber ? "#fff" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              >
                {TARGET_AI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 theme-text-secondary">PROMPT TEMPLATE TEXT</label>
              <textarea
                required
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Paste the prompt text here. Use [variables] if needed."
                rows={6}
                className="w-full p-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-all scrollbar-thin"
                style={{
                  backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#fff",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                  color: isCyber ? "#fff" : "#000",
                  borderWidth: isCyber ? "1px" : "2px",
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-95"
                style={{
                  backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                  color: isCyber ? "#94A3B8" : "#475569",
                  border: isCyber ? "1px solid rgba(255,255,255,0.1)" : "2px solid #000",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-95"
                style={{
                  background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#2EC4B6",
                  color: "#fff",
                  border: isCyber ? "none" : "2px solid #000",
                  boxShadow: isCyber ? "0 0 10px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                }}
              >
                Save Prompt
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default function PromptVaultPage() {
  return (
    <AppShell>
      <PromptVaultPageContent />
    </AppShell>
  );
}
