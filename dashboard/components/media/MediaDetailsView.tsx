"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useDashboardStore, DramaEntry, AnimeEntry, CategoryRatings, DossierEmotionMilestone } from "@/lib/store/dashboardStore";
import { resolveDossierTheme } from "@/components/dossier/DossierThemeAccent";
import { DossierHero } from "@/components/dossier/DossierHero";
import { DossierStatsBar } from "@/components/dossier/DossierStatsBar";
import { DossierSynopsis } from "@/components/dossier/DossierSynopsis";
import { DossierMyJourney } from "@/components/dossier/DossierMyJourney";
import { DossierCharacterSpotlight } from "@/components/dossier/DossierCharacterSpotlight";
import { DossierEpisodeNavigator } from "@/components/dossier/DossierEpisodeNavigator";
import { DossierRatingRadar } from "@/components/dossier/DossierRatingRadar";
import { DossierMemoryGallery, MemoryScreenshot } from "@/components/dossier/DossierMemoryGallery";
import { DossierEmotionalTimeline } from "@/components/dossier/DossierEmotionalTimeline";
import { DossierReviewEditor } from "@/components/dossier/DossierReviewEditor";
import { DossierExternalLinks } from "@/components/dossier/DossierExternalLinks";
import { MetadataConfirmationModal, CandidateItem } from "@/components/ui/MetadataConfirmationModal";
import { Loader2 } from "lucide-react";

export interface MediaDetailsViewProps {
  mediaId: string;
  mediaType: "drama" | "anime" | "movie";
}

export function MediaDetailsView({ mediaId, mediaType }: MediaDetailsViewProps) {
  const router = useRouter();
  const { dramas, animeList, dramaLog, updateDrama, updateAnime, addDrama, addAnime } = useDashboardStore();

  // Search existing item in store / logs
  const existingDrama =
    dramas.find((d) => d.id === mediaId) ||
    dramas.find((d) => d.title.toLowerCase().replace(/\s+/g, "-") === mediaId);

  const existingAnime =
    animeList.find((a) => a.id === mediaId) ||
    animeList.find((a) => a.title.toLowerCase().replace(/\s+/g, "-") === mediaId);

  const existingLog = dramaLog.find((d) => d.id === mediaId);

  const rawTitle = existingDrama?.title || existingAnime?.title || existingLog?.title || mediaId.replace(/-/g, " ");

  // Local storage extended dossier cache to guarantee refresh persistence
  const [localDossier, setLocalDossier] = useState<Record<string, any>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`nexus_dossier_${mediaId}`);
      if (saved) {
        setLocalDossier(JSON.parse(saved));
      }
    } catch {}
  }, [mediaId]);

  const persistDossierPatch = (patch: Record<string, any>) => {
    setLocalDossier((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(`nexus_dossier_${mediaId}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [liveMetadata, setLiveMetadata] = useState<any>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Selected external IDs
  const [selectedImdbId, setSelectedImdbId] = useState<string | undefined>(existingLog?.omdbId || undefined);
  const [selectedTvmazeId, setSelectedTvmazeId] = useState<string | undefined>(undefined);
  const [selectedMalId, setSelectedMalId] = useState<number | undefined>(undefined);

  // Fetch Metadata with confidence scoring
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      if (!rawTitle || rawTitle.trim().length < 2) return;
      setLoadingMetadata(true);

      try {
        const queryParams = new URLSearchParams({
          title: rawTitle,
          mediaType,
          ...(selectedImdbId ? { imdbId: selectedImdbId } : {}),
          ...(selectedTvmazeId ? { tvmazeId: selectedTvmazeId } : {}),
          ...(selectedMalId ? { malId: String(selectedMalId) } : {}),
        });

        const res = await fetch(`/api/media/metadata?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch media metadata");
        const json = await res.json();

        if (isMounted) {
          if (json.requiresConfirmation && json.candidates?.length > 1) {
            setCandidates(json.candidates);
            setShowConfirmModal(true);
          } else if (json.success && json.metadata) {
            setLiveMetadata(json.metadata);
          }
        }
      } catch (err) {
        console.warn("[MediaDetailsView] Metadata error:", err);
      } finally {
        if (isMounted) setLoadingMetadata(false);
      }
    }

    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, [rawTitle, mediaType, selectedImdbId, selectedTvmazeId, selectedMalId]);

  const handleSelectCandidate = async (candidate: CandidateItem) => {
    setShowConfirmModal(false);
    setLoadingMetadata(true);

    if (candidate.imdbId) setSelectedImdbId(candidate.imdbId);
    if (candidate.tvmazeId) setSelectedTvmazeId(candidate.tvmazeId);
    if (candidate.malId) setSelectedMalId(candidate.malId);

    // Force fetch with exact candidate ID
    try {
      const queryParams = new URLSearchParams({
        title: candidate.title,
        mediaType,
        forceSelect: "true",
        ...(candidate.imdbId ? { imdbId: candidate.imdbId } : {}),
        ...(candidate.tvmazeId ? { tvmazeId: candidate.tvmazeId } : {}),
        ...(candidate.malId ? { malId: String(candidate.malId) } : {}),
      });

      const res = await fetch(`/api/media/metadata?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success && json.metadata) {
        setLiveMetadata(json.metadata);
      }
    } catch (err) {
      console.warn("Error forcing candidate metadata:", err);
    } finally {
      setLoadingMetadata(false);
    }
  };

  // Unified Single Source of Truth Entry
  const dossierData: DramaEntry = {
    id: existingDrama?.id || existingAnime?.id || mediaId,
    title: existingDrama?.title || existingAnime?.title || liveMetadata?.title || rawTitle,
    originalTitle: existingDrama?.originalTitle || liveMetadata?.originalTitle || undefined,
    country: (existingDrama?.country || liveMetadata?.country || existingLog?.country || (mediaType === "anime" ? "japanese" : "korean")) as any,
    episodes: existingDrama?.episodes || existingAnime?.totalEpisodes || liveMetadata?.episodes || existingLog?.totalEpisodes || 12,
    episodesWatched: existingDrama?.episodesWatched ?? existingAnime?.episodesWatched ?? existingLog?.episodesWatched ?? 0,
    status: existingDrama?.status || (existingAnime?.status as any) || "Watching",
    rating: existingDrama?.rating ?? existingAnime?.rating ?? (existingLog?.rating ? Number(existingLog.rating) : 0),
    genre: existingDrama?.genre || existingAnime?.genre || (liveMetadata?.genres?.length ? liveMetadata.genres.join(", ") : "Drama"),
    year: existingDrama?.year || existingAnime?.year || liveMetadata?.year || existingLog?.releaseYear || new Date().getFullYear(),
    platform: existingDrama?.platform || liveMetadata?.studio || existingAnime?.studio || "Streaming Platform",
    posterUrl: existingDrama?.posterUrl || existingAnime?.posterUrl || liveMetadata?.posterUrl || existingLog?.posterUrl || undefined,
    backdropUrl: existingDrama?.backdropUrl || liveMetadata?.backdropUrl || existingDrama?.posterUrl || existingAnime?.posterUrl || undefined,
    synopsis: existingDrama?.synopsis || existingAnime?.synopsis || liveMetadata?.synopsis || existingLog?.plotSummary || undefined,
    studio: existingDrama?.studio || existingAnime?.studio || liveMetadata?.studio || undefined,
    runtime: existingDrama?.runtime || liveMetadata?.runtime || undefined,
    startDate: existingDrama?.startDate || localDossier.startDate || undefined,
    finishDate: existingDrama?.finishDate || localDossier.finishDate || undefined,
    rewatchCount: existingDrama?.rewatchCount || localDossier.rewatchCount || 0,
    favoriteEpisode: existingDrama?.favoriteEpisode || localDossier.favoriteEpisode || undefined,
    favoriteCharacter: existingDrama?.favoriteCharacter || localDossier.favoriteCharacter || undefined,
    emotionalEpisode: existingDrama?.emotionalEpisode || localDossier.emotionalEpisode || undefined,
    mood: existingDrama?.mood || localDossier.mood || undefined,
    wouldRewatch: existingDrama?.wouldRewatch ?? localDossier.wouldRewatch ?? false,
    categoryRatings: existingDrama?.categoryRatings || localDossier.categoryRatings || undefined,
    characters: existingDrama?.characters || undefined,
    castGrid: (() => {
      const savedGrid = existingDrama?.castGrid || [];
      const liveGrid = liveMetadata?.castGrid || [];

      // 1. If savedGrid has items, keep all items and enrich missing portraits from liveGrid
      if (savedGrid.length > 0) {
        return savedGrid.map((item) => {
          if (item.photoUrl || item.characterImageUrl) return item;
          const liveMatch = liveGrid.find(
            (l: any) =>
              (l.name && l.name.trim().toLowerCase() === item.name?.trim().toLowerCase()) ||
              (l.characterName && l.characterName.trim().toLowerCase() === item.characterName?.trim().toLowerCase())
          );
          return {
            ...item,
            photoUrl: item.photoUrl || liveMatch?.photoUrl || liveMatch?.characterImageUrl,
            characterImageUrl: item.characterImageUrl || liveMatch?.characterImageUrl || liveMatch?.photoUrl,
          };
        });
      }

      // 2. If liveGrid has photos, use liveGrid
      if (liveGrid.length > 0 && liveGrid.some((l: any) => l.photoUrl || l.characterImageUrl)) {
        return liveGrid;
      }

      // 3. If manual cast string array exists, map to items and enrich from liveGrid
      if (existingDrama?.cast?.length) {
        return existingDrama.cast.map((name, i) => {
          const liveMatch = liveGrid.find(
            (l: any) => l.name && l.name.trim().toLowerCase() === name.trim().toLowerCase()
          );
          return {
            id: `saved-cast-${i}`,
            name,
            characterName: liveMatch?.characterName || (i === 0 ? "Main Lead" : "Lead Role"),
            role: liveMatch?.role || (i < 2 ? "Main Role" : "Supporting Role"),
            photoUrl: liveMatch?.photoUrl || liveMatch?.characterImageUrl,
            characterImageUrl: liveMatch?.characterImageUrl || liveMatch?.photoUrl,
          };
        });
      }

      // 4. If log mainActors array exists
      if (existingLog?.mainActors?.length) {
        return existingLog.mainActors.map((name, i) => {
          const liveMatch = liveGrid.find(
            (l: any) => l.name && l.name.trim().toLowerCase() === name.trim().toLowerCase()
          );
          return {
            id: `log-cast-${i}`,
            name,
            characterName: liveMatch?.characterName || (i === 0 ? "Main Lead" : "Lead Role"),
            role: liveMatch?.role || (i < 2 ? "Main Role" : "Supporting Role"),
            photoUrl: liveMatch?.photoUrl || liveMatch?.characterImageUrl,
            characterImageUrl: liveMatch?.characterImageUrl || liveMatch?.photoUrl,
          };
        });
      }

      // 5. If anime cast string array exists
      if (existingAnime?.cast?.length) {
        return existingAnime.cast.map((name, i) => {
          const liveMatch = liveGrid.find(
            (l: any) => l.name && l.name.trim().toLowerCase() === name.trim().toLowerCase()
          );
          return {
            id: `anime-cast-${i}`,
            name,
            characterName: liveMatch?.characterName || name,
            role: liveMatch?.role || (i < 2 ? "Main Role" : "Supporting Role"),
            photoUrl: liveMatch?.photoUrl || liveMatch?.characterImageUrl,
            characterImageUrl: liveMatch?.characterImageUrl || liveMatch?.photoUrl,
          };
        });
      }

      return liveGrid;
    })(),
    episodeLog: existingDrama?.episodeLog?.length ? existingDrama.episodeLog : liveMetadata?.episodeLog || [],
    emotionalTimeline: existingDrama?.emotionalTimeline || localDossier.emotionalTimeline || [],
    ostTracks: existingDrama?.ostTracks?.length ? existingDrama.ostTracks : liveMetadata?.ostTracks || [],
    externalLinks: { ...(liveMetadata?.externalLinks || {}), ...(existingDrama?.externalLinks || {}) },
    reviewMarkdown: existingDrama?.reviewMarkdown || localDossier.reviewMarkdown || undefined,
    awards: existingDrama?.awards?.length ? existingDrama.awards : liveMetadata?.awards || [],
  };

  const themeConfig = resolveDossierTheme(dossierData.country, dossierData.genre);
  const [isFavorite, setIsFavorite] = useState(existingDrama?.isFavorite ?? true);

  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    if (existingDrama) {
      updateDrama(existingDrama.id, { isFavorite: next });
    } else if (existingAnime) {
      updateAnime(existingAnime.id, { isFavorite: next });
    }
  };

  const handleSaveJourney = (updated: any) => {
    persistDossierPatch(updated);
    if (existingDrama) {
      updateDrama(existingDrama.id, updated);
    } else if (existingAnime) {
      updateAnime(existingAnime.id, updated);
    } else if (mediaType === "anime") {
      addAnime({
        id: mediaId,
        title: dossierData.title,
        episodesWatched: dossierData.episodesWatched,
        totalEpisodes: dossierData.episodes,
        status: dossierData.status as any,
        rating: dossierData.rating,
        genre: dossierData.genre,
        studio: dossierData.studio,
        year: dossierData.year,
        posterUrl: dossierData.posterUrl,
        synopsis: dossierData.synopsis,
        cast: dossierData.cast,
        ...updated,
      });
    } else {
      addDrama({
        id: mediaId,
        title: dossierData.title,
        country: dossierData.country,
        episodes: dossierData.episodes,
        episodesWatched: dossierData.episodesWatched,
        status: dossierData.status as any,
        rating: dossierData.rating,
        genre: dossierData.genre,
        year: dossierData.year,
        platform: dossierData.platform,
        cast: dossierData.cast,
        ...updated,
      });
    }
  };

  const handleToggleEpisode = (epNum: number) => {
    const total = dossierData.episodes || 12;
    // If clicking current exact watched episode, step down by 1; otherwise set directly to selected episode
    const nextWatched = dossierData.episodesWatched === epNum ? Math.max(0, epNum - 1) : epNum;
    const nextStatus = nextWatched >= total
      ? "Completed"
      : nextWatched > 0
      ? "Watching"
      : "Plan to Watch";

    persistDossierPatch({ episodesWatched: nextWatched, status: nextStatus });

    if (existingDrama) {
      updateDrama(existingDrama.id, { episodesWatched: nextWatched, status: nextStatus });
    } else if (existingAnime) {
      updateAnime(existingAnime.id, { episodesWatched: nextWatched, status: nextStatus });
    } else if (mediaType === "anime") {
      addAnime({
        id: mediaId,
        title: dossierData.title,
        episodesWatched: nextWatched,
        totalEpisodes: total,
        status: nextStatus as any,
        rating: dossierData.rating,
        genre: dossierData.genre,
        studio: dossierData.studio,
        year: dossierData.year,
        posterUrl: dossierData.posterUrl,
      });
    } else {
      addDrama({
        id: mediaId,
        title: dossierData.title,
        country: dossierData.country,
        episodes: total,
        episodesWatched: nextWatched,
        status: nextStatus as any,
        rating: dossierData.rating,
        genre: dossierData.genre,
        year: dossierData.year,
        platform: dossierData.platform,
      });
    }
  };

  const handleSaveRatings = (ratings: CategoryRatings) => {
    const ratedVals = Object.values(ratings).filter((v) => typeof v === "number" && v > 0) as number[];
    const avg = ratedVals.length > 0 ? Math.round(ratedVals.reduce((a, b) => a + b, 0) / ratedVals.length) : dossierData.rating;
    persistDossierPatch({ categoryRatings: ratings, rating: avg });

    if (existingDrama) {
      updateDrama(existingDrama.id, { categoryRatings: ratings, rating: avg });
    } else if (existingAnime) {
      updateAnime(existingAnime.id, { categoryRatings: ratings, rating: avg });
    }
  };

  const handleSaveReview = (reviewMarkdown: string) => {
    persistDossierPatch({ reviewMarkdown });
    if (existingDrama) {
      updateDrama(existingDrama.id, { reviewMarkdown });
    } else if (existingAnime) {
      updateAnime(existingAnime.id, { reviewMarkdown });
    }
  };

  const handleSaveTimeline = (emotionalTimeline: DossierEmotionMilestone[]) => {
    persistDossierPatch({ emotionalTimeline });
    if (existingDrama) {
      updateDrama(existingDrama.id, { emotionalTimeline });
    } else if (existingAnime) {
      updateAnime(existingAnime.id, { emotionalTimeline });
    }
  };

  // Convert gallery string array to MemoryScreenshot objects
  const memoryScreenshots: MemoryScreenshot[] = useMemo(() => {
    const rawList = existingDrama?.gallery || localDossier.gallery || [];
    return rawList.map((item: any, i: number) => {
      if (typeof item === "string") {
        return {
          id: `shot-${i}`,
          url: item,
          caption: "Drama Memory Screenshot",
          episode: `Memory ${i + 1}`,
        };
      }
      return item;
    });
  }, [existingDrama?.gallery, localDossier.gallery]);

  const handleAddScreenshot = (shot: MemoryScreenshot) => {
    const current = localDossier.gallery || existingDrama?.gallery || [];
    const updated = [...current, shot.url];
    persistDossierPatch({ gallery: updated });
    if (existingDrama) {
      updateDrama(existingDrama.id, { gallery: updated } as any);
    } else if (existingAnime) {
      updateAnime(existingAnime.id, { gallery: updated } as any);
    }
  };

  const handleDeleteScreenshot = (shotId: string) => {
    const updatedScreenshots = memoryScreenshots.filter((s) => s.id !== shotId);
    const updatedUrls = updatedScreenshots.map((s) => s.url);
    persistDossierPatch({ gallery: updatedUrls });
    if (existingDrama) {
      updateDrama(existingDrama.id, { gallery: updatedUrls } as any);
    } else if (existingAnime) {
      updateAnime(existingAnime.id, { gallery: updatedUrls } as any);
    }
  };

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto pb-12">
        {loadingMetadata && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Loader2 size={14} className="animate-spin" />
            <span>Fetching live media metadata & voice actors...</span>
          </div>
        )}

        {/* 1. Hero Banner with Parallax Backdrop & Poster */}
        <DossierHero
          title={dossierData.title}
          originalTitle={dossierData.originalTitle}
          posterUrl={dossierData.posterUrl}
          backdropUrl={dossierData.backdropUrl}
          year={dossierData.year}
          country={dossierData.country}
          studio={dossierData.studio}
          genres={dossierData.genre ? dossierData.genre.split(",").map((g) => g.trim()) : []}
          runtime={dossierData.runtime}
          episodes={dossierData.episodes}
          episodesWatched={dossierData.episodesWatched}
          status={dossierData.status}
          rating={dossierData.rating}
          isFavorite={isFavorite}
          themeConfig={themeConfig}
          onToggleFavorite={handleToggleFavorite}
          onBack={() => router.back()}
        />

        {/* 2. Quick Statistics Bar */}
        <DossierStatsBar
          episodesWatched={dossierData.episodesWatched}
          totalEpisodes={dossierData.episodes}
          rating={dossierData.rating}
          startDate={dossierData.startDate}
          finishDate={dossierData.finishDate}
          rewatchCount={dossierData.rewatchCount}
          themeConfig={themeConfig}
        />

        {/* 3. Official Synopsis & Plot */}
        <DossierSynopsis synopsis={dossierData.synopsis} themeConfig={themeConfig} />

        {/* 4. My Personal Watch Journey Hub */}
        <DossierMyJourney
          startDate={dossierData.startDate}
          finishDate={dossierData.finishDate}
          status={dossierData.status}
          favoriteEpisode={dossierData.favoriteEpisode}
          favoriteCharacter={dossierData.favoriteCharacter}
          emotionalEpisode={dossierData.emotionalEpisode}
          mood={dossierData.mood}
          personalScore={dossierData.rating}
          wouldRewatch={dossierData.wouldRewatch}
          themeConfig={themeConfig}
          onSaveJourney={handleSaveJourney}
        />

        {/* 5. Character Spotlight & Cast */}
        <DossierCharacterSpotlight
          characters={dossierData.characters}
          castGrid={dossierData.castGrid}
          themeConfig={themeConfig}
        />

        {/* 6. Episode Navigator & Analytics */}
        <DossierEpisodeNavigator
          episodes={dossierData.episodeLog}
          totalEpisodes={dossierData.episodes}
          episodesWatched={dossierData.episodesWatched}
          themeConfig={themeConfig}
          onToggleEpisodeWatched={handleToggleEpisode}
        />

        {/* 7. Rating Breakdown Radar Chart */}
        <DossierRatingRadar
          ratings={dossierData.categoryRatings}
          themeConfig={themeConfig}
          onSaveRatings={handleSaveRatings}
        />

        {/* 8. Memory Gallery & Screenshots */}
        <DossierMemoryGallery
          screenshots={memoryScreenshots}
          themeConfig={themeConfig}
          onAddScreenshot={handleAddScreenshot}
          onDeleteScreenshot={handleDeleteScreenshot}
        />

        {/* 9. Emotional Milestone Timeline */}
        <DossierEmotionalTimeline
          timeline={dossierData.emotionalTimeline}
          themeConfig={themeConfig}
          onSaveTimeline={handleSaveTimeline}
        />

        {/* 10. Personal Review & Critique */}
        <DossierReviewEditor
          reviewMarkdown={dossierData.reviewMarkdown}
          themeConfig={themeConfig}
          onSaveReview={handleSaveReview}
        />

        {/* 11. External Resources & Soundtracks */}
        <DossierExternalLinks
          externalLinks={dossierData.externalLinks}
          ostTracks={dossierData.ostTracks}
          awards={dossierData.awards}
          studio={dossierData.studio}
          country={dossierData.country}
          themeConfig={themeConfig}
        />

        {/* Low Confidence Metadata Selection Dialog */}
        <MetadataConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          queryTitle={rawTitle}
          candidates={candidates}
          onSelectCandidate={handleSelectCandidate}
        />
      </div>
    </AppShell>
  );
}
