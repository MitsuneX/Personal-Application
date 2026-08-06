/**
 * Music Offline Storage — IndexedDB-backed audio cache
 *
 * Stores audio blobs for offline playback. YouTube tracks cannot
 * be stored due to ToS; only direct-URL songs are eligible.
 */

const DB_NAME = "MusicVaultOffline";
const DB_VERSION = 1;
const STORE_NAME = "audioCache";

interface OfflineTrackMeta {
  songId: string;
  title: string;
  artist: string;
  imageUrl?: string;
  duration?: string;
  audioUrl: string;
  cachedAt: number; // epoch ms
  sizeBytes: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "songId" });
        store.createIndex("cachedAt", "cachedAt", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Saves an audio blob to IndexedDB for offline playback.
 */
export async function cacheAudioOffline(
  song: OfflineTrackMeta,
  blob: Blob
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ ...song, blob, sizeBytes: blob.size });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Returns the cached audio blob for a songId, or null if not cached.
 */
export async function getCachedAudio(
  songId: string
): Promise<{ blob: Blob; meta: OfflineTrackMeta } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(songId);
    req.onsuccess = () => {
      const result = req.result;
      if (!result) {
        resolve(null);
        return;
      }
      const { blob, ...meta } = result;
      resolve({ blob, meta: meta as OfflineTrackMeta });
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Returns the object URL of a cached song, creating one from the blob.
 * Caller is responsible for revoking the URL when done.
 */
export async function getCachedAudioUrl(
  songId: string
): Promise<string | null> {
  const cached = await getCachedAudio(songId);
  if (!cached) return null;
  return URL.createObjectURL(cached.blob);
}

/**
 * Removes a cached song from IndexedDB.
 */
export async function removeCachedAudio(songId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(songId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Lists all cached songs with their metadata (excluding blobs).
 */
export async function listCachedSongs(): Promise<OfflineTrackMeta[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const results = (req.result || []).map(({ blob: _blob, ...meta }: any) => meta as OfflineTrackMeta);
      resolve(results.sort((a, b) => b.cachedAt - a.cachedAt));
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Checks if a specific songId is already cached offline.
 */
export async function isSongCached(songId: string): Promise<boolean> {
  const cached = await getCachedAudio(songId);
  return cached !== null;
}

/**
 * Returns the total size in bytes of all cached audio.
 */
export async function getCacheStorageSize(): Promise<number> {
  const all = await listCachedSongs();
  return all.reduce((acc, m) => acc + m.sizeBytes, 0);
}

/**
 * Clears all cached audio from IndexedDB.
 */
export async function clearAllCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
