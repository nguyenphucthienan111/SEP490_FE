import { User } from "lucide-react";
import { FullLoadoutDto } from "@/services/cosmeticService";
import { userService } from "@/services/userService";

interface Props {
  avatarUrl?: string | null;
  username?: string;
  size?: number; // px
  loadout?: FullLoadoutDto | null;
  className?: string;
}

function getFrameStyle(framePreview?: string | null): React.CSSProperties {
  if (!framePreview) return {};
  if (framePreview === "animated-gradient-border" || framePreview === "holographic-border") {
    return {
      border: "3px solid transparent",
      background: "linear-gradient(#1a1a2e,#1a1a2e) padding-box, linear-gradient(45deg,#FF4444,#F59E0B,#22C55E,#3B82F6,#A855F7) border-box",
    };
  }
  const style: React.CSSProperties = {};
  framePreview.split(";").forEach(rule => {
    const [prop, val] = rule.split(":").map(s => s.trim());
    if (!prop || !val) return;
    const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof React.CSSProperties;
    (style as any)[camel] = val;
  });
  return style;
}

const BADGE_ICONS: Record<string, string> = {
  soccer: "⚽", target: "🎯", crown: "👑", star: "🌟",
  zap: "⚡", lion: "🦁", trophy: "🏆", king: "👑", diamond: "💎",
};

// Effect overlay rendered around/on avatar
function EffectOverlay({ effect, size }: { effect: string; size: number }) {
  const particles: Record<string, { emoji: string; count: number; color: string }> = {
    "effect-confetti":      { emoji: "🎊", count: 4, color: "#FF4444" },
    "effect-bouncing-ball": { emoji: "⚽", count: 3, color: "#22C55E" },
    "effect-fire":          { emoji: "🔥", count: 4, color: "#F97316" },
    "effect-lightning":     { emoji: "⚡", count: 3, color: "#F59E0B" },
    "effect-diamonds":      { emoji: "💎", count: 4, color: "#00D9FF" },
  };

  const cfg = particles[effect];
  if (!cfg) return null;

  const positions = [
    { top: -8, left: -8 },
    { top: -8, right: -8 },
    { bottom: -8, left: -8 },
    { bottom: -8, right: -8 },
    { top: "50%", left: -10 },
  ].slice(0, cfg.count);

  return (
    <>
      {positions.map((pos, i) => (
        <span
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            ...pos,
            fontSize: size * 0.22,
            animation: `bounce ${0.8 + i * 0.2}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.15}s`,
            zIndex: 10,
          }}
        >
          {cfg.emoji}
        </span>
      ))}
    </>
  );
}

export function UserAvatar({ avatarUrl, username, size = 40, loadout, className = "" }: Props) {
  const frameStyle = getFrameStyle(loadout?.framePreview);
  const badge = loadout?.badgePreview ? (BADGE_ICONS[loadout.badgePreview] ?? loadout.badgePreview) : null;
  const effect = loadout?.effectPreview ?? null;
  const resolvedUrl = userService.getAvatarUrl(avatarUrl);

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {/* Effect particles */}
      {effect && <EffectOverlay effect={effect} size={size} />}

      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#00D9FF]/20 to-[#00D9FF]/5"
        style={{ ...frameStyle, borderRadius: "50%" }}
      >
        {resolvedUrl
          ? <img src={resolvedUrl} alt={username ?? "avatar"} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          : <User className="text-[#00D9FF]" style={{ width: size * 0.5, height: size * 0.5 }} />
        }
      </div>

      {/* Badge */}
      {badge && (
        <span
          className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow"
          style={{ fontSize: size * 0.3, width: size * 0.4, height: size * 0.4 }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/** Render username with nameColor cosmetic applied */
export function UserDisplayName({ username, loadout, className = "" }: { username: string; loadout?: FullLoadoutDto | null; className?: string }) {
  const preview = loadout?.nameColorPreview;
  if (!preview) return <span className={className}>{username}</span>;

  const isGradient = preview.startsWith("linear-gradient");
  if (isGradient) {
    return (
      <span className={className} style={{ background: preview, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
        {username}
      </span>
    );
  }
  return <span className={className} style={{ color: preview }}>{username}</span>;
}
