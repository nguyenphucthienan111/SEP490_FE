import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Headphones, User, Paperclip, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/services/api';
import { authService } from '@/services/authService';

interface SupportMessage {
  messageId: string;
  ticketId: string;
  senderRole: 'user' | 'admin';
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface SupportTicket {
  ticketId: string;
  category: string;
  subject: string;
  status: string;
}

const QUICK_REPLIES = [
  { label: 'Chuyển khoản sai nội dung', category: 'wrong_transfer_content' },
  { label: 'Đã thanh toán nhưng chưa lên gói', category: 'payment_not_updated' },
  { label: 'Gói hết hạn chưa được gia hạn', category: 'expired_not_renewed' },
  { label: 'Nạp credit nhưng số dư không tăng', category: 'credit_not_added' },
  { label: 'Đổi quà không thành công nhưng điểm đã trừ', category: 'reward_deducted' },
  { label: 'Yêu cầu hoàn tiền', category: 'refund_request' },
];

export function SupportChatBubble() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isAuthenticated());
  const [isAdmin] = useState(() => {
    const token = authService.getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles: string[] = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        ?? payload['role'] ?? [];
      return (Array.isArray(roles) ? roles : [roles]).some((r: string) => r.toLowerCase() === 'admin');
    } catch { return false; }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync auth state on login/logout events
  useEffect(() => {
    const onLogin = () => setIsLoggedIn(authService.isAuthenticated());
    const onLogout = () => { setIsLoggedIn(false); setIsOpen(false); };
    window.addEventListener('auth:login', onLogin);
    window.addEventListener('auth:logout', onLogout);
    return () => {
      window.removeEventListener('auth:login', onLogin);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);
  // Lưu số lượng tin nhắn admin đã thấy lần cuối
  const lastSeenAdminMsgCount = useRef(0);
  // Ref để tránh stale closure trong polling
  const isOpenRef = useRef(false);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

  const countUnread = (msgs: SupportMessage[]) => {
    const adminMsgs = msgs.filter(m => m.senderRole === 'admin').length;
    return Math.max(0, adminMsgs - lastSeenAdminMsgCount.current);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    // Mark all as read khi mở chat
    const adminMsgs = messages.filter(m => m.senderRole === 'admin').length;
    lastSeenAdminMsgCount.current = adminMsgs;
    setUnreadCount(0);
  };

  // Load ticket + messages khi mount (nếu đã login)
  useEffect(() => {
    if (!isLoggedIn || isAdmin) return;
    (async () => {
      try {
        const t = await apiClient.get<SupportTicket>('/api/support/my-ticket/current');
        setTicket(t);
        const msgs = await apiClient.get<SupportMessage[]>(`/api/support/my-ticket/${t.ticketId}/messages`);
        const list = Array.isArray(msgs) ? msgs : [];
        setMessages(list);
        if (list.length > 0) setShowQuickReplies(false);
        // Lần đầu load = user đã thấy hết tin nhắn cũ
        lastSeenAdminMsgCount.current = list.filter(m => m.senderRole === 'admin').length;
      } catch { /* 404 = chưa có ticket, hiện quick replies */ }
    })();
  }, []);

  // Poll mỗi 5s — luôn chạy khi có ticket (kể cả resolved để detect admin reopen)
  useEffect(() => {
    if (!ticket) return;
    const poll = async () => {
      try {
        const t = await apiClient.get<SupportTicket>('/api/support/my-ticket/current').catch(() => null);
        if (t) {
          setTicket(prev => {
            // Nếu status thay đổi (ví dụ resolved → in_progress), update
            if (prev?.status !== t.status || prev?.ticketId !== t.ticketId) return t;
            return prev;
          });
        }
        const ticketId = t?.ticketId ?? ticket.ticketId;
        const msgs = await apiClient.get<SupportMessage[]>(`/api/support/my-ticket/${ticketId}/messages`);
        const list = Array.isArray(msgs) ? msgs : [];
        setMessages(prev => {
          if (list.length !== prev.length) {
            if (!isOpenRef.current) {
              const adminCount = list.filter(m => m.senderRole === 'admin').length;
              const newUnread = Math.max(0, adminCount - lastSeenAdminMsgCount.current);
              if (newUnread > 0) setUnreadCount(newUnread);
            }
            return list;
          }
          return prev;
        });
      } catch { /* ignore */ }
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [ticket?.ticketId]);

  const handleQuickReply = async (qr: typeof QUICK_REPLIES[0]) => {
    setShowQuickReplies(false);
    setSending(true);
    try {
      const params = new URLSearchParams({ category: qr.category, subject: qr.label });
      const t = await apiClient.get<SupportTicket>(`/api/support/my-ticket?${params}`);
      setTicket(t);
      const form = new FormData();
      form.append('TicketId', t.ticketId);
      form.append('Content', qr.label);
      const msg = await apiClient.postForm<SupportMessage>('/api/support/my-ticket/messages', form);
      setMessages([msg]);
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

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

  const send = async () => {
    if ((!input.trim() && !imageFile) || sending) return;
    setSending(true);
    try {
      // Tự tạo ticket nếu chưa có
      let currentTicket = ticket;
      if (!currentTicket) {
        const params = new URLSearchParams({ category: 'other', subject: 'Yêu cầu hỗ trợ' });
        currentTicket = await apiClient.get<SupportTicket>(`/api/support/my-ticket?${params}`);
        setTicket(currentTicket);
      }

      const form = new FormData();
      form.append('TicketId', currentTicket.ticketId);
      form.append('Content', input.trim());
      if (imageFile) form.append('Image', imageFile);

      const msg = await apiClient.postForm<SupportMessage>('/api/support/my-ticket/messages', form);
      setMessages(prev => [...prev, msg]);
      setInput('');
      setShowQuickReplies(false);
      removeImage();
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  if (!isLoggedIn || isAdmin) return null;

  return (
    <>
      {/* Bubble button - positioned above AI bubble */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-[88px] right-6 z-[60] w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4444] to-[#FF6666] shadow-lg shadow-[#FF4444]/30 flex items-center justify-center hover:scale-110 transition-transform"
        whileTap={{ scale: 0.95 }}
        title="Chat với Admin hỗ trợ"
        style={{ position: 'fixed', bottom: '88px', right: '24px' }}
      >
        <Headphones className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[#FF4444] text-[10px] font-bold flex items-center justify-center shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-40 right-6 z-[60] w-[360px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f0f1a]"
            style={{ position: 'fixed', bottom: '160px', right: '24px' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#FF4444]/20 to-[#FF6666]/10 border-b border-slate-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center flex-shrink-0">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-foreground">Hỗ trợ Admin</p>
                <p className="text-[10px] text-slate-500 dark:text-[#A8A29E]">Thanh toán & Gói đăng ký</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="ml-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">

              {/* Quick replies */}
              {showQuickReplies && messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Chọn vấn đề bạn cần hỗ trợ:</p>
                  {QUICK_REPLIES.map(qr => (
                    <button
                      key={qr.category}
                      onClick={() => handleQuickReply(qr)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-white/10 hover:border-[#FF4444]/50 hover:bg-[#FF4444]/5 transition-all text-slate-700 dark:text-slate-300"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Messages list */}
              {messages.map(msg => (
                <div key={msg.messageId} className={cn('flex gap-2', msg.senderRole === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    msg.senderRole === 'user' ? 'bg-[#FF4444]/20' : 'bg-slate-200 dark:bg-white/10')}>
                    {msg.senderRole === 'user'
                      ? <User className="w-3.5 h-3.5 text-[#FF4444]" />
                      : <Headphones className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    }
                  </div>
                  <div className={cn('max-w-[80%] space-y-1', msg.senderRole === 'user' ? 'items-end' : 'items-start')}>
                    {msg.content && (
                      <div className={cn('px-3 py-2 rounded-2xl text-sm leading-relaxed',
                        msg.senderRole === 'user'
                          ? 'bg-[#FF4444]/10 text-slate-900 dark:text-foreground rounded-tr-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-foreground rounded-tl-sm')}>
                        {msg.content}
                      </div>
                    )}
                    {msg.imageUrl && (
                      <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                        <img src={msg.imageUrl} alt="attachment" className="max-w-[200px] rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:opacity-90" />
                      </a>
                    )}
                    <p className="text-[10px] text-slate-400 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
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
            <div className="p-3 border-t border-slate-200 dark:border-white/10">
              <div className="flex gap-2 items-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
                  title="Đính kèm ảnh"
                >
                  <Paperclip className="w-4 h-4 text-slate-500" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 h-9 px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4444]/30 border border-slate-200 dark:border-white/10"
                />
                <button
                  onClick={send}
                  disabled={(!input.trim() && !imageFile) || sending}
                  className="w-9 h-9 rounded-xl bg-[#FF4444] flex items-center justify-center disabled:opacity-40 hover:bg-[#FF5555] transition-colors flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
