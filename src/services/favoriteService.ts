import { apiClient } from './api';

export const favoriteService = {
  getFavorites: () =>
    apiClient.get<any>(`/api/SofascoreHybrid/getFavorite`),

  addFavorite: (apiPlayerId: number) =>
    apiClient.post<any>(`/api/SofascoreHybrid/addFavorite?apiPlayerId=${apiPlayerId}`, {}),

  removeFavorite: (apiPlayerId: number) =>
    apiClient.delete<any>(`/api/SofascoreHybrid/removeFavorite?apiPlayerId=${apiPlayerId}`),
};
