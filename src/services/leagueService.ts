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

export const leagueService = {
  async syncLeagues(): Promise<League[]> {
    return await apiClient.post<League[]>('/api/Football/sync-leagues');
  },

  async getLeagues(): Promise<League[]> {
    return await apiClient.get<League[]>('/api/Football/leagues');
  },

  async getTeams(): Promise<Team[]> {
    return await apiClient.get<Team[]>('/api/Football/teams');
  },

  async syncTeams(apiLeagueId: number, season: number): Promise<Team[]> {
    return await apiClient.post<Team[]>(
      `/api/Football/sync-teams?apiLeagueId=${apiLeagueId}&season=${season}`
    );
  },

  async getPlayers(): Promise<Player[]> {
    return await apiClient.get<Player[]>('/api/Football/players');
  },

  async getStandings(): Promise<Standing[]> {
    return await apiClient.get<Standing[]>('/api/Football/standings');
  },

  async getPlayerStats(): Promise<PlayerStats[]> {
    return await apiClient.get<PlayerStats[]>('/api/Football/player-stats');
  },

  async getMatches(): Promise<ApiMatch[]> {
    return await apiClient.get<ApiMatch[]>('/api/Football/matches');
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

  async syncStadiums(): Promise<Stadium[]> {
    return await apiClient.post<Stadium[]>('/api/Football/sync-stadiums');
  },

  async syncPlayers(apiLeagueId: number, season: number): Promise<Player[]> {
    return await apiClient.post<Player[]>(
      `/api/Football/sync-players?apiLeagueId=${apiLeagueId}&season=${season}`
    );
  },
};
