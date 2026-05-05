/**
 * Sofascore image URL helpers.
 *
 * Use backend proxy to fetch images from Sofascore and cache to Cloudinary.
 * The proxy handles Sofascore's blocking and caches images automatically.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Use backend proxy URLs — handles Sofascore fetching + Cloudinary caching
export const sofaTeamLogo = (apiTeamId: number | string) =>
  `${API_BASE}/api/ImageProxy/sofascore/team/${apiTeamId}`;

export const sofaPlayerPhoto = (apiPlayerId: number | string) =>
  `${API_BASE}/api/ImageProxy/sofascore/player/${apiPlayerId}`;

export const sofaTournamentLogo = (uniqueTournamentId: number | string, theme: 'dark' | 'light' = 'dark') =>
  `${API_BASE}/api/ImageProxy/sofascore/tournament/${uniqueTournamentId}/${theme}`;

/**
 * No-op function for backward compatibility.
 * Caching is now handled automatically by the backend proxy.
 */
export function cacheSofaImage(_type: 'team' | 'player' | 'tournament', _id: number | string, _theme?: 'dark' | 'light') {
  // Backend proxy handles caching automatically
}

/**
 * No-op function for backward compatibility.
 * No need for browser-side fallback since we use the backend proxy.
 */
export function setupSofascoreImageFallback() {
  // Backend proxy handles everything
}
