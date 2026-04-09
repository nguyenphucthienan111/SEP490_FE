import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService, NotificationDto, NOTIFICATION_ICONS } from '@/services/notificationService';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationDto | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) return;
    // Poll unread count every 30s
    const fetchCount = () => {
      notificationService.getUnreadCount()
        .then(r => setUnread((r as any).data?.count ?? r.count ?? 0))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      const data = (res as any).data ?? res;
      setNotifications(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch { }
    finally { setLoading(false); }
  };

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) loadNotifications();
  };

  const handleClick = async (n: NotificationDto) => {
    if (!n.isRead) {
      await notificationService.markRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setUnread(prev => Math.max(0, prev - 1));
    }
    setSelectedNotif(n);
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(x => ({ ...x, isRead: true })));
    setUnread(0);
  };

  if (!authService.isAuthenticated()) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/40 transition-colors">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF4444] text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white text-sm">Thông báo</span>
              {unread > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-[#00D9FF] hover:underline flex items-center gap-1">
                  <Check className="w-3 h-3" />Đọc tất cả
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#00D9FF]" /></div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">Không có thông báo nào</div>
              ) : (
                notifications.map(n => (
                  <button key={n.id} onClick={() => handleClick(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{NOTIFICATION_ICONS[n.type] ?? '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.createdAt}</p>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#FF4444] flex-shrink-0 mt-1.5" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40" onClick={() => setSelectedNotif(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="text-center mb-4">
                <span className="text-4xl">{NOTIFICATION_ICONS[selectedNotif.type] ?? '🔔'}</span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-center mb-2">{selectedNotif.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-3">{selectedNotif.message}</p>
              <p className="text-xs text-slate-400 text-center mb-4">{selectedNotif.createdAt}</p>
              <div className="flex gap-3">
                {selectedNotif.link && (
                  <button onClick={() => { setSelectedNotif(null); setOpen(false); navigate(selectedNotif.link!); }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white text-sm font-medium">
                    Xem chi tiết
                  </button>
                )}
                <button onClick={() => setSelectedNotif(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
