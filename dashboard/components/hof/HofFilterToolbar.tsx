import { HofMultiSelectGameFilter } from "./HofMultiSelectGameFilter";

interface HofFilterToolbarProps {
  isCyber: boolean;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  selectedGames?: string[];
  setSelectedGames?: (selected: string[]) => void;
  featuredOnly?: boolean;
  setFeaturedOnly?: (v: boolean) => void;
  games?: Array<{ id: string; game: string }>;
  gameCharacters?: Array<{ gameId?: string; gameName?: string }>;
  countryFilter: string;
  setCountryFilter: (v: string) => void;
  professionFilter: string;
  setProfessionFilter: (v: string) => void;
  seasonFilter: string;
  setSeasonFilter: (v: string) => void;
  prestigeFilter: string;
  setPrestigeFilter: (v: string) => void;
  sortFilter: string;
  setSortFilter: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onReset: () => void;
}

export function HofFilterToolbar({
  isCyber,
  categoryFilter,
  setCategoryFilter,
  selectedGames = [],
  setSelectedGames,
  featuredOnly = false,
  setFeaturedOnly,
  games = [],
  gameCharacters = [],
  countryFilter,
  setCountryFilter,
  professionFilter,
  setProfessionFilter,
  seasonFilter,
  setSeasonFilter,
  prestigeFilter,
  setPrestigeFilter,
  sortFilter,
  setSortFilter,
  searchQuery,
  setSearchQuery,
  onReset,
}: HofFilterToolbarProps) {
  const isFiltered =
    (categoryFilter as string) !== "all" ||
    (categoryFilter === "game" && selectedGames.length > 0) ||
    featuredOnly ||
    countryFilter !== "all" ||
    professionFilter !== "all" ||
    seasonFilter !== "all" ||
    prestigeFilter !== "all" ||
    sortFilter !== "likes" ||
    searchQuery.trim() !== "";

  return (
    <div
      className="p-5 rounded-3xl border space-y-4 font-mono text-xs shadow-xl transition-all"
      style={{
        backgroundColor: isCyber ? "rgba(10,15,36,0.7)" : "#FFFFFF",
        borderColor: isCyber ? "rgba(255,215,0,0.3)" : "#000000",
        borderWidth: isCyber ? "1.5px" : "3px",
        boxShadow: isCyber ? "0 0 25px rgba(255,215,0,0.08)" : "5px 5px 0 #000000",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3" style={{ borderColor: isCyber ? "rgba(255,255,255,0.1)" : "#E2E8F0" }}>
        <div className="flex items-center gap-2">
          <span className="text-sm">🏛️</span>
          <h3 className="font-black text-sm uppercase tracking-wider theme-text-primary">
            Museum Showcase Controls
          </h3>
        </div>

        {isFiltered && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all cursor-pointer"
          >
            Reset Filters ✕
          </button>
        )}
      </div>

      {/* Dropdown Toolbar Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Featured Only Toggle Button */}
        {setFeaturedOnly && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase theme-text-muted block">Featured ⭐</label>
            <button
              type="button"
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                featuredOnly
                  ? (isCyber ? "bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]" : "bg-yellow-300 text-black border-black shadow-[2px_2px_0_#000]")
                  : (isCyber ? "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10" : "bg-gray-100 text-gray-700 border-gray-300")
              }`}
            >
              <span>⭐</span>
              <span>{featuredOnly ? "Featured Only" : "All Items"}</span>
            </button>
          </div>
        )}

        {/* Category Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase theme-text-muted block">Category ▼</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
              color: isCyber ? "#FFF" : "#000",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
            }}
          >
            <option value="all">All Categories</option>
            <option value="drama">🎭 Drama</option>
            <option value="anime">⛩️ Anime</option>
            <option value="movie">🎬 Movie</option>
            <option value="tokusatsu">🦸 Tokusatsu</option>
            <option value="music">🎵 Music</option>
            <option value="game">🎮 Game</option>
          </select>
        </div>

        {/* Dynamic Multi-Select Game Filter (Revealed when Category === "game") */}
        {categoryFilter === "game" && setSelectedGames && (
          <HofMultiSelectGameFilter
            isCyber={isCyber}
            games={games}
            gameCharacters={gameCharacters}
            selectedGames={selectedGames}
            onChangeSelectedGames={setSelectedGames}
          />
        )}

        {/* Country Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase theme-text-muted block">Country ▼</label>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
              color: isCyber ? "#FFF" : "#000",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
            }}
          >
            <option value="all">All Countries</option>
            <option value="Korea">🇰🇷 Korea</option>
            <option value="Japan">🇯🇵 Japan</option>
            <option value="China">🇨🇳 China</option>
            <option value="Hollywood">🎬 Hollywood</option>
            <option value="Indonesia">🇮🇩 Indonesia</option>
          </select>
        </div>

        {/* Profession Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase theme-text-muted block">Profession ▼</label>
          <select
            value={professionFilter}
            onChange={(e) => setProfessionFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
              color: isCyber ? "#FFF" : "#000",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
            }}
          >
            <option value="all">All Professions</option>
            <option value="actor">🎭 Actor</option>
            <option value="actress">💫 Actress</option>
            <option value="singer">🎤 Singer</option>
            <option value="anime">⛩️ Anime Character</option>
            <option value="tokusatsu">🦸 Suit Actor</option>
          </select>
        </div>

        {/* Season Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase theme-text-muted block">Season ▼</label>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
              color: isCyber ? "#FFF" : "#000",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
            }}
          >
            <option value="all">Overall Legacy</option>
            <option value="s2026">2026 Season</option>
            <option value="s2025">2025 Season</option>
            <option value="monthly">Monthly Peak</option>
            <option value="community">Community Choice</option>
          </select>
        </div>

        {/* Prestige Tier Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase theme-text-muted block">Prestige ▼</label>
          <select
            value={prestigeFilter}
            onChange={(e) => setPrestigeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
              color: isCyber ? "#FFF" : "#000",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
            }}
          >
            <option value="all">All Prestige Tiers</option>
            <option value="Eternal Legend">👑 Eternal Legend</option>
            <option value="Mythic Legend">🔮 Mythic Legend</option>
            <option value="Diamond Legend">💎 Diamond Legend</option>
            <option value="Gold Legend">🥇 Gold Legend</option>
            <option value="Silver Legend">🥈 Silver Legend</option>
            <option value="Bronze Legend">🥉 Bronze Legend</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase theme-text-muted block">Sort ▼</label>
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold cursor-pointer"
            style={{
              backgroundColor: isCyber ? "rgba(255,255,255,0.08)" : "#F8FAFC",
              color: isCyber ? "#FFF" : "#000",
              borderColor: isCyber ? "rgba(255,255,255,0.2)" : "#000",
            }}
          >
            <option value="likes">❤️ Most Liked</option>
            <option value="name">🔤 Name (A-Z)</option>
            <option value="works">🎬 Most Works</option>
          </select>
        </div>
      </div>

      {/* Live Search */}
      <div className="w-full pt-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search museum archives for legend or masterpiece..."
          className="w-full px-4 py-2.5 rounded-2xl border text-xs font-mono focus:outline-none transition-all"
          style={{
            backgroundColor: isCyber ? "rgba(255,255,255,0.05)" : "#FFFFFF",
            color: isCyber ? "#FFF" : "#000",
            borderColor: isCyber ? "rgba(255,215,0,0.4)" : "#000000",
            borderWidth: isCyber ? "1px" : "2px",
          }}
        />
      </div>
    </div>
  );
}
