import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/services/api';
import { authService } from '@/services/authService';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'model';
  content: string;
}

// Extract player IDs from links like /players/123
function extractPlayerIds(text: string): number[] {
  const matches = [...text.matchAll(/\/players\/(\d+)/g)];
  return [...new Set(matches.map(m => Number(m[1])))];
}

function PlayerCard({ playerId }: { playerId: number }) {
  const [player, setPlayer] = useState<{ fullName: string; photoUrl: string; position: string } | null>(null);
  useEffect(() => {
    apiClient.get<any>(`/api/Football/players/${playerId}`)
      .then(p => setPlayer({ fullName: p.fullName ?? p.FullName, photoUrl: p.photoUrl ?? p.PhotoUrl, position: p.position ?? p.Position }))
      .catch(() => {});
  }, [playerId]);
  if (!player) return null;
  return (
    <Link to={`/players/${playerId}`} className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-[#00D9FF]/50 transition-colors group">
      <img src={player.photoUrl} alt={player.fullName} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-900 dark:text-foreground truncate group-hover:text-[#00D9FF]">{player.fullName}</p>
        <p className="text-[10px] text-slate-500">{{ F: 'Tiền đạo', M: 'Tiền vệ', D: 'Hậu vệ', G: 'Thủ môn' }[player.position] ?? player.position}</p>
      </div>
    </Link>
  );
}

function renderContent(text: string) {
  const parts = text.split(/(\[.*?\]\(.*?\)|!\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) return <img key={i} src={imgMatch[2]} alt={imgMatch[1]} className="w-10 h-10 rounded-lg object-cover inline-block mr-1" />;
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) return <Link key={i} to={linkMatch[2]} className="text-[#00D9FF] underline hover:text-[#00E8FF]">{linkMatch[1]}</Link>;
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return <span key={i}>{boldParts.map((bp, j) => { const bold = bp.match(/^\*\*(.*?)\*\*$/); return bold ? <strong key={j}>{bold[1]}</strong> : bp; })}</span>;
  });
}

export function AIChatBubble() {
  if (!authService.isAuthenticated()) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getUserId = (): string | null => {
    const user = authService.getCurrentUser() as any;
    return user?.userId ?? user?.id ?? null;
  };

  // Load lịch sử chat từ DB ngay khi component mount
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    (async () => {
      try {
        const sessions = await apiClient.get<any>(`/api/Chat/sessions?userId=${userId}`);
        // API trả về { count, data: [...] } hoặc array trực tiếp
        const sessionList: any[] = sessions?.data ?? (Array.isArray(sessions) ? sessions : []);
        const latest = sessionList[0];
        if (latest) {
          setSessionId(latest.sessionId);
          const msgs = await apiClient.get<any>(`/api/Chat/sessions/${latest.sessionId}/messages?userId=${userId}`);
          const msgList: any[] = msgs?.data ?? (Array.isArray(msgs) ? msgs : []);
          const loaded: Message[] = msgList.map(m => ({
            role: m.sender === 'User' ? 'user' : 'model',
            content: m.text,
          }));
          if (loaded.length > 0) {
            setMessages(loaded);
            setHistoryLoaded(true);
            return;
          }
        }
      } catch { /* ignore */ }
      setMessages([{ role: 'model', content: 'Xin chào! Tôi là trợ lý AI của VN Player Rating. Bạn có thể hỏi tôi về cầu thủ, đội bóng, trận đấu hoặc bất kỳ thông tin nào về 3 giải bóng đá Việt Nam.' }]);
      setHistoryLoaded(true);
    })();
  }, []); // chỉ chạy 1 lần khi mount

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const userId = getUserId();
      const data = await apiClient.post<{ response: string; sessionId: string }>('/api/Chat', {
        UserId: userId,
        SessionId: sessionId || undefined,
        Message: msg,
      });
      setMessages(prev => [...prev, { role: 'model', content: data.response }]);
      if (data.sessionId) setSessionId(data.sessionId);
    } catch {
      setMessages(prev => [...prev, { role: 'model', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099BB] shadow-lg shadow-[#00D9FF]/30 flex items-center justify-center hover:scale-110 transition-transform"
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-6 h-6 text-white" /></motion.div>
            : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Sparkles className="w-6 h-6 text-white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f0f1a]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#00D9FF]/20 to-[#0099BB]/10 border-b border-slate-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#0099BB] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-foreground">VN Football AI</p>
                <p className="text-[10px] text-slate-500 dark:text-[#A8A29E]">Powered by Gemini</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {!historyLoaded && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-[#00D9FF] animate-spin" />
                </div>
              )}
              {messages.map((msg, i) => {
                const playerIds = msg.role === 'model' ? extractPlayerIds(msg.content) : [];
                return (
                  <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      msg.role === 'user' ? 'bg-[#FF4444]/20' : 'bg-[#00D9FF]/20')}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-[#FF4444]" /> : <Bot className="w-3.5 h-3.5 text-[#00D9FF]" />}
                    </div>
                    <div className="max-w-[80%]">
                      <div className={cn('px-3 py-2 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-[#FF4444]/10 text-slate-900 dark:text-foreground rounded-tr-sm'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-foreground rounded-tl-sm')}>
                        {renderContent(msg.content)}
                      </div>
                      {/* Player cards */}
                      {playerIds.map(id => <PlayerCard key={id} playerId={id} />)}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#00D9FF]/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#00D9FF]" />
                  </div>
                  <div className="bg-slate-100 dark:bg-white/5 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-white/10">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Hỏi về cầu thủ, trận đấu..."
                  className="flex-1 h-9 px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/30 border border-slate-200 dark:border-white/10"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl bg-[#00D9FF] flex items-center justify-center disabled:opacity-40 hover:bg-[#00E8FF] transition-colors flex-shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
