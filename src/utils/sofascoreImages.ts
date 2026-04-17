/**
 * Sofascore image URL helpers.
 *
 * Sofascore blocks hotlinking from external domains (Hotlink Protection),
 * so images break on Vercel. We proxy them through our own BE to fix this.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const sofaTeamLogo = (apiTeamId: number | string) =>
  `${API_BASE}/api/ImageProxy/sofascore/team/${apiTeamId}`;

export const sofaPlayerPhoto = (apiPlayerId: number | string) =>
  `${API_BASE}/api/ImageProxy/sofascore/player/${apiPlayerId}`;

export const sofaTournamentLogo = (uniqueTournamentId: number | string, theme: 'dark' | 'light' = 'dark') =>
  `${API_BASE}/api/ImageProxy/sofascore/tournament/${uniqueTournamentId}/${theme}`;
