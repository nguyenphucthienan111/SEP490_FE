import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leagueService, SofascoreStandingRow } from '@/services/leagueService';
import { cn } from '@/lib/utils';

const LEAGUES = [
  { tournamentId: 626, seasonId: 78589, name: 'V-League 1', color: '#FF4444' },
  { tournamentId: 771, seasonId: 80926, name: 'V-League 2', color: '#00D9FF' },
];

function FormDot({ result }: { result: string }) {
  return (
    <span className={cn(
      'w-5 h-5 rounded-full text-[9px] font-black text-white flex items-center justify-center flex-shrink-0',
      result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-white/20' : 'bg-red-500'
    )}>{result}</span>
  );
}

export function AnalyticsHub() {
  const [data, setData] = useState<{ name: string; color: string; rows: SofascoreStandingRow[] }[]>([]);
  const [activeLeague, setActiveLeague] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const results = await Promise.allSettled(
        LEAGUES.map(async l => {
          const rows = await leagueService.getHybridStandings(l.tournamentId, l.seasonId);
          return { name: l.name, color: l.color, rows: rows.slice(0, 10) };
        })
      );
      setData(results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<any>).value));
      setLoading(false);
    };
    load();
  }, []);

  const current = data[activeLeague];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-[#FF4444]/4 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#FF4444] to-[#00D9FF]" />
              <span className="text-xs font-label font-bold text-[#00D9FF] uppercase tracking-widest">Bảng xếp hạng</span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground">
              Thứ hạng<br />
              <span className="text-gradient">mùa 2024/25</span>
            </h2>
          </div>
          <Link to="/leagues" className="flex items-center gap-2 text-sm font-semibold text-[#00D9FF] hover:text-white transition-colors group">
            Xem đầy đủ
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* League tabs */}
        <div className="flex gap-2 mb-6">
          {LEAGUES.map((l, i) => (
            <button key={l.tournamentId} onClick={() => setActiveLeague(i)}
              className={cn(
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                activeLeague === i ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/8'
              )}
              style={activeLeague === i ? { backgroundColor: l.color, boxShadow: `0 8px 24px ${l.color}30` } : {}}>
              {l.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-96 rounded-3xl bg-white/[0.03] border border-white/8 animate-pulse" />
        ) : current ? (
          <motion.div key={activeLeague} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl overflow-hidden border border-white/8 bg-white/[0.02]">
            {/* Table header */}
            <div className="grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem_5rem_4.5rem] gap-2 px-5 py-3 border-b border-white/8 text-[10px] font-bold uppercase tracking-widest text-white/25">
              <span>#</span>
              <span>Đội bóng</span>
              <span className="text-center">Tr</span>
              <span className="text-center">T</span>
              <span className="text-center">H</span>
              <span className="text-center">B</span>
              <span className="text-center">HS</span>
              <span className="text-center">Phong độ</span>
              <span className="text-center">Điểm</span>
            </div>

            <div>
              {current.rows.map((row, i) => {
                const gd = row.scoresFor - row.scoresAgainst;
                const form = (row.form ?? '').split('').slice(-5);
                const isTop3 = i < 3;
                const isBottom3 = i >= current.rows.length - 3;
                return (
                  <motion.div key={row.id}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }}
                    className={cn(
                      'grid grid-cols-[2.5rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3rem_5rem_4.5rem] gap-2 px-5 py-3.5 items-center border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors',
                    )}>
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      {i === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-black flex items-center justify-center">1</span>
                      ) : i === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 text-xs font-black flex items-center justify-center">2</span>
                      ) : i === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-500 text-xs font-black flex items-center justify-center">3</span>
                      ) : (
                        <span className="text-sm font-bold text-white/25 text-center w-full">{row.position}</span>
                      )}
                    </div>

                    {/* Team */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Promotion/relegation indicator */}
                      <div className="w-0.5 h-5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isTop3 ? current.color : isBottom3 ? '#FF4444' : 'transparent', opacity: 0.6 }} />
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={row.team.logo} alt="" className="w-5 h-5 object-contain"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <span className={cn('text-sm font-semibold truncate',
                        isTop3 ? 'text-white' : 'text-white/60')}>
                        {row.team.name}
                      </span>
                    </div>

                    <span className="text-xs font-mono-data text-center text-white/40">{row.matches}</span>
                    <span className="text-xs font-mono-data text-center text-green-400">{row.wins}</span>
                    <span className="text-xs font-mono-data text-center text-white/30">{row.draws}</span>
                    <span className="text-xs font-mono-data text-center text-red-400">{row.losses}</span>
                    <div className="flex items-center justify-center gap-1">
                      {gd > 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : gd < 0 ? <TrendingDown className="w-3 h-3 text-red-400" /> : <Minus className="w-3 h-3 text-white/20" />}
                      <span className={cn('text-xs font-mono-data font-bold',
                        gd > 0 ? 'text-green-400' : gd < 0 ? 'text-red-400' : 'text-white/30')}>
                        {gd > 0 ? '+' : ''}{gd}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 justify-center">
                      {form.map((r, fi) => <FormDot key={fi} result={r} />)}
                    </div>
                    <div className="text-center">
                      <span className={cn('font-mono-data text-lg font-black',
                        isTop3 ? 'text-white' : 'text-white/50')}>
                        {row.points}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
