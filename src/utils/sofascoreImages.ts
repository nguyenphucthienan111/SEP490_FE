/**
 * Sofascore image URL helpers.
 *
 * Sofascore blocks server-side proxies (Azure IP bị block).
 * Browser load <img> trực tiếp từ Sofascore KHÔNG bị block.
 * Nên: dùng thẳng Sofascore URL cho src, đồng thời cache lên Cloudinary ngầm.
 * Khi Cloudinary đã có cache, BE sẽ redirect về Cloudinary thay vì Sofascore.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Dùng thẳng Sofascore URL — browser fetch với referrerPolicy="no-referrer" không bị block
export const sofaTeamLogo = (apiTeamId: number | string) =>
  `https://api.sofascore.app/api/v1/team/${apiTeamId}/image`;

export const sofaPlayerPhoto = (apiPlayerId: number | string) =>
  `https://api.sofascore.app/api/v1/player/${apiPlayerId}/image`;

export const sofaTournamentLogo = (uniqueTournamentId: number | string, theme: 'dark' | 'light' = 'dark') =>
  `https://api.sofascore.app/api/v1/unique-tournament/${uniqueTournamentId}/image/${theme}`;

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

    // Browser fetch với no-referrer — không bị Sofascore block
    const res = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!res.ok) return;

    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // Gửi base64 lên BE để upload lên Cloudinary
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
 * Global setup — observe DOM để tự động cache ảnh Sofascore lên Cloudinary
 * khi bất kỳ <img src="https://api.sofascore.app/..."> nào được render.
 */
export function setupSofascoreImageFallback() {
  if (typeof window === 'undefined') return;

  const SOFA_PATTERN = /api\.sofascore\.app\/api\/v1\/(team|player|unique-tournament)\/(\d+)\/image(?:\/(dark|light))?/;

  function tryCache(img: HTMLImageElement) {
    const src = img.src;
    const m = src.match(SOFA_PATTERN);
    if (!m) return;
    const rawType = m[1];
    const id = m[2];
    const theme = m[3] as 'dark' | 'light' | undefined;
    const type = rawType === 'unique-tournament' ? 'tournament' : rawType as 'team' | 'player';
    cacheSofaImage(type, id, theme);
  }

  // Cache ảnh đã có sẵn trên DOM
  function scanExisting() {
    document.querySelectorAll<HTMLImageElement>('img[src*="sofascore"]').forEach(tryCache);
  }

  // Observe DOM changes để cache ảnh mới được thêm vào
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLImageElement && node.src.includes('sofascore')) {
          tryCache(node);
        } else if (node instanceof Element) {
          node.querySelectorAll<HTMLImageElement>('img[src*="sofascore"]').forEach(tryCache);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Scan sau khi trang load xong
  if (document.readyState === 'complete') {
    scanExisting();
  } else {
    window.addEventListener('load', scanExisting);
  }
}
