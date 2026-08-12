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
