import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, Users, Trophy, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leagueService, PlayerFromAPI } from '@/services/leagueService';
import { cn } from '@/lib/utils';

const POS_LABEL: Record<string, string> = { G: 'Thủ môn', D: 'Hậu vệ', M: 'Tiền vệ', F: 'Tiền đạo' };
const POS_COLOR: Record<string, string> = {
  G: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
  D: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  M: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  F: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
};

type FeaturedPlayer = PlayerFromAPI & { rating: number };

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 60;
    const timer = setInterval(() => {
      frame++;
      setVal(Math.floor((frame / total) * target));
      if (frame >= total) { setVal(target); clearInterval(timer); }
    }, 1500 / total);
    return () => clearInterval(timer);
  }, [target]);
  return <span className="font-mono-data">{val.toLocaleString()}{suffix}</span>;
}

export function HeroSection() {
  const [players, setPlayers] = useState<FeaturedPlayer[]>([]);
  const [idx, setIdx] = useState(0);
  const [stats, setStats] = useState({ players: 0, leagues: 3 });

  useEffect(() => {
    const load = async () => {
      try {
        const [allPlayers, ratings] = await Promise.all([
          leagueService.getAllPlayers(),
          leagueService.getAllPlayerSeasonRatings(),
        ]);
        const top = allPlayers
          .map(p => ({ ...p, rating: ratings[p.playerId] ?? 0 }))
          .filter(p => p.rating > 0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5) as FeaturedPlayer[];
        setPlayers(top);
        setStats({ players: allPlayers.length, leagues: 3 });
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (players.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % players.length), 4000);
    return () => clearInterval(t);
  }, [players.length]);

  const player = players[idx];

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background blobs — subtle in both modes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-[#FF4444]/6 dark:bg-[#FF4444]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00D9FF]/6 dark:bg-[#00D9FF]/8 rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF4444]/30 bg-[#FF4444]/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#FF4444] animate-pulse" />
              <span className="text-xs font-label font-bold text-[#FF4444] uppercase tracking-widest">Mùa giải 2025/26 đang diễn ra</span>
            </motion.div>

            <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.05] mb-6">
              Hệ thống<br />
              phân tích{' '}
              <span className="text-gradient">bóng đá</span>
              <br />
              Việt Nam
              <br />
              <span className="text-foreground/30 text-4xl sm:text-5xl lg:text-6xl">chuyên sâu</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
              Dữ liệu thực, chỉ số minh bạch — theo dõi cầu thủ, kết quả và bảng xếp hạng V-League theo thời gian thực.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <Link to="/players">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 bg-[#FF4444] hover:bg-[#ff5555] text-white font-label font-bold rounded-xl shadow-lg shadow-[#FF4444]/25 transition-colors group">
                  Khám phá cầu thủ
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/matches">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 border border-border text-foreground/70 hover:text-foreground hover:border-foreground/30 font-label font-semibold rounded-xl transition-all">
                  Xem trận đấu
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Users, label: 'Cầu thủ', value: stats.players || 500, suffix: '+' },
                { icon: Trophy, label: 'Giải đấu', value: stats.leagues, suffix: '' },
                { icon: TrendingUp, label: 'Điểm dữ liệu', value: 50, suffix: 'K+' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="w-4 h-4 text-[#00D9FF]" />
                    <span className="text-xs text-muted-foreground font-label uppercase tracking-wider">{s.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    <AnimatedNumber target={s.value} suffix={s.suffix} />
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Featured Player Card */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3 }}
            className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF4444]/15 to-[#00D9FF]/15 rounded-3xl blur-2xl scale-95" />

            <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-xl">
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-label font-bold text-muted-foreground uppercase tracking-widest">Cầu thủ nổi bật</span>
                </div>
                <div className="flex gap-1.5">
                  {players.map((_, i) => (
                    <button key={i} onClick={() => setIdx(i)}
                      className={cn('h-1.5 rounded-full transition-all duration-300', i === idx ? 'w-6 bg-[#FF4444]' : 'w-1.5 bg-foreground/15 hover:bg-foreground/30')} />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {player ? (
                  <motion.div key={player.playerId}
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }} className="p-6">
                    <div className="flex items-start gap-5 mb-6">
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border border-border">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.fullName} className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl font-bold">
                              {player.fullName?.[0]}
                            </div>
                          )}
                        </div>
                        {player.isInjured && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">!</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-xl text-foreground truncate mb-1">{player.fullName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{player.nationality}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {player.position && (
                            <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-bold border', POS_COLOR[player.position] ?? 'bg-muted text-muted-foreground border-border')}>
                              {POS_LABEL[player.position] ?? player.position}
                            </span>
                          )}
                          {player.number && (
                            <span className="text-xs text-muted-foreground font-mono-data">#{player.number}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4444] to-[#ff6b6b] flex flex-col items-center justify-center shadow-lg shadow-[#FF4444]/30">
                          <span className="font-mono-data text-2xl font-black text-white leading-none">{player.rating.toFixed(1)}</span>
                          <span className="text-[9px] text-white/70 uppercase tracking-wider mt-0.5">Rating</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Chỉ số đánh giá</span>
                        <span className="font-mono-data">{player.rating.toFixed(2)} / 10</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(player.rating / 10) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-[#FF4444] to-[#00D9FF]" />
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Tuổi', value: player.age ?? '—' },
                        { label: 'Chiều cao', value: player.heightCm ? `${player.heightCm}cm` : '—' },
                      ].map(s => (
                        <div key={s.label} className="text-center p-3 rounded-xl bg-muted border border-border">
                          <p className="font-mono-data text-lg font-bold text-foreground">{s.value}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <Link to={`/players/${player.playerId}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all group">
                      Xem hồ sơ đầy đủ
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                ) : (
                  <div className="p-6 h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#00D9FF]/30 border-t-[#00D9FF] rounded-full animate-spin" />
                  </div>
                )}
              </AnimatePresence>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              className="absolute -bottom-4 -left-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card border border-[#00D9FF]/30 shadow-lg">
              <Zap className="w-4 h-4 text-[#00D9FF]" />
              <span className="text-xs font-label font-bold text-[#00D9FF]">Dữ liệu thực</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
