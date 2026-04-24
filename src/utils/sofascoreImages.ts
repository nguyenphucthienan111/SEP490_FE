/**
 * Sofascore image URL helpers.
 *
 * Sofascore blocks server-side proxies (Azure IP bị block).
 * Browser load <img> trực tiếp từ Sofascore KHÔNG bị block.
 * Nên: dùng thẳng Sofascore URL cho src, đồng thời cache lên Cloudinary ngầm.
 * Khi Cloudinary đã có cache, BE sẽ redirect về Cloudinary thay vì Sofascore.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Trên localhost dùng direct URL (không bị block), trên production dùng Vercel proxy
const isDev = import.meta.env.DEV;
const sofaBase = isDev
  ? 'https://api.sofascore.app/api/v1'
  : '/sofascore-proxy';

export const sofaTeamLogo = (apiTeamId: number | string) =>
  `${sofaBase}/team/${apiTeamId}/image`;

export const sofaPlayerPhoto = (apiPlayerId: number | string) =>
  `${sofaBase}/player/${apiPlayerId}/image`;

export const sofaTournamentLogo = (uniqueTournamentId: number | string, theme: 'dark' | 'light' = 'dark') =>
  `${sofaBase}/unique-tournament/${uniqueTournamentId}/image/${theme}`;

// Track which IDs are being cached to avoid duplicate requests
const cachingInProgress = new Set<string>();

/**
 * Fetch ảnh từ Sofascore (browser không bị block),
 * convert sang base64, gửi lên BE để cache vào Cloudinary.
 */
async function cacheToBackend(type: string, id: string, theme?: string) {
  const key = theme ? `${type}/${id}/${theme}` : `${type}/${id}`;
  if (cachingInProgress.has(key)) return;
  cachingInProgress.add(key);

  try {
    const url =
      type === 'team' ? sofaTeamLogo(id) :
      type === 'player' ? sofaPlayerPhoto(id) :
      sofaTournamentLogo(id, (theme ?? 'dark') as 'dark' | 'light');

    // Dùng no-referrer để tránh bị block khi fetch lại
    const res = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!res.ok) return;

    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    await fetch(`${API_BASE}/api/ImageProxy/sofascore/cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id, theme: theme ?? null, dataUrl }),
    });
  } catch {
    // silent — caching is best-effort
  } finally {
    cachingInProgress.delete(key);
  }
}

/**
 * Gọi hàm này để cache ảnh lên Cloudinary ngầm (fire-and-forget).
 * Dùng trong useEffect hoặc sau khi ảnh load thành công.
 */
export function cacheSofaImage(type: 'team' | 'player' | 'tournament', id: number | string, theme?: 'dark' | 'light') {
  cacheToBackend(type, String(id), theme);
}

/**
 * Global setup — không cần thiết nữa vì đã dùng direct URL,
 * nhưng giữ lại để không break import trong main.tsx.
 */
export function setupSofascoreImageFallback() {
  // no-op: direct Sofascore URLs không cần fallback handler
}
