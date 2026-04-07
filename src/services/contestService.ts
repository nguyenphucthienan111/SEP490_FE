import { apiClient } from './api';

export type ContestType = 'TOP4' | 'POTM' | 'TOP_SCORER' | 'POTS' | 'CHAMPION';
export type ContestStatus = 'OPEN' | 'CLOSED' | 'SETTLED';

export interface ContestDto {
  contestId: number;
  contestType: ContestType;
  title: string;
  description?: string;
  closesAt: string;
  resultAt?: string;
  pointsExact: number;
  pointsPartial: number;
  status: ContestStatus;
  leagueId?: number;
  seasonId?: number;
  createdAt: string;
  hasEntered: boolean;
  results?: ContestResultDto[];
  myEntries?: ContestEntryDto[];
}

export interface ContestEntryDto {
  entryId: number;
  rank: number;
  teamId?: number;
  teamName?: string;
  playerId?: number;
  playerName?: string;
  points?: number;
  isCorrect?: number;
}

export interface ContestResultDto {
  rank: number;
  teamId?: number;
  teamName?: string;
  playerId?: number;
  playerName?: string;
}

export interface ContestPickDto {
  rank: number;
  teamId?: number;
  playerId?: number;
}

export interface TeamPickerDto {
  teamId: number;
  teamName: string;
  apiTeamId?: number;
}

export interface PlayerPickerDto {
  playerId: number;
  fullName: string;
  position?: string;
  apiPlayerId?: number;
}

export interface CreateContestRequest {
  contestType: ContestType;
  title: string;
  description?: string;
  closesAt: string;
  pointsExact: number;
  pointsPartial: number;
  leagueId?: number;
  seasonId?: number;
}

export interface SettleContestRequest {
  contestId: number;
  results: ContestPickDto[];
}

export const contestService = {
  getOpen: () => apiClient.get<ContestDto[]>('/api/contests'),
  getOne: (id: number) => apiClient.get<ContestDto>(`/api/contests/${id}`),
  submitEntry: (data: { contestId: number; picks: ContestPickDto[] }) =>
    apiClient.post<void>('/api/contests/entry', data),
  getTeams: (leagueId?: number, seasonId?: number) =>
    apiClient.get<TeamPickerDto[]>(`/api/contests/teams?leagueId=${leagueId ?? ''}&seasonId=${seasonId ?? ''}`),
  getPlayers: (teamId: number) =>
    apiClient.get<PlayerPickerDto[]>(`/api/contests/players/${teamId}`),

  // Admin
  create: (data: CreateContestRequest) => apiClient.post<ContestDto>('/api/contests/admin', data),
  getAll: () => apiClient.get<ContestDto[]>('/api/contests/admin/all'),
  settle: (data: SettleContestRequest) => apiClient.post<{ settled: number }>('/api/contests/admin/settle', data),
};
