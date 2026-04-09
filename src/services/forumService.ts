import { apiClient } from './api';

export interface PostSummary {
  postId: number;
  title: string;
  leagueTag?: string;
  status: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  commentCount: number;
  firstMediaUrl?: string;
  rejectionReason?: string;
  viewCount: number;
}

export interface PostDetail {
  postId: number;
  title: string;
  content: string;
  leagueTag?: string;
  status: string;
  rejectionReason?: string;
  authorName: string;
  authorAvatar?: string;
  authorId: string;
  createdAt: string;
  mediaUrls: string[];
  mediaTypes: string[];
  commentCount: number;
  viewCount: number;
  reactions: Record<string, number>;
  authorNameColorPreview?: string;
  authorFramePreview?: string;
  authorBadgePreview?: string;
}

export interface CommentDto {
  commentId: number;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  status: string;
  createdAt: string;
  parentCommentId?: number;
  parentAuthorName?: string;
  authorNameColorPreview?: string;
  authorFramePreview?: string;
  authorBadgePreview?: string;
  parentAuthorNameColorPreview?: string;
}

export interface PostsResponse {
  data: PostSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export const forumService = {
  getPosts: (leagueTag?: string, page = 1, pageSize = 20) =>
    apiClient.get<PostsResponse>(`/api/forum/posts?${leagueTag ? `leagueTag=${leagueTag}&` : ''}page=${page}&pageSize=${pageSize}`),

  getPost: (id: number) =>
    apiClient.get<PostDetail>(`/api/forum/posts/${id}`),

  getComments: (postId: number) =>
    apiClient.get<CommentDto[]>(`/api/forum/posts/${postId}/comments`),

  getMyPosts: () =>
    apiClient.get<PostSummary[]>('/api/forum/posts/my'),

  createPost: (data: { title: string; content: string; leagueTag: string; mediaUrls?: string[]; mediaTypes?: string[] }) =>
    apiClient.post<{ postId: number }>('/api/forum/posts', data),

  addComment: (postId: number, content: string, parentCommentId?: number) =>
    apiClient.post<void>(`/api/forum/posts/${postId}/comments`, { content, parentCommentId }),

  toggleReaction: (postId: number, reactionType: string) =>
    apiClient.post<{ myReaction: string | null; counts: Record<string, number> }>(`/api/forum/posts/${postId}/reactions`, { reactionType }),

  getReactions: (postId: number) =>
    apiClient.get<{ counts: Record<string, number>; myReaction: string | null }>(`/api/forum/posts/${postId}/reactions`),

  editComment: (commentId: number, content: string) =>
    apiClient.put<void>(`/api/forum/comments/${commentId}`, { content }),

  deleteComment: (commentId: number) =>
    apiClient.delete<void>(`/api/forum/comments/${commentId}`),

  editPost: (postId: number, data: { title: string; content: string; mediaUrls?: string[]; mediaTypes?: string[] }) =>
    apiClient.put<void>(`/api/forum/posts/${postId}`, data),

  deletePost: (postId: number) =>
    apiClient.delete<void>(`/api/forum/posts/${postId}`),

  reportComment: (commentId: number, reason: string) =>
    apiClient.post<void>(`/api/forum/comments/${commentId}/report`, { reason }),

  // Admin
  adminGetPosts: (status?: string, page = 1, pageSize = 20) =>
    apiClient.get<PostsResponse>(`/api/forum/admin/posts?${status ? `status=${status}&` : ''}page=${page}&pageSize=${pageSize}`),

  adminGetReports: (status?: string) =>
    apiClient.get<any[]>(`/api/forum/admin/reports${status ? `?status=${status}` : ''}`),

  adminApproveReport: (id: number) =>
    apiClient.post<void>(`/api/forum/admin/reports/${id}/approve`),

  adminDismissReport: (id: number, reason?: string) =>
    apiClient.post<void>(`/api/forum/admin/reports/${id}/dismiss`, { reason: reason ?? '' }),

  adminApprove: (id: number) => apiClient.post<void>(`/api/forum/admin/posts/${id}/approve`),
  adminReject: (id: number, reason: string) => apiClient.post<void>(`/api/forum/admin/posts/${id}/reject`, { reason }),
  adminHidePost: (id: number) => apiClient.post<void>(`/api/forum/admin/posts/${id}/hide`),
  adminHideComment: (id: number) => apiClient.post<void>(`/api/forum/admin/comments/${id}/hide`),
  adminBanComment: (userId: string, reason: string, days = 2) =>
    apiClient.post<void>(`/api/forum/admin/users/${userId}/ban-comment`, { reason, days }),
  adminUnbanComment: (userId: string) =>
    apiClient.post<void>(`/api/forum/admin/users/${userId}/unban-comment`),
};
