import { apiClient } from './api';

export interface CosmeticItemDto {
  itemId: number;
  name: string;
  description?: string;
  category: 'frame' | 'nameColor' | 'banner' | 'badge' | 'effect' | 'card';
  unlockType: 'shop' | 'achievement';
  pointCost?: number;
  achievementKey?: string;
  previewData?: string;
  isOwned: boolean;
}

export interface LoadoutDto {
  frameItemId?: number | null;
  nameColorItemId?: number | null;
  bannerItemId?: number | null;
  badgeItemId?: number | null;
  effectItemId?: number | null;
  cardItemId?: number | null;
}

export interface FullLoadoutDto {
  framePreview?: string | null;
  nameColorPreview?: string | null;
  bannerPreview?: string | null;
  badgePreview?: string | null;
  effectPreview?: string | null;
  cardPreview?: string | null;
  frameName?: string | null;
  nameColorName?: string | null;
  badgeName?: string | null;
}

export const cosmeticService = {
  getShop: () => apiClient.get<CosmeticItemDto[]>('/api/cosmetics/shop'),
  getInventory: () => apiClient.get<CosmeticItemDto[]>('/api/cosmetics/inventory'),
  purchase: (itemId: number) => apiClient.post<void>(`/api/cosmetics/purchase/${itemId}`),
  equip: (loadout: LoadoutDto) => apiClient.post<void>('/api/cosmetics/equip', loadout),
  getLoadout: (userId: string) => apiClient.get<LoadoutDto>(`/api/cosmetics/loadout/${userId}`),
  getFullLoadout: (userId: string) => apiClient.get<FullLoadoutDto>(`/api/cosmetics/full-loadout/${userId}`),
  checkAchievements: () => apiClient.post<CosmeticItemDto[]>('/api/cosmetics/check-achievements'),
};
