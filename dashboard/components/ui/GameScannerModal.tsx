"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, DossierCharacterEntry } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { analyzeGameScreenshot, ExtractedDossierResult } from "@/lib/data/gameScannerEngine";
import { getGameDossierConfig } from "@/lib/data/gameDossierConfig";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useToast } from "@/components/ui/ToastProvider";

interface GameScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle?: string;
  gameCategory?: string;
}

export function GameScannerModal({
  isOpen,
  onClose,
  gameId,
  gameTitle = "Selected Game",
  gameCategory = "General",
}: GameScannerModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";

  const { dossierCharacters, addDossierCharacter, updateDossierCharacter } = useDashboardStore();
  const { warning: toastWarning } = useToast();
  const config = getGameDossierConfig(gameTitle, gameCategory);

  // Scanner Steps: "upload" | "scanning" | "review"
  const [step, setStep] = useState<"upload" | "scanning" | "review">("upload");

  // File & Image state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extracted & Editable Fields State
  const [extractedResult, setExtractedResult] = useState<ExtractedDossierResult | null>(null);

  // User Edited Values
  const [editedName, setEditedName] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedRole, setEditedRole] = useState("");
  const [editedLevelRank, setEditedLevelRank] = useState("");
  const [editedWinRate, setEditedWinRate] = useState<number>(60);
  const [editedMatches, setEditedMatches] = useState<number>(50);
  const [editedNotes, setEditedNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const resetModalState = () => {
    setStep("upload");
    setImagePreview(null);
    setFileName("");
    setExtractedResult(null);
    setIsSaving(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  // Image Selection Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      toastWarning("Unsupported file type. Please upload a PNG, JPG, JPEG, or WEBP screenshot.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setImagePreview(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI / OCR Scanner Analysis
  const runScanner = async () => {
    if (!imagePreview) return;

    setStep("scanning");

    // Filter existing characters for this game to check duplicates
    const gameExistingChars = dossierCharacters.filter((c) => c.gameId === gameId);

    // Simulate OCR analysis delay
    setTimeout(async () => {
      const result = await analyzeGameScreenshot(
        fileName || imagePreview,
        gameTitle,
        gameCategory,
        gameExistingChars
      );

      setExtractedResult(result);

      // Populate Editable Fields
      setEditedName(result.name.value);
      setEditedCategory(result.category.value);
      setEditedRole(result.role.value);
      setEditedLevelRank(result.levelRank.value);
      setEditedWinRate(result.winRate.value);
      setEditedMatches(result.matches.value);
      setEditedNotes(result.notes.value);

      setStep("review");
    }, 1800);
  };

  // Confirm & Persist
  const handleConfirmSave = async () => {
    if (!editedName.trim()) return;

    setIsSaving(true);
    try {
      if (extractedResult?.isDuplicate && extractedResult.existingId) {
        // Update existing entry
        await updateDossierCharacter(extractedResult.existingId, {
          name: editedName,
          category: editedCategory,
          role: editedRole || undefined,
          levelRank: editedLevelRank || undefined,
          winRate: Number(editedWinRate),
          matches: Number(editedMatches),
          notes: editedNotes || undefined,
        });
      } else {
        // Save new entry
        const newChar: DossierCharacterEntry = {
          id: `dossier-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          gameId,
          name: editedName,
          category: editedCategory,
          role: editedRole || undefined,
          levelRank: editedLevelRank || undefined,
          winRate: Number(editedWinRate),
          matches: Number(editedMatches),
          notes: editedNotes || undefined,
          avatarUrl: undefined,
          accentColor: "#3B82F6",
          isFavorite: false,
        };
        await addDossierCharacter(newChar);
      }

      handleClose();
    } catch (err) {
      console.error("Failed to save scanned data:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions = config.categories.map((c) => c.name);

  const inputStyles = {
    backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#F8FAFC",
    color: isCyber ? "#F8FAFC" : "#0F172A",
    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-2xl">
      <div className="overflow-y-auto overscroll-contain flex-1 p-5 sm:p-7 space-y-5 scrollbar-thin">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-white/10">
          <div>
            <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
              <span>📷</span> {isCyber ? "AI_SCANNER_TERMINAL" : "Screenshot Data Import Scanner"}
            </h2>
            <p className="text-xs theme-text-muted font-mono mt-0.5">
              Target Game: <strong className="text-amber-500">{gameTitle}</strong> ({config.gameType})
            </p>
          </div>
        </div>

        {/* ── STEP 1: Upload & Preview ── */}
        {step === "upload" && (
          <div className="space-y-4">
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 md:p-12 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.01] group"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.03)" : "#F8FAFC",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000000",
                  boxShadow: isCyber ? "none" : "3px 3px 0 #000",
                }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</div>
                <h3 className="font-black text-base theme-text-primary">
                  Upload Game Statistics Screenshot
                </h3>
                <p className="text-xs theme-text-muted max-w-sm mt-1">
                  Select a screenshot of your match summary, hero statistics, or career profile.
                </p>
                <div className="mt-4 px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500 text-black border-2 border-black shadow-[2px_2px_0_#000]">
                  Select Image File (PNG, JPG, WEBP)
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border max-h-72 aspect-video w-full group"
                  style={{
                    borderColor: isCyber ? "rgba(0,245,255,0.4)" : "#000",
                    borderWidth: isCyber ? "1px" : "2.5px",
                    boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.2)" : "4px 4px 0 #000",
                  }}
                >
                  <img src={imagePreview} alt="Screenshot Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow transition-all cursor-pointer"
                  >
                    🗑️ Replace Image
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs theme-text-muted border cursor-pointer"
                    style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={runScanner}
                    className="flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                    style={{
                      background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#FF6B35",
                      color: "#FFFFFF",
                      border: isCyber ? "none" : "2px solid #000",
                      boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                    }}
                  >
                    <span>⚡ Run AI Scan Analysis</span>
                  </button>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
          </div>
        )}

        {/* ── STEP 2: Scanning Animation ── */}
        {step === "scanning" && (
          <div className="p-8 text-center space-y-6 flex flex-col items-center justify-center">
            {/* Screenshot Preview with Animated Scan Line */}
            {imagePreview && (
              <div className="relative w-full max-h-48 aspect-video rounded-2xl overflow-hidden border border-cyan-500/40">
                <img src={imagePreview} alt="Scanning" className="w-full h-full object-cover opacity-60" />
                {/* Laser Scanning Line */}
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 shadow-[0_0_15px_#00F5FF]"
                  animate={{ top: ["0%", "95%", "0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-black theme-text-primary animate-pulse flex items-center justify-center gap-2">
                <span>⚡</span> Analyzing Screenshot with Game OCR...
              </h3>
              <p className="text-xs theme-text-muted font-mono">
                Extracting statistics for {gameTitle}...
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results Review & Confirmation ── */}
        {step === "review" && extractedResult && (
          <div className="space-y-5">
            {/* Duplicate Notice Banner */}
            {extractedResult.isDuplicate && (
              <div
                className="p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5"
                style={{
                  backgroundColor: isCyber ? "rgba(245,158,11,0.12)" : "#FEF3C7",
                  borderColor: isCyber ? "rgba(245,158,11,0.4)" : "#F59E0B",
                  color: isCyber ? "#FBBF24" : "#92400E",
                }}
              >
                <span className="text-base">⚠️</span>
                <span>{extractedResult.duplicateMessage}</span>
              </div>
            )}

            <div className="text-xs font-mono theme-text-muted flex items-center justify-between">
              <span>{extractedResult.rawTextSummary}</span>
              <span className="text-emerald-400 font-bold">Review & Edit values below before saving</span>
            </div>

            {/* Editable Fields Grid */}
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmSave(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Character Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold theme-text-secondary uppercase">
                      {extractedResult.name.label} *
                    </label>
                    <StatusBadge status={extractedResult.name.status} />
                  </div>
                  <input
                    type="text"
                    required
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-sm font-bold focus:outline-none"
                    style={inputStyles}
                  />
                </div>

                {/* Category / Lane */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold theme-text-secondary uppercase">
                      {extractedResult.category.label} *
                    </label>
                    <StatusBadge status={extractedResult.category.status} />
                  </div>
                  <CustomSelect
                    value={editedCategory}
                    onChange={(val) => setEditedCategory(val)}
                    options={categoryOptions}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Win Rate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold theme-text-secondary uppercase">
                      Win Rate (%)
                    </label>
                    <StatusBadge status={extractedResult.winRate.status} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={editedWinRate}
                    onChange={(e) => setEditedWinRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-xl border text-sm font-bold focus:outline-none"
                    style={inputStyles}
                  />
                </div>

                {/* Matches */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold theme-text-secondary uppercase">
                      Matches
                    </label>
                    <StatusBadge status={extractedResult.matches.status} />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={editedMatches}
                    onChange={(e) => setEditedMatches(parseInt(e.target.value, 10) || 0)}
                    className="w-full p-2 rounded-xl border text-sm font-bold focus:outline-none"
                    style={inputStyles}
                  />
                </div>

                {/* Level / Build */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold theme-text-secondary uppercase">
                      Level / Rank
                    </label>
                    <StatusBadge status={extractedResult.levelRank.status} />
                  </div>
                  <input
                    type="text"
                    value={editedLevelRank}
                    onChange={(e) => setEditedLevelRank(e.target.value)}
                    className="w-full p-2 rounded-xl border text-sm font-bold focus:outline-none"
                    style={inputStyles}
                  />
                </div>
              </div>

              {/* Sub Role & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                    Specialty / Sub Role
                  </label>
                  <input
                    type="text"
                    value={editedRole}
                    onChange={(e) => setEditedRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                    style={inputStyles}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                    Import Notes
                  </label>
                  <input
                    type="text"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                    style={inputStyles}
                  />
                </div>
              </div>

              {/* Bottom Action Controls */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs theme-text-muted border cursor-pointer"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000" }}
                >
                  🔄 Re-Scan
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs theme-text-muted border cursor-pointer"
                  style={{ borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#000" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : "#10B981",
                    color: "#FFFFFF",
                    border: isCyber ? "none" : "2px solid #000",
                    boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                  }}
                >
                  <span>{isSaving ? "Saving..." : "✓ Confirm & Save to Game Dossier"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
}

function StatusBadge({ status }: { status: "detected" | "needs_review" | "not_found" }) {
  if (status === "detected") {
    return (
      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        ✓ Detected
      </span>
    );
  }
  if (status === "needs_review") {
    return (
      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
        ? Needs Review
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 border border-slate-500/30">
      + Not Found
    </span>
  );
}
