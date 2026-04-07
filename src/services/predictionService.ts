import { apiClient } from './api';

export interface PredictionItemDto {
  predictionId: number;
  matchId: number;
  homeTeamName?: string;
  awayTeamName?: string;
  predictedHomeGoals?: number;
  predictedAwayGoals?: number;
  actualHomeGoals?: number;
  actualAwayGoals?: number;
  matchStatus?: string;
  /** 0 = sai, 1 = đúng kết quả, 2 = đúng tỉ số */
  isCorrect?: number;
  points?: number;
  createdAt?: string;
}

export interface UserPredictionStatsDto {
  totalPredictions: number;
  correctPredictions: number;
  exactScorePredictions: number;
  points: number;
  lastUpdated?: string;
  matchPredictionPoints: number;
  contestPoints: number;
  checkInPoints: number;
}

export const predictionService = {
  submit: (matchId: number, predictedHomeGoals: number, predictedAwayGoals: number) =>
    apiClient.post<PredictionItemDto>('/api/predictions', { matchId, predictedHomeGoals, predictedAwayGoals }),

  getMyPredictions: () =>
    apiClient.get<PredictionItemDto[]>('/api/predictions/me'),

  getMyStats: () =>
    apiClient.get<UserPredictionStatsDto>('/api/predictions/me/stats'),

  getForMatch: (matchId: number) =>
    apiClient.get<PredictionItemDto | null>(`/api/predictions/match/${matchId}`),
};
