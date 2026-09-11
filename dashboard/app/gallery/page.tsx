"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useTheme } from "@/lib/theme";
import { useDashboardStore, GalleryEntry } from "@/lib/store/dashboardStore";
import { Modal } from "@/components/ui/modal";
import { ImageCropModal } from "@/components/ui/ImageCropModal";
import { MoveToFolderModal } from "@/components/gallery/MoveToFolderModal";
import { useConfirm } from "@/lib/context/ConfirmContext";
import { useContextMenu } from "@/hooks/useContextMenu";

interface ChildFolderInfo {
  name: string;
  fullPath: string;
  itemCount: number;
  subfolderCount: number;
  coverUrl?: string;
}

function GalleryPageContent() {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const {
    gallery,
    addGalleryItem,
    updateGalleryItem,
    moveGalleryItem,
    renameGalleryFolder,
    deleteGalleryItem,
  } = useDashboardStore();
  const { confirm } = useConfirm();
  const { openContextMenu } = useContextMenu();

  // ─── Windows Explorer Navigation & Folder Hierarchy State ──────────────────
  const [currentFolder, setCurrentFolder] = useState<string>("Root");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchScope, setSearchScope] = useState<"current" | "all">("current");
  const [viewMode, setViewMode] = useState<"grid" | "masonry" | "timeline">("grid");
  const [localFolders, setLocalFolders] = useState<string[]>([]);

  // Drag-and-drop state
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [dragTargetFolder, setDragTargetFolder] = useState<string | null>(null);
  const [isDropActiveCanvas, setIsDropActiveCanvas] = useState(false);

  // Move-to-Folder modal state (Mobile and keyboard alternative)
  const [moveModalItem, setMoveModalItem] = useState<GalleryEntry | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Edit photo metadata modal state
  const [editItem, setEditItem] = useState<GalleryEntry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add / Import Virtual Asset modal state
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("General");
  const [folderInput, setFolderInput] = useState("Root");

  // Upload state
  const [uploadTab, setUploadTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // New folder prompt state
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState("");
  const [newFolderParentPath, setNewFolderParentPath] = useState("Root");

  // Rename folder prompt state
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [renamedFolderNameInput, setRenamedFolderNameInput] = useState("");

  // Lightbox preview state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState("");
  const [lightboxCaption, setLightboxCaption] = useState<string | null>(null);
  const [lightboxTags, setLightboxTags] = useState<string[]>([]);
  const [lightboxCategory, setLightboxCategory] = useState<string | null>(null);
  const [lightboxFolder, setLightboxFolder] = useState<string | null>(null);

  const openLightbox = useCallback(
    (item: { url: string; title: string; caption?: string | null; tags?: string[] | null; category?: string; folder?: string }) => {
      setLightboxUrl(item.url);
      setLightboxTitle(item.title);
      setLightboxCaption(item.caption || null);
      setLightboxTags((item.tags?.filter(Boolean) as string[]) || []);
      setLightboxCategory(item.category || "General");
      setLightboxFolder(item.folder || "Root");
    },
    []
  );

  // ─── Folders & Hierarchy Resolution ─────────────────────────────────────────

  // All known folder paths across database records and local sessions
  const allUniqueFolders = useMemo(() => {
    const fromGallery = gallery.map((g) => g.folder || "Root");
    const combined = Array.from(new Set(["Root", ...fromGallery, ...localFolders])).filter(Boolean);
    return combined.sort();
  }, [gallery, localFolders]);

  // Clickable Breadcrumb Trail for currentFolder
  const breadcrumbTrail = useMemo(() => {
    if (currentFolder === "Root") {
      return [{ name: "Gallery Root", path: "Root" }];
    }
    const parts = currentFolder.split("/");
    const crumbs = [{ name: "Gallery Root", path: "Root" }];
    let acc = "";
    parts.forEach((part) => {
      acc = acc ? `${acc}/${part}` : part;
      crumbs.push({ name: part, path: acc });
    });
    return crumbs;
  }, [currentFolder]);

  // Immediate child folders inside currentFolder
  const childFolders = useMemo((): ChildFolderInfo[] => {
    const childMap = new Map<string, { fullPath: string; subfolders: Set<string> }>();

    allUniqueFolders.forEach((folderPath) => {
      if (folderPath === "Root") return;

      if (currentFolder === "Root") {
        const topSegment = folderPath.split("/")[0];
        if (!childMap.has(topSegment)) {
          childMap.set(topSegment, { fullPath: topSegment, subfolders: new Set() });
        }
        if (folderPath.includes("/")) {
          childMap.get(topSegment)!.subfolders.add(folderPath);
        }
      } else if (folderPath.startsWith(currentFolder + "/")) {
        const sub = folderPath.slice(currentFolder.length + 1);
        const nextSegment = sub.split("/")[0];
        const nextFullPath = `${currentFolder}/${nextSegment}`;
        if (!childMap.has(nextSegment)) {
          childMap.set(nextSegment, { fullPath: nextFullPath, subfolders: new Set() });
        }
        if (sub.includes("/")) {
          childMap.get(nextSegment)!.subfolders.add(folderPath);
        }
      }
    });

    const result: ChildFolderInfo[] = [];
    childMap.forEach((val, name) => {
      // Calculate item count (all items residing in this folder or its subfolders)
      const matchingItems = gallery.filter((item) => {
        const itemFolder = item.folder || "Root";
        return itemFolder === val.fullPath || itemFolder.startsWith(val.fullPath + "/");
      });

      result.push({
        name,
        fullPath: val.fullPath,
        itemCount: matchingItems.length,
        subfolderCount: val.subfolders.size,
        coverUrl: matchingItems.find((i) => i.url)?.url,
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [allUniqueFolders, currentFolder, gallery]);

  // Direct media items stored strictly inside currentFolder (or all if searchScope === "all")
  const displayedMedia = useMemo(() => {
    return gallery.filter((item) => {
      const itemFolder = item.folder || "Root";

      // Folder filtering:
      // If searching across all folders, do not restrict folder
      if (!searchQuery.trim() || searchScope === "current") {
        if (itemFolder !== currentFolder) return false;
      }

      // Search query filtering:
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchCaption = (item.caption || "").toLowerCase().includes(q);
        const matchCategory = (item.category || "").toLowerCase().includes(q);
        const matchTags = (item.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchFolder = itemFolder.toLowerCase().includes(q);
        return matchTitle || matchCaption || matchCategory || matchTags || matchFolder;
      }

      return true;
    });
  }, [gallery, currentFolder, searchQuery, searchScope]);

  // Navigate up one folder level
  const handleNavigateUp = () => {
    if (currentFolder === "Root") return;
    if (currentFolder.includes("/")) {
      const parent = currentFolder.slice(0, currentFolder.lastIndexOf("/"));
      setCurrentFolder(parent || "Root");
    } else {
      setCurrentFolder("Root");
    }
  };

  // ─── Drag-and-Drop Handlers ────────────────────────────────────────────────

  const handlePhotoDragStart = (e: React.DragEvent, item: GalleryEntry) => {
    setDraggedPhotoId(item.id);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setData("application/gallery-photo-id", item.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePhotoDragEnd = () => {
    setDraggedPhotoId(null);
    setDragTargetFolder(null);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragTargetFolder !== folderPath) {
      setDragTargetFolder(folderPath);
    }
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragTargetFolder(null);
  };

  const handleFolderDrop = async (e: React.DragEvent, targetFolderPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragTargetFolder(null);

    const photoId =
      e.dataTransfer.getData("application/gallery-photo-id") ||
      e.dataTransfer.getData("text/plain");

    if (!photoId) return;
    const photo = gallery.find((g) => g.id === photoId);
    if (!photo) return;
    const currentPhotoFolder = photo.folder || "Root";

    if (currentPhotoFolder === targetFolderPath) {
      return; // Already in destination folder
    }

    await moveGalleryItem(photo.id, targetFolderPath);
  };

  // Drag external files from OS onto canvas to upload directly into current folder
  const handleCanvasDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setIsDropActiveCanvas(true);
    }
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropActiveCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropActiveCanvas(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setIsCropOpen(true);
        setFolderInput(currentFolder);
        setIsOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Folder Creation, Renaming, and Deletion ───────────────────────────────

  const handlePromptCreateSubfolder = (parentPath: string) => {
    setNewFolderParentPath(parentPath);
    setNewFolderNameInput("");
    setIsNewFolderModalOpen(true);
  };

  const handleConfirmCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFolderNameInput.trim().replace(/^\/+|\/+$/g, "");
    if (!clean) return;

    const fullPath = newFolderParentPath === "Root" ? clean : `${newFolderParentPath}/${clean}`;
    if (!allUniqueFolders.includes(fullPath)) {
      setLocalFolders((prev) => [...prev, fullPath]);
    }
    setIsNewFolderModalOpen(false);
    setNewFolderNameInput("");
  };

  const handlePromptRenameFolder = (folderPath: string) => {
    const parts = folderPath.split("/");
    setFolderToRename(folderPath);
    setRenamedFolderNameInput(parts[parts.length - 1]);
    setIsRenameModalOpen(true);
  };

  const handleConfirmRenameFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderToRename) return;
    const cleanNewName = renamedFolderNameInput.trim().replace(/\//g, "");
    if (!cleanNewName) return;

    const parts = folderToRename.split("/");
    parts[parts.length - 1] = cleanNewName;
    const newFullPath = parts.join("/");

    if (newFullPath === folderToRename) {
      setIsRenameModalOpen(false);
      return;
    }

    await renameGalleryFolder(folderToRename, newFullPath);

    // Update local folders list if tracked
    setLocalFolders((prev) =>
      prev.map((f) => {
        if (f === folderToRename) return newFullPath;
        if (f.startsWith(folderToRename + "/")) {
          return newFullPath + f.slice(folderToRename.length);
        }
        return f;
      })
    );

    // If currently inside renamed folder, update currentFolder
    if (currentFolder === folderToRename) {
      setCurrentFolder(newFullPath);
    } else if (currentFolder.startsWith(folderToRename + "/")) {
      setCurrentFolder(newFullPath + currentFolder.slice(folderToRename.length));
    }

    setIsRenameModalOpen(false);
    setFolderToRename(null);
  };

  const handleDeleteFolder = (folderPath: string) => {
    const itemsInFolder = gallery.filter((item) => {
      const fold = item.folder || "Root";
      return fold === folderPath || fold.startsWith(folderPath + "/");
    });

    confirm({
      title: "Delete Gallery Folder",
      message: `Are you sure you want to delete folder "${folderPath}"? ${
        itemsInFolder.length > 0
          ? `It contains ${itemsInFolder.length} media item(s) which will be moved to Root Base.`
          : ""
      }`,
      confirmText: "Delete Folder",
      variant: "danger",
      itemPreview: {
        title: folderPath,
        subtitle: `${itemsInFolder.length} assets`,
        icon: "📁",
      },
      successToast: `✓ Folder "${folderPath}" removed.`,
      onConfirm: async () => {
        // Safely move contained items to Root before removing folder reference
        for (const it of itemsInFolder) {
          await moveGalleryItem(it.id, "Root");
        }
        setLocalFolders((prev) => prev.filter((f) => f !== folderPath && !f.startsWith(folderPath + "/")));
        if (currentFolder === folderPath || currentFolder.startsWith(folderPath + "/")) {
          setCurrentFolder("Root");
        }
      },
    });
  };

  // ─── Photo Operations (Edit info, Move, Delete) ────────────────────────────

  const handlePromptMovePhoto = (item: GalleryEntry) => {
    setMoveModalItem(item);
    setIsMoveModalOpen(true);
  };

  const handlePromptEditPhoto = (item: GalleryEntry) => {
    setEditItem(item);
    setEditTitle(item.title || "");
    setEditCaption(item.caption || "");
    setEditCategory(item.category || "General");
    setEditTags(item.tags || []);
    setIsEditModalOpen(true);
  };

  const handleSavePhotoEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    await updateGalleryItem(editItem.id, {
      title: editTitle.trim() || "Untitled",
      caption: editCaption.trim() || null,
      category: editCategory.trim() || "General",
      tags: editTags,
    });
    setIsEditModalOpen(false);
    setEditItem(null);
  };

  const handleDeletePhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const item = gallery.find((g) => g.id === id);
    confirm({
      title: "Remove Gallery Asset",
      message: `Are you sure you want to remove asset "${item?.title || "Gallery Image"}"?`,
      confirmText: "Remove Image",
      variant: "danger",
      itemPreview: {
        title: item?.title || "Gallery Image",
        subtitle: `${item?.category || "General"} · 📁 ${item?.folder || "Root"}`,
        imageUrl: item?.url,
        icon: "🖼️",
        category: item?.category,
      },
      successToast: `✓ Gallery asset "${item?.title || "Image"}" removed.`,
      onConfirm: async () => {
        await deleteGalleryItem(id);
      },
    });
  };

  // ─── Context Menus ─────────────────────────────────────────────────────────

  const handlePhotoContextMenu = (e: React.MouseEvent, item: GalleryEntry) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "preview",
          label: "Open Full Preview",
          icon: "🔍",
          onClick: () => openLightbox(item),
        },
        {
          id: "move",
          label: "Move to Folder...",
          icon: "📁",
          onClick: () => handlePromptMovePhoto(item),
        },
        {
          id: "edit",
          label: "Edit Metadata & Tags",
          icon: "✏️",
          onClick: () => handlePromptEditPhoto(item),
        },
        {
          id: "copy-url",
          label: "Copy Image URL",
          icon: "📋",
          onClick: () => {
            if (typeof window !== "undefined" && item.url) {
              navigator.clipboard.writeText(item.url).catch(() => {});
            }
          },
        },
        {
          id: "delete",
          label: "Delete Image",
          icon: "🗑️",
          danger: true,
          divider: true,
          onClick: () => handleDeletePhoto(item.id),
        },
      ],
      item.title || "Asset Menu"
    );
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folder: ChildFolderInfo) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "open",
          label: `Open Folder "${folder.name}"`,
          icon: "📂",
          onClick: () => setCurrentFolder(folder.fullPath),
        },
        {
          id: "new-subfolder",
          label: "New Subfolder Here",
          icon: "➕",
          onClick: () => handlePromptCreateSubfolder(folder.fullPath),
        },
        {
          id: "rename",
          label: "Rename Folder",
          icon: "✏️",
          onClick: () => handlePromptRenameFolder(folder.fullPath),
        },
        {
          id: "delete",
          label: "Delete Folder",
          icon: "🗑️",
          danger: true,
          divider: true,
          onClick: () => handleDeleteFolder(folder.fullPath),
        },
      ],
      `📁 ${folder.name}`
    );
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(
      e,
      [
        {
          id: "upload",
          label: "Import Asset to Current Folder",
          icon: "➕",
          onClick: () => {
            setFolderInput(currentFolder);
            setIsOpen(true);
          },
        },
        {
          id: "new-folder",
          label: "New Subfolder Here",
          icon: "📁",
          onClick: () => handlePromptCreateSubfolder(currentFolder),
        },
        ...(currentFolder !== "Root"
          ? [
              {
                id: "up",
                label: "Navigate Up",
                icon: "↑",
                onClick: handleNavigateUp,
              },
              {
                id: "root",
                label: "Return to Root Base",
                icon: "🏠",
                divider: true,
                onClick: () => setCurrentFolder("Root"),
              },
            ]
          : []),
      ],
      currentFolder === "Root" ? "📁 Gallery Root" : `📁 ${currentFolder}`
    );
  };

  // ─── Upload Asset Handlers ─────────────────────────────────────────────────

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

  return (
    <div
      onDragOver={handleCanvasDragOver}
      onDragLeave={handleCanvasDragLeave}
      onDrop={handleCanvasDrop}
      className="space-y-6 relative min-h-[calc(100vh-140px)]"
    >
      {/* Visual drop indicator overlay when dropping external files */}
      {isDropActiveCanvas && (
        <div
          className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center backdrop-blur-sm"
          style={{
            backgroundColor: isCyber ? "rgba(0, 245, 255, 0.15)" : "rgba(255, 209, 102, 0.4)",
            border: isCyber ? "4px dashed #00F5FF" : "6px dashed #000",
          }}
        >
          <div className="p-6 rounded-2xl bg-black text-white font-mono text-base font-bold shadow-2xl animate-pulse">
            📥 Drop image here to import into 📁 {currentFolder}
          </div>
        </div>
      )}

      {/* ── Page Header Banner ── */}
      <motion.div
        className="p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-6"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: isCyber
            ? "linear-gradient(135deg, #060b24, rgba(0,245,255,0.08), rgba(255,51,102,0.04))"
            : "linear-gradient(135deg, #FFDEE9, #B5FFFC)",
          border: isCyber ? "1px solid rgba(0,245,255,0.25)" : "4px solid #000",
          boxShadow: isCyber ? "0 0 40px rgba(0,245,255,0.2)" : "6px 6px 0 #000",
        }}
      >
        <div>
          <h1
            className="font-black text-3xl md:text-4xl font-mono tracking-wider uppercase"
            style={{
              fontFamily: isCyber ? "var(--font-orbitron)" : "inherit",
              color: isCyber ? "#00F5FF" : "#000",
              textShadow: isCyber ? "0 0 15px rgba(0,245,255,0.6)" : "none",
            }}
          >
            {isCyber ? "MEDIA_EXPLORER.SYS" : "⚡ Media Hub Explorer"}
          </h1>
          <p className="text-xs mt-1.5 max-w-xl font-bold opacity-80 uppercase tracking-wide">
            Windows Explorer-style repository matrix. True nested folder containment, direct asset placement, and drag-and-drop relocation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handlePromptCreateSubfolder(currentFolder)}
            className="px-4 py-2.5 text-xs font-black rounded-xl transition-all active:scale-95 uppercase tracking-wider border-adaptive-unique"
            style={{
              backgroundColor: isCyber ? "rgba(0,245,255,0.12)" : "#FFD166",
              color: isCyber ? "#00F5FF" : "#000",
            }}
          >
            📁 New Folder
          </button>

          <button
            onClick={() => {
              setFolderInput(currentFolder);
              setIsOpen(true);
            }}
            className="px-5 py-2.5 text-xs font-black rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            style={{
              backgroundColor: isCyber ? "#00F5FF" : "#000",
              color: isCyber ? "#050816" : "#FFF",
              border: isCyber ? "1px solid #00F5FF" : "3px solid #000",
              boxShadow: isCyber ? "0 0 20px rgba(0, 245, 255, 0.5)" : "4px 4px 0 #FF3366",
            }}
          >
            ➕ Import Asset
          </button>
        </div>
      </motion.div>

      {/* ── Explorer Toolbar: Breadcrumbs + Search + View Modes ── */}
      <div
        className="p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between border-adaptive-unique"
        style={{
          backgroundColor: isCyber ? "rgba(6,11,30,0.7)" : "#FFF",
          boxShadow: isCyber ? "none" : "4px 4px 0 #000",
        }}
      >
        {/* Search Bar + Scope Selector */}
        <div className="flex items-center gap-2 w-full md:max-w-md">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs opacity-50">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchScope === "current"
                  ? `Search inside 📁 ${currentFolder}...`
                  : "Search across all folders..."
              }
              className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-xl outline-none border"
              style={{
                backgroundColor: isCyber ? "rgba(0,0,0,0.3)" : "#F9FAFB",
                borderColor: isCyber ? "rgba(0,245,255,0.2)" : "#000",
                color: isCyber ? "#00F5FF" : "#1A1A1A",
              }}
            />
          </div>

          <select
            value={searchScope}
            onChange={(e) => setSearchScope(e.target.value as any)}
            className="text-[10px] font-black uppercase px-2 py-2 rounded-xl outline-none border-adaptive-unique shrink-0"
            style={{
              backgroundColor: isCyber ? "rgba(0,0,0,0.4)" : "#FFF",
              color: isCyber ? "#00F5FF" : "#000",
            }}
          >
            <option value="current">📂 In Folder</option>
            <option value="all">🌍 All Folders</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
          <div
            className="flex items-center rounded-xl overflow-hidden border"
            style={{
              borderColor: isCyber ? "rgba(0,245,255,0.25)" : "#000",
              borderWidth: isCyber ? "1px" : "2px",
            }}
          >
            {(["grid", "masonry", "timeline"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all"
                style={{
                  backgroundColor:
                    viewMode === mode
                      ? isCyber
                        ? "rgba(0,245,255,0.2)"
                        : "#FFD166"
                      : "transparent",
                  color:
                    viewMode === mode
                      ? isCyber
                        ? "#00F5FF"
                        : "#000"
                      : isCyber
                      ? "rgba(255,255,255,0.4)"
                      : "#6B7280",
                }}
                title={`${mode} View`}
              >
                {mode === "grid" ? "▦ Grid" : mode === "masonry" ? "⊞ Masonry" : "📅 Timeline"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Windows Explorer Breadcrumb Navigation Path ── */}
      <div
        className="px-5 py-3 rounded-xl border-adaptive-unique flex flex-wrap items-center gap-2 text-xs font-mono font-bold"
        style={{
          backgroundColor: isCyber ? "rgba(5,8,22,0.5)" : "#FFF9E6",
        }}
      >
        {/* Up to Parent Button */}
        {currentFolder !== "Root" && (
          <button
            onClick={handleNavigateUp}
            className="px-2.5 py-1 rounded-lg border-adaptive-unique text-[11px] font-black flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/10 transition-transform active:scale-95"
            title="Navigate Up one directory level"
          >
            <span>↑</span>
            <span>Up</span>
          </button>
        )}

        {/* Clickable Breadcrumbs (Support drag-and-drop targeting!) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {breadcrumbTrail.map((crumb, idx) => {
            const isLast = idx === breadcrumbTrail.length - 1;
            const isDropTarget = dragTargetFolder === crumb.path;

            return (
              <React.Fragment key={crumb.path}>
                {idx > 0 && <span className="opacity-40">/</span>}
                <span
                  onClick={() => setCurrentFolder(crumb.path)}
                  onDragOver={(e) => handleFolderDragOver(e, crumb.path)}
                  onDragLeave={handleFolderDragLeave}
                  onDrop={(e) => handleFolderDrop(e, crumb.path)}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                    isLast ? "font-black" : "opacity-75 hover:opacity-100 hover:underline"
                  }`}
                  style={{
                    backgroundColor: isDropTarget
                      ? isCyber
                        ? "rgba(0,245,255,0.3)"
                        : "#FFD166"
                      : isLast
                      ? isCyber
                        ? "rgba(0,245,255,0.12)"
                        : "#FFF"
                      : "transparent",
                    color: isLast ? (isCyber ? "#00F5FF" : "#000") : undefined,
                    border: isDropTarget ? "2px solid #00F5FF" : undefined,
                  }}
                >
                  {crumb.path === "Root" ? "🏠 Gallery" : `📁 ${crumb.name}`}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        {/* Count overview */}
        <div className="ml-auto text-[10px] opacity-60 flex items-center gap-2">
          <span>{childFolders.length} folder(s)</span>
          <span>•</span>
          <span>{displayedMedia.length} asset(s)</span>
        </div>
      </div>

      {/* ── Main Explorer Content Canvas (Right-Clickable Canvas) ── */}
      <div onContextMenu={handleCanvasContextMenu} className="space-y-8 min-h-[400px]">
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION A: SUB-DIRECTORIES (Folders that contain media)
        ═════════════════════════════════════════════════════════════════════ */}
        {childFolders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider font-mono theme-text-primary flex items-center gap-1.5">
                <span>📁</span>
                <span>Sub-Directories ({childFolders.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {childFolders.map((folder) => {
                const isDropTarget = dragTargetFolder === folder.fullPath;

                return (
                  <motion.div
                    key={folder.fullPath}
                    onClick={() => setCurrentFolder(folder.fullPath)}
                    onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                    onDragOver={(e) => handleFolderDragOver(e, folder.fullPath)}
                    onDragLeave={handleFolderDragLeave}
                    onDrop={(e) => handleFolderDrop(e, folder.fullPath)}
                    whileHover={{ y: -2, scale: 1.02 }}
                    className="p-3.5 rounded-2xl border-adaptive-unique cursor-pointer transition-all flex flex-col justify-between min-h-[105px] relative group select-none overflow-hidden"
                    style={{
                      backgroundColor: isDropTarget
                        ? isCyber
                          ? "rgba(0, 245, 255, 0.25)"
                          : "#FFD166"
                        : isCyber
                        ? "rgba(10, 15, 44, 0.6)"
                        : "#FFFFFF",
                      borderColor: isDropTarget
                        ? isCyber
                          ? "#00F5FF"
                          : "#000"
                        : undefined,
                      borderWidth: isDropTarget ? "3px" : undefined,
                      boxShadow: isDropTarget
                        ? isCyber
                          ? "0 0 25px rgba(0,245,255,0.4)"
                          : "6px 6px 0 #000"
                        : isCyber
                        ? "none"
                        : "3px 3px 0 #000",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl">{isDropTarget ? "📂" : "📁"}</span>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-adaptive-unique shrink-0"
                        style={{
                          backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#F3F4F6",
                        }}
                      >
                        {folder.itemCount} items
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-black truncate theme-text-primary tracking-wide">
                        {folder.name}
                      </h3>
                      {folder.subfolderCount > 0 && (
                        <p className="text-[9px] theme-text-muted mt-0.5 font-mono">
                          {folder.subfolderCount} subfolder(s)
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION B: DIRECT ASSET MATRIX (Media in this directory)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider font-mono theme-text-primary flex items-center gap-1.5">
              <span>🖼️</span>
              <span>
                {currentFolder === "Root" ? "Root Media Assets" : "Contained Assets"} (
                {displayedMedia.length})
              </span>
            </h2>
          </div>

          {/* Render by active View Mode */}
          {displayedMedia.length > 0 ? (
            viewMode === "masonry" ? (
              /* ── MASONRY VIEW ── */
              <div
                style={{ columnCount: 3, columnGap: "1.25rem" }}
                className="[&>*]:break-inside-avoid [&>*]:mb-5 md:columns-3 columns-1 sm:columns-2"
              >
                {displayedMedia.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`asset-${item.id}`}
                    draggable
                    onDragStart={(e) => handlePhotoDragStart(e as any, item)}
                    onDragEnd={handlePhotoDragEnd}
                    onClick={() => openLightbox(item)}
                    onContextMenu={(e) => handlePhotoContextMenu(e, item)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border-adaptive-unique bg-black/10 transition-transform duration-200"
                    style={{
                      boxShadow: isCyber ? "none" : "4px 4px 0 #000",
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80";
                      }}
                    />

                    {/* Gradient Overlay with Meta & Quick Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                      <p className="text-white text-xs font-black uppercase tracking-wide truncate">
                        {item.title}
                      </p>
                      {item.caption && (
                        <p className="text-[10px] text-white/70 line-clamp-2 mt-1">{item.caption}</p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptMovePhoto(item);
                          }}
                          className="px-2 py-1 text-[9px] font-black rounded-lg bg-[#00F5FF] text-black shadow-md uppercase"
                        >
                          📁 Move
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptEditPhoto(item);
                          }}
                          className="px-2 py-1 text-[9px] font-black rounded-lg bg-white/20 text-white hover:bg-white/30 uppercase"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={(e) => handleDeletePhoto(item.id, e)}
                          className="ml-auto p-1 rounded-lg text-red-400 hover:bg-red-500/20 text-[10px] font-bold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : viewMode === "timeline" ? (
              /* ── TIMELINE VIEW ── */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayedMedia.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`asset-${item.id}`}
                    draggable
                    onDragStart={(e) => handlePhotoDragStart(e as any, item)}
                    onDragEnd={handlePhotoDragEnd}
                    onClick={() => openLightbox(item)}
                    onContextMenu={(e) => handlePhotoContextMenu(e, item)}
                    className="group relative cursor-pointer overflow-hidden aspect-square rounded-2xl border-adaptive-unique bg-black/10"
                    whileHover={{ scale: 1.04 }}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                      <p className="text-white text-[11px] font-black truncate">{item.title}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromptMovePhoto(item);
                        }}
                        className="mt-1 px-2 py-0.5 text-[8px] font-black rounded bg-[#00F5FF] text-black w-max"
                      >
                        📁 Move
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* ── STANDARD GRID VIEW ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {displayedMedia.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`asset-${item.id}`}
                    draggable
                    onDragStart={(e) => handlePhotoDragStart(e as any, item)}
                    onDragEnd={handlePhotoDragEnd}
                    onClick={() => openLightbox(item)}
                    onContextMenu={(e) => handlePhotoContextMenu(e, item)}
                    className="group relative cursor-pointer overflow-hidden aspect-video rounded-2xl border-adaptive-unique bg-black/10 transition-transform duration-200"
                    style={{
                      boxShadow: isCyber ? "none" : "4px 4px 0 #000",
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80";
                      }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
                      <span className="text-[9px] font-black uppercase font-mono px-2 py-0.5 bg-black/80 text-white rounded-md">
                        📁 {item.folder || "Root"}
                      </span>
                      {item.category && (
                        <span className="text-[9px] font-black uppercase font-mono px-2 py-0.5 bg-[#00F5FF] text-black rounded-md">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Hover Info & Quick Action Bar (Mobile-friendly Move button) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                      <p className="text-white text-xs font-black uppercase tracking-wide truncate">
                        {item.title}
                      </p>
                      {item.caption && (
                        <p className="text-[10px] text-white/70 line-clamp-2 mt-0.5">{item.caption}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptMovePhoto(item);
                          }}
                          className="px-2.5 py-1 text-[9px] font-black rounded-lg bg-[#00F5FF] text-black shadow-md uppercase transition-transform active:scale-95"
                          title="Move to Folder"
                        >
                          📁 Move
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptEditPhoto(item);
                          }}
                          className="px-2.5 py-1 text-[9px] font-black rounded-lg bg-white/20 text-white hover:bg-white/30 uppercase transition-transform active:scale-95"
                          title="Edit Info"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={(e) => handleDeletePhoto(item.id, e)}
                          className="ml-auto p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 text-xs font-bold"
                          title="Delete Photo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            /* Empty Directory Canvas */
            <div
              className="p-12 text-center rounded-2xl border-4 border-dashed border-adaptive-unique flex flex-col items-center justify-center gap-3 opacity-70"
              style={{
                backgroundColor: isCyber ? "rgba(10,15,44,0.3)" : "#FFF",
              }}
            >
              <span className="text-4xl">📂</span>
              <h3 className="font-black text-sm uppercase tracking-wider theme-text-primary">
                {searchQuery
                  ? "No Assets Match Query"
                  : currentFolder === "Root"
                  ? "Root Matrix has no Direct Media"
                  : `Folder "${currentFolder}" is Empty`}
              </h3>
              <p className="text-xs theme-text-muted max-w-sm">
                Drag and drop photos onto this area, or import virtual assets directly into this directory.
              </p>
              <button
                onClick={() => {
                  setFolderInput(currentFolder);
                  setIsOpen(true);
                }}
                className="mt-2 px-4 py-2 text-xs font-black rounded-xl border-adaptive-unique transition-transform active:scale-95"
                style={{
                  backgroundColor: isCyber ? "#00F5FF" : "#FFD166",
                  color: isCyber ? "#050816" : "#000",
                }}
              >
                ➕ Import Asset Here
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Move-to-Folder Modal (Mobile & Keyboard Drag/Drop Alternative) ── */}
      <MoveToFolderModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setMoveModalItem(null);
        }}
        item={moveModalItem}
        folders={allUniqueFolders}
        onMove={async (id, target) => {
          await moveGalleryItem(id, target);
        }}
      />

      {/* ── Edit Asset Metadata Modal ── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="max-w-md">
        <form onSubmit={handleSavePhotoEdits} className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-adaptive-unique">
            <h3 className="text-base font-black uppercase tracking-wider theme-text-primary">
              ✏️ Edit Asset Metadata
            </h3>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs font-black opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase theme-text-muted">Title</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase theme-text-muted">Caption</label>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none resize-none h-20"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase theme-text-muted">Category</label>
            <input
              type="text"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase theme-text-muted">Tags (Press Enter)</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={editTagInput}
                onChange={(e) => setEditTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const clean = editTagInput.trim().replace(/#/g, "");
                    if (clean && !editTags.includes(clean)) {
                      setEditTags([...editTags, clean]);
                    }
                    setEditTagInput("");
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none"
              />
            </div>
            {editTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {editTags.map((tag, idx) => (
                  <span
                    key={tag}
                    onClick={() => setEditTags(editTags.filter((_, i) => i !== idx))}
                    className="text-[9px] font-black px-2 py-0.5 rounded cursor-pointer bg-black/10 dark:bg-white/10"
                  >
                    #{tag} ✕
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-black rounded-xl border border-adaptive-unique uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black rounded-xl bg-[#00F5FF] text-black uppercase tracking-wider"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ── New Subfolder Prompt Modal ── */}
      <Modal isOpen={isNewFolderModalOpen} onClose={() => setIsNewFolderModalOpen(false)} maxWidth="max-w-md">
        <form onSubmit={handleConfirmCreateFolder} className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-adaptive-unique">
            <h3 className="text-base font-black uppercase tracking-wider theme-text-primary">
              📁 Initialize Sub-Directory
            </h3>
            <button
              type="button"
              onClick={() => setIsNewFolderModalOpen(false)}
              className="text-xs font-black opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          <p className="text-xs font-mono theme-text-muted">
            Mounting inside: <span className="font-bold text-emerald-500">{newFolderParentPath}</span>
          </p>

          <div>
            <label className="text-[10px] font-black uppercase theme-text-muted">Folder Name</label>
            <input
              type="text"
              required
              autoFocus
              value={newFolderNameInput}
              onChange={(e) => setNewFolderNameInput(e.target.value)}
              placeholder="e.g. Wallpapers or Screenshots"
              className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsNewFolderModalOpen(false)}
              className="px-4 py-2 text-xs font-black rounded-xl border border-adaptive-unique uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black rounded-xl bg-[#00F5FF] text-black uppercase tracking-wider"
            >
              Create Folder
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Rename Folder Prompt Modal ── */}
      <Modal isOpen={isRenameModalOpen} onClose={() => setIsRenameModalOpen(false)} maxWidth="max-w-md">
        <form onSubmit={handleConfirmRenameFolder} className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-adaptive-unique">
            <h3 className="text-base font-black uppercase tracking-wider theme-text-primary">
              ✏️ Rename Directory
            </h3>
            <button
              type="button"
              onClick={() => setIsRenameModalOpen(false)}
              className="text-xs font-black opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          <p className="text-xs font-mono theme-text-muted">
            Target: <span className="font-bold">{folderToRename}</span>
          </p>

          <div>
            <label className="text-[10px] font-black uppercase theme-text-muted">New Folder Name</label>
            <input
              type="text"
              required
              autoFocus
              value={renamedFolderNameInput}
              onChange={(e) => setRenamedFolderNameInput(e.target.value)}
              className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsRenameModalOpen(false)}
              className="px-4 py-2 text-xs font-black rounded-xl border border-adaptive-unique uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black rounded-xl bg-[#00F5FF] text-black uppercase tracking-wider"
            >
              Apply Rename
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add / Import Asset Dialog ── */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="max-w-md">
        <div className="p-6 relative">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-adaptive-unique">
            <h3 className="font-black text-lg uppercase tracking-wide">Import Virtual Asset</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-black p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddImage} className="space-y-4">
            {/* Folder Destination Selector */}
            <div>
              <label className="text-[10px] font-black uppercase theme-text-muted">
                Destination Folder
              </label>
              <select
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none font-mono"
              >
                {allUniqueFolders.map((f) => (
                  <option key={f} value={f}>
                    {f === "Root" ? "🏠 Root Base" : `📁 ${f}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Method Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-adaptive-unique">
              <button
                type="button"
                onClick={() => setUploadTab("upload")}
                className="flex-1 py-1.5 text-xs font-black uppercase"
                style={{
                  backgroundColor: uploadTab === "upload" ? (isCyber ? "#00F5FF" : "#FFD166") : "transparent",
                  color: uploadTab === "upload" ? "#000" : undefined,
                }}
              >
                📁 Local Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadTab("url")}
                className="flex-1 py-1.5 text-xs font-black uppercase"
                style={{
                  backgroundColor: uploadTab === "url" ? (isCyber ? "#00F5FF" : "#FFD166") : "transparent",
                  color: uploadTab === "url" ? "#000" : undefined,
                }}
              >
                🌐 Remote URL
              </button>
            </div>

            {uploadTab === "upload" ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs font-mono"
                />
                {selectedFile && (
                  <p className="text-[10px] font-mono text-emerald-500 mt-1">✓ Ready to deploy image</p>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase theme-text-muted">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Asset title"
                className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase theme-text-muted">Caption (Optional)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Asset description..."
                className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none resize-none h-16"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase theme-text-muted">Category</label>
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full mt-1 p-2 text-xs font-bold rounded-lg border border-adaptive-unique bg-transparent outline-none"
              />
            </div>

            {uploadError && (
              <p className="text-[10px] text-red-500 font-black font-mono">ERROR // {uploadError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-black rounded-xl border border-adaptive-unique uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 text-xs font-black rounded-xl bg-[#00F5FF] text-black uppercase tracking-wider"
              >
                {uploading ? "Deploying..." : "Deploy Asset"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ── Lightbox Preview Modal ── */}
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
                      setCurrentFolder(lightboxFolder);
                      setLightboxUrl(null);
                    }}
                    className="text-[9px] font-black px-2.5 py-0.5 bg-black/20 text-[#94A3B8] border border-adaptive-unique rounded-md cursor-pointer uppercase font-mono tracking-wider"
                  >
                    📁 {lightboxFolder}
                  </span>
                )}
                {lightboxCategory && (
                  <span className="text-[9px] font-black px-2.5 py-0.5 bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 rounded-md uppercase font-mono tracking-wider">
                    🏷️ {lightboxCategory}
                  </span>
                )}
              </div>
              <h4 className="text-lg font-black uppercase tracking-wide theme-text-primary">
                {lightboxTitle}
              </h4>
              {lightboxCaption && (
                <p className="text-xs mt-3 leading-relaxed opacity-80 font-semibold">{lightboxCaption}</p>
              )}
            </div>

            {lightboxTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {lightboxTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#00F5FF]/15 text-[#00F5FF] font-mono"
                  >
                    #{tag.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => setLightboxUrl(null)}
              className="mt-auto w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border-2 border-black dark:border-white bg-transparent transition-all active:scale-95"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Crop Modal */}
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
    </div>
  );
}

export default function GalleryPage() {
  return (
    <AppShell>
      <GalleryPageContent />
    </AppShell>
  );
}