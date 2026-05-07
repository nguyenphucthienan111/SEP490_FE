/**
 * Sofascore image URL helpers.
 *
 * Browser fetches directly from Sofascore (server IPs are blocked, browsers are not).
 * After successful load, images are cached to Cloudinary as backup.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Direct Sofascore URLs — browser can access these fine
export const sofaTeamLogo = (apiTeamId: number | string) =>
  `https://api.sofascore.app/api/v1/team/${apiTeamId}/image`;

export const sofaPlayerPhoto = (apiPlayerId: number | string) =>
  `https://api.sofascore.app/api/v1/player/${apiPlayerId}/image`;

export const sofaTournamentLogo = (uniqueTournamentId: number | string, theme: 'dark' | 'light' = 'dark') =>
  `https://api.sofascore.app/api/v1/unique-tournament/${uniqueTournamentId}/image/${theme}`;

// Cloudinary fallback URLs (used when Sofascore is blocked)
export const cloudinaryTeamLogo = (apiTeamId: number | string) =>
  `${API_BASE}/api/ImageProxy/sofascore/team/${apiTeamId}`;

export const cloudinaryPlayerPhoto = (apiPlayerId: number | string) =>
  `${API_BASE}/api/ImageProxy/sofascore/player/${apiPlayerId}`;

export const cloudinaryTournamentLogo = (uniqueTournamentId: number | string, theme: 'dark' | 'light' = 'dark') =>
  `${API_BASE}/api/ImageProxy/sofascore/tournament/${uniqueTournamentId}/${theme}`;

// Track which IDs have already been queued for caching (avoid duplicate calls)
const _cacheQueued = new Set<string>();

/**
 * After an image loads successfully from Sofascore, call this to cache it to Cloudinary.
 * FE fetches the image (browser not blocked) and sends base64 to BE for Cloudinary upload.
 * Fire-and-forget — won't affect UI.
 */
export function cacheSofaImage(type: 'team' | 'player' | 'tournament', id: number | string, theme?: 'dark' | 'light') {
  const key = theme ? `${type}/${id}/${theme}` : `${type}/${id}`;
  if (_cacheQueued.has(key)) return;
  _cacheQueued.add(key);

  const sofaUrl = type === 'team'
    ? `https://api.sofascore.app/api/v1/team/${id}/image`
    : type === 'player'
    ? `https://api.sofascore.app/api/v1/player/${id}/image`
    : `https://api.sofascore.app/api/v1/unique-tournament/${id}/image/${theme ?? 'dark'}`;

  // Fetch ảnh từ Sofascore (browser không bị block), convert sang base64, gửi lên BE
  fetch(sofaUrl)
    .then(res => {
      if (!res.ok) return;
      return res.blob();
    })
    .then(blob => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        fetch(`${API_BASE}/api/ImageProxy/sofascore/cache`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, id: String(id), theme: theme ?? null, dataUrl }),
        }).catch(() => { /* silent fail */ });
      };
      reader.readAsDataURL(blob);
    })
    .catch(() => { /* silent fail */ });
}

export function setupSofascoreImageFallback() {
  // Capture phase — bắt tất cả load/error của <img> trong toàn app
  document.addEventListener('load', (e) => {
    const img = e.target as HTMLImageElement;
    if (img.tagName !== 'IMG') return;
    const src = img.src ?? '';
    if (!src.includes('api.sofascore.app')) return;
    const match = src.match(/api\.sofascore\.app\/api\/v1\/(team|player|unique-tournament)\/(\d+)\/image\/?(\w+)?/);
    if (!match) return;
    const rawType = match[1];
    const id = match[2];
    const theme = match[3] as 'dark' | 'light' | undefined;
    const type = rawType === 'unique-tournament' ? 'tournament' : rawType as 'team' | 'player';
    // Cache lên Cloudinary sau khi load thành công
    cacheSofaImage(type, id, theme);
  }, true);

  document.addEventListener('error', (e) => {
    const img = e.target as HTMLImageElement;
    if (img.tagName !== 'IMG') return;
    const src = img.src ?? '';
    // Chỉ fallback khi đang load từ Sofascore — nếu đã là BE proxy hoặc Cloudinary thì dừng
    if (!src.includes('api.sofascore.app')) return;
    const match = src.match(/api\.sofascore\.app\/api\/v1\/(team|player|unique-tournament)\/(\d+)\/image\/?(\w+)?/);
    if (!match) return;
    const rawType = match[1];
    const id = match[2];
    const theme = match[3];
    const proxyType = rawType === 'unique-tournament' ? 'tournament' : rawType;
    const fallbackUrl = theme
      ? `${API_BASE}/api/ImageProxy/sofascore/${proxyType}/${id}/${theme}`
      : `${API_BASE}/api/ImageProxy/sofascore/${proxyType}/${id}`;
    // Đánh dấu để tránh loop: nếu BE proxy cũng fail thì img sẽ ẩn đi
    img.dataset.fallbackAttempted = '1';
    img.onerror = () => { img.style.display = 'none'; };
    img.src = fallbackUrl;
  }, true);
}

/**
 * Helper để dùng inline trong onLoad của <img>.
 * Tự detect type/id từ src URL của Sofascore.
 * Usage: <img src={sofaTeamLogo(id)} onLoad={onLoadCache} ... />
 */
export function onLoadCache(e: React.SyntheticEvent<HTMLImageElement>) {
  const src = e.currentTarget.src;
  // Match: https://api.sofascore.app/api/v1/{type}/{id}/image[/{theme}]
  const match = src.match(/api\.sofascore\.app\/api\/v1\/(team|player|unique-tournament)\/(\d+)\/image\/?(\w+)?/);
  if (!match) return;
  const rawType = match[1];
  const id = match[2];
  const theme = match[3] as 'dark' | 'light' | undefined;
  const type = rawType === 'unique-tournament' ? 'tournament' : rawType as 'team' | 'player';
  cacheSofaImage(type, id, theme);
}
