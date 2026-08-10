"use client";

import React, { useState, useRef, useCallback } from "react";
import { useTheme } from "@/lib/theme";
import type { TokusatsuProfile } from "@/lib/types/tokusatsu";
import { normalizeTokusatsuProfile } from "@/lib/data/tokusatsuDataHelper";
import {
  validateTokusatsuJson,
  diffTokusatsuProfiles,
  summarizeDiff,
  type ValidationError,
  type FieldDiff,
} from "@/lib/data/tokusatsuSchema";

// ─── Props ─────────────────────────────────────────────────────────────────────

interface TokusatsuJsonEditorProps {
  /** Current live profile from the visual editor */
  profile: TokusatsuProfile;
  /** Called when user clicks Replace Data or Merge Data */
  onApply: (updated: TokusatsuProfile, mode: "replace" | "merge") => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prettyPrint(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "";
  }
}

type ValidationState = "idle" | "valid" | "invalid";

// ─── Component ────────────────────────────────────────────────────────────────

export function TokusatsuJsonEditor({ profile, onApply }: TokusatsuJsonEditorProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Textarea content (editable by user)
  const [jsonText, setJsonText] = useState<string>(() => prettyPrint(profile));
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [parsed, setParsed] = useState<Partial<TokusatsuProfile> | null>(null);
  const [diffs, setDiffs] = useState<FieldDiff[] | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy JSON");

  // Sync from visual editor → JSON textarea whenever profile changes externally
  // Called by parent whenever profile updates (via useEffect there)
  // (parent passes current profile; we expose refreshFromProfile)
  const refreshFromProfile = useCallback(() => {
    setJsonText(prettyPrint(profile));
    setValidationState("idle");
    setErrors([]);
    setParsed(null);
    setDiffs(null);
  }, [profile]);

  // ─── Validate ────────────────────────────────────────────────────────────────

  const handleValidate = useCallback(() => {
    let raw: unknown;
    try {
      raw = JSON.parse(jsonText);
    } catch (e: any) {
      setValidationState("invalid");
      setErrors([{ path: "JSON syntax", message: `Invalid JSON syntax: ${e.message}`, severity: "error" }]);
      setParsed(null);
      setDiffs(null);
      return;
    }

    const result = validateTokusatsuJson(raw);
    if (!result.valid) {
      setValidationState("invalid");
      setErrors(result.errors);
      setParsed(null);
      setDiffs(null);
    } else {
      setValidationState("valid");
      setErrors([]);
      const normalized = normalizeTokusatsuProfile(raw as any, null);
      setParsed(normalized);
      setDiffs(diffTokusatsuProfiles(profile, normalized));
    }
  }, [jsonText, profile]);

  // ─── Format ──────────────────────────────────────────────────────────────────

  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(prettyPrint(parsed));
    } catch {
      // Don't modify invalid JSON
    }
  }, [jsonText]);

  // ─── Reset ────────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setJsonText(prettyPrint(profile));
    setValidationState("idle");
    setErrors([]);
    setParsed(null);
    setDiffs(null);
  }, [profile]);

  // ─── Copy ─────────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonText).then(() => {
      setCopyLabel("Copied! ✓");
      setTimeout(() => setCopyLabel("Copy JSON"), 1800);
    });
  }, [jsonText]);

  // ─── Download ─────────────────────────────────────────────────────────────────

  const handleDownload = useCallback(() => {
    const blob = new Blob([prettyPrint(profile)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `${(profile.heroName || "tokusatsu-hero").replace(/\s+/g, "_").toLowerCase()}.json`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [profile]);

  // ─── Import from file ─────────────────────────────────────────────────────────

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
    // Reset file input so same file can be re-selected
    e.target.value = "";
  }, []);

  // ─── Apply ────────────────────────────────────────────────────────────────────

  const handleApply = useCallback((mode: "replace" | "merge") => {
    if (!parsed) return;

    if (mode === "replace") {
      onApply(parsed as TokusatsuProfile, "replace");
    } else {
      // Merge: only overwrite fields present in incoming JSON
      const merged: TokusatsuProfile = { ...profile };
      (Object.keys(parsed) as (keyof TokusatsuProfile)[]).forEach((key) => {
        const val = (parsed as any)[key];
        if (val !== undefined) {
          (merged as any)[key] = val;
        }
      });
      onApply(merged, "merge");
    }

    setValidationState("idle");
    setParsed(null);
    setDiffs(null);
  }, [parsed, profile, onApply]);

  // ─── Styles ───────────────────────────────────────────────────────────────────

  const surface = isCyber
    ? { backgroundColor: "rgba(5,8,22,0.95)", color: "#E2E8F0", borderColor: "rgba(255,255,255,0.1)" }
    : { backgroundColor: "#FAFAFA", color: "#111827", borderColor: "#D1D5DB" };

  const btnBase =
    "px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border select-none";

  const btnGhost = `${btnBase} ${isCyber
    ? "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
    }`;

  const btnGreen = `${btnBase} ${isCyber
    ? "border-green-500/40 bg-green-500/15 text-green-400 hover:bg-green-500/25"
    : "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
    }`;

  const btnRed = `${btnBase} ${isCyber
    ? "border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25"
    : "border-red-500 bg-red-50 text-red-600 hover:bg-red-100"
    }`;

  const btnPrimary = `${btnBase} bg-red-500 text-white border-red-600 hover:bg-red-600`;

  const diffSummary = diffs ? summarizeDiff(diffs) : null;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* ── Toolbar Row ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-50 mr-1">
          Actions:
        </span>

        {/* Import */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={btnGhost}
          title="Import a .json file"
        >
          📂 Import JSON File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileImport}
        />

        {/* Format */}
        <button type="button" onClick={handleFormat} className={btnGhost}>
          ⚡ Format
        </button>

        {/* Validate */}
        <button type="button" onClick={handleValidate} className={btnGhost}>
          🔍 Validate
        </button>

        {/* Reset */}
        <button type="button" onClick={handleReset} className={btnGhost}>
          ↺ Reset
        </button>

        {/* Divider */}
        <span className="mx-1 opacity-20 select-none">|</span>

        {/* Copy */}
        <button type="button" onClick={handleCopy} className={btnGhost}>
          📋 {copyLabel}
        </button>

        {/* Download */}
        <button type="button" onClick={handleDownload} className={btnGhost}>
          ⬇ Download .json
        </button>
      </div>

      {/* ── Validation Badge ── */}
      {validationState !== "idle" && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border ${
            validationState === "valid"
              ? isCyber
                ? "bg-green-500/15 border-green-500/40 text-green-400"
                : "bg-green-50 border-green-400 text-green-700"
              : isCyber
              ? "bg-red-500/15 border-red-500/40 text-red-400"
              : "bg-red-50 border-red-400 text-red-700"
          }`}
        >
          <span className="text-base">{validationState === "valid" ? "✅" : "❌"}</span>
          <span className="font-bold">
            {validationState === "valid"
              ? "JSON schema validation passed"
              : `Schema validation failed — ${errors.length} error${errors.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      {/* ── Error list ── */}
      {errors.length > 0 && (
        <div
          className="max-h-36 overflow-y-auto rounded-xl border p-2 space-y-1"
          style={{
            backgroundColor: isCyber ? "rgba(239,68,68,0.07)" : "#FFF5F5",
            borderColor: isCyber ? "rgba(239,68,68,0.3)" : "#FCA5A5",
          }}
        >
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] font-mono">
              <span className="text-red-400 shrink-0">⚠</span>
              <span>
                <span className="font-bold text-red-400">[{err.path}]</span>{" "}
                <span className={isCyber ? "text-red-300" : "text-red-700"}>{err.message}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Main Textarea ── */}
      <div className="relative flex-1 min-h-0">
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            // Reset validation state on any edit
            setValidationState("idle");
            setErrors([]);
            setParsed(null);
            setDiffs(null);
          }}
          spellCheck={false}
          className="w-full h-full min-h-[300px] rounded-xl border p-3 text-xs font-mono resize-none focus:outline-none leading-relaxed overflow-auto"
          style={{
            ...surface,
            borderColor: validationState === "valid"
              ? (isCyber ? "#22C55E" : "#16A34A")
              : validationState === "invalid"
              ? (isCyber ? "#EF4444" : "#DC2626")
              : surface.borderColor,
            tabSize: 2,
            MozTabSize: 2,
          }}
          placeholder={`Paste valid TokusatsuProfile JSON here…\n\nExample:\n{\n  "heroName": "Kamen Rider Geats",\n  "franchiseType": "KAMEN_RIDER",\n  "series": "Kamen Rider Geats",\n  "forms": [\n    {\n      "name": "MagnumBoost Form",\n      "formType": "Base"\n    }\n  ]\n}`}
        />
        {/* Line-count hint (top-right corner) */}
        <div className="absolute top-2 right-3 text-[9px] font-mono opacity-30 pointer-events-none select-none">
          {jsonText.split("\n").length} lines
        </div>
      </div>

      {/* ── Change Diff Preview ── */}
      {diffSummary && validationState === "valid" && (
        <div
          className="rounded-2xl border p-3 space-y-2"
          style={{
            backgroundColor: isCyber ? "rgba(255,255,255,0.03)" : "#F0FDF4",
            borderColor: isCyber ? "rgba(34,197,94,0.3)" : "#86EFAC",
          }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60">
              Change Preview
            </span>
            {diffSummary.added > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                +{diffSummary.added} added
              </span>
            )}
            {diffSummary.modified > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ~{diffSummary.modified} modified
              </span>
            )}
            {diffSummary.removed > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                -{diffSummary.removed} removed
              </span>
            )}
            {diffSummary.unchanged > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold opacity-40 border" style={{
                borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB"
              }}>
                {diffSummary.unchanged} unchanged
              </span>
            )}
          </div>

          {/* Notable changes list */}
          {diffSummary.notable.length > 0 && (
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {diffSummary.notable.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono opacity-80">
                  <span
                    className={
                      d.kind === "added"
                        ? "text-green-400"
                        : d.kind === "modified"
                        ? "text-amber-400"
                        : "text-red-400"
                    }
                  >
                    {d.kind === "added" ? "+" : d.kind === "modified" ? "~" : "-"}
                  </span>
                  <span className="font-bold">{d.field}</span>
                </div>
              ))}
            </div>
          )}

          {/* Apply actions */}
          <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: isCyber ? "rgba(255,255,255,0.08)" : "#BBF7D0" }}>
            <button type="button" onClick={() => handleApply("replace")} className={btnPrimary}>
              ✓ Replace Data
            </button>
            <button type="button" onClick={() => handleApply("merge")} className={btnGreen}>
              ⊕ Merge Data
            </button>
            <span className="text-[10px] font-mono opacity-40 ml-1 hidden sm:block">
              Replace = set entire state from JSON · Merge = update only supplied fields
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Expose refreshFromProfile as a handle via forwardRef pattern
// Parent calls editorRef.current?.refreshFromProfile() after updating profile
export type TokusatsuJsonEditorHandle = {
  refreshFromProfile: () => void;
};
