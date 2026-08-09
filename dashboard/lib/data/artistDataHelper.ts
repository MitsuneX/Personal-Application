import artistData from "./ArtistData.json";

export interface ArtistPreset {
  id: string;
  name: string;
  fullName?: string;
  aliases?: string[];
  originalLanguage?: string;
  pronunciation?: string;
  gender?: string;
  age?: string;
  nationality?: string;
  occupation?: string[];
  bio?: string;
  personality?: string;
  traits?: string[];
  works?: string[];
  socialLinks?: { platform: string; url: string }[];
}

export function getArtistPresets(): ArtistPreset[] {
  return (artistData.artists || []) as ArtistPreset[];
}

export function searchArtistPresets(query: string): ArtistPreset[] {
  if (!query || !query.trim()) return getArtistPresets();
  const q = query.toLowerCase().trim();
  return getArtistPresets().filter((artist) => {
    const matchName = artist.name.toLowerCase().includes(q);
    const matchFull = (artist.fullName || "").toLowerCase().includes(q);
    const matchAliases = (artist.aliases || []).some((a) => a.toLowerCase().includes(q));
    const matchWorks = (artist.works || []).some((w) => w.toLowerCase().includes(q));
    return matchName || matchFull || matchAliases || matchWorks;
  });
}
