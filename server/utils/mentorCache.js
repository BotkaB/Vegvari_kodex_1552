const cache = new Map();

export const mentorCache = {
  get: (key) => cache.get(key),
  set: (key, value) => cache.set(key, value),
  clear: () => {
    cache.clear();
    console.log("🧹 [CACHE] A mentor gyorsítótár kiürítve.");
  }
};