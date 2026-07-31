"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { useToast } from "@/components/ui/ToastProvider";

export function useRealtimeSync() {
  const { isHydrated } = useDashboardStore();
  const { toast } = useToast();

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
          if (eventType === "DELETE") {
            useDashboardStore.setState((state) => ({
              games: state.games.filter((g) => g.id !== oldRecord.id),
            }));
            toast({ type: "info", title: "Game Removed", message: "Removed from Games roster." });
            return;
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
            let isNew = false;
            useDashboardStore.setState((state) => {
              if (state.games.some((g) => g.id === mappedRecord.id)) return {};
              isNew = true;
              return { games: [...state.games, mappedRecord] };
            });
            if (isNew) {
              toast({ type: "success", title: "🎮 New Game Added", message: mappedRecord.game });
            }
          } else if (eventType === "UPDATE") {
            useDashboardStore.setState((state) => ({
              games: state.games.map((g) =>
                g.id === mappedRecord.id ? { ...g, ...mappedRecord } : g
              ),
            }));
            toast({ type: "info", title: "🎮 Game Updated", message: mappedRecord.game });
          }
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
          if (eventType === "DELETE") {
            useDashboardStore.setState((state) => ({
              animeList: state.animeList.filter((a) => a.id !== oldRecord.id),
            }));
            toast({ type: "info", title: "⛩️ Anime Removed", message: "Removed from list." });
            return;
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
            let isNew = false;
            useDashboardStore.setState((state) => {
              if (state.animeList.some((a) => a.id === mappedRecord.id)) return {};
              isNew = true;
              return { animeList: [...state.animeList, mappedRecord] };
            });
            if (isNew) {
              toast({ type: "success", title: "⛩️ Anime Added", message: mappedRecord.title });
            }
          } else if (eventType === "UPDATE") {
            useDashboardStore.setState((state) => ({
              animeList: state.animeList.map((a) =>
                a.id === mappedRecord.id ? { ...a, ...mappedRecord } : a
              ),
            }));
            toast({ type: "info", title: "⛩️ Anime Updated", message: mappedRecord.title });
          }
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
          if (eventType === "DELETE") {
            useDashboardStore.setState((state) => ({
              dramas: state.dramas.filter((d) => d.id !== oldRecord.id),
            }));
            toast({ type: "info", title: "🎬 Drama Removed", message: "Removed from drama list." });
            return;
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
            let isNew = false;
            useDashboardStore.setState((state) => {
              if (state.dramas.some((d) => d.id === mappedRecord.id)) return {};
              isNew = true;
              return { dramas: [...state.dramas, mappedRecord] };
            });
            if (isNew) {
              toast({ type: "success", title: "🎬 Drama Added", message: mappedRecord.title });
            }
          } else if (eventType === "UPDATE") {
            useDashboardStore.setState((state) => ({
              dramas: state.dramas.map((d) =>
                d.id === mappedRecord.id ? { ...d, ...mappedRecord } : d
              ),
            }));
            toast({ type: "info", title: "🎬 Drama Updated", message: mappedRecord.title });
          }
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
          toast({ type: "success", title: "👤 Profile Synced", message: "Your profile was updated remotely." });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(animeChannel);
      supabase.removeChannel(dramaChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [isHydrated, toast]);
}

