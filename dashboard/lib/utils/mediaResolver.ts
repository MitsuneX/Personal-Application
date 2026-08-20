/**
 * mediaResolver.ts
 *
 * Canonical card-preview media resolution engine supporting:
 * 1. MP4 / WebM / Video previews (muted, autoplay, loop, playsInline, metadata-only preload).
 * 2. Image previews (cardImage, imageUrl, portraitUrl, splashArt, avatarUrl).
 * 3. Non-destructive video & poster framing transformations (x, y, zoom, aspect).
 * 4. Dedicated 1:1 row avatar resolution (avatarUrl -> portraitUrl -> imageUrl).
 * 5. Automatic error fallback (Video Error -> Image Preview -> Initials/Gradient).
 * 6. Strict exclusion of media fields from canonical JSON exports.
 */

export const MEDIA_KEYS = new Set([
  "cardImage",
  "avatarUrl",
  "splashArt",
  "gallery",
  "portraitUrl",
  "bannerUrl",
  "videoUrl",
  "thumbnail",
  "previewVideo",
  "cardVideo",
  "media",
]);

/**
 * Returns true if a string is a video URL (.mp4, .webm, .mov, .ogg — with or without
 * query-string / fragment suffixes as produced by Supabase Storage CDN URLs).
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  // Match extension before an optional query-string (?…) or fragment (#…) or end-of-string.
  // This correctly handles both local paths (/uploads/clip.mp4) and Supabase CDN URLs
  // like https://…supabase.co/storage/v1/object/public/uploads/clip.mp4?token=abc
  return (
    /\.(mp4|webm|mov|ogg)(?:[?#]|$)/i.test(trimmed) ||
    trimmed.startsWith("data:video/")
  );
}

/**
 * Returns true if a string is a valid image URL or image data URL
 * (https://..., http://..., /uploads/..., /game-icons/..., or data:image/...).
 */
export function isImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.startsWith("data:image/")) return true;
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif|svg|avif|bmp|ico)(?:[?#]|$)/i.test(trimmed);
}

/**
 * Resolves the primary video preview URL for a card if available.
 */
export function getCardVideoUrl(entry: any): string | null {
  if (!entry) return null;
  const candidate =
    entry.cardVideo ||
    entry.previewVideo ||
    entry.videoUrl ||
    entry.details?.cardVideo ||
    entry.details?.previewVideo ||
    entry.details?.videoUrl ||
    entry.stats?.cardVideo ||
    entry.stats?.previewVideo ||
    entry.stats?.videoUrl ||
    (isVideoUrl(entry.cardImage) ? entry.cardImage : null) ||
    (isVideoUrl(entry.imageUrl) ? entry.imageUrl : null) ||
    (isVideoUrl(entry.portraitUrl) ? entry.portraitUrl : null) ||
    (isVideoUrl(entry.splashArt) ? entry.splashArt : null);

  return candidate && isVideoUrl(candidate) ? candidate : null;
}

export interface VideoFraming {
  x: number;
  y: number;
  zoom: number;
  aspect: number;
  posterUrl?: string;
  posterTimestamp?: number;
  customPosterUrl?: string;
  originalUrl?: string;
}

/**
 * Shared CSS transform & origin helper for non-destructive video framing.
 * Guarantees VideoCropModal, LazyCardVideo, and card previews render 100% pixel-perfect identical compositions.
 */
export function getVideoFramingStyle(framing?: Partial<VideoFraming> | null): React.CSSProperties {
  const x = typeof framing?.x === "number" ? framing.x : 0;
  const y = typeof framing?.y === "number" ? framing.y : 0;
  const zoom = typeof framing?.zoom === "number" && framing.zoom > 0 ? framing.zoom : 1.0;

  return {
    transform: `translate(${x}%, ${y}%) scale(${zoom})`,
    transformOrigin: "center center",
  };
}

/**
 * Shared Tailwind/CSS class name for video & media elements inside 3:4 aspect ratio containers.
 */
export const VIDEO_FRAMING_MEDIA_CLASS = "w-full h-full object-contain object-center pointer-events-none";

/**
 * Resolves non-destructive framing/crop transformation coordinates for card video rendering.
 * Safely extracts framing across Game Characters, Hall of Fame, Character Dictionary, Anime, and VTubers.
 */
export function getCardVideoFraming(entry: any): VideoFraming {
  if (!entry) {
    return { x: 0, y: 0, zoom: 1, aspect: 0.75 };
  }

  const crop =
    entry?.stats?.cropData?.cardVideoCrop ||
    entry?.stats?.cropData?.videoFraming ||
    entry?.stats?.cropData?.cardImageCrop ||
    (typeof entry?.stats?.cropData?.zoom === "number" || typeof entry?.stats?.cropData?.x === "number" ? entry?.stats?.cropData : null) ||
    entry?.stats?.cardVideoCrop ||
    entry?.stats?.videoFraming ||
    entry?.details?.cropData?.cardVideoCrop ||
    entry?.details?.cropData?.videoFraming ||
    entry?.details?.cropData?.cardImageCrop ||
    (typeof entry?.details?.cropData?.zoom === "number" || typeof entry?.details?.cropData?.x === "number" ? entry?.details?.cropData : null) ||
    entry?.details?.cardVideoCrop ||
    entry?.details?.videoFraming ||
    entry?.cropData?.cardVideoCrop ||
    entry?.cropData?.videoFraming ||
    entry?.cropData?.cardImageCrop ||
    (typeof entry?.cropData?.zoom === "number" || typeof entry?.cropData?.x === "number" ? entry?.cropData : null) ||
    entry?.videoFraming ||
    entry?.cardVideoCrop ||
    (typeof entry?.zoom === "number" && typeof entry?.aspect === "number" ? entry : null);

  const customPosterUrl =
    crop?.customPosterUrl ||
    entry?.stats?.cropData?.customPosterUrl ||
    entry?.details?.cropData?.customPosterUrl ||
    entry?.cropData?.customPosterUrl ||
    entry?.customPosterUrl ||
    entry?.details?.customPosterUrl ||
    entry?.stats?.customPosterUrl;

  const posterUrl =
    crop?.posterUrl ||
    entry?.stats?.cropData?.posterUrl ||
    entry?.details?.cropData?.posterUrl ||
    entry?.cropData?.posterUrl ||
    entry?.posterUrl ||
    entry?.details?.posterUrl ||
    entry?.stats?.posterUrl;

  const posterTimestamp =
    crop?.posterTimestamp ??
    entry?.stats?.cropData?.posterTimestamp ??
    entry?.details?.cropData?.posterTimestamp ??
    entry?.cropData?.posterTimestamp ??
    entry?.posterTimestamp;

  const originalUrl =
    crop?.originalUrl ||
    entry?.stats?.cropData?.originalUrl ||
    entry?.details?.cropData?.originalUrl ||
    entry?.cropData?.originalUrl ||
    entry?.originalUrl;

  return {
    x: typeof crop?.x === "number" ? crop.x : 0,
    y: typeof crop?.y === "number" ? crop.y : 0,
    zoom: typeof crop?.zoom === "number" && crop.zoom > 0 ? crop.zoom : 1,
    aspect: typeof crop?.aspect === "number" && crop.aspect > 0 ? crop.aspect : 0.75, // 3:4 aspect ratio
    posterUrl: posterUrl && typeof posterUrl === "string" ? posterUrl : undefined,
    posterTimestamp: typeof posterTimestamp === "number" ? posterTimestamp : undefined,
    customPosterUrl: customPosterUrl && typeof customPosterUrl === "string" ? customPosterUrl : undefined,
    originalUrl: originalUrl && typeof originalUrl === "string" ? originalUrl : undefined,
  };
}

/**
 * Resolves optional custom poster framing/crop transformation coordinates if configured.
 */
export function getCardVideoPosterFraming(entry: any): VideoFraming | null {
  if (!entry) return null;
  const crop =
    entry?.stats?.cropData ||
    entry?.details?.cropData ||
    entry?.cropData;

  const posterCrop =
    crop?.posterFraming ||
    entry?.posterFraming ||
    entry?.details?.posterFraming ||
    entry?.stats?.posterFraming;

  if (!posterCrop || typeof posterCrop !== "object") return null;

  return {
    x: typeof posterCrop.x === "number" ? posterCrop.x : 0,
    y: typeof posterCrop.y === "number" ? posterCrop.y : 0,
    zoom: typeof posterCrop.zoom === "number" && posterCrop.zoom > 0 ? posterCrop.zoom : 1,
    aspect: typeof posterCrop.aspect === "number" && posterCrop.aspect > 0 ? posterCrop.aspect : 0.75,
  };
}

/**
 * Resolves poster image URL for MP4 card preview (lightweight initial frame thumbnail).
 * Priority: 1. customPosterUrl, 2. generated posterUrl, 3. static cardImage fallback
 */
export function getCardVideoPosterUrl(entry: any): string | null {
  if (!entry) return null;
  const crop =
    entry?.stats?.cropData?.cardVideoCrop ||
    entry?.stats?.cropData?.videoFraming ||
    entry?.stats?.cropData?.cardImageCrop ||
    (typeof entry?.stats?.cropData?.zoom === "number" || typeof entry?.stats?.cropData?.x === "number" ? entry?.stats?.cropData : null) ||
    entry?.stats?.cardVideoCrop ||
    entry?.stats?.videoFraming ||
    entry?.details?.cropData?.cardVideoCrop ||
    entry?.details?.cropData?.videoFraming ||
    entry?.details?.cropData?.cardImageCrop ||
    (typeof entry?.details?.cropData?.zoom === "number" || typeof entry?.details?.cropData?.x === "number" ? entry?.details?.cropData : null) ||
    entry?.details?.cardVideoCrop ||
    entry?.details?.videoFraming ||
    entry?.cropData?.cardVideoCrop ||
    entry?.cropData?.videoFraming ||
    entry?.cropData?.cardImageCrop ||
    (typeof entry?.cropData?.zoom === "number" || typeof entry?.cropData?.x === "number" ? entry?.cropData : null) ||
    entry?.videoFraming ||
    entry?.cardVideoCrop;

  const customPoster =
    crop?.customPosterUrl ||
    entry?.stats?.cropData?.customPosterUrl ||
    entry?.details?.cropData?.customPosterUrl ||
    entry?.cropData?.customPosterUrl ||
    entry?.customPosterUrl ||
    entry?.details?.customPosterUrl ||
    entry?.stats?.customPosterUrl;

  if (customPoster && typeof customPoster === "string" && !isVideoUrl(customPoster)) {
    return customPoster;
  }

  const posterCandidate =
    crop?.posterUrl ||
    entry?.stats?.cropData?.posterUrl ||
    entry?.details?.cropData?.posterUrl ||
    entry?.cropData?.posterUrl ||
    entry?.posterUrl ||
    entry?.details?.posterUrl ||
    entry?.stats?.posterUrl;

  if (posterCandidate && typeof posterCandidate === "string" && !isVideoUrl(posterCandidate)) {
    return posterCandidate;
  }

  return getCardImageUrl(entry);
}

/**
 * Resolves the primary image preview URL for a 3:4 card.
 */
export function getCardImageUrl(entry: any): string | null {
  if (!entry) return null;
  const candidate =
    (!isVideoUrl(entry.cardImage) ? entry.cardImage : null) ||
    (!isVideoUrl(entry.imageUrl) ? entry.imageUrl : null) ||
    (!isVideoUrl(entry.portraitUrl) ? entry.portraitUrl : null) ||
    (!isVideoUrl(entry.splashArt) ? entry.splashArt : null) ||
    (!isVideoUrl(entry.avatarUrl) ? entry.avatarUrl : null);

  return candidate || null;
}

/**
 * Strict resolution order for Leaderboard / Row View 1:1 dedicated square avatar:
 * 1. avatarUrl / profileAvatarUrl (dedicated 1:1 square asset from entry, details, or stats)
 * 2. portraitUrl (dedicated 1:1 portrait asset for Character Dictionary if available)
 * 3. imageUrl / cardImage (fallback only if not video)
 * 4. splashArt (fallback only if not video)
 * 5. null (renders initials placeholder)
 */
export function getLeaderboardRowAvatarUrl(entry: any): string | null {
  if (!entry) return null;

  // 1. Dedicated avatarUrl / profileAvatarUrl on entry or inside details / stats / cropData
  const candidateAvatar =
    entry.avatarUrl ||
    entry.profileAvatarUrl ||
    entry.details?.avatarUrl ||
    entry.details?.profileAvatarUrl ||
    entry.details?.avatar ||
    entry.stats?.avatarUrl ||
    entry.stats?.cropData?.avatarCrop?.originalUrl ||
    entry.cropData?.avatarCrop?.originalUrl;

  if (candidateAvatar && typeof candidateAvatar === "string" && !isVideoUrl(candidateAvatar)) {
    return candidateAvatar;
  }

  // 2. Dedicated portraitUrl ONLY if available and not video
  const candidatePortrait =
    entry.portraitUrl ||
    entry.details?.portraitUrl;

  if (candidatePortrait && typeof candidatePortrait === "string" && !isVideoUrl(candidatePortrait)) {
    return candidatePortrait;
  }

  // 3. imageUrl / cardImage as fallback
  const candidateImage =
    entry.imageUrl ||
    entry.cardImage ||
    entry.details?.imageUrl ||
    entry.details?.cardImage;

  if (candidateImage && typeof candidateImage === "string" && !isVideoUrl(candidateImage)) {
    return candidateImage;
  }

  // 4. splashArt as fallback
  const candidateSplash =
    entry.splashArt ||
    entry.details?.splashArt;

  if (candidateSplash && typeof candidateSplash === "string" && !isVideoUrl(candidateSplash)) {
    return candidateSplash;
  }

  return null;
}

/**
 * Safely merges Character Dictionary media fields (imageUrl, portraitUrl, avatarUrl, and optional splashArt)
 * into a deduplicated persistent gallery array without overwriting existing gallery items or introducing duplicates.
 */
export function mergeCharacterDictionaryMediaIntoGallery(
  existingGallery?: string[] | null,
  mediaFields?: {
    imageUrl?: string | null;
    portraitUrl?: string | null;
    avatarUrl?: string | null;
    splashArt?: string | null;
  }
): string[] {
  const currentList = Array.isArray(existingGallery)
    ? existingGallery.filter((url) => typeof url === "string" && url.trim().length > 0)
    : [];

  const candidateUrls: string[] = [];

  if (mediaFields) {
    if (mediaFields.imageUrl && typeof mediaFields.imageUrl === "string" && !isVideoUrl(mediaFields.imageUrl)) {
      candidateUrls.push(mediaFields.imageUrl.trim());
    }
    if (mediaFields.portraitUrl && typeof mediaFields.portraitUrl === "string" && !isVideoUrl(mediaFields.portraitUrl)) {
      candidateUrls.push(mediaFields.portraitUrl.trim());
    }
    if (mediaFields.avatarUrl && typeof mediaFields.avatarUrl === "string" && !isVideoUrl(mediaFields.avatarUrl)) {
      candidateUrls.push(mediaFields.avatarUrl.trim());
    }
    if (mediaFields.splashArt && typeof mediaFields.splashArt === "string" && !isVideoUrl(mediaFields.splashArt)) {
      candidateUrls.push(mediaFields.splashArt.trim());
    }
  }

  return Array.from(new Set([...currentList, ...candidateUrls].filter(Boolean)));
}

export interface CharacterGalleryMediaItem {
  src: string;
  label: string;
  type: "avatar" | "portrait" | "card" | "gallery";
  aspect: "1:1" | "3:4";
}

/**
 * Resolves all canonical media assets for a Character Dictionary entry:
 * 1. Profile Avatar (1:1 square identity image)
 * 2. Portrait Image (3:4 portrait)
 * 3. Card Image (3:4 roster card artwork)
 * 4. Custom Gallery Images
 *
 * Automatically deduplicates identical URLs while preserving role metadata and geometric aspect ratios.
 */
export function resolveCharacterDictionaryGallery(entry: any): CharacterGalleryMediaItem[] {
  if (!entry) return [];

  const items: CharacterGalleryMediaItem[] = [];
  const seenUrls = new Set<string>();

  const addMedia = (
    urlCandidate: any,
    type: "avatar" | "portrait" | "card" | "gallery",
    defaultLabel: string,
    aspect: "1:1" | "3:4" = "3:4"
  ) => {
    if (!urlCandidate || typeof urlCandidate !== "string") return;
    const clean = urlCandidate.trim();
    if (!clean || isVideoUrl(clean) || !isImageUrl(clean)) return;

    if (!seenUrls.has(clean)) {
      seenUrls.add(clean);
      items.push({
        src: clean,
        label: defaultLabel,
        type,
        aspect,
      });
    }
  };

  // 1. Profile Avatar (Full uncropped picture prioritized over cropped thumbnail)
  const avatar =
    entry.stats?.cropData?.avatarCrop?.originalUrl ||
    entry.details?.cropData?.avatarCrop?.originalUrl ||
    entry.cropData?.avatarCrop?.originalUrl ||
    entry.details?.avatarOriginalUrl ||
    entry.avatarOriginalUrl ||
    entry.avatarUrl ||
    entry.profileAvatarUrl ||
    entry.details?.avatarUrl ||
    entry.details?.profileAvatarUrl ||
    entry.details?.avatar ||
    entry.stats?.avatarUrl;
  addMedia(avatar, "avatar", "Profile Avatar", "3:4");

  // 2. Portrait (3:4)
  const portrait =
    entry.portraitUrl ||
    entry.details?.portraitUrl ||
    entry.stats?.portraitUrl;
  addMedia(portrait, "portrait", "Portrait Image (3:4)", "3:4");

  // 3. Card Image (3:4 / Roster Card Geometry)
  const cardImage =
    entry.imageUrl ||
    entry.cardImage ||
    entry.details?.cardImage ||
    entry.details?.imageUrl ||
    entry.stats?.cardImage ||
    entry.stats?.imageUrl;
  addMedia(cardImage, "card", "Card Image (Roster)", "3:4");

  // 4. Custom User Gallery Images
  const galleryList = Array.isArray(entry.gallery)
    ? entry.gallery
    : Array.isArray(entry.details?.gallery)
    ? entry.details.gallery
    : Array.isArray(entry.stats?.gallery)
    ? entry.stats.gallery
    : [];

  let galleryCount = 0;
  galleryList.forEach((img: any) => {
    if (typeof img === "string" && img.trim()) {
      const clean = img.trim();
      if (!seenUrls.has(clean)) {
        galleryCount += 1;
        addMedia(clean, "gallery", `Gallery Image ${galleryCount}`, "3:4");
      }
    }
  });

  return items;
}
