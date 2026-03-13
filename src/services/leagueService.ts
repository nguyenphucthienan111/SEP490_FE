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
  fullName: string;
  nationality: string | null;
  heightCm: number | null;
  weightKg: number | null;
  photoUrl: string | null;
  statistics: PlayerStatistic[];
}

export interface SyncTeamsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Team[];
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

export const leagueService = {
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
