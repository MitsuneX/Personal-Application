"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useDashboardStore, DramaEntry } from "@/lib/store/dashboardStore";
import { resolveDossierTheme } from "@/components/dossier/DossierThemeAccent";
import { DossierHero } from "@/components/dossier/DossierHero";
import { DossierStatsBar } from "@/components/dossier/DossierStatsBar";
import { DossierSynopsis } from "@/components/dossier/DossierSynopsis";
import { DossierMyJourney } from "@/components/dossier/DossierMyJourney";
import { DossierCharacterSpotlight } from "@/components/dossier/DossierCharacterSpotlight";
import { DossierEpisodeNavigator } from "@/components/dossier/DossierEpisodeNavigator";
import { DossierRatingRadar } from "@/components/dossier/DossierRatingRadar";
import { DossierMemoryGallery } from "@/components/dossier/DossierMemoryGallery";
import { DossierEmotionalTimeline } from "@/components/dossier/DossierEmotionalTimeline";
import { DossierReviewEditor } from "@/components/dossier/DossierReviewEditor";
import { DossierExternalLinks } from "@/components/dossier/DossierExternalLinks";

export default function DramaDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { dramas, dramaLog, updateDrama } = useDashboardStore();

  const dramaId = resolvedParams.id;

  // Search existing drama entry or log
  const existingDrama = dramas.find((d) => d.id === dramaId) || dramas.find((d) => d.title.toLowerCase().replace(/\s+/g, "-") === dramaId);
  const existingLog = dramaLog.find((d) => d.id === dramaId);

  // Default fallback data if ID is new
  const dossierData: DramaEntry = existingDrama || {
    id: dramaId,
    title: existingLog?.title || "Moving",
    originalTitle: "무빙 (Moving)",
    country: (existingLog?.country as any) || "korean",
    episodes: existingLog?.totalEpisodes || 20,
    episodesWatched: existingLog?.episodesWatched || 20,
    status: "Completed",
    rating: existingLog?.rating ? Number(existingLog.rating) : 9.8,
    genre: existingLog?.type || "Superhero, Action, Romance, Mystery",
    year: existingLog?.releaseYear || 2023,
    platform: "Disney+",
    posterUrl: existingLog?.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    synopsis: existingLog?.plotSummary || "Children who live with superpowered abilities hidden from society, along with their parents who harbor painful secrets from their past, face huge dangers together across time.",
    studio: "Studio FINECUT / Disney+ Original",
    runtime: "60 mins / Episode",
    startDate: "2023-08-09",
    finishDate: "2023-09-20",
    rewatchCount: 2,
    favoriteEpisode: "Episode 13 (Namsan Pork Cutlet)",
    favoriteCharacter: "Kim Bong-seok & Jang Ju-won",
    emotionalEpisode: "Episode 12 (Parent Backstory)",
    mood: "Hyped, Nostalgic & Emotional",
    wouldRewatch: true,
  };

  const themeConfig = resolveDossierTheme(dossierData.country, dossierData.genre);
  const [isFavorite, setIsFavorite] = useState(dossierData.isFavorite ?? true);

  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    if (existingDrama) {
      updateDrama(existingDrama.id, { isFavorite: next });
    }
  };

  const handleSaveJourney = (updated: any) => {
    if (existingDrama) {
      updateDrama(existingDrama.id, updated);
    }
  };

  const handleToggleEpisode = (epNum: number) => {
    if (existingDrama) {
      const nextWatched = Math.max(dossierData.episodesWatched, epNum);
      updateDrama(existingDrama.id, { episodesWatched: nextWatched });
    }
  };

  return (
    <AppShell>
      <div className="w-full max-w-7xl mx-auto pb-12">
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
        <DossierRatingRadar ratings={dossierData.categoryRatings} themeConfig={themeConfig} />

        {/* 8. Memory Gallery & Screenshots */}
        <DossierMemoryGallery themeConfig={themeConfig} />

        {/* 9. Emotional Milestone Timeline */}
        <DossierEmotionalTimeline timeline={dossierData.emotionalTimeline} themeConfig={themeConfig} />

        {/* 10. Personal Review & Critique */}
        <DossierReviewEditor reviewMarkdown={dossierData.reviewMarkdown} themeConfig={themeConfig} />

        {/* 11. External Resources & Soundtracks */}
        <DossierExternalLinks
          externalLinks={dossierData.externalLinks}
          ostTracks={dossierData.ostTracks}
          awards={dossierData.awards}
          studio={dossierData.studio}
          country={dossierData.country}
          themeConfig={themeConfig}
        />
      </div>
    </AppShell>
  );
}
