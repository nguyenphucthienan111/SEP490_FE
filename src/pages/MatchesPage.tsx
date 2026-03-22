import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Radio, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { Match as ApiMatch, leagueService } from '@/services/leagueService';
import { toast } from 'sonner';

function MatchCard({ match, index }: { match: ApiMatch; index: number }) {
  const isLive = match.status.includes('Halftime') || match.status === 'Match Finished - After Penalties';
  const isCompleted = match.status === 'Match Finished';
  const isScheduled = match.status === 'Not Started';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/matches/${match.matchId}`}>
        <div className={cn(
          "group glass-card rounded-2xl p-6 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent",
          isLive ? "border-[#FF4444]/30 hover:border-[#FF4444]/50" : "hover:border-[#00D9FF]/20"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {match.round && (
                <span className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider">
                  {match.round}
                </span>
              )}
            </div>
            {isLive && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4444]/20 rounded-full">
                <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                <span className="text-xs font-label font-semibold text-[#FF4444] uppercase">Trực tiếp</span>
              </span>
            )}
            {isCompleted && (
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-label text-slate-600 dark:text-[#A8A29E]">Kết thúc</span>
            )}
            {isScheduled && (
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-[#00D9FF]/10 rounded-full text-xs font-label text-[#00D9FF]">Sắp diễn ra</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 overflow-hidden border border-slate-200 dark:border-white/10">
                {match.homeTeam.logoUrl ? (
                  <img src={match.homeTeam.logoUrl} alt={match.homeTeam.teamName} className="w-12 h-12 object-contain" />
                ) : (
                  <span className="font-display font-bold text-xl text-foreground">{match.homeTeam.teamName.charAt(0)}</span>
                )}
              </div>
              <h4 className="font-body font-semibold text-foreground text-sm">{match.homeTeam.teamName}</h4>
              <span className="text-xs text-slate-600 dark:text-[#A8A29E]">Home</span>
            </div>

            <div className="flex flex-col items-center">
              {(isLive || isCompleted) ? (
                <div className="flex items-center gap-4">
                  <span className="font-mono-data text-4xl font-bold text-foreground">{match.homeGoals}</span>
                  <span className="text-slate-600 dark:text-[#A8A29E] text-2xl">-</span>
                  <span className="font-mono-data text-4xl font-bold text-foreground">{match.awayGoals}</span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-mono-data text-xl text-[#00D9FF] mb-1">
                    {new Date(match.matchDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Kick-off</p>
                </div>
              )}
            </div>

            <div className="flex-1 text-right">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 ml-auto overflow-hidden border border-slate-200 dark:border-white/10">
                {match.awayTeam.logoUrl ? (
                  <img src={match.awayTeam.logoUrl} alt={match.awayTeam.teamName} className="w-12 h-12 object-contain" />
                ) : (
                  <span className="font-display font-bold text-xl text-foreground">{match.awayTeam.teamName.charAt(0)}</span>
                )}
              </div>
              <h4 className="font-body font-semibold text-foreground text-sm">{match.awayTeam.teamName}</h4>
              <span className="text-xs text-slate-600 dark:text-[#A8A29E]">Away</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200 dark:border-white/5 text-sm text-slate-600 dark:text-[#A8A29E]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(match.matchDate).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            {match.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="truncate max-w-[140px]">{match.venue}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MatchesPage() {
  const [apiMatches, setApiMatches] = useState<ApiMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => { loadMatches(); }, []);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const fetchedMatches = await leagueService.getMatches(1, 13);
      setApiMatches(fetchedMatches);
    } catch (error) {
      toast.error('Không thể tải danh sách trận đấu');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatches = apiMatches.filter((m) => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'completed') return m.status === 'Match Finished';
    if (selectedStatus === 'scheduled') return m.status === 'Not Started';
    if (selectedStatus === 'live') return m.status.includes('Halftime');
    return true;
  });

  const liveMatches = filteredMatches.filter(m => m.status.includes('Halftime') || m.status === 'Match Finished - After Penalties');
  const otherMatches = filteredMatches.filter(m => !m.status.includes('Halftime') && m.status !== 'Match Finished - After Penalties');

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-3">
                Lịch thi đấu
              </h1>
              <p className="text-slate-600 dark:text-[#A8A29E] text-lg max-w-2xl">
                Kết quả, lịch đấu và trận đang diễn ra
              </p>
            </div>
            <button
              onClick={loadMatches}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00D9FF] hover:bg-[#00E8FF] text-slate-900 font-label font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Làm mới
            </button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-4 sm:p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'live', label: 'Trực tiếp' },
                  { value: 'completed', label: 'Kết thúc' },
                  { value: 'scheduled', label: 'Sắp diễn ra' },
                ].map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedStatus(s.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all duration-200",
                      selectedStatus === s.value
                        ? "bg-[#00D9FF]/20 text-[#00D9FF]"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-[#00D9FF] animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-[#A8A29E]">Đang tải trận đấu...</p>
              </div>
            </div>
          ) : (
            <>

          {/* Live Matches */}
          {liveMatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-6">
                <Radio className="w-5 h-5 text-[#FF4444] animate-pulse" />
                <h2 className="font-display font-bold text-xl text-foreground">
                  Live Now
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {liveMatches.map((match, index) => (
                  <MatchCard key={match.matchId} match={match} index={index} />
                ))}
              </div>
            </motion.div>
          )}

              {/* Others */}
              {otherMatches.length > 0 && (
                <>
                  <h2 className="font-display font-bold text-xl text-foreground mb-6">
                    {selectedStatus === 'scheduled' ? 'Sắp diễn ra' :
                     selectedStatus === 'completed' ? 'Kết quả' : 'Tất cả trận đấu'}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {otherMatches.map((m, i) => (
                      <MatchCard key={m.matchId} match={m} index={i} />
                    ))}
                  </div>
                </>
              )}

          <div className="grid md:grid-cols-2 gap-6">
            {otherMatches.map((match, index) => (
              <MatchCard key={match.matchId} match={match} index={index} />
            ))}
          </div>
          </>
          )}

          {/* Empty State */}
          {!isLoading && filteredMatches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-slate-600 dark:text-[#A8A29E]" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                No Matches Found
              </h3>
              <p className="text-slate-600 dark:text-[#A8A29E]">
                Try adjusting your filters.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
