"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, ProjectItemEntry, ProjectStatus } from "@/lib/store/dashboardStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useConfirm } from "@/lib/context/ConfirmContext";

interface ProjectEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: ProjectItemEntry | null;
}

const CATEGORY_OPTIONS = [
  { value: "Full-Stack Web", label: "🌐 Full-Stack Web", icon: "🌐" },
  { value: "Mobile App", label: "📱 Mobile App", icon: "📱" },
  { value: "AI & ML", label: "🤖 AI & Vision Engine", icon: "🤖" },
  { value: "Game Dev", label: "🎮 Game / Interactive", icon: "🎮" },
  { value: "Media Platform", label: "⛩️ Media / Streaming", icon: "⛩️" },
  { value: "Utility", label: "🛠️ System Utility & Tools", icon: "🛠️" },
  { value: "Open Source", label: "📦 Open Source Library", icon: "📦" },
  { value: "Other", label: "💡 Other Project", icon: "💡" },
];

const STATUS_OPTIONS = [
  { value: "Live", label: "🟢 Live / Active", icon: "🟢" },
  { value: "Development", label: "🟡 In Development", icon: "🟡" },
  { value: "Beta", label: "🔵 Public Beta", icon: "🔵" },
  { value: "Maintenance", label: "🟠 Maintenance", icon: "🟠" },
  { value: "Experimental", label: "🟣 Experimental / Lab", icon: "🟣" },
  { value: "Upcoming", label: "🔮 Upcoming / Roadmap", icon: "🔮" },
  { value: "Archived", label: "📦 Archived", icon: "📦" },
];

const ACCENT_PRESETS = [
  "#00F5FF", "#FF6B35", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#EF4444", "#3B82F6"
];

const PRESET_TECH_STACK = [
  "Next.js 16", "React 19", "TypeScript", "Prisma", "Supabase", "TailwindCSS", "Framer Motion", "Zustand", "Node.js", "PostgreSQL", "Python", "Unity", "Flutter", "Android Studio"
];

export function ProjectEditorModal({ isOpen, onClose, projectToEdit }: ProjectEditorModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { addProject, updateProject, removeProject } = useDashboardStore();
  const { confirm } = useConfirm();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Full-Stack Web");
  const [status, setStatus] = useState<ProjectStatus>("Live");
  const [version, setVersion] = useState("v1.0.0");
  const [accentColor, setAccentColor] = useState("#00F5FF");
  const [logo, setLogo] = useState("⚡");
  const [heroBanner, setHeroBanner] = useState("");

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");
  const [apiDocsUrl, setApiDocsUrl] = useState("");
  const [adminUrl, setAdminUrl] = useState("");
  const [stagingUrl, setStagingUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const [techStackString, setTechStackString] = useState("");
  const [tagsString, setTagsString] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category || "Full-Stack Web");
      setStatus(projectToEdit.status || "Live");
      setVersion(projectToEdit.version || "v1.0.0");
      setAccentColor(projectToEdit.accentColor || "#00F5FF");
      setLogo(projectToEdit.logo || "⚡");
      setHeroBanner(projectToEdit.heroBanner || "");

      setWebsiteUrl(projectToEdit.websiteUrl || "");
      setGithubUrl(projectToEdit.githubUrl || "");
      setDocsUrl(projectToEdit.docsUrl || "");
      setFigmaUrl(projectToEdit.figmaUrl || "");
      setApiDocsUrl(projectToEdit.apiDocsUrl || "");
      setAdminUrl(projectToEdit.adminUrl || "");
      setStagingUrl(projectToEdit.stagingUrl || "");
      setDownloadUrl(projectToEdit.downloadUrl || "");

      setTechStackString(Array.isArray(projectToEdit.techStack) ? projectToEdit.techStack.join(", ") : "");
      setTagsString(Array.isArray(projectToEdit.tags) ? projectToEdit.tags.join(", ") : "");
      setIsFeatured(projectToEdit.isFeatured ?? false);
      setIsArchived(projectToEdit.isArchived ?? false);
    } else {
      setName("");
      setDescription("");
      setCategory("Full-Stack Web");
      setStatus("Live");
      setVersion("v1.0.0");
      setAccentColor("#00F5FF");
      setLogo("⚡");
      setHeroBanner("");

      setWebsiteUrl("");
      setGithubUrl("");
      setDocsUrl("");
      setFigmaUrl("");
      setApiDocsUrl("");
      setAdminUrl("");
      setStagingUrl("");
      setDownloadUrl("");

      setTechStackString("");
      setTagsString("");
      setIsFeatured(false);
      setIsArchived(false);
    }
  }, [projectToEdit, isOpen]);

  const handleAssetUpload = async (file: File, type: "logo" | "banner") => {
    if (type === "logo") setIsUploadingLogo(true);
    else setIsUploadingBanner(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (type === "logo") setLogo(data.url);
        else setHeroBanner(data.url);
      }
    } catch (err) {
      console.error(`Failed to upload ${type}:`, err);
    } finally {
      if (type === "logo") setIsUploadingLogo(false);
      else setIsUploadingBanner(false);
    }
  };

  const handleAddTech = (tech: string) => {
    const list = techStackString.split(",").map((t) => t.trim()).filter(Boolean);
    if (!list.includes(tech)) {
      setTechStackString([...list, tech].join(", "));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsSaving(true);
    const techStack = techStackString.split(",").map((t) => t.trim()).filter(Boolean);
    const tags = tagsString.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (projectToEdit) {
        await updateProject(projectToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          category,
          status,
          version: version.trim() || "v1.0.0",
          accentColor,
          logo: logo.trim() || undefined,
          heroBanner: heroBanner.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          docsUrl: docsUrl.trim() || undefined,
          figmaUrl: figmaUrl.trim() || undefined,
          apiDocsUrl: apiDocsUrl.trim() || undefined,
          adminUrl: adminUrl.trim() || undefined,
          stagingUrl: stagingUrl.trim() || undefined,
          downloadUrl: downloadUrl.trim() || undefined,
          techStack,
          tags,
          isFeatured,
          isArchived,
        });
      } else {
        const newProj: ProjectItemEntry = {
          id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: name.trim(),
          description: description.trim(),
          category,
          status,
          version: version.trim() || "v1.0.0",
          accentColor,
          logo: logo.trim() || undefined,
          heroBanner: heroBanner.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          docsUrl: docsUrl.trim() || undefined,
          figmaUrl: figmaUrl.trim() || undefined,
          apiDocsUrl: apiDocsUrl.trim() || undefined,
          adminUrl: adminUrl.trim() || undefined,
          stagingUrl: stagingUrl.trim() || undefined,
          downloadUrl: downloadUrl.trim() || undefined,
          techStack,
          tags,
          sortOrder: 0,
          isFeatured,
          isArchived,
          createdAt: new Date().toISOString(),
        };
        await addProject(newProj);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!projectToEdit) return;
    confirm({
      title: "Delete Project Showcase",
      message: `Are you sure you want to delete project "${projectToEdit.name}"?`,
      confirmText: "Delete Project",
      variant: "danger",
      itemPreview: {
        title: projectToEdit.name,
        subtitle: `${projectToEdit.category} · ${projectToEdit.status || "Live"}`,
        description: projectToEdit.description,
        icon: projectToEdit.logo || "🌐",
        imageUrl: projectToEdit.heroBanner,
        category: projectToEdit.category,
      },
      successToast: `✓ Project "${projectToEdit.name}" deleted successfully.`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await removeProject(projectToEdit.id);
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
              <span>🌐</span> {projectToEdit ? "Edit Project Entry" : "Add Project Showcase"}
            </h2>
            <p className="text-xs theme-text-muted font-mono mt-0.5">
              Visit Project Hub Portfolio Engine
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
          {/* Project Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nexus Xenon Command Center"
                className="w-full p-2.5 rounded-xl border text-sm font-bold focus:outline-none"
                style={inputStyles}
              />
            </div>
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
          </div>

          {/* Status & Version & Accent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Status
              </label>
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val as ProjectStatus)}
                options={STATUS_OPTIONS}
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
                placeholder="e.g. v3.1.0"
                className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                style={inputStyles}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Accent Theme Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border cursor-pointer p-0.5 bg-transparent"
                />
                <div className="flex flex-wrap gap-1">
                  {ACCENT_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setAccentColor(hex)}
                      className="w-5 h-5 rounded-md border border-black/40 cursor-pointer"
                      style={{ backgroundColor: hex }}
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
              placeholder="e.g. Next-gen full-stack command center, interactive HUD, gaming database, and AI statistics suite."
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          {/* Logo & Hero Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Project Logo / Icon
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="Emoji (⚡) or Image URL"
                  className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                  style={inputStyles}
                />
                <input
                  type="file"
                  ref={logoFileRef}
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleAssetUpload(e.target.files[0], "logo")}
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
                  {isUploadingLogo ? "..." : "📁"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
                Hero Banner / Preview Image
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={heroBanner}
                  onChange={(e) => setHeroBanner(e.target.value)}
                  placeholder="Image URL or upload screenshot"
                  className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
                  style={inputStyles}
                />
                <input
                  type="file"
                  ref={bannerFileRef}
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleAssetUpload(e.target.files[0], "banner")}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingBanner}
                  onClick={() => bannerFileRef.current?.click()}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold border shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: isCyber ? "rgba(0,245,255,0.1)" : "#E2E8F0",
                    borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                  }}
                >
                  {isUploadingBanner ? "..." : "📁"}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="p-3.5 rounded-xl border space-y-2.5" style={{ borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#CBD5E1", backgroundColor: isCyber ? "rgba(0,245,255,0.02)" : "#FAFAFA" }}>
            <p className="text-xs font-bold uppercase tracking-wider theme-text-primary flex items-center gap-1.5">
              <span>🔗</span> Configurable Quick Action Buttons
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input type="text" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Website URL (e.g. https://...)" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="GitHub URL (e.g. https://github.com/...)" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={docsUrl} onChange={(e) => setDocsUrl(e.target.value)} placeholder="Documentation URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} placeholder="Figma Design URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={adminUrl} onChange={(e) => setAdminUrl(e.target.value)} placeholder="Admin Panel URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
              <input type="text" value={stagingUrl} onChange={(e) => setStagingUrl(e.target.value)} placeholder="Staging Server URL" className="p-2 rounded-lg border text-xs font-mono" style={inputStyles} />
            </div>
          </div>

          {/* Tech Stack & Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Technology Stack (Comma-separated)
            </label>
            <input
              type="text"
              value={techStackString}
              onChange={(e) => setTechStackString(e.target.value)}
              placeholder="Next.js 16, React 19, TypeScript, Prisma, Supabase"
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] theme-text-muted self-center font-mono mr-1">Quick Add:</span>
              {PRESET_TECH_STACK.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => handleAddTech(tech)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold font-mono border transition-all cursor-pointer hover:scale-105"
                  style={{
                    backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F1F5F9",
                    borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                    color: isCyber ? "#94A3B8" : "#475569",
                  }}
                >
                  +{tech}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold mb-1 theme-text-secondary uppercase">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="e.g. Personal Dashboard, Gaming, AI Scanner"
              className="w-full p-2.5 rounded-xl border text-sm font-semibold focus:outline-none"
              style={inputStyles}
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="projIsFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-amber-500"
              />
              <label htmlFor="projIsFeatured" className="text-xs font-bold cursor-pointer theme-text-primary flex items-center gap-1">
                <span>⭐ Pin to Featured Showcase</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="projIsArchived"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-slate-500"
              />
              <label htmlFor="projIsArchived" className="text-xs font-bold cursor-pointer theme-text-primary flex items-center gap-1">
                <span>📦 Archive Project</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            {projectToEdit && (
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
              disabled={isSaving || isUploadingLogo || isUploadingBanner || isDeleting}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                background: isCyber ? "linear-gradient(135deg, #00F5FF, #bf5fff)" : accentColor,
                color: "#fff",
                border: isCyber ? "none" : "2px solid #000",
                boxShadow: isCyber ? "0 0 12px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
              }}
            >
              {isSaving ? "Saving..." : projectToEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
