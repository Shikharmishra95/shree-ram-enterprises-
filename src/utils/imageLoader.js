// src/utils/imageLoader.js
export const getProductImage = (() => {
  // CRA/Webpack path: adjust folder to your images
  try {
    const ctx = require.context("../assets/product", false, /\.(png|jpe?g|webp|svg)$/i);
    const cache = {};
    return (nameOrPath) => {
      if (!nameOrPath) return "";
      const name = String(nameOrPath).replace(/^\.?\//, "");
      if (cache[name]) return cache[name];
      const key = "./" + name;          // e.g., "./garnier.png"
      try { return (cache[name] = ctx(key)); }
      catch { console.warn("Image missing:", name); return ""; }
    };
  } catch {
    // Vite fallback
    const modules = import.meta.glob("../assets/product/*", { eager: true });
    const map = {};
    Object.entries(modules).forEach(([p, m]) => { map[p.split("/").pop()] = m.default; });
    return (nameOrPath) => map[String(nameOrPath).split("/").pop()] || "";
  }
})();
