import { apiClient } from './api';

export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string; // already formatted as "HH:mm dd/MM/yyyy" UTC+7
}

export interface NotificationsResponse {
  items: NotificationDto[];
  unread: number;
  page: number;
  pageSize: number;
}

export const notificationService = {
  getAll: (page = 1, pageSize = 20) =>
    apiClient.get<NotificationsResponse>(`/api/notifications?page=${page}&pageSize=${pageSize}`),

  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/api/notifications/unread-count'),

  markRead: (id: number) =>
    apiClient.post<void>(`/api/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.post<void>('/api/notifications/read-all'),
};

// Notification type icons
export const NOTIFICATION_ICONS: Record<string, string> = {
  welcome:              '🎉',
  subscription_success: '✅',
  subscription_expiring:'⚠️',
  topup_success:        '💳',
  comment_reply:        '💬',
  comment_warning:      '⚠️',
  comment_ban:          '🚫',
  cosmetic_purchase:    '🎁',
  achievement_unlocked: '🏆',
  post_approved:        '✅',
  post_rejected:        '❌',
  post_hidden:          '🔒',
  prediction_result:    '🎯',
  contest_result:       '🏅',
  checkin_streak:       '🔥',
  points_milestone:     '⭐',
  admin_warning:        '📢',
  new_feature:          '🆕',
  password_changed:     '🔐',
  email_verified:       '✅',
  post_popular:         '🔥',
  comment_liked:        '❤️',
};
