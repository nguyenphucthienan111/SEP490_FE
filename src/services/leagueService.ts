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

export interface SyncTeamsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Team[];
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
