"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, AiToolItemEntry, AiPricingModel, AiUsageStatus } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useConfirm } from "@/lib/context/ConfirmContext";

interface AiToolEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolToEdit?: AiToolItemEntry | null;
}

const CATEGORY_OPTIONS = [
  { value: "💬 General AI", label: "💬 General AI", icon: "💬" },
  { value: "💻 Coding", label: "💻 Coding & IDEs", icon: "💻" },
  { value: "🔍 Search", label: "🔍 Search & Answers", icon: "🔍" },
  { value: "🧠 Research", label: "🧠 Research & Reasoning", icon: "🧠" },
  { value: "🎨 Image Generation", label: "🎨 Image & Design", icon: "🎨" },
  { value: "🎥 Video Generation", label: "🎥 Video & Motion", icon: "🎥" },
  { value: "🎵 Audio", label: "🎵 Audio & Voice", icon: "🎵" },
  { value: "📄 Writing", label: "📄 Writing & Copy", icon: "📄" },
  { value: "⚙ Productivity", label: "⚙ Productivity & Agents", icon: "⚙" },
  { value: "📊 Data", label: "📊 Data & Analytics", icon: "📊" },
  { value: "🛠 Development", label: "🛠 Dev & Infrastructure", icon: "🛠" },
  { value: "☁ Cloud", label: "☁ Cloud AI Services", icon: "☁" },
  { value: "📚 Learning", label: "📚 Learning & Education", icon: "📚" },
  { value: "🏢 Enterprise", label: "🏢 Enterprise Solutions", icon: "🏢" },
];

const USAGE_STATUS_OPTIONS = [
  { value: "Daily", label: "🔥 Daily Use", icon: "🔥" },
  { value: "Weekly", label: "⚡ Weekly Use", icon: "⚡" },
  { value: "Occasionally", label: "🎯 Occasional Use", icon: "🎯" },
  { value: "Rarely", label: "🐢 Rarely Used", icon: "🐢" },
  { value: "Experimental", label: "🧪 Experimental / Lab", icon: "🧪" },
  { value: "Inactive", label: "💤 Inactive / Evaluated", icon: "💤" },
  { value: "Archived", label: "📦 Archived", icon: "📦" },
];

const PRICING_OPTIONS = [
  { value: "Free", label: "🆓 Free", icon: "🆓" },
  { value: "Freemium", label: "⚡ Freemium", icon: "⚡" },
  { value: "Paid", label: "💎 Paid / Subscription", icon: "💎" },
  { value: "Open Source", label: "📦 Open Source", icon: "📦" },
  { value: "Enterprise", label: "🏢 Enterprise Only", icon: "🏢" },
];

const BRANDING_PRESETS = [
  { name: "ChatGPT Green", hex: "#10A37F" },
  { name: "Claude Orange", hex: "#D97706" },
  { name: "Gemini Blue", hex: "#4285F4" },
  { name: "Perplexity Teal", hex: "#00B4D8" },
  { name: "DeepSeek Blue", hex: "#4D6BFE" },
  { name: "Cursor Cyan", hex: "#00F5FF" },
  { name: "Windsurf Blue", hex: "#3B82F6" },
  { name: "Bolt Purple", hex: "#9333EA" },
  { name: "Lovable Pink", hex: "#EC4899" },
  { name: "Copilot Gray", hex: "#6E7681" },
];

const PRESET_STRENGTHS = [
  "Coding", "Frontend", "Backend", "Full Stack", "Reasoning", "Writing", "Translation", "Research", "Summarization", "OCR", "Image Generation", "Video Generation", "Audio", "Productivity", "Data Analysis", "Math"
];

const PRESET_TAGS = [
  "LLM", "Coding", "Reasoning", "Vision", "Multimodal", "Open Source", "IDE", "Search", "Agents", "Local AI"
];

export function AiToolEditorModal({ isOpen, onClose, toolToEdit }: AiToolEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addAiTool, updateAiTool, removeAiTool } = useDashboardStore();
  const { confirm } = useConfirm();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("💬 General AI");
  const [usageStatus, setUsageStatus] = useState<AiUsageStatus>("Daily");
  const [pricingModel, setPricingModel] = useState<AiPricingModel>("Freemium");
  const [rating, setRating] = useState<number>(5);
  const [strengthsString, setStrengthsString] = useState("");
  const [notes, setNotes] = useState("");
  const [version, setVersion] = useState("");
  const [accentColor, setAccentColor] = useState("#10A37F");
  const [logo, setLogo] = useState("🤖");

  const [launchUrl, setLaunchUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [pricingUrl, setPricingUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [communityUrl, setCommunityUrl] = useState("");
  const [releaseNotesUrl, setReleaseNotesUrl] = useState("");
  const [blogUrl, setBlogUrl] = useState("");
  const [roadmapUrl, setRoadmapUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [tagsString, setTagsString] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toolToEdit) {
      setName(toolToEdit.name);
      setCompany(toolToEdit.company || "");
      setDescription(toolToEdit.description);
      setCategory(toolToEdit.category || "💬 General AI");
      setUsageStatus(toolToEdit.usageStatus || "Daily");
      setPricingModel(toolToEdit.pricingModel || "Freemium");
      setRating(toolToEdit.rating ?? 5);
      setStrengthsString(Array.isArray(toolToEdit.strengths) ? toolToEdit.strengths.join(", ") : "");
      setNotes(toolToEdit.notes || "");
      setVersion(toolToEdit.version || "");
      setAccentColor(toolToEdit.accentColor || "#10A37F");
      setLogo(toolToEdit.logo || "🤖");

      setLaunchUrl(toolToEdit.launchUrl || "");
      setWebsiteUrl(toolToEdit.websiteUrl || "");
      setDocsUrl(toolToEdit.docsUrl || "");
      setApiUrl(toolToEdit.apiUrl || "");
      setPricingUrl(toolToEdit.pricingUrl || "");
      setGithubUrl(toolToEdit.githubUrl || "");
      setDiscordUrl(toolToEdit.discordUrl || "");
      setCommunityUrl(toolToEdit.communityUrl || "");
      setReleaseNotesUrl(toolToEdit.releaseNotesUrl || "");
      setBlogUrl(toolToEdit.blogUrl || "");
      setRoadmapUrl(toolToEdit.roadmapUrl || "");
      setYoutubeUrl(toolToEdit.youtubeUrl || "");

      setTagsString(Array.isArray(toolToEdit.tags) ? toolToEdit.tags.join(", ") : "");
      setIsFavorite(toolToEdit.isFavorite ?? false);
      setIsPinned(toolToEdit.isPinned ?? false);
      setIsArchived(toolToEdit.isArchived ?? false);
    } else {
      setName("");
      setCompany("");
      setDescription("");
      setCategory("💬 General AI");
      setUsageStatus("Daily");
      setPricingModel("Freemium");
      setRating(5);
      setStrengthsString("");
      setNotes("");
      setVersion("");
      setAccentColor("#10A37F");
      setLogo("🤖");

      setLaunchUrl("");
      setWebsiteUrl("");
      setDocsUrl("");
      setApiUrl("");
      setPricingUrl("");
      setGithubUrl("");
      setDiscordUrl("");
      setCommunityUrl("");
      setReleaseNotesUrl("");
      setBlogUrl("");
      setRoadmapUrl("");
      setYoutubeUrl("");

      setTagsString("");
      setIsFavorite(false);
      setIsPinned(false);
      setIsArchived(false);
    }
  }, [toolToEdit, isOpen]);

  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setLogo(data.url);
      }
    } catch (err) {
      console.error("Failed to upload logo:", err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleAddStrength = (strength: string) => {
    const list = strengthsString.split(",").map((s) => s.trim()).filter(Boolean);
    if (!list.includes(strength)) {
      setStrengthsString([...list, strength].join(", "));
    }
  };

  const handleAddTag = (tag: string) => {
    const list = tagsString.split(",").map((t) => t.trim()).filter(Boolean);
    if (!list.includes(tag)) {
      setTagsString([...list, tag].join(", "));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsSaving(true);
    const strengths = strengthsString.split(",").map((s) => s.trim()).filter(Boolean);
    const tags = tagsString.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (toolToEdit) {
        await updateAiTool(toolToEdit.id, {
          name: name.trim(),
          company: company.trim() || undefined,
          description: description.trim(),
          category,
          usageStatus,
          pricingModel,
          rating,
          strengths,
          notes: notes.trim() || undefined,
          version: version.trim() || undefined,
          accentColor,
          logo: logo.trim() || undefined,
          launchUrl: launchUrl.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          docsUrl: docsUrl.trim() || undefined,
          apiUrl: apiUrl.trim() || undefined,
          pricingUrl: pricingUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          discordUrl: discordUrl.trim() || undefined,
          communityUrl: communityUrl.trim() || undefined,
          releaseNotesUrl: releaseNotesUrl.trim() || undefined,
          blogUrl: blogUrl.trim() || undefined,
          roadmapUrl: roadmapUrl.trim() || undefined,
          youtubeUrl: youtubeUrl.trim() || undefined,
          tags,
          isFavorite,
          isPinned,
          isArchived,
        });
      } else {
        const newTool: AiToolItemEntry = {
          id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: name.trim(),
          company: company.trim() || undefined,
          description: description.trim(),
          category,
          usageStatus,
          pricingModel,
          rating,
          strengths,
          notes: notes.trim() || undefined,
          version: version.trim() || undefined,
          accentColor,
          logo: logo.trim() || undefined,
          launchUrl: launchUrl.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          docsUrl: docsUrl.trim() || undefined,
          apiUrl: apiUrl.trim() || undefined,
          pricingUrl: pricingUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          discordUrl: discordUrl.trim() || undefined,
          communityUrl: communityUrl.trim() || undefined,
          releaseNotesUrl: releaseNotesUrl.trim() || undefined,
          blogUrl: blogUrl.trim() || undefined,
          roadmapUrl: roadmapUrl.trim() || undefined,
          youtubeUrl: youtubeUrl.trim() || undefined,
          tags,
          sortOrder: 0,
          isFavorite,
          isPinned,
          isArchived,
          createdAt: new Date().toISOString(),
        };
        await addAiTool(newTool);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save AI tool:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!toolToEdit) return;
    confirm({
      title: "Delete AI Platform Entry",
      message: `Are you sure you want to remove "${toolToEdit.name}" from your AI Library?`,
      confirmText: "Delete Platform",
      variant: "danger",
      itemPreview: {
        title: toolToEdit.name,
        subtitle: `${toolToEdit.company || "Independent"} · ${toolToEdit.category}`,
        description: toolToEdit.description,
        icon: toolToEdit.logo || "🤖",
        imageUrl: toolToEdit.logo && toolToEdit.logo.startsWith("http") ? toolToEdit.logo : undefined,
        category: toolToEdit.usageStatus || "Daily",
      },
      successToast: `✓ AI Platform "${toolToEdit.name}" removed from AI Library.`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await removeAiTool(toolToEdit.id);
          onClose();
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const inputStyles = {
    backgroundColor: isCyber ? "rgba(10,15,30,0.75)" : "#F8FAFC",
    color: isCyber ? "#F8FAFC" : "#0F172A",
    borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000000",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="overflow-y-auto overscroll-contain flex-1 p-5 sm:p-6 scrollbar-thin">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-black theme-text-primary flex items-center gap-2">
              <span>🤖</span> {toolToEdit ? "Edit AI Platform & Knowledge Entry" : "Add AI Platform Entry"}
            </h2>
            <p className="text-xs theme-text-muted font-mono mt-0.5">
              Personal AI Collection & Knowledge Hub Manager
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold opacity-60 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Name & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                AI Platform Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ChatGPT, Claude 3.5 Sonnet, Cursor"
                className="w-full p-2.5 rounded-xl border text-sm font-bold focus:outline-none"
                style={inputStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Company / Developer
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. OpenAI, Anthropic, Google"
                className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
          </div>

          {/* Category & Usage Status & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Category
              </label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={CATEGORY_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Usage Status
              </label>
              <CustomSelect
                value={usageStatus}
                onChange={(val) => setUsageStatus(val as AiUsageStatus)}
                options={USAGE_STATUS_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Personal Rating (1-5★)
              </label>
              <div className="flex items-center gap-1.5 p-2 rounded-xl border" style={inputStyles}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-lg cursor-pointer transition-transform hover:scale-125 ${
                      star <= rating ? "text-amber-400" : "opacity-20"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Model & Version Tag & Accent Branding */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Pricing Model
              </label>
              <CustomSelect
                value={pricingModel}
                onChange={(val) => setPricingModel(val as AiPricingModel)}
                options={PRICING_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Version Tag
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. GPT-4o, 3.5 Sonnet"
                className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border cursor-pointer p-0.5 bg-transparent"
                />
                <div className="flex flex-wrap gap-1">
                  {BRANDING_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      title={preset.name}
                      onClick={() => setAccentColor(preset.hex)}
                      className="w-5 h-5 rounded-md border border-black/40 cursor-pointer"
                      style={{ backgroundColor: preset.hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Short Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. State-of-the-art conversational AI assistant powered by GPT-4o for writing, analysis, coding, and multi-modal problem solving."
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          {/* Personal Strengths Tag Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Personal Strengths (Comma-separated)
            </label>
            <input
              type="text"
              value={strengthsString}
              onChange={(e) => setStrengthsString(e.target.value)}
              placeholder="e.g. Coding, Reasoning, Frontend, Writing, Math"
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] theme-text-muted self-center font-mono mr-1">Quick Strengths:</span>
              {PRESET_STRENGTHS.map((str) => (
                <button
                  key={str}
                  type="button"
                  onClick={() => handleAddStrength(str)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border transition-all cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.08)" : "#EFF6FF",
                    borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#BFDBFE",
                    color: isCyber ? "#00F5FF" : "#1E40AF",
                  }}
                >
                  +{str}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Personal Knowledge Notes & Workflow Evaluation
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Excellent for React refactoring. Best artifact quality. Weak at image generation."
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none font-sans"
              style={inputStyles}
            />
          </div>

          {/* Logo Upload / Emoji */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Official Logo / Icon
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="Emoji (🤖) or Image URL"
                className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
              <input
                type="file"
                ref={logoFileRef}
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploadingLogo}
                onClick={() => logoFileRef.current?.click()}
                className="px-3 py-2.5 rounded-xl text-xs font-bold border shrink-0 cursor-pointer"
                style={{
                  backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E2E8F0",
                  borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                }}
              >
                {isUploadingLogo ? "..." : "📁 Upload"}
              </button>
            </div>
          </div>

          {/* Primary Fast Launch Target */}
          <div className="p-3.5 rounded-xl border space-y-2.5" style={{ borderColor: isCyber ? "rgba(16,185,129,0.3)" : "#A7F3D0", backgroundColor: isCyber ? "rgba(16,185,129,0.03)" : "#ECFDF5" }}>
            <p className="text-xs font-bold uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
              <span>🚀</span> Primary Fast Launch Target URL
            </p>
            <input
              type="text"
              value={launchUrl}
              onChange={(e) => setLaunchUrl(e.target.value)}
              placeholder="Primary launch URL (e.g. https://chatgpt.com or desktop app link)"
              className="w-full p-2.5 rounded-lg border text-xs font-mono font-bold"
              style={inputStyles}
            />
          </div>

          {/* Configurable Quick Action Resource Links */}
          <div className="p-3.5 rounded-xl border space-y-2.5" style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#CBD5E1", backgroundColor: isCyber ? "rgba(0,245,255,0.02)" : "#FAFAFA" }}>
            <p className="text-xs font-bold uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
              <span>🔗</span> Resource & Developer Links
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input type="text" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Official Website URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} placeholder="Documentation URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="API Docs / Keys URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={pricingUrl} onChange={(e) => setPricingUrl(e.target.value)} placeholder="Pricing URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="GitHub Repository URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="Discord Server URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={communityUrl} onChange={(e) => setCommunityUrl(e.target.value)} placeholder="Community Forum URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={releaseNotesUrl} onChange={(e) => setReleaseNotesUrl(e.target.value)} placeholder="Release Notes URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)} placeholder="Official Blog URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={roadmapUrl} onChange={(e) => setRoadmapUrl(e.target.value)} placeholder="Product Roadmap URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="YouTube Demos URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="e.g. LLM, Coding, Vision, Multimodal"
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] theme-text-muted self-center font-mono mr-1">Quick Tags:</span>
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border transition-all cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                    color: isCyber ? "#94A3B8" : "#475569",
                  }}
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aiIsFavorite"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-amber-500"
              />
              <label htmlFor="aiIsFavorite" className="text-xs font-bold cursor-pointer theme-text-primary flex items-center gap-1">
                <span>⭐ Favorite AI Platform</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aiIsPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-cyan-500"
              />
              <label htmlFor="aiIsPinned" className="text-xs font-bold cursor-pointer theme-text-primary flex items-center gap-1">
                <span>📌 Pin to Top</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aiIsArchived"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-slate-500"
              />
              <label htmlFor="aiIsArchived" className="text-xs font-bold cursor-pointer theme-text-primary flex items-center gap-1">
                <span>📦 Archive Entry</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            {toolToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{
                  border: isCyber ? "none" : "2px solid #000",
                  boxShadow: isCyber ? "none" : "3px 3px 0 #000",
                }}
              >
                {isDeleting ? "..." : "🗑️ Delete"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
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
              disabled={isSaving || isUploadingLogo || isDeleting}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                background: isCyber ? "linear-gradient(135deg, #10A37F, #00F5FF)" : accentColor,
                color: "#fff",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? "0 0 12px rgba(16,163,127,0.4)" : "3px 3px 0 #000",
              }}
            >
              {isSaving ? "Saving..." : toolToEdit ? "Save Changes" : "Create AI Entry"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
