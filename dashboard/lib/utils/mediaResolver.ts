/**
 * mediaResolver.ts
 *
 * Clean, lightweight card-preview media resolution engine supporting:
 * 1. MP4 / WebM / Video previews (muted, autoplay, loop, playsInline, metadata-only preload).
 * 2. Image previews (cardImage, imageUrl, portraitUrl, splashArt, avatarUrl).
 * 3. Automatic error fallback (Video Error -> Image Preview -> Initials/Gradient).
 * 4. Strict exclusion of media fields from canonical JSON exports.
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
    entry.stats?.cardVideo ||
    entry.stats?.previewVideo ||
    (isVideoUrl(entry.cardImage) ? entry.cardImage : null) ||
    (isVideoUrl(entry.imageUrl) ? entry.imageUrl : null) ||
    (isVideoUrl(entry.portraitUrl) ? entry.portraitUrl : null);

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
  const zoom = typeof framing?.zoom === "number" ? framing.zoom : 1.0;

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
 */
export function getCardVideoFraming(entry: any): VideoFraming {
  const crop =
    entry?.stats?.cropData?.cardVideoCrop ||
    entry?.stats?.cropData?.videoFraming ||
    entry?.stats?.cardVideoCrop ||
    entry?.details?.cardVideoCrop;

  return {
    x: typeof crop?.x === "number" ? crop.x : 0,
    y: typeof crop?.y === "number" ? crop.y : 0,
    zoom: typeof crop?.zoom === "number" ? crop.zoom : 1,
    aspect: typeof crop?.aspect === "number" ? crop.aspect : 0.75, // 3:4 aspect ratio
    posterUrl: crop?.posterUrl,
    posterTimestamp: crop?.posterTimestamp,
    customPosterUrl: crop?.customPosterUrl,
    originalUrl: crop?.originalUrl,
  };
}

/**
 * Resolves poster image URL for MP4 card preview (lightweight initial frame thumbnail).
 * Priority: 1. customPosterUrl, 2. generated posterUrl, 3. static cardImage fallback
 */
export function getCardVideoPosterUrl(entry: any): string | null {
  if (!entry) return null;
  const crop = entry?.stats?.cropData?.cardVideoCrop || entry?.details?.cardVideoCrop;
  const customPoster = crop?.customPosterUrl || entry?.customPosterUrl;

  if (customPoster && typeof customPoster === "string" && !isVideoUrl(customPoster)) {
    return customPoster;
  }

  const posterCandidate =
    crop?.posterUrl ||
    entry?.posterUrl ||
    entry?.details?.posterUrl;

  if (posterCandidate && typeof posterCandidate === "string" && !isVideoUrl(posterCandidate)) {
    return posterCandidate;
  }

  return getCardImageUrl(entry);
}

/**
 * Resolves the primary image preview URL for a card.
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
