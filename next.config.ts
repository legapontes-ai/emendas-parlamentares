import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace neste projeto. Sem isto, o Next infere a raiz
  // pelo lockfile de C:\Users\pc e emite aviso (há múltiplos package-lock.json).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
