// src/utils/imageLoader.js
export const getProductImage = (() => {
  try {
    // ✅ Webpack/CRA support
    const ctx = require.context("../assets/product", false, /\.(png|jpe?g|webp|svg)$/i);
    const cache = {};
    return (nameOrPath) => {
      if (!nameOrPath) return "";
      const name = String(nameOrPath).replace(/^\.?\//, ""); // "12.jpg"
      if (cache[name]) return cache[name];
      const key = "./" + name;
      try {
        return (cache[name] = ctx(key));
      } catch {
        console.warn("⚠️ Image missing:", name);
        return "";
      }
    };
  } catch {
    // ✅ Vite fallback
    const modules = import.meta.glob("../assets/product/*", { eager: true });
    const map = {};
    Object.entries(modules).forEach(([p, m]) => {
      map[p.split("/").pop()] = m.default;
    });
    return (nameOrPath) => {
      const file = String(nameOrPath).split("/").pop();
      return map[file] || "";
    };
  }
})();
