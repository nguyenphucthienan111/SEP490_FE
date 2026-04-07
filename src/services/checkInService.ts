import { apiClient } from './api';

export interface CheckInResultDto {
  alreadyCheckedIn: boolean;
  pointsEarned: number;
  currentStreak: number;
  totalCheckInPoints: number;
}

export interface CheckInStatusDto {
  checkedInToday: boolean;
  currentStreak: number;
  totalCheckInPoints: number;
  checkedDatesThisMonth: string[]; // "yyyy-MM-dd"
}

export const checkInService = {
  checkIn: () => apiClient.post<CheckInResultDto>('/api/checkin'),
  getStatus: () => apiClient.get<CheckInStatusDto>('/api/checkin/me'),
};
