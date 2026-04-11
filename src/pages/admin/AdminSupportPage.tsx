import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from './AdminLayout';
import { Loader2, Send, Paperclip, X, CheckCircle, Clock, MessageSquare, User, Headphones, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TicketItem {
  ticketId: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  category: string;
  subject: string;
  status: string;
  unreadByAdmin: number;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

interface SupportMessage {
  messageId: string;
  senderRole: 'user' | 'admin';
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface TicketDetail {
  ticket: {
    ticketId: string;
    userId: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    category: string;
    subject: string;
    status: string;
  };
  messages: SupportMessage[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:        { label: 'Mới',         color: 'bg-blue-500/10 text-blue-600' },
  in_progress: { label: 'Đang xử lý', color: 'bg-amber-500/10 text-amber-600' },
  resolved:    { label: 'Đã đóng',    color: 'bg-green-500/10 text-green-600' },
  closed:      { label: 'Đã đóng',    color: 'bg-green-500/10 text-green-600' },
};

const PLAN_OPTIONS = [
  { code: 'TRIAL',            label: 'Gói Dùng thử (3 ngày)' },
  { code: 'MONTHLY',          label: 'Gói Hàng tháng (30 ngày)' },
  { code: 'QUARTERLY',        label: 'Gói Hàng quý (90 ngày)' },
  { code: 'TOPUP_AI_VIDEO',   label: 'Nạp thêm AI Video Analysis (5 lượt)' },
  { code: 'TOPUP_FORUM_POST', label: 'Nạp thêm bài đăng diễn đàn (10 bài)' },
];

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TicketDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [grantModal, setGrantModal] = useState<{ userId: string; ticketId: string } | null>(null);
  const [grantPlan, setGrantPlan] = useState('MONTHLY');
  const [granting, setGranting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: '1', pageSize: '50' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiClient.get<any>(`/api/support/admin/tickets?${params}`);
      setTickets(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch { toast.error('Không thể tải danh sách ticket'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setSelected(null); // clear selection khi đổi filter
    loadTickets();
  }, [statusFilter]);

  const openTicket = async (ticketId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await apiClient.get<TicketDetail>(`/api/support/admin/tickets/${ticketId}/messages`);
      setSelected(detail);
      // Update local unread count
      setTickets(prev => prev.map(t => t.ticketId === ticketId ? { ...t, unreadByAdmin: 0 } : t));
    } catch { toast.error('Không thể tải tin nhắn'); }
    finally { setLoadingDetail(false); }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages]);

  // Poll tin nhắn mới mỗi 5s khi đang xem ticket (chỉ khi ticket còn active)
  useEffect(() => {
    if (!selected) return;
    if (selected.ticket.status === 'resolved' || selected.ticket.status === 'closed') return;
    const poll = async () => {
      try {
        const detail = await apiClient.get<TicketDetail>(`/api/support/admin/tickets/${selected.ticket.ticketId}/messages`);
        setSelected(prev => {
          if (!prev) return prev;
          if (detail.messages.length !== prev.messages.length) return detail;
          return prev;
        });
        // Cập nhật unread về 0 trong list
        setTickets(prev => prev.map(t => t.ticketId === selected.ticket.ticketId ? { ...t, unreadByAdmin: 0 } : t));
      } catch { /* ignore */ }
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [selected?.ticket.ticketId, selected?.ticket.status]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendReply = async () => {
    if ((!input.trim() && !imageFile) || sending || !selected) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append('Content', input.trim());
      if (imageFile) form.append('Image', imageFile);
      const msg = await apiClient.postForm<SupportMessage>(`/api/support/admin/tickets/${selected.ticket.ticketId}/messages`, form);
      setSelected(prev => prev ? { ...prev, messages: [...prev.messages, msg], ticket: { ...prev.ticket, status: 'in_progress' } } : prev);
      setInput('');
      removeImage();
    } catch { toast.error('Gửi thất bại'); }
    finally { setSending(false); }
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    try {
      await apiClient.patch(`/api/support/admin/tickets/${selected.ticket.ticketId}/status`, { status });
      setSelected(prev => prev ? { ...prev, ticket: { ...prev.ticket, status } } : prev);
      setTickets(prev => prev.map(t => t.ticketId === selected.ticket.ticketId ? { ...t, status } : t));
      toast.success('Đã cập nhật trạng thái');
    } catch { toast.error('Lỗi cập nhật'); }
  };

  const handleGrant = async () => {
    if (!grantModal) return;
    setGranting(true);
    try {
      await apiClient.post('/api/support/admin/manual-grant-subscription', {
        userId: grantModal.userId,
        planCode: grantPlan,
        ticketId: grantModal.ticketId,
      });
      toast.success('Đã cấp gói thành công');
      setGrantModal(null);
      // Reload ticket detail
      await openTicket(grantModal.ticketId);
      loadTickets();
    } catch (e: any) { toast.error(e.message || 'Lỗi cấp gói'); }
    finally { setGranting(false); }
  };

  const fmtTime = (iso: string) =>
    new Date(iso.endsWith('Z') ? iso : iso + 'Z').toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Tin nhắn hỗ trợ</h1>
            <p className="text-slate-500 mt-1 text-sm">{statusFilter ? `${total} ticket` : `Tổng ${total} ticket`}</p>
          </div>
          {/* Status filter */}
          <div className="flex gap-2">
            {[{ v: '', l: 'Tất cả' }, { v: 'open', l: 'Mới' }, { v: 'in_progress', l: 'Đang xử lý' }, { v: 'resolved', l: 'Đã đóng' }].map(f => (
              <button key={f.v} onClick={() => setStatusFilter(f.v)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  statusFilter === f.v ? 'bg-[#FF4444] text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10')}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 h-[calc(100vh-220px)]">
          {/* Ticket list */}
          <div className={cn('flex flex-col gap-2 overflow-y-auto', selected ? 'hidden lg:flex lg:w-80 flex-shrink-0' : 'w-full lg:w-80 flex-shrink-0')}>
            {loading
              ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#FF4444]" /></div>
              : tickets.length === 0
              ? <div className="text-center py-12 text-slate-400 text-sm">Không có ticket nào</div>
              : tickets.map(t => (
                <button key={t.ticketId} onClick={() => openTicket(t.ticketId)}
                  className={cn('text-left p-3 rounded-xl border transition-all',
                    selected?.ticket.ticketId === t.ticketId
                      ? 'border-[#FF4444] bg-[#FF4444]/5'
                      : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 bg-card')}>
                  <div className="flex items-start gap-2">
                    {t.avatarUrl
                      ? <img src={t.avatarUrl} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(t.fullName || t.username || '?').charAt(0).toUpperCase()}
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold text-foreground truncate">{t.fullName || t.username}</p>
                        {t.unreadByAdmin > 0 && (
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF4444] text-white text-[10px] font-bold flex items-center justify-center">
                            {t.unreadByAdmin}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{t.subject}</p>
                      {t.lastMessage && <p className="text-xs text-slate-400 truncate mt-0.5">{t.lastMessage}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', STATUS_LABELS[t.status]?.color ?? 'bg-slate-100 text-slate-500')}>
                          {STATUS_LABELS[t.status]?.label ?? t.status}
                        </span>
                        <span className="text-[10px] text-slate-400">{fmtTime(t.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            }
          </div>

          {/* Chat panel */}
          {selected ? (
            <div className="flex-1 flex flex-col bg-card border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/5">
                <button onClick={() => setSelected(null)} className="lg:hidden p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {selected.ticket.avatarUrl
                  ? <img src={selected.ticket.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                  : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center text-white text-xs font-bold">
                      {(selected.ticket.fullName || selected.ticket.username || '?').charAt(0).toUpperCase()}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{selected.ticket.fullName || selected.ticket.username}</p>
                  <p className="text-xs text-slate-500 truncate">{selected.ticket.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_LABELS[selected.ticket.status]?.color)}>
                    {STATUS_LABELS[selected.ticket.status]?.label}
                  </span>
                  {/* Status actions */}
                  {selected.ticket.status !== 'resolved' && selected.ticket.status !== 'closed' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus('resolved')} className="text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50">
                      <CheckCircle className="w-3 h-3" />Đóng ticket
                    </Button>
                  )}
                  {(selected.ticket.status === 'resolved' || selected.ticket.status === 'closed') && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus('open')} className="text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                      Mở lại
                    </Button>
                  )}
                  {/* Manual grant button */}
                  <Button size="sm" onClick={() => setGrantModal({ userId: selected.ticket.userId, ticketId: selected.ticket.ticketId })}
                    className="text-xs bg-[#FF4444] hover:bg-[#FF5555] text-white gap-1">
                    Cấp gói thủ công
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingDetail
                  ? <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#FF4444]" /></div>
                  : selected.messages.map(msg => (
                    <div key={msg.messageId} className={cn('flex gap-2', msg.senderRole === 'admin' ? 'flex-row-reverse' : 'flex-row')}>
                      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                        msg.senderRole === 'admin' ? 'bg-[#FF4444]/20' : 'bg-slate-200 dark:bg-white/10')}>
                        {msg.senderRole === 'admin'
                          ? <Headphones className="w-3.5 h-3.5 text-[#FF4444]" />
                          : <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        }
                      </div>
                      <div className="max-w-[70%] space-y-1">
                        {msg.content && (
                          <div className={cn('px-3 py-2 rounded-2xl text-sm leading-relaxed',
                            msg.senderRole === 'admin'
                              ? 'bg-[#FF4444]/10 text-slate-900 dark:text-foreground rounded-tr-sm'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-foreground rounded-tl-sm')}>
                            {msg.content}
                          </div>
                        )}
                        {msg.imageUrl && (
                          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img src={msg.imageUrl} alt="attachment" className="max-w-[240px] rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:opacity-90" />
                          </a>
                        )}
                        <p className="text-[10px] text-slate-400 px-1">{fmtTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  ))
                }
                <div ref={bottomRef} />
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="px-3 pb-1 flex items-center gap-2">
                  <div className="relative">
                    <img src={imagePreview} alt="preview" className="h-14 w-14 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                    <button onClick={removeImage} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-slate-200 dark:border-white/5">
                <div className="flex gap-2 items-end">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex-shrink-0">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    placeholder="Nhập phản hồi..."
                    className="flex-1 h-9 px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4444]/30 border border-slate-200 dark:border-white/10"
                  />
                  <button onClick={sendReply} disabled={(!input.trim() && !imageFile) || sending}
                    className="w-9 h-9 rounded-xl bg-[#FF4444] flex items-center justify-center disabled:opacity-40 hover:bg-[#FF5555] transition-colors flex-shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center text-slate-400 text-sm">
              <div className="text-center space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
                <p>Chọn một ticket để xem tin nhắn</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual grant modal */}
      <Dialog open={!!grantModal} onOpenChange={() => setGrantModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cấp gói thủ công</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Chọn gói để cấp cho người dùng. Hệ thống sẽ tự động gửi thông báo trong chat.</p>
            <div className="space-y-2">
              {PLAN_OPTIONS.map(p => (
                <button key={p.code} onClick={() => setGrantPlan(p.code)}
                  className={cn('w-full text-left px-3 py-2 rounded-xl text-sm border transition-all',
                    grantPlan === p.code ? 'border-[#FF4444] bg-[#FF4444]/10 text-[#FF4444] font-medium' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setGrantModal(null)}>Hủy</Button>
              <Button onClick={handleGrant} disabled={granting} className="bg-[#FF4444] hover:bg-[#FF5555] text-white gap-1">
                {granting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Xác nhận cấp gói
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
