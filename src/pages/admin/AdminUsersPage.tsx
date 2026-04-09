import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { Search, Shield, Ban, CheckCircle, Mail, Loader2, MessageSquareOff, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient } from '@/services/api';
import { forumService } from '@/services/forumService';
import { toast } from 'sonner';

interface AdminUser {
  userId: string;
  username: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  commentBanned: boolean;
  commentBanExpiry: string | null;
  isAdmin: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [banModal, setBanModal] = useState<{ userId: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState(2);
  const [unbanModal, setUnbanModal] = useState<{ userId: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>(`/api/auth/admin/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=20`);
      const data = (res as any).data ?? res;
      setUsers(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { toast.error('Không thể tải danh sách người dùng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const handleBan = async () => {
    if (!banModal) return;
    try {
      await forumService.adminBanComment(banModal.userId, banReason || 'Vi phạm quy định', banDays);
      toast.success(`Đã cấm bình luận ${banModal.name} ${banDays} ngày`);
      setBanModal(null); setBanReason(''); setBanDays(2);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi'); }
  };

  const handleUnban = async (userId: string, name: string) => {
    try {
      await forumService.adminUnbanComment(userId);
      toast.success(`Đã gỡ cấm bình luận ${name}`);
      setUnbanModal(null);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi'); }
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso.endsWith('Z') ? iso : iso + 'Z').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Quản lý người dùng</h1>
          <p className="text-slate-600 dark:text-[#A8A29E] mt-1">Tổng: {total} người dùng</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm theo tên, email, username..." value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button type="submit">Tìm</Button>
        </form>

        {/* Table */}
        <div className="bg-card border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
          {loading
            ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#00D9FF]" /></div>
            : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Người dùng</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Cấm bình luận</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ngày tham gia</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {users.map(u => (
                      <tr key={u.userId} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {u.avatarUrl
                              ? <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                              : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center text-white text-xs font-bold">
                                  {(u.fullName || u.username).charAt(0).toUpperCase()}
                                </div>
                            }
                            <div>
                              <p className="text-sm font-medium text-foreground">{u.fullName || u.username}</p>
                              <p className="text-xs text-slate-400">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{u.email}</span>
                            {u.isEmailVerified
                              ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              : <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                            {u.isActive ? 'Hoạt động' : 'Bị khóa'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.commentBanned
                            ? <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600">
                                  <MessageSquareOff className="w-3 h-3" />Đang bị cấm
                                </span>
                                {u.commentBanExpiry && (
                                  <p className="text-xs text-slate-400 mt-0.5">Đến {fmtDate(u.commentBanExpiry)}</p>
                                )}
                              </div>
                            : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                                <MessageSquare className="w-3 h-3" />Bình thường
                              </span>
                          }
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{fmtDate(u.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          {u.isAdmin
                            ? <span className="text-xs text-slate-400 px-2">Admin</span>
                            : u.commentBanned
                            ? <Button size="sm" variant="outline" onClick={() => setUnbanModal({ userId: u.userId, name: u.fullName || u.username })}
                                className="text-xs gap-1">
                                <Shield className="w-3 h-3" />Gỡ cấm bình luận
                              </Button>
                            : <Button size="sm" variant="outline" onClick={() => setBanModal({ userId: u.userId, name: u.fullName || u.username })}
                                className="text-xs gap-1 text-orange-600 border-orange-200 hover:bg-orange-50">
                                <Ban className="w-3 h-3" />Cấm bình luận
                              </Button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</Button>
            <span className="text-sm text-slate-500">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</Button>
          </div>
        )}
      </div>

      {/* Ban modal */}
      <Dialog open={!!banModal} onOpenChange={() => { setBanModal(null); setBanReason(''); setBanDays(2); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cấm bình luận: {banModal?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Số ngày cấm</label>
              <div className="flex gap-2">
                {[1, 2, 7, 30].map(d => (
                  <button key={d} onClick={() => setBanDays(d)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${banDays === d ? 'border-[#FF4444] bg-[#FF4444]/10 text-[#FF4444]' : 'border-slate-200 dark:border-slate-700 text-slate-600'}`}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Lý do (tùy chọn)</label>
              <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
                placeholder="Vi phạm quy định cộng đồng..."
                className="w-full min-h-[70px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none" />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setBanModal(null)}>Hủy</Button>
              <Button onClick={handleBan} className="bg-orange-500 hover:bg-orange-600 text-white">
                Cấm {banDays} ngày
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Unban modal */}
      <Dialog open={!!unbanModal} onOpenChange={() => setUnbanModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Gỡ cấm bình luận</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Xác nhận gỡ cấm bình luận cho <span className="font-semibold text-slate-900 dark:text-white">{unbanModal?.name}</span>?
            Người dùng sẽ nhận được thông báo.
          </p>
          <div className="flex justify-end gap-3 mt-2">
            <Button variant="outline" onClick={() => setUnbanModal(null)}>Hủy</Button>
            <Button onClick={() => unbanModal && handleUnban(unbanModal.userId, unbanModal.name)}
              className="bg-green-500 hover:bg-green-600 text-white gap-1">
              <Shield className="w-4 h-4" />Xác nhận gỡ cấm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
