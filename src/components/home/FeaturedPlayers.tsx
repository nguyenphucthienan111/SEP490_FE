import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, Star, Flame, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leagueService, PlayerFromAPI } from '@/services/leagueService';
import { cn } from '@/lib/utils';

const POS_LABEL: Record<string, string> = { G: 'Thủ môn', D: 'Hậu vệ', M: 'Tiền vệ', F: 'Tiền đạo' };
const POS_ICON: Record<string, any> = { G: Shield, D: Shield, M: Zap, F: Flame };
const POS_COLOR: Record<string, string> = {
  G: 'text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10',
  D: 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10',
  M: 'text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  F: 'text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10',
};
const RANK_COLORS = ['text-yellow-500', 'text-slate-400', 'text-amber-600', 'text-muted-foreground', 'text-muted-foreground', 'text-muted-foreground'];

type PlayerWithRating = PlayerFromAPI & { rating: number };

export function FeaturedPlayers() {
  const [players, setPlayers] = useState<PlayerWithRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [allPlayers, ratings] = await Promise.all([
          leagueService.getAllPlayers(),
          leagueService.getAllPlayerSeasonRatings(),
        ]);
        const withRating = allPlayers
          .map(p => ({ ...p, rating: ratings[p.playerId] ?? 0 }))
          .filter(p => p.rating > 0)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6) as PlayerWithRating[];
        setPlayers(withRating);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <section className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00D9FF]/4 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#FF4444] to-[#00D9FF]" />
              <span className="text-xs font-label font-bold text-[#00D9FF] uppercase tracking-widest">Cầu thủ</span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground">
              Top cầu thủ<br />
              <span className="text-gradient">mùa này</span>
            </h2>
          </div>
          <Link to="/players" className="flex items-center gap-2 text-sm font-semibold text-[#00D9FF] hover:text-foreground transition-colors group">
            Xem tất cả cầu thủ
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-3xl bg-muted border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {players.map((player, index) => {
              const PosIcon = POS_ICON[player.position ?? ''] ?? Star;
              const posColor = POS_COLOR[player.position ?? ''] ?? 'text-muted-foreground border-border bg-muted';
              return (
                <motion.div key={player.playerId}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }}>
                  <Link to={`/players/${player.playerId}`}>
                    <div className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                      {/* Rank number watermark */}
                      <span className={cn('absolute top-4 right-5 font-mono-data text-5xl font-black opacity-10', RANK_COLORS[index])}>
                        {index + 1}
                      </span>

                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border">
                              {player.photoUrl ? (
                                <img src={player.photoUrl} alt={player.fullName}
                                  className="w-full h-full object-cover object-top" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-7 h-7 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            {/* Rank badge */}
                            {index < 3 && (
                              <div className={cn('absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black',
                                index === 0 ? 'bg-yellow-400 text-yellow-900' : index === 1 ? 'bg-slate-300 text-slate-700' : 'bg-amber-600 text-white')}>
                                {index + 1}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-bold text-base text-foreground truncate group-hover:text-[#00D9FF] transition-colors mb-0.5">
                              {player.fullName}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate mb-2">{player.nationality}</p>
                            <div className="flex items-center gap-2">
                              {player.position && (
                                <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border', posColor)}>
                                  <PosIcon className="w-2.5 h-2.5" />
                                  {POS_LABEL[player.position] ?? player.position}
                                </span>
                              )}
                              {player.number && (
                                <span className="text-[10px] text-muted-foreground font-mono-data">#{player.number}</span>
                              )}
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex-shrink-0 text-right">
                            <p className="font-mono-data text-2xl font-black text-foreground">{player.rating.toFixed(1)}</p>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Đánh giá</p>
                          </div>
                        </div>

                        {/* Rating bar */}
                        <div className="mt-4">
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }}
                              whileInView={{ width: `${(player.rating / 10) * 100}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                              className="h-full rounded-full bg-gradient-to-r from-[#FF4444] to-[#00D9FF]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
