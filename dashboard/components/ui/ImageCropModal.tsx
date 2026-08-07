"use client";

import React, { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/cropImage";
import { Modal } from "@/components/ui/modal";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/components/ui/ToastProvider";

export interface CropData {
  zoom: number;
  x: number;
  y: number;
  rotation: number;
  aspect: number;
  cropArea: { x: number; y: number; width: number; height: number };
}

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  aspect?: number;
  title?: string;
  initialCropData?: Partial<CropData> | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob, cropData: CropData) => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  aspect = 1,
  title = "Position & Crop Image",
  initialCropData,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const { theme } = useTheme();
  const isCyber = theme === "cyber";
  const { error: toastError } = useToast();

  const [crop, setCrop] = useState({ x: initialCropData?.x || 0, y: initialCropData?.y || 0 });
  const [zoom, setZoom] = useState(initialCropData?.zoom || 1);
  const [rotation, setRotation] = useState(initialCropData?.rotation || 0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(initialCropData?.cropArea || null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCrop({ x: initialCropData?.x || 0, y: initialCropData?.y || 0 });
      setZoom(initialCropData?.zoom || 1);
      setRotation(initialCropData?.rotation || 0);
    }
  }, [isOpen, initialCropData]);

  const handleCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handleCropCompleteInternal = (_croppedArea: any, croppedAreaPixelsParam: any) => {
    setCroppedAreaPixels(croppedAreaPixelsParam);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleFit = () => {
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  const handleFill = () => {
    setZoom(1.4);
    setCrop({ x: 0, y: 0 });
  };

  const handleCenter = () => {
    setCrop({ x: 0, y: 0 });
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (croppedBlob) {
        const cropDataResult: CropData = {
          zoom: Number(zoom.toFixed(2)),
          x: Math.round(crop.x),
          y: Math.round(crop.y),
          rotation,
          aspect,
          cropArea: croppedAreaPixels,
        };
        onCropComplete(croppedBlob, cropDataResult);
      }
    } catch (e) {
      console.error("Cropping error:", e);
      toastError("Failed to crop image.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="overflow-y-auto overscroll-contain flex-1 p-5 sm:p-6 scrollbar-thin relative select-none">
        {/* Cyber corner brackets */}
        {isCyber && (
          <>
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00F5FF]" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#BF5FFF]" />
          </>
        )}

        <div
          className="flex justify-between items-center mb-4 pb-3"
          style={{ borderBottom: isCyber ? "1px solid rgba(255,255,255,0.08)" : "2px dashed #000" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✂️</span>
            <h2
              className="text-base font-black tracking-wide"
              style={{ fontFamily: isCyber ? "var(--font-orbitron)" : "inherit", color: isCyber ? "#00F5FF" : "#000" }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-colors hover:bg-black/10 cursor-pointer"
            style={{ color: isCyber ? "#94A3B8" : "#6B7280" }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Cropper Box Canvas */}
          <div
            onDoubleClick={handleReset}
            className="relative w-full h-80 bg-black/90 rounded-2xl overflow-hidden border border-adaptive-unique shadow-inner cursor-grab active:cursor-grabbing"
            title="Double-click to reset zoom & position"
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={handleCropChange}
              onZoomChange={handleZoomChange}
              onRotationChange={setRotation}
              onCropComplete={handleCropCompleteInternal}
              zoomSpeed={0.3}
              minZoom={1}
              maxZoom={5}
            />
            <div className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-1 rounded bg-black/60 text-white/70 backdrop-blur pointer-events-none">
              ✋ Drag to Pan • 🖱️ Scroll / Pinch to Zoom • ⚡ Dbl-Click Reset
            </div>
          </div>

          {/* Preset Buttons Bar */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap text-xs font-mono">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleFit}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  isCyber ? "bg-white/5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20" : "bg-gray-100 border-black text-black hover:bg-gray-200"
                }`}
                title="Fit image inside bounds"
              >
                🖼️ Fit
              </button>
              <button
                type="button"
                onClick={handleFill}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  isCyber ? "bg-white/5 border-purple-500/30 text-purple-300 hover:bg-purple-500/20" : "bg-gray-100 border-black text-black hover:bg-gray-200"
                }`}
                title="Fill crop area"
              >
                📐 Fill
              </button>
              <button
                type="button"
                onClick={handleCenter}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  isCyber ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" : "bg-gray-100 border-black text-black hover:bg-gray-200"
                }`}
                title="Center image position"
              >
                🎯 Center
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRotateLeft}
                className={`p-1.5 rounded-lg border font-bold transition-all ${
                  isCyber ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" : "bg-gray-100 border-black text-black hover:bg-gray-200"
                }`}
                title="Rotate Left 90°"
              >
                ↺
              </button>
              <button
                type="button"
                onClick={handleRotateRight}
                className={`p-1.5 rounded-lg border font-bold transition-all ${
                  isCyber ? "bg-white/5 border-white/10 text-white/70 hover:bg-white/10" : "bg-gray-100 border-black text-black hover:bg-gray-200"
                }`}
                title="Rotate Right 90°"
              >
                ↻
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`px-2 py-1 rounded-lg border font-bold transition-all ${
                  isCyber ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20" : "bg-red-100 border-black text-red-700 hover:bg-red-200"
                }`}
                title="Reset zoom and offset"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Zoom Slider Control */}
          <div className="flex items-center gap-3 px-1">
            <button
              type="button"
              onClick={() => handleZoomChange(Math.max(1, zoom - 0.25))}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-sm ${
                isCyber ? "border-white/10 bg-white/5 text-white/80" : "border-black bg-gray-100 text-black"
              }`}
            >
              −
            </button>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-mono uppercase text-gray-400">
                <span>Zoom Level</span>
                <span className="font-bold text-cyan-400">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={0.05}
                value={zoom}
                onChange={(e) => handleZoomChange(Number(e.target.value))}
                className="w-full accent-[#00F5FF] cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={() => handleZoomChange(Math.min(5, zoom + 0.25))}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-sm ${
                isCyber ? "border-white/10 bg-white/5 text-white/80" : "border-black bg-gray-100 text-black"
              }`}
            >
              +
            </button>
          </div>

          {/* Actions Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border-2 transition-colors bg-transparent cursor-pointer"
              style={{
                borderColor: isCyber ? "rgba(255,255,255,0.15)" : "#D1D5DB",
                color: isCyber ? "#94A3B8" : "#6B7280",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-black rounded-xl transition-transform active:scale-95 disabled:opacity-60 cursor-pointer shadow-lg"
              style={{
                backgroundColor: isCyber ? "#00F5FF" : "#FF6B35",
                color: isCyber ? "#050816" : "#fff",
              }}
            >
              {isProcessing ? "Saving Crop..." : "✂️ Apply & Save Position"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

