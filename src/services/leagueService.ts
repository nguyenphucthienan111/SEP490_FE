import { apiClient } from './api';

export interface League {
  leagueId: number;
  leagueName: string;
  apiLeagueId: number;
  country: string | null;
  logoUrl: string;
  leagueType: string;
  seasons: any[];
  teams: any[];
}

export interface Team {
  teamId: number;
  teamName: string;
  shortName: string | null;
  coachName: string | null;
  clubId: number;
  apiTeamId: number;
  founded: number | null;
  national: boolean;
  logoUrl: string;
  stadiumId: number;
  leagueId: number;
  stadium?: Stadium;
  league?: League;
  contracts?: any[];
}

export interface Stadium {
  stadiumId: number;
  stadiumName: string;
  city: string | null;
  capacity: number;
  surface: string | null;
  address: string | null;
  imageUrl: string | null;
}

export interface PlayerStatistic {
  season: number;
  leagueId: number;
  teamId: number;
  appearances: number;
  lineups: number;
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  rating: number | null;
}

export interface Player {
  playerId: number;
  apiPlayerId: number;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  dateOfBirth: string | null;
  age: number | null;
  nationality: string | null;
  birthPlace: string | null;
  birthCountry: string | null;
  heightCm: number | null;
  weightKg: number | null;
  photoUrl: string | null;
  isInjured: boolean;
  teamId: number | null;
  position: string | null;
  number: number | null;
  statistics: PlayerStatistic[];
}

export interface Standing {
  standingId: number;
  leagueId: number;
  seasonId: number;
  teamId: number;
  rank: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string;
  status: string;
  description: string | null;
  homeRecord: string;
  awayRecord: string;
  apiLastUpdated: string;
}

export interface PlayerStats {
  playerStatisticsId: number;
  playerId: number;
  teamId: number;
  leagueId: number;
  seasonId: number;
  appearances: number;
  lineups: number;
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  rating: number | null;
  substitutionsIn: number | null;
  substitutionsOut: number | null;
  shotsTotal: number | null;
  shotsOnTarget: number | null;
  passesTotal: number | null;
  passesKey: number | null;
  passesAccuracy: number | null;
  dribblesAttempted: number | null;
  dribblesSuccess: number | null;
  dribblesSuccessRate: number | null;
  duelsWon: number | null;
  duelsTotal: number | null;
  duelsWonRate: number | null;
  tackles: number | null;
  interceptions: number | null;
  foulsDrawn: number | null;
  foulsCommitted: number | null;
  penaltiesScored: number | null;
  penaltiesMissed: number | null;
}

export interface TeamStatistic {
  teamStatId: number;
  teamId: number;
  leagueId: number;
  seasonId: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string;
  homePlayed: number;
  homeWins: number;
  homeDraws: number;
  homeLosses: number;
  awayPlayed: number;
  awayWins: number;
  awayDraws: number;
  awayLosses: number;
  homeGoalsFor: number;
  awayGoalsFor: number;
  homeGoalsAgainst: number;
  awayGoalsAgainst: number;
  goalsForAvgTotal: string;
  goalsAgainstAvgTotal: string;
  biggestStreakWins: number;
  biggestStreakDraws: number;
  biggestStreakLosses: number;
  biggestWinHome: string;
  biggestWinAway: string;
  biggestLossHome: string;
  biggestLossAway: string;
  cleanSheets: number;
  cleanSheetsHome: number;
  cleanSheetsAway: number;
  failedToScore: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  penaltiesTotal: number;
  penaltyPercentage: string;
}

export interface Transfer {
  transferId: number;
  playerId: number;
  fromTeamId: number;
  toTeamId: number;
  transferDate: string;
  transferType: string;
}

export interface MatchEvent {
  eventId: number;
  matchId: number;
  teamId: number;
  playerId: number | null;
  assistPlayerId: number | null;
  eventType: string;
  detail: string;
  eventTime: number;
  extraTime: number | null;
  period: string;
  comments: string | null;
}

export interface ApiMatch {
  matchId: number;
  apiFixtureId: number;
  leagueId: number;
  seasonId: number;
  matchDate: string;
  kickOffTime: string;
  status: string;
  homeTeamId: number;
  awayTeamId: number;
  homeGoals: number | null;
  awayGoals: number | null;
  venue: string;
  refereeName: string | null;
  attendance: number | null;
  round: string;
  apiVenueId: number | null;
}

export interface Season {
  seasonId: number;
  year: number;
  startDate: string;
  endDate: string;
  current: boolean;
  leagueId: number;
}

export interface PlayerFromAPI {
  playerId: number;
  apiPlayerId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  birthPlace: string | null;
  birthCountry: string;
  heightCm: number | null;
  weightKg: number | null;
  photoUrl: string;
  isInjured: boolean;
  teamId: number;
  position: string;
  number: number | null;
  team?: Team;
}

export interface PlayerStats {
  playerStatisticsId: number;
  playerId: number;
  teamId: number;
  leagueId: number;
  seasonId: number;
  appearances: number;
  lineups: number;
  minutes: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  rating: number | null;
  substitutionsIn: number | null;
  substitutionsOut: number | null;
  shotsTotal: number | null;
  shotsOnTarget: number | null;
  passesTotal: number | null;
  passesKey: number | null;
  passesAccuracy: number | null;
  dribblesAttempted: number | null;
  dribblesSuccess: number | null;
  dribblesSuccessRate: number | null;
  duelsWon: number | null;
  duelsTotal: number | null;
  duelsWonRate: number | null;
  tackles: number | null;
  interceptions: number | null;
  foulsDrawn: number | null;
  foulsCommitted: number | null;
  penaltiesScored: number | null;
  penaltiesMissed: number | null;
  league?: League;
  player?: PlayerFromAPI;
  season?: Season;
}

export interface MatchTeam {
  teamId: number;
  teamName: string;
  logoUrl: string;
}

export interface Match {
  matchId: number;
  apiFixtureId: number;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  homeGoals: number;
  awayGoals: number;
  matchDate: string;
  round: string;
  status: string;
  venue: string;
}

export interface StandingTeam {
  teamId: number;
  teamName: string;
  logoUrl: string;
}

export interface Standing {
  standingId: number;
  team: StandingTeam;
  rank: number;
  points: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string;
}

export interface SofascoreStandingRow {
  id: number;
  position: number;
  team: {
    id: number;
    name: string;
    logo: string; // built from team.id
  };
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  scoresFor: number;
  scoresAgainst: number;
  points: number;
}

export interface SofascoreTeamMatch {
  id: number;
  homeTeam: { id: number; name: string; };
  awayTeam: { id: number; name: string; };
  homeScore: { current: number; display?: number; };
  awayScore: { current: number; display?: number; };
  startTimestamp: number;
  status: { type: string; };
  roundInfo?: { round: number; name?: string; cupRoundType?: number; };
}

interface RawSofascoreRow {
  id: number;
  position: number;
  team: { id: number; name: string; };
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  scoresFor: number;
  scoresAgainst: number;
  points: number;
}

export interface SofascoreLeague {
  name: string;
  uniqueTournamentId: number;
  currentSeasonId: number;
  seasonName: string;
  url: string;
  logoUrl: string; // built client-side
}

export const leagueService = {
  async getVietnameseLeagues(): Promise<SofascoreLeague[]> {
    const result = await apiClient.get<any>('/api/Sofascore/vietnamese-leagues');
    const raw: Omit<SofascoreLeague, 'logoUrl'>[] = result?.leagues ?? [];
    return raw.map((l) => ({
      ...l,
      logoUrl: `https://api.sofascore.app/api/v1/unique-tournament/${l.uniqueTournamentId}/image/dark`,
    }));
  },

  async getTournamentLastMatches(uniqueTournamentId: number, seasonId: number, page = 0): Promise<SofascoreTeamMatch[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/tournament/last-matches?uniqueTournamentId=${uniqueTournamentId}&seasonId=${seasonId}&page=${page}`
    );
    const raw = result?.events ?? result?.matches ?? result ?? [];
    return Array.isArray(raw) ? raw : [];
  },

  async getTournamentNextMatches(uniqueTournamentId: number, seasonId: number, page = 0): Promise<SofascoreTeamMatch[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/tournament/next-matches?uniqueTournamentId=${uniqueTournamentId}&seasonId=${seasonId}&page=${page}`
    );
    const raw = result?.events ?? result?.matches ?? result ?? [];
    return Array.isArray(raw) ? raw : [];
  },

  async getTournamentCupTrees(uniqueTournamentId: number, seasonId: number): Promise<any> {
    return await apiClient.get<any>(
      `/api/Sofascore/tournament/cuptrees?uniqueTournamentId=${uniqueTournamentId}&seasonId=${seasonId}`
    );
  },

  async getTournamentRoundMatches(uniqueTournamentId: number, seasonId: number, round: number): Promise<SofascoreTeamMatch[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/tournament/round-matches?uniqueTournamentId=${uniqueTournamentId}&seasonId=${seasonId}&round=${round}`
    );
    const raw = result?.events ?? result?.matches ?? result ?? [];
    return Array.isArray(raw) ? raw : [];
  },

  async getTeamLastMatches(teamId: number, page = 0): Promise<SofascoreTeamMatch[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/team/last-matches?teamId=${teamId}&page=${page}`
    );
    const raw = result?.events ?? result?.matches ?? result ?? [];
    return Array.isArray(raw) ? raw : [];
  },

  async getSofascoreStandings(tournamentId: number, seasonId: number): Promise<SofascoreStandingRow[]> {
    const result = await apiClient.get<any>(
      `/api/Sofascore/standings?tournamentId=${tournamentId}&seasonId=${seasonId}`
    );
    // Response: { standings: [{ type: "total", rows: [...] }] }
    const rawRows: RawSofascoreRow[] = result?.standings?.[0]?.rows ?? [];
    return rawRows.map((row) => ({
      ...row,
      team: {
        id: row.team.id,
        name: row.team.name,
        logo: `https://api.sofascore.app/api/v1/team/${row.team.id}/image`,
      },
    }));
  },

  async getLeagues(): Promise<League[]> {
    return await apiClient.get<League[]>('/api/Football/leagues');
  },

  async getSeasons(leagueId: number): Promise<Season[]> {
    return await apiClient.get<Season[]>(`/api/Football/seasons?leagueId=${leagueId}`);
  },

  async getTeams(leagueId: number): Promise<Team[]> {
    return await apiClient.get<Team[]>(`/api/Football/teams?leagueId=${leagueId}`);
  },

  async getPlayers(teamId: number): Promise<PlayerFromAPI[]> {
    return await apiClient.get<PlayerFromAPI[]>(`/api/Football/players?teamId=${teamId}`);
  },

  async getPlayerStats(playerId: number, seasonId: number): Promise<PlayerStats[]> {
    return await apiClient.get<PlayerStats[]>(`/api/Football/player-stats?playerId=${playerId}&seasonId=${seasonId}`);
  },

  async getMatches(leagueId: number, seasonId: number): Promise<Match[]> {
    return await apiClient.get<Match[]>(`/api/Football/matches?leagueId=${leagueId}&seasonId=${seasonId}`);
  },

  async getStandings(leagueId: number, seasonId: number): Promise<Standing[]> {
    return await apiClient.get<Standing[]>(`/api/Football/standings?leagueId=${leagueId}&seasonId=${seasonId}`);
  },

  async getMatchEvents(): Promise<MatchEvent[]> {
    return await apiClient.get<MatchEvent[]>('/api/Football/match-events');
  },

  async getTransfers(): Promise<Transfer[]> {
    return await apiClient.get<Transfer[]>('/api/Football/transfers');
  },

  async getTeamStatistics(): Promise<TeamStatistic[]> {
    return await apiClient.get<TeamStatistic[]>('/api/Football/team-statistics');
  },

  async getStadium(stadiumId: number): Promise<Stadium> {
    return await apiClient.get<Stadium>(`/api/Football/stadiums/${stadiumId}`);
  },

  // Legacy sync methods - deprecated
  async syncLeagues(): Promise<League[]> {
    return await apiClient.post<League[]>('/api/Football/sync-leagues');
  },

  async syncTeams(apiLeagueId: number, season: number): Promise<Team[]> {
    return await apiClient.post<Team[]>(
      `/api/Football/sync-teams?apiLeagueId=${apiLeagueId}&season=${season}`
    );
  },

  async syncStadiums(): Promise<Stadium[]> {
    return await apiClient.post<Stadium[]>('/api/Football/sync-stadiums');
  },

  async syncPlayers(apiLeagueId: number, season: number): Promise<Player[]> {
    return await apiClient.post<Player[]>(
      `/api/Football/sync-players?apiLeagueId=${apiLeagueId}&season=${season}`
    );
  },
};
