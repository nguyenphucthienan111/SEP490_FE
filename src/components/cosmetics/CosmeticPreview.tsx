import { CosmeticItemDto } from "@/services/cosmeticService";

interface Props {
  item: CosmeticItemDto;
  size?: "sm" | "md" | "lg";
}

const BADGE_ICONS: Record<string, string> = {
  soccer: "⚽", target: "🎯", crown: "👑", star: "🌟",
  zap: "⚡", lion: "🦁", trophy: "🏆", king: "👑", diamond: "💎",
};

export function CosmeticPreview({ item, size = "md" }: Props) {
  const sz = size === "lg" ? 56 : size === "md" ? 40 : 28;
  const preview = item.previewData ?? "";

  if (item.category === "nameColor") {
    const isGradient = preview.startsWith("linear-gradient");
    return (
      <span className="font-bold text-base truncate px-2"
        style={isGradient
          ? { background: preview, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
          : { color: preview }}>
        Tên bạn
      </span>
    );
  }

  if (item.category === "frame") {
    const isAnimated = preview === "animated-gradient-border";
    const isHolo = preview === "holographic-border";
    return (
      <div className="relative" style={{ width: sz, height: sz }}>
        <div className="w-full h-full rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center overflow-hidden"
          style={isAnimated
            ? { border: "3px solid transparent", background: "linear-gradient(#1a1a2e,#1a1a2e) padding-box, linear-gradient(45deg,#FF4444,#F59E0B,#22C55E,#3B82F6) border-box" }
            : isHolo
            ? { border: "3px solid transparent", background: "linear-gradient(#1a1a2e,#1a1a2e) padding-box, linear-gradient(45deg,#FF4444,#F59E0B,#22C55E,#3B82F6,#A855F7) border-box" }
            : { cssText: preview } as any}>
          <span className="text-lg">👤</span>
        </div>
      </div>
    );
  }

  if (item.category === "badge") {
    const emoji = BADGE_ICONS[preview] ?? preview;
    return <span style={{ fontSize: sz * 0.7 }}>{emoji}</span>;
  }

  if (item.category === "banner") {
    const gradients: Record<string, string> = {
      "bg-green-field": "linear-gradient(135deg,#166534,#22C55E)",
      "bg-stadium-night": "linear-gradient(135deg,#0f172a,#1e3a5f)",
      "bg-confetti": "linear-gradient(135deg,#FF4444,#F59E0B,#22C55E)",
      "bg-animated-stars": "linear-gradient(135deg,#0f172a,#4c1d95)",
      "bg-holographic": "linear-gradient(135deg,#FF4444,#F59E0B,#22C55E,#3B82F6,#A855F7)",
    };
    const bg = gradients[preview]
      ?? (preview.startsWith("linear-gradient") || preview.startsWith("#") || preview.startsWith("rgb") ? preview : "#334155");
    return (
      <div className="w-full h-full rounded-lg" style={{ background: bg, minHeight: 40 }} />
    );
  }

  if (item.category === "effect") {
    const effectEmojis: Record<string, string> = {
      "effect-confetti": "🎊", "effect-bouncing-ball": "⚽", "effect-fire": "🔥",
      "effect-lightning": "⚡", "effect-diamonds": "💎",
    };
    return <span style={{ fontSize: sz * 0.7 }}>{effectEmojis[preview] ?? "✨"}</span>;
  }

  if (item.category === "card") {
    const cardStyles: Record<string, React.CSSProperties> = {
      "card-silver": { background: "linear-gradient(135deg,#94a3b8,#cbd5e1)", borderRadius: 8 },
      "card-gold": { background: "linear-gradient(135deg,#F59E0B,#FCD34D)", borderRadius: 8 },
      "card-holographic": { background: "linear-gradient(135deg,#FF4444,#F59E0B,#22C55E,#3B82F6)", borderRadius: 8 },
      "card-animated": { background: "linear-gradient(135deg,#7C3AED,#EC4899,#F59E0B)", borderRadius: 8 },
    };
    return <div style={{ width: sz * 1.4, height: sz, ...(cardStyles[preview] ?? {}) }} />;
  }

  return <span className="text-2xl">🎁</span>;
}
