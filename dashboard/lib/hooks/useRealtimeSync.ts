"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDashboardStore } from "@/lib/store/dashboardStore";

export function useRealtimeSync() {
  const { isHydrated, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    if (!isHydrated) return;

    const supabase = createClient();

    // ─── Game Realtime Channel ───
    const gameChannel = supabase
      .channel("game-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Game" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          useDashboardStore.setState((state) => {
            if (eventType === "DELETE") {
              return { games: state.games.filter((g) => g.id !== oldRecord.id) };
            }
            const mappedRecord = {
              id: newRecord.id,
              game: newRecord.game,
              handle: newRecord.handle ?? undefined,
              platform: newRecord.platform,
              rank: newRecord.rank ?? undefined,
              mainCharacter: newRecord.mainCharacter,
              mainRole: newRecord.mainRole ?? undefined,
              category: newRecord.category,
              isActive: newRecord.isActive,
              accentColor: newRecord.accentColor,
              profileLink: newRecord.profileLink ?? undefined,
              icon: newRecord.icon ?? undefined,
            };
            if (eventType === "INSERT") {
              if (state.games.some((g) => g.id === mappedRecord.id)) return {};
              return { games: [...state.games, mappedRecord] };
            }
            if (eventType === "UPDATE") {
              return {
                games: state.games.map((g) =>
                  g.id === mappedRecord.id ? { ...g, ...mappedRecord } : g
                ),
              };
            }
            return {};
          });
        }
      )
      .subscribe();

    // ─── Anime Realtime Channel ───
    const animeChannel = supabase
      .channel("anime-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Anime" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          useDashboardStore.setState((state) => {
            if (eventType === "DELETE") {
              return { animeList: state.animeList.filter((a) => a.id !== oldRecord.id) };
            }
            const mappedRecord = {
              id: newRecord.id,
              title: newRecord.title,
              episodesWatched: newRecord.episodesWatched,
              totalEpisodes: newRecord.totalEpisodes,
              status: newRecord.status,
              rating: newRecord.rating ?? undefined,
              genre: newRecord.genre ?? undefined,
              studio: newRecord.studio ?? undefined,
              year: newRecord.year ?? undefined,
            };
            if (eventType === "INSERT") {
              if (state.animeList.some((a) => a.id === mappedRecord.id)) return {};
              return { animeList: [...state.animeList, mappedRecord] };
            }
            if (eventType === "UPDATE") {
              return {
                animeList: state.animeList.map((a) =>
                  a.id === mappedRecord.id ? { ...a, ...mappedRecord } : a
                ),
              };
            }
            return {};
          });
        }
      )
      .subscribe();

    // ─── Drama Realtime Channel ───
    const dramaChannel = supabase
      .channel("drama-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Drama" },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          useDashboardStore.setState((state) => {
            if (eventType === "DELETE") {
              return { dramas: state.dramas.filter((d) => d.id !== oldRecord.id) };
            }
            const mappedRecord = {
              id: newRecord.id,
              title: newRecord.title,
              country: newRecord.country,
              episodes: newRecord.episodes,
              episodesWatched: newRecord.episodesWatched,
              status: newRecord.status,
              rating: newRecord.rating,
              genre: newRecord.genre,
              year: newRecord.year,
              platform: newRecord.platform ?? undefined,
              cast: newRecord.cast ?? [],
            };
            if (eventType === "INSERT") {
              if (state.dramas.some((d) => d.id === mappedRecord.id)) return {};
              return { dramas: [...state.dramas, mappedRecord] };
            }
            if (eventType === "UPDATE") {
              return {
                dramas: state.dramas.map((d) =>
                  d.id === mappedRecord.id ? { ...d, ...mappedRecord } : d
                ),
              };
            }
            return {};
          });
        }
      )
      .subscribe();

    // ─── Profile Realtime Channel ───
    const profileChannel = supabase
      .channel("profile-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Profile" },
        (payload) => {
          const { new: newRecord } = payload;
          useDashboardStore.setState((state) => ({
            profile: {
              ...state.profile,
              ...newRecord,
            },
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(animeChannel);
      supabase.removeChannel(dramaChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [isHydrated]);
}
