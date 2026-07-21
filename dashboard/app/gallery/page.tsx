"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { ImageCropModal } from "@/components/ui/ImageCropModal";

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface FolderTreeNode {
  name: string;
  fullPath: string;
  children: { [key: string]: FolderTreeNode };
  itemCount: number;
}

export default function GalleryPage() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { gallery, addGalleryItem, deleteGalleryItem } = useDashboardStore();

  // Navigation & Filtering state
  const [selectedFolder, setSelectedFolder] = useState<string>("All Folders");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [includeSubfolders, setIncludeSubfolders] = useState(true);

  // Form Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("General");
  const [folderInput, setFolderInput] = useState("Root");

  // Custom Inline Folder Creation State
  const [inlineFolderParent, setInlineFolderParent] = useState("Root");
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderCreator, setShowFolderCreator] = useState(false);
  const [localFolders, setLocalFolders] = useState<string[]>([]);

  // Upload state
  const [uploadTab, setUploadTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // Autocomplete state
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showFolderSuggestions, setShowFolderSuggestions] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<HTMLDivElement>(null);

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [lightboxCaption, setLightboxCaption] = useState<string | null>(null);
  const [lightboxTags, setLightboxTags] = useState<string[]>([]);
  const [lightboxCategory, setLightboxCategory] = useState<string | null>(null);
  const [lightboxFolder, setLightboxFolder] = useState<string | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategorySuggestions(false);
      }
      if (folderRef.current && !folderRef.current.contains(event.target as Node)) {
        setShowFolderSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Unique Lists & Statistics ──────────────────────────────────────────────
  const uniqueCategories = useMemo(() => {
    const list = gallery.map((item) => item.category || "General");
    return Array.from(new Set(list)).sort();
  }, [gallery]);

  const uniqueFolders = useMemo(() => {
    const databaseFolders = gallery.map((item) => item.folder || "Root");
    const combined = [...databaseFolders, ...localFolders];
    return Array.from(new Set(combined)).sort();
  }, [gallery, localFolders]);

  // Dynamically build recursive folder tree
  const folderTree = useMemo(() => {
    const root: FolderTreeNode = { name: "Root", fullPath: "Root", children: {}, itemCount: 0 };
    
    uniqueFolders.forEach((path) => {
      if (path === "Root") return;
      const parts = path.split("/");
      let current = root;
      let currentPath = "";
      
      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            fullPath: currentPath,
            children: {},
            itemCount: 0,
          };
        }
        current = current.children[part];
      });
    });

    // Populate Item Counts accurately
    gallery.forEach((item) => {
      const path = item.folder || "Root";
      if (path === "Root") {
        root.itemCount++;
        return;
      }
      root.itemCount++;
      const parts = path.split("/");
      let current = root;
      parts.forEach((part) => {
        if (current.children[part]) {
          current.children[part].itemCount++;
          current = current.children[part];
        }
      });
    });

    return root;
  }, [gallery, uniqueFolders]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateFolderInline = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newFolderName.trim().replace(/\//g, "");
    if (!cleanName) return;
    
    const targetPath = inlineFolderParent === "Root" 
      ? cleanName 
      : `${inlineFolderParent}/${cleanName}`;
      
    if (!localFolders.includes(targetPath)) {
      setLocalFolders([...localFolders, targetPath]);
    }
    setNewFolderName("");
    setShowFolderCreator(false);
  };

  // ─── Filter Logic ──────────────────────────────────────────────────────────
  const filteredGallery = useMemo(() => {
    return gallery.filter((item) => {
      if (selectedCategory !== "All Categories") {
        const itemCat = item.category || "General";
        if (itemCat !== selectedCategory) return false;
      }
      if (selectedFolder !== "All Folders") {
        const itemFolder = item.folder || "Root";
        if (includeSubfolders) {
          if (selectedFolder === "Root") {
            // Root shows everything
          } else if (
            itemFolder !== selectedFolder &&
            !itemFolder.startsWith(selectedFolder + "/")
          ) {
            return false;
          }
        } else {
          if (itemFolder !== selectedFolder) return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCaption = (item.caption || "").toLowerCase().includes(query);
        const matchesTags = (item.tags || []).some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCaption && !matchesTags) return false;
      }
      return true;
    });
  }, [gallery, selectedCategory, selectedFolder, includeSubfolders, searchQuery]);

  const handleAddTag = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = tagInput.trim().replace(/#/g, "");
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setIsCropOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setIsCropOpen(false);
    setSelectedFile(croppedBlob as any);
    setCropImageSrc(null);
  };

  const uploadFileToServer = async (file: File | Blob): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file, "gallery-cropped.jpg");
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || "File upload failed.");
    }
    return data.url;
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    let finalUrl = "";
    setUploading(true);
    setUploadError(null);
    try {
      if (uploadTab === "upload") {
        if (!selectedFile) {
          setUploadError("Please select an image file to upload.");
          setUploading(false);
          return;
        }
        finalUrl = await uploadFileToServer(selectedFile);
      } else {
        if (!url) {
          setUploadError("Please enter a valid image URL.");
          setUploading(false);
          return;
        }
        finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl) && !/^\//.test(finalUrl)) {
          finalUrl = "https://" + finalUrl;
        }
      }
      const newId = "gallery-" + Math.random().toString(36).substr(2, 9);
      const cat = categoryInput.trim() || "General";
      const fold = folderInput.trim() || "Root";
      await addGalleryItem(newId, title.trim(), finalUrl, caption.trim(), tags, cat, fold);
      
      setTitle("");
      setUrl("");
      setCaption("");
      setTags([]);
      setCategoryInput("General");
      setFolderInput("Root");
      setSelectedFile(null);
      setIsOpen(false);
    } catch (err: any) {
      setUploadError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remove this image from your gallery?")) {
      await deleteGalleryItem(id);
    }
  };

  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadError(null);
    }
  };

  const filteredCategorySuggestions = useMemo(() => {
    const query = categoryInput.toLowerCase();
    return uniqueCategories.filter((cat) => cat.toLowerCase().includes(query));
  }, [categoryInput, uniqueCategories]);

  const filteredFolderSuggestions = useMemo(() => {
    const query = folderInput.toLowerCase();
    return uniqueFolders.filter((f) => f.toLowerCase().includes(query));
  }, [folderInput, uniqueFolders]);

  // ─── Dynamic Folder Tree Navigation Component ────────────────────────────────
  const FolderTreeNavigation = ({
    node,
    depth = 0,
  }: {
    node: FolderTreeNode;
    depth: number;
  }) => {
    const hasChildren = Object.keys(node.children).length > 0;
    const isSelected = selectedFolder === node.fullPath;
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div className="flex flex-col">
        <div
          onClick={() => setSelectedFolder(node.fullPath)}
          className="group flex items-center justify-between py-2 px-2.5 rounded-xl cursor-pointer transition-all duration-200 select-none mb-1 hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            marginLeft: `${depth * 10}px`,
            backgroundColor: isSelected
              ? isCyber
                ? "rgba(0, 245, 255, 0.15)"
                : "#FF3366"
              : "transparent",
            borderLeft: isSelected
              ? isCyber
                ? "4px solid #00F5FF"
                : "4px solid #000"
              : "4px solid transparent",
            border: !isCyber && isSelected ? "3px solid #000" : undefined,
            boxShadow: !isCyber && isSelected ? "3px 3px 0px #000" : undefined,
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(!collapsed);
                }}
                className="text-[10px] font-bold opacity-70 hover:opacity-100 p-0.5 transition-transform"
                style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
              >
                ▼
              </button>
            )}
            <span className="text-sm shrink-0">{isSelected ? "📂" : "📁"}</span>
            <span
              className="text-xs truncate font-black tracking-wide"
              style={{
                color: isSelected
                  ? isCyber
                    ? "#00F5FF"
                    : "#FFF"
                  : isCyber
                  ? "#94A3B8"
                  : "#000",
              }}
            >
              {node.name}
            </span>
          </div>
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded-md border shrink-0 transition-colors"
            style={{
              backgroundColor: isSelected && !isCyber ? "#000" : isCyber ? "rgba(255,255,255,0.02)" : "#FFF",
              borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#000",
              color: isSelected && !isCyber ? "#FFF" : isCyber ? "#00F5FF" : "#000",
            }}
          >
            {node.itemCount}
          </span>
        </div>
        {hasChildren && !collapsed && (
          <div className="flex flex-col mt-0.5">
            {Object.values(node.children).map((child) => (
              <FolderTreeNavigation key={child.fullPath} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppShell>
      {/* ── Page Header ── */}
      <motion.div
        className="mb-8 p-8 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #060b24, rgba(0,245,255,0.08), rgba(255,51,102,0.04))"
            : "linear-gradient(135deg, #FFDEE9, #B5FFFC)",
          border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "4px solid #000",
          boxShadow: isCyber ? "0 0 40px rgba(0,245,255,0.2)" : "8px 8px 0 #000",
        }}
      >
        <div>
          <h1
            className="font-black text-4xl font-mono tracking-wider uppercase"
            style={{
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              color: isCyber ? "#00F5FF" : "#000",
              textShadow: isCyber ? "0 0 15px rgba(0,245,255,0.6)" : "none",
            }}
          >
            {isCyber ? "MEDIA_VAULT.SYS" : "⚡ Media Hub Gallery"}
          </h1>
          <p className="text-xs mt-1.5 max-w-xl font-black opacity-80 uppercase tracking-wide">
            Dynamic repository matrix. Structured categorization across virtual drives, directories, and tagging protocols.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-3 text-xs font-black rounded-xl transition-all active:scale-95 shrink-0 uppercase tracking-widest hover:-translate-y-0.5"
          style={{
            backgroundColor: isCyber ? "#00F5FF" : "#000",
            color: isCyber ? "#050816" : "#FFF",
            border: isCyber ? "1px solid #00F5FF" : "3px solid #000",
            boxShadow: isCyber ? "0 0 20px rgba(0, 245, 255, 0.5)" : "4px 4px 0 #FF3366",
          }}
        >
          ➕ Import Asset
        </button>
      </motion.div>

      {/* ── Toolbar Search ── */}
      <div
        className="mb-8 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center"
        style={{
          backgroundColor: isCyber ? "rgba(5,8,22,0.6)" : "#FFF",
          borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
          borderWidth: isCyber ? "1px" : "4px",
          boxShadow: isCyber ? "0 0 25px rgba(0,245,255,0.05)" : "5px 5px 0 #000",
          backdropFilter: isCyber ? "blur(12px)" : "none",
        }}
      >
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="PROMPT STRINGS // Search metadata tags, title matrix..."
            className="w-full px-5 py-3 text-xs font-black rounded-xl outline-none border transition-all uppercase tracking-wider"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.02)" : "#F3F4F6",
              borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
              borderWidth: isCyber ? "1px" : "3px",
              color: isCyber ? "#00F5FF" : "#000",
            }}
          />
        </div>
        <div className="flex items-center gap-4 shrink-0 select-none">
          <label className="flex items-center gap-2.5 text-xs font-black select-none cursor-pointer uppercase tracking-wider">
            <input
              type="checkbox"
              checked={includeSubfolders}
              onChange={(e) => setIncludeSubfolders(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer border-2"
              style={{ accentColor: isCyber ? "#00F5FF" : "#FF3366" }}
            />
            <span>Include Nested Sectors</span>
          </label>
        </div>
      </div>

      {/* ── Main Layout (Sidebar + Grid) ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Controls */}
        <div
          className="w-full lg:w-80 shrink-0 p-6 rounded-2xl flex flex-col gap-6"
          style={{
            backgroundColor: isCyber ? "rgba(6,11,30,0.7)" : "#FFF",
            borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
            borderWidth: isCyber ? "1px" : "4px",
            boxShadow: isCyber ? "none" : "6px 6px 0 #000",
            backdropFilter: isCyber ? "blur(8px)" : "none",
          }}
        >
          {/* Section: Folders Tree */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b-2 border-dashed border-adaptive-unique">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span>📁</span> Core Directories
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowFolderCreator(!showFolderCreator)}
                  className="text-[9px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider bg-black/5 dark:hover:bg-white/10"
                  style={{ borderColor: "#000" }}
                >
                  {showFolderCreator ? "Cancel" : "⚡ New Folder"}
                </button>
              </div>
            </div>

            {/* Inline dynamic folder builder form */}
            <AnimatePresence>
              {showFolderCreator && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateFolderInline}
                  className="p-3 rounded-xl border-2 space-y-2 bg-black/5 dark:bg-white/5"
                  style={{ borderColor: isCyber ? "#00F5FF" : "#000" }}
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase">Mount Inside Node</label>
                    <select
                      value={inlineFolderParent}
                      onChange={(e) => setInlineFolderParent(e.target.value)}
                      className="text-[10px] p-1 font-bold rounded bg-transparent border border-adaptive-unique"
                    >
                      <option value="Root">Root Base</option>
                      {uniqueFolders.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase">Directory Name</label>
                    <input
                      type="text"
                      required
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="e.g. ConceptArt"
                      className="text-[10px] p-1.5 font-bold rounded bg-transparent border border-adaptive-unique"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1 text-[9px] font-black uppercase text-center rounded bg-black text-white dark:bg-white dark:text-black border border-transparent"
                  >
                    🚀 Initialize Folder
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
              <div
                onClick={() => setSelectedFolder("All Folders")}
                className="flex items-center justify-between py-2 px-2.5 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-black mb-1 tracking-wide"
                style={{
                  backgroundColor: selectedFolder === "All Folders" ? (isCyber ? "rgba(0,245,255,0.15)" : "#FF3366") : "transparent",
                  borderLeft: selectedFolder === "All Folders" ? (isCyber ? "4px solid #00F5FF" : "4px solid #000") : "4px solid transparent",
                  border: !isCyber && selectedFolder === "All Folders" ? "3px solid #000" : undefined,
                  boxShadow: !isCyber && selectedFolder === "All Folders" ? "3px 3px 0px #000" : undefined,
                  color: selectedFolder === "All Folders" && !isCyber ? "#FFF" : undefined,
                }}
              >
                <span>🌍 Root Matrix Vector</span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-adaptive-unique rounded">
                  {gallery.length}
                </span>
              </div>
              <FolderTreeNavigation node={folderTree} depth={0} />
            </div>
          </div>

          {/* Section: Categories */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b-2 border-dashed border-adaptive-unique">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span>🏷️</span> Classification Core
              </h3>
            </div>
            <div className="flex flex-wrap lg:flex-col gap-1 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
              <div
                onClick={() => setSelectedCategory("All Categories")}
                className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-black w-full mb-1"
                style={{
                  backgroundColor: selectedCategory === "All Categories" ? (isCyber ? "rgba(0,245,255,0.15)" : "#FF3366") : "transparent",
                  borderLeft: selectedCategory === "All Categories" ? (isCyber ? "4px solid #00F5FF" : "4px solid #000") : "4px solid transparent",
                  border: !isCyber && selectedCategory === "All Categories" ? "3px solid #000" : undefined,
                  boxShadow: !isCyber && selectedCategory === "All Categories" ? "3px 3px 0px #000" : undefined,
                  color: selectedCategory === "All Categories" && !isCyber ? "#FFF" : undefined,
                }}
              >
                <span>🏷️ All Classifications</span>
                <span className="text-[9px] font-mono px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-adaptive-unique rounded">
                  {gallery.length}
                </span>
              </div>
              {uniqueCategories.map((cat) => {
                const count = gallery.filter((item) => (item.category || "General") === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <div
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-black w-full mb-1"
                    style={{
                      backgroundColor: isSelected ? (isCyber ? "rgba(0,245,255,0.15)" : "#FF3366") : "transparent",
                      borderLeft: isSelected ? (isCyber ? "4px solid #00F5FF" : "4px solid #000") : "4px solid transparent",
                      border: !isCyber && isSelected ? "3px solid #000" : undefined,
                      boxShadow: !isCyber && isSelected ? "3px 3px 0px #000" : undefined,
                      color: isSelected && !isCyber ? "#FFF" : undefined,
                    }}
                  >
                    <span className="truncate uppercase tracking-wider">{cat}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-black/5 dark:bg-white/5 border border-adaptive-unique rounded">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gallery Grid Section */}
        <div className="flex-1 w-full">
          {/* Active Navigation Path / Breadcrumbs */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-black tracking-wider font-mono uppercase">
            <span>INDEX:</span>
            <span className="bg-black/5 dark:bg-white/10 px-2.5 py-1 border border-adaptive-unique rounded-lg text-emerald-500">
              📁 {selectedFolder}
            </span>
            <span>//</span>
            <span className="bg-black/5 dark:bg-white/10 px-2.5 py-1 border border-adaptive-unique rounded-lg text-amber-500">
              🏷️ {selectedCategory}
            </span>
            {filteredGallery.length > 0 && (
              <span className="ml-auto text-[10px] opacity-60">
                Found {filteredGallery.length} active pipelines
              </span>
            )}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <motion.div
                key={item.id}
                layoutId={`gallery-${item.id}`}
                onClick={() => {
                  setLightboxUrl(item.url);
                  setLightboxTitle(item.title);
                  setLightboxCaption(item.caption || null);
                  setLightboxTags(item.tags || []);
                  setLightboxCategory(item.category || "General");
                  setLightboxFolder(item.folder || "Root");
                }}
                className="group relative cursor-pointer overflow-hidden aspect-video bg-black/10 transition-transform duration-200"
                style={{
                  borderRadius: isCyber ? "16px" : "0px",
                  border: isCyber ? "1px solid rgba(0,245,255,0.2)" : "4px solid #000",
                  boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.02)" : "6px 6px 0 #000",
                }}
                whileHover={{ scale: 1.03 }}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80";
                  }}
                />
                {/* Static tags layout overlays */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  <span className="text-[9px] font-black uppercase tracking-wider font-mono px-2 py-0.5 bg-black/80 text-white border border-white/10 rounded-md shadow-md">
                    📁 {item.folder || "Root"}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider font-mono px-2 py-0.5 bg-[#00F5FF] text-black rounded-md shadow-md w-max">
                    {item.category || "General"}
                  </span>
                </div>
                {/* Hover overlay description */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 pointer-events-none">
                  <h3 className="text-white text-sm font-black tracking-wide uppercase truncate">{item.title}</h3>
                  {item.caption && (
                    <p className="text-[11px] text-white/70 line-clamp-2 mt-1.5 leading-relaxed font-semibold">
                      {item.caption}
                    </p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-black px-2 py-0.5 bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 rounded-md font-mono"
                        >
                          #{tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[#00F5FF] font-black font-mono mt-3 flex items-center gap-1 uppercase tracking-widest">
                    <span>🔍</span> Mount Node View
                  </p>
                </div>
                {/* Quick delete button */}
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20 shadow-lg border border-red-700 font-bold"
                >
                  ✕
                </button>
              </motion.div>
            ))}
            {filteredGallery.length === 0 && (
              <div className="col-span-full text-center py-24 border-4 border-dashed border-adaptive-unique rounded-2xl opacity-75 bg-black/5 dark:bg-white/5">
                <p className="text-5xl animate-bounce">📡</p>
                <p className="text-sm font-black uppercase tracking-wider mt-4">Empty Sector Grid Array</p>
                <p className="text-xs opacity-60 mt-1">Initialize dynamic asset loading or select another virtual drive channel.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Image Overlay dialog ── */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="max-w-md">
        <div className="p-6 relative">
          {isCyber && (
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00F5FF]" />
          )}
          <div
            className="flex justify-between items-center mb-5 pb-3"
            style={{
              borderBottom: isCyber ? "1px solid rgba(255,255,255,0.1)" : "4px dashed #000",
            }}
          >
            <h3 className="font-black text-lg uppercase tracking-wide">Import Virtual Asset</h3>
            <button onClick={() => setIsOpen(false)} className="text-xs font-black p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded">
              ✕
            </button>
          </div>
          <form onSubmit={handleAddImage} className="space-y-4">
            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider opacity-70">
                Asset Identifier Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ALPHA RAW DATA DEPLOYMENT"
                className="px-4 py-2.5 text-xs font-black rounded-xl border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique uppercase"
              />
            </div>
            {/* Upload Method Selector Tab */}
            <div className="flex gap-2 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-adaptive-unique">
              <button
                type="button"
                onClick={() => setUploadTab("upload")}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
                style={{
                  backgroundColor: uploadTab === "upload" ? (isCyber ? "rgba(0,245,255,0.15)" : "#000") : "transparent",
                  color: uploadTab === "upload" ? (isCyber ? "#00F5FF" : "#FFF") : "inherit",
                }}
              >
                📁 local drive
              </button>
              <button
                type="button"
                onClick={() => setUploadTab("url")}
                className="flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
                style={{
                  backgroundColor: uploadTab === "url" ? (isCyber ? "rgba(0,245,255,0.15)" : "#000") : "transparent",
                  color: uploadTab === "url" ? (isCyber ? "#00F5FF" : "#FFF") : "inherit",
                }}
              >
                🔗 network link
              </button>
            </div>
            {/* Ingestion Type Form Fields */}
            {uploadTab === "upload" ? (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider opacity-70">
                  Select Data Stream Source
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-200 ${
                    dragActive
                      ? "bg-[#00F5FF]/10 border-[#00F5FF]"
                      : "bg-black/5 dark:bg-white/5 border-adaptive-unique hover:bg-black/10"
                  }`}
                  style={{
                    borderWidth: !isCyber ? "3px" : "2px",
                    borderColor: !isCyber ? "#000" : undefined,
                    borderRadius: !isCyber ? "0px" : undefined,
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-black text-emerald-500">✓ DATA STREAM LOCKED</p>
                      <p className="text-[10px] font-mono truncate">{selectedFile.name}</p>
                      <p className="text-[9px] opacity-60">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB CAPACITY
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-2xl">📥</p>
                      <p className="text-[10px] font-black uppercase">
                        Drop media matrix bundle or tap to index
                      </p>
                      <p className="text-[8px] opacity-50">PNG, JPG, GIF MATCHERS MAX 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider opacity-70">
                  Remote System Web Uniform Link
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. HTTPS://SERVER.NET/IMAGE.PNG"
                  className="px-4 py-2.5 text-xs font-black rounded-xl border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique"
                />
              </div>
            )}
            {/* Folder & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div ref={categoryRef} className="flex flex-col gap-1 relative">
                <label className="text-[10px] font-black uppercase tracking-wider opacity-70">
                  Classification Category
                </label>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setShowCategorySuggestions(true);
                  }}
                  onFocus={() => setShowCategorySuggestions(true)}
                  className="px-4 py-2.5 text-xs font-black rounded-xl border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique uppercase"
                />
                {showCategorySuggestions && filteredCategorySuggestions.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-y-auto rounded-xl border shadow-xl"
                    style={{
                      backgroundColor: isCyber ? "#080F25" : "#FFF",
                      borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                      borderWidth: isCyber ? "1px" : "3px",
                    }}
                  >
                    {filteredCategorySuggestions.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          setCategoryInput(cat);
                          setShowCategorySuggestions(false);
                        }}
                        className="px-4 py-2 text-[10px] font-black uppercase cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Folder */}
              <div ref={folderRef} className="flex flex-col gap-1 relative">
                <label className="text-[10px] font-black uppercase tracking-wider opacity-70">
                  System Folder Path
                </label>
                <input
                  type="text"
                  value={folderInput}
                  onChange={(e) => {
                    setFolderInput(e.target.value);
                    setShowFolderSuggestions(true);
                  }}
                  onFocus={() => setShowFolderSuggestions(true)}
                  className="px-4 py-2.5 text-xs font-black rounded-xl border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique uppercase"
                />
                {showFolderSuggestions && filteredFolderSuggestions.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 z-50 mt-1 max-h-40 overflow-y-auto rounded-xl border shadow-xl"
                    style={{
                      backgroundColor: isCyber ? "#080F25" : "#FFF",
                      borderColor: isCyber ? "rgba(0,245,255,0.3)" : "#000",
                      borderWidth: isCyber ? "1px" : "3px",
                    }}
                  >
                    {filteredFolderSuggestions.map((f) => (
                      <div
                        key={f}
                        onClick={() => {
                          setFolderInput(f);
                          setShowFolderSuggestions(false);
                        }}
                        className="px-4 py-2 text-[10px] font-black uppercase cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Caption */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider opacity-70">
                Asset Summary Details
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Metadata descriptive notes..."
                rows={2}
                className="px-4 py-2.5 text-xs font-black rounded-xl border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique"
              />
            </div>
            {/* Tag Builder */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider opacity-70">
                Indexing Hash Tokens
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const clean = tagInput.trim().replace(/#/g, "");
                      if (clean && !tags.includes(clean)) {
                        setTags([...tags, clean]);
                      }
                      setTagInput("");
                    }
                  }}
                  placeholder="Type tag token & enter..."
                  className="flex-1 px-4 py-2.5 text-xs font-black rounded-xl border outline-none bg-black/5 dark:bg-white/5 border-adaptive-unique uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 text-xs font-black rounded-xl border-2 border-black dark:border-white bg-black/5 dark:bg-white/5 uppercase"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={tag}
                      className="text-[10px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#000",
                        color: isCyber ? "#00F5FF" : "#FFF",
                        border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                      }}
                      onClick={() => handleRemoveTag(idx)}
                    >
                      #{tag.toUpperCase()} <span className="opacity-60 text-[8px] font-bold">✕</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {uploadError && (
              <p className="text-[10px] text-red-500 font-black tracking-wider uppercase">
                CRITICAL_ERROR // {uploadError}
              </p>
            )}
            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setUrl("");
                  setCaption("");
                  setTags([]);
                  setCategoryInput("General");
                  setFolderInput("Root");
                  setSelectedFile(null);
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-xs font-black rounded-xl border border-adaptive-unique bg-transparent uppercase"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 text-xs font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 uppercase"
                style={{
                  backgroundColor: uploading ? "#E2E8F0" : isCyber ? "#00F5FF" : "#FF3366",
                  color: isCyber ? "#050816" : "#fff",
                  boxShadow: isCyber ? "0 0 15px rgba(0,245,255,0.4)" : "3px 3px 0 #000",
                  border: !isCyber ? "3px solid #000" : undefined,
                }}
              >
                {uploading ? "COMPILING SYSTEMSTREAM..." : "DEPLOY ASSET"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ── Lightbox Modal Preview ── */}
      <Modal isOpen={!!lightboxUrl} onClose={() => setLightboxUrl(null)} maxWidth="max-w-4xl">
        <div className="relative rounded-2xl overflow-hidden flex flex-col md:flex-row bg-[#02040a] border-4 border-black dark:border-[#00F5FF]/30">
          <div className="flex-1 bg-black/60 flex items-center justify-center p-4">
            <img
              src={lightboxUrl || ""}
              alt={lightboxTitle}
              className="max-w-full max-h-[70vh] object-contain block rounded-lg shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80";
              }}
            />
          </div>
          <div
            className="w-full md:w-80 p-6 flex flex-col gap-5 border-t md:border-t-0 md:border-l-4 border-black dark:border-white/10"
            style={{ backgroundColor: isCyber ? "rgba(6,11,26,0.95)" : "#FFF" }}
          >
            <div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {lightboxFolder && (
                  <span
                    onClick={() => {
                      setSelectedFolder(lightboxFolder);
                      setLightboxUrl(null);
                    }}
                    className="text-[9px] font-black px-2.5 py-0.5 bg-black/20 text-[#94A3B8] border border-adaptive-unique rounded-md cursor-pointer uppercase font-mono tracking-wider"
                  >
                    📁 {lightboxFolder}
                  </span>
                )}
                {lightboxCategory && (
                  <span
                    onClick={() => {
                      setSelectedCategory(lightboxCategory);
                      setLightboxUrl(null);
                    }}
                    className="text-[9px] font-black px-2.5 py-0.5 bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 rounded-md cursor-pointer uppercase font-mono tracking-wider"
                  >
                    🏷️ {lightboxCategory}
                  </span>
                )}
              </div>
              <h4 className="text-lg font-black uppercase tracking-wide theme-text-primary">
                {lightboxTitle}
              </h4>
              {lightboxCaption && (
                <p className="text-xs mt-3 leading-relaxed opacity-80 font-semibold">
                  {lightboxCaption}
                </p>
              )}
            </div>
            {lightboxTags.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider opacity-50 mb-2">
                  Metadata Hashes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {lightboxTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-black px-3 py-0.5 rounded-md"
                      style={{
                        backgroundColor: isCyber ? "rgba(0,245,255,0.15)" : "#000",
                        color: isCyber ? "#00F5FF" : "#FFF",
                        border: isCyber ? "1px solid rgba(0,245,255,0.3)" : "2px solid #000",
                      }}
                    >
                      #{tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setLightboxUrl(null)}
              className="mt-auto w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-black dark:border-white bg-transparent transition-all active:scale-95"
            >
              Terminate View
            </button>
          </div>
        </div>
      </Modal>

      <ImageCropModal
        isOpen={isCropOpen}
        imageSrc={cropImageSrc}
        aspect={16 / 9}
        title="Crop Gallery Image"
        onClose={() => {
          setIsCropOpen(false);
          setCropImageSrc(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onCropComplete={handleCropComplete}
      />
    </AppShell>
  );
}