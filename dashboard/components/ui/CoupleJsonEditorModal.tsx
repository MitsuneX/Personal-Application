"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTheme } from "@/lib/theme";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/ToastProvider";
import type { CoupleEntry } from "@/lib/data/coupleSchema";
import {
  validateCoupleJson,
  normalizeCoupleJson,
  exportCoupleToJson,
  diffCoupleProfiles,
  summarizeDiff,
  type ValidationError,
  type FieldDiff,
} from "@/lib/data/coupleSchema";

function prettyPrint(obj: unknown): string {
  try {
    if (obj && typeof obj === "object") {
      const canonical = exportCoupleToJson(obj as Partial<CoupleEntry>);
      return JSON.stringify(canonical, null, 2);
    }
    return JSON.stringify(obj, null, 2);
  } catch {
    return "";
  }
}

type ValidationState = "idle" | "valid" | "invalid";

export interface CoupleJsonEditorViewProps {
  profile: Partial<CoupleEntry>;
  onApply: (data: Partial<CoupleEntry>, mode: "replace" | "merge") => Promise<void> | void;
  onCancel?: () => void;
  isInsideModal?: boolean;
}

export function CoupleJsonEditorView({
  profile,
  onApply,
  onCancel,
  isInsideModal = false,
}: CoupleJsonEditorViewProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { success: toastSuccess, warning: toastWarning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jsonText, setJsonText] = useState<string>(() => prettyPrint(profile));
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [parsed, setParsed] = useState<Partial<CoupleEntry> | null>(null);
  const [diffs, setDiffs] = useState<FieldDiff[] | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy JSON");
  const [isApplying, setIsApplying] = useState(false);

  // Sync state whenever profile changes
  useEffect(() => {
    setJsonText(prettyPrint(profile));
    setValidationState("idle");
    setErrors([]);
    setParsed(null);
    setDiffs(null);
  }, [profile]);

  const handleValidate = useCallback(() => {
    let raw: unknown;
    try {
      raw = JSON.parse(jsonText);
    } catch (e: any) {
      setValidationState("invalid");
      setErrors([
        {
          path: "JSON syntax",
          message: `Invalid JSON syntax: ${e.message}`,
          severity: "error",
        },
      ]);
      setParsed(null);
      setDiffs(null);
      return;
    }

    const result = validateCoupleJson(raw);
    if (!result.valid) {
      setValidationState("invalid");
      setErrors(result.errors);
      setParsed(null);
      setDiffs(null);
    } else {
      setValidationState("valid");
      setErrors([]);
      const normalized = normalizeCoupleJson(raw);
      setParsed(normalized);
      if (profile) {
        setDiffs(diffCoupleProfiles(profile, normalized));
      } else {
        setDiffs([]);
      }
    }
  }, [jsonText, profile]);

  const handleFormat = useCallback(() => {
    try {
      const p = JSON.parse(jsonText);
      setJsonText(prettyPrint(p));
      toastSuccess("JSON formatted.");
    } catch {
      toastWarning("Cannot format: invalid JSON syntax.");
    }
  }, [jsonText, toastSuccess, toastWarning]);

  const handleReset = useCallback(() => {
    setJsonText(prettyPrint(profile));
    setValidationState("idle");
    setErrors([]);
    setParsed(null);
    setDiffs(null);
  }, [profile]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonText).then(() => {
      setCopyLabel("Copied! ✓");
      setTimeout(() => setCopyLabel("Copy JSON"), 1800);
      toastSuccess("JSON copied to clipboard!");
    });
  }, [jsonText, toastSuccess]);

  const handleDownload = useCallback(() => {
    const filename = `${((profile.coupleName || "couple-profile").replace(/[^a-zA-Z0-9_-]/g, "_")).toLowerCase()}.json`;
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toastSuccess(`Downloaded ${filename}!`);
  }, [jsonText, profile, toastSuccess]);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === "string") {
        setJsonText(content);
        setValidationState("idle");
        setErrors([]);
        setParsed(null);
        setDiffs(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const handleApplyAction = useCallback(
    async (mode: "replace" | "merge") => {
      let candidate = parsed;
      if (!candidate) {
        let raw: unknown;
        try {
          raw = JSON.parse(jsonText);
        } catch (e: any) {
          toastWarning(`Invalid JSON syntax: ${e.message}`);
          return;
        }
        const val = validateCoupleJson(raw);
        if (!val.valid) {
          toastWarning(`Schema validation failed with ${val.errors.length} errors.`);
          setValidationState("invalid");
          setErrors(val.errors);
          return;
        }
        candidate = normalizeCoupleJson(raw);
      }

      setIsApplying(true);
      try {
        await onApply(candidate, mode);
        toastSuccess(
          mode === "replace"
            ? "Replaced couple data with JSON payload!"
            : "Merged JSON payload into couple profile!"
        );
      } catch (err: any) {
        toastWarning(err?.message || "Failed to apply JSON updates.");
      } finally {
        setIsApplying(false);
      }
    },
    [parsed, jsonText, onApply, toastSuccess, toastWarning]
  );

  const diffSummary = diffs ? summarizeDiff(diffs) : null;

  const btnBase =
    "px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border select-none";
  const btnGhost = `${btnBase} ${
    isCyber
      ? "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
  }`;

  return (
    <div className="flex flex-col h-full max-h-[75vh] overflow-hidden">
      {/* Header if inside standalone modal */}
      {isInsideModal && (
        <div
          className={`flex items-center justify-between p-4 border-b shrink-0 ${
            isCyber ? "border-cyan-500/20 bg-[#080d1e]/90" : "border-black bg-rose-50/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl select-none">{"{ }"}</span>
            <div>
              <h2
                className={`text-base font-black tracking-wide ${
                  isCyber ? "text-white" : "text-black"
                }`}
              >
                Couple Profile JSON Workspace
              </h2>
              <p className={`text-xs font-mono ${isCyber ? "text-cyan-400/80" : "text-slate-600"}`}>
                {profile?.coupleName
                  ? `Raw JSON for: ${profile.coupleName}`
                  : "Import, view, edit, or export couple profiles as JSON"}
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`p-1.5 rounded-lg text-sm font-mono cursor-pointer transition-all ${
                isCyber
                  ? "text-slate-400 hover:text-white hover:bg-white/10"
                  : "text-slate-600 hover:text-black hover:bg-black/10"
              }`}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center gap-2 px-4 py-2.5 border-b shrink-0 ${
          isCyber ? "border-white/10 bg-[#050814]" : "border-black bg-amber-50/40"
        }`}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={btnGhost}
        >
          📂 Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileImport}
        />
        <button type="button" onClick={handleFormat} className={btnGhost}>
          ⚡ Format
        </button>
        <button type="button" onClick={handleValidate} className={btnGhost}>
          🔍 Validate
        </button>
        <button type="button" onClick={handleReset} className={btnGhost}>
          ↺ Reset
        </button>
        <span className="mx-1 opacity-20 select-none">|</span>
        <button type="button" onClick={handleCopy} className={btnGhost}>
          📋 {copyLabel}
        </button>
        <button type="button" onClick={handleDownload} className={btnGhost}>
          ⬇ Download .json
        </button>
      </div>

      {/* Validation Banner */}
      {validationState !== "idle" && (
        <div
          className={`flex items-center gap-2 px-4 py-2 text-xs font-mono border-b shrink-0 ${
            validationState === "valid"
              ? isCyber
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-emerald-50 border-emerald-400 text-emerald-800"
              : isCyber
              ? "bg-red-500/15 border-red-500/40 text-red-400"
              : "bg-red-50 border-red-400 text-red-800"
          }`}
        >
          <span>{validationState === "valid" ? "✅" : "❌"}</span>
          <span className="font-bold">
            {validationState === "valid"
              ? "Schema validation passed! Profile structure is valid."
              : `Schema validation failed (${errors.length} error${
                  errors.length !== 1 ? "s" : ""
                }).`}
          </span>
        </div>
      )}

      {/* Validation Errors List */}
      {errors.length > 0 && (
        <div
          className={`max-h-24 overflow-y-auto p-3 text-xs font-mono space-y-1 border-b shrink-0 ${
            isCyber
              ? "bg-red-950/30 border-red-500/30 text-red-300"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 text-red-500">⚠</span>
              <span>
                <strong>[{err.path}]:</strong> {err.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Diff Summary */}
      {diffSummary && (
        <div
          className={`flex items-center gap-4 px-4 py-1.5 text-xs font-mono border-b shrink-0 ${
            isCyber
              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
              : "bg-blue-50 border-blue-300 text-blue-900"
          }`}
        >
          <span className="font-bold uppercase tracking-wider">Diff vs Current:</span>
          <span>{diffSummary}</span>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col min-h-[280px]">
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setValidationState("idle");
          }}
          spellCheck={false}
          className={`w-full h-full min-h-[260px] font-mono text-xs p-3.5 rounded-xl resize-none focus:outline-none transition-all leading-relaxed ${
            isCyber
              ? "bg-[#0a0f24] text-cyan-100 border border-cyan-500/30 focus:border-cyan-400 selection:bg-cyan-500/30"
              : "bg-white text-slate-900 border-2 border-black focus:border-purple-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] selection:bg-purple-100"
          }`}
        />
      </div>

      {/* Footer Actions */}
      <div
        className={`flex items-center justify-between p-3.5 border-t shrink-0 ${
          isCyber ? "border-white/10 bg-[#080d1e]" : "border-black bg-slate-50"
        }`}
      >
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
              isCyber
                ? "border border-white/15 text-slate-400 hover:bg-white/5"
                : "border-2 border-black bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Cancel
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {profile && (
            <button
              type="button"
              disabled={isApplying}
              onClick={() => handleApplyAction("merge")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all ${
                isCyber
                  ? "border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30"
                  : "border-2 border-blue-600 bg-blue-50 text-blue-800 hover:bg-blue-100 font-black"
              }`}
            >
              Apply (Merge Non-Empty)
            </button>
          )}

          <button
            type="button"
            disabled={isApplying}
            onClick={() => handleApplyAction("replace")}
            className={`px-4 py-1.5 rounded-xl text-xs font-black font-mono cursor-pointer transition-all shadow-md ${
              isCyber
                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 shadow-rose-500/25"
                : "bg-rose-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
            }`}
          >
            {isApplying
              ? "Applying..."
              : profile?.id
              ? "Apply (Full Replace)"
              : "Import as New Couple"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CoupleJsonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  couple?: CoupleEntry | null;
  onApply: (data: Partial<CoupleEntry>, mode: "replace" | "merge") => Promise<void> | void;
}

export function CoupleJsonEditorModal({
  isOpen,
  onClose,
  couple,
  onApply,
}: CoupleJsonEditorModalProps) {
  const defaultProfile: Partial<CoupleEntry> = useMemo(
    () =>
      couple || {
        coupleName: "New Couple",
        partnerA: { name: "Partner 1", role: "Main Character" },
        partnerB: { name: "Partner 2", role: "Main Character" },
        source: {
          title: "Anime or Drama Title",
          mediaType: "Anime",
          country: "Japan",
          year: new Date().getFullYear(),
        },
        relationship: {
          status: "canon",
          ending: "endgame",
          dynamics: ["Slow Burn", "Found Family"],
          description: "Heartfelt bond between two dedicated individuals.",
        },
        tier: "S",
        isFavorite: false,
        likes: 0,
        greenFlags: {
          partnerA: ["Attentive", "Supportive"],
          partnerB: ["Loyal", "Protective"],
        },
        chemistry: {
          communication: 9,
          trust: 9,
          loyalty: 10,
          support: 9,
          compatibility: 8,
          growth: 9,
          affection: 8,
          humor: 8,
          description: "Deep mutual understanding.",
        },
        timeline: [],
        favouriteMoments: [],
        personalNotes: {
          whyILoveThem: "Their dynamic feels completely earned and genuine.",
          relationshipAnalysis: "Complementary strengths and mutual vulnerability.",
        },
        media: {
          cover: null,
          card: null,
          gallery: [],
        },
      },
    [couple]
  );

  const handleApplyWrapper = useCallback(
    async (data: Partial<CoupleEntry>, mode: "replace" | "merge") => {
      await onApply(data, mode);
      onClose();
    },
    [onApply, onClose]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <CoupleJsonEditorView
        profile={defaultProfile}
        onApply={handleApplyWrapper}
        onCancel={onClose}
        isInsideModal
      />
    </Modal>
  );
}
