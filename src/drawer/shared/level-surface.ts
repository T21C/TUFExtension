import type { CSSProperties } from "react";

export const panelSurfaceClassName =
  "rounded-md border border-white/10 bg-black/35 shadow-[0_0_24px_rgba(168,85,247,0.16)] backdrop-blur-xl";

export const interactiveSurfaceClassName =
  "rounded-md border border-white/10 bg-black/35 text-white shadow-[0_0_16px_rgba(168,85,247,0.14)] backdrop-blur-md transition hover:bg-black/25";

export const mutedSurfaceClassName =
  "rounded-md border border-white/10 bg-black/25 text-white/35 backdrop-blur-md";

export const activeSurfaceClassName =
  "border-white/20 bg-black/30 shadow-[0_0_18px_rgba(168,85,247,0.34)]";

export const glowBorderStyle: CSSProperties = {
  borderColor: "rgba(168, 85, 247, 0.45)",
  boxShadow: "0 0 24px rgba(168, 85, 247, 0.2)",
};

export const softGlowBorderStyle: CSSProperties = {
  borderColor: "rgba(168, 85, 247, 0.32)",
  boxShadow: "0 0 14px rgba(168, 85, 247, 0.16)",
};

export const glowDividerStyle: CSSProperties = {
  background:
    "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.7), transparent)",
  boxShadow: "0 0 10px rgba(168, 85, 247, 0.45)",
};

export const verticalGlowDividerStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, transparent, rgba(168, 85, 247, 0.42), transparent)",
  boxShadow: "0 0 10px rgba(168, 85, 247, 0.24)",
};
