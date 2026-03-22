import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Radio, Loader2, RefreshCw, Trophy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { leagueService, SofascoreTeamMatch } from '@/services/leagueService';
import { toast } from 'sonner';

const LEAGUES = [
  { name: 'V-League 1', tournamentId: 626, seasonId: 78589 },
  { name: 'V-League 2', tournamentId: 771, seasonId: 80926 },
  { name: 'Vietnam Cup', tournamentId: 3087, seasonId: 81023 },
];

function teamLogo(teamId: number) {
  return `https://api.sofascore.app/api/v1/team/${teamId}/image`;
}

function statusLabel(status: string) {
  if (status === 'finished') return { text: 'Kết thúc', cls: 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E]' };
  if (status === 'inprogress') return { text: 'Trực tiếp', cls: 'bg-[#FF4444]/20 text-[#FF4444]' };
  if (status === 'postponed') return { text: 'Hoãn', cls: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' };
  return { text: 'Sắp diễn ra', cls: 'bg-blue-100 dark:bg-[#00D9FF]/10 text-[#00D9FF]' };
}

function MatchCard({ match, index }: { match: SofascoreTeamMatch; index: number }) {
  const st = match.status.type;
  const isLive = st === 'inprogress';
  const isFinished = st === 'finished';
  const label = statusLabel(st);
  const date = new Date(match.startTimestamp * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Link to={`/matches/${match.id}`} className="block">
      <div className={cn(
        'group glass-card rounded-2xl p-6 border border-transparent transition-all duration-300 cursor-pointer',
        isLive ? 'border-[#FF4444]/30' : 'hover:border-[#00D9FF]/20 hover:translate-y-[-4px] hover:shadow-xl'
      )}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs text-slate-500 dark:text-[#A8A29E] font-label uppercase tracking-wider">
            {match.roundInfo?.round ? `Vòng ${match.roundInfo.round}` : 'Cup'}
          </span>
          <span className={cn('px-3 py-1 rounded-full text-xs font-label font-semibold flex items-center gap-1.5', label.cls)}>
            {isLive && <Radio className="w-3 h-3 animate-pulse" />}
            {label.text}
          </span>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-4">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
              <img
                src={teamLogo(match.homeTeam.id)}
                alt={match.homeTeam.name}
                className="w-10 h-10 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <p className="font-body font-semibold text-sm text-center text-foreground leading-tight">
              {match.homeTeam.name}
            </p>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center min-w-[80px]">
            {(isFinished || isLive) ? (
              <div className="flex items-center gap-3">
                <span className="font-mono-data text-4xl font-bold text-foreground">{match.homeScore.current}</span>
                <span className="text-slate-400 text-2xl">-</span>
                <span className="font-mono-data text-4xl font-bold text-foreground">{match.awayScore.current}</span>
              </div>
            ) : (
              <p className="font-mono-data text-xl text-[#00D9FF]">
                {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-[#A8A29E] mt-1">
              {date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}
            </p>
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
              <img
                src={teamLogo(match.awayTeam.id)}
                alt={match.awayTeam.name}
                className="w-10 h-10 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <p className="font-body font-semibold text-sm text-center text-foreground leading-tight">
              {match.awayTeam.name}
            </p>
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}

export default function MatchesPage() {
  const [activeLeagueIdx, setActiveLeagueIdx] = useState(0);
  const [matchesByLeague, setMatchesByLeague] = useState<Record<number, SofascoreTeamMatch[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'finished' | 'inprogress' | 'notstarted'>('all');
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const activeLeague = LEAGUES[activeLeagueIdx];

  const loadMatches = useCallback(async (league: typeof LEAGUES[0], force = false) => {
    if (!force && matchesByLeague[league.tournamentId]) return;
    setIsLoading(true);
    try {
      // Fetch all pages from both last-matches and next-matches in parallel
      const fetchAll = async (fetcher: (page: number) => Promise<{ events: SofascoreTeamMatch[]; hasNextPage: boolean }>) => {
        const all: SofascoreTeamMatch[] = [];
        let page = 0;
        let hasNext = true;
        while (hasNext) {
          const { events, hasNextPage } = await fetcher(page);
          all.push(...events);
          hasNext = hasNextPage;
          page++;
        }
        return all;
      };

      const [lastEvents, nextEvents] = await Promise.all([
        fetchAll((p) => leagueService.getTournamentLastMatches(league.tournamentId, league.seasonId, p)),
        fetchAll((p) => leagueService.getTournamentNextMatches(league.tournamentId, league.seasonId, p)),
      ]);

      // Merge, deduplicate by id, sort by startTimestamp desc
      const seen = new Set<number>();
      const unique = [...lastEvents, ...nextEvents].filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      unique.sort((a, b) => a.startTimestamp - b.startTimestamp);
      setMatchesByLeague(prev => {
        const updated = { ...prev, [league.tournamentId]: unique };
        // Cache all matches for MatchDetailPage lookup
        const all = Object.values(updated).flat();
        try { sessionStorage.setItem('sofascore-matches', JSON.stringify(all)); } catch { /* ignore */ }
        return updated;
      });
    } catch {
      toast.error('Không thể tải trận đấu');
    } finally {
      setIsLoading(false);
    }
  }, [matchesByLeague]);

  useEffect(() => {
    loadMatches(activeLeague);
    setSelectedRound(null);
    setSelectedStatus('all');
  }, [activeLeagueIdx]);

  const currentMatches = matchesByLeague[activeLeague.tournamentId] ?? [];

  // Get sorted unique rounds
  const rounds = [...new Set(currentMatches.map(m => m.roundInfo?.round).filter((r): r is number => r != null))].sort((a, b) => a - b);

  const filtered = currentMatches.filter(m => {
    if (selectedStatus !== 'all') {
      const st = m.status.type;
      if (selectedStatus === 'finished' && st !== 'finished') return false;
      if (selectedStatus === 'inprogress' && st !== 'inprogress') return false;
      if (selectedStatus === 'notstarted' && st !== 'notstarted') return false;
    }
    if (selectedRound !== null && m.roundInfo?.round !== selectedRound) return false;
    // Khi filter "Sắp diễn ra" mà không chọn vòng cụ thể → chỉ hiện vòng tiếp theo gần nhất
    if (selectedStatus === 'notstarted' && selectedRound === null) {
      const nextRound = Math.min(
        ...currentMatches
          .filter(x => x.status.type === 'notstarted' && x.roundInfo?.round != null)
          .map(x => x.roundInfo!.round!)
      );
      if (isFinite(nextRound) && m.roundInfo?.round !== nextRound) return false;
    }
    return true;
  });

  // Sort all filtered matches by startTimestamp ascending (earliest first)
  const sortedFiltered = [...filtered].sort((a, b) => a.startTimestamp - b.startTimestamp);
  const liveMatches = sortedFiltered.filter(m => m.status.type === 'inprogress');
  const otherMatches = sortedFiltered.filter(m => m.status.type !== 'inprogress');

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
              <p className="text-slate-600 dark:text-[#A8A29E] text-lg">
                Kết quả và lịch đấu các giải Việt Nam
              </p>
            </div>
            <button
              onClick={() => loadMatches(activeLeague, true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00D9FF] hover:bg-[#00E8FF] text-slate-900 font-label font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              Làm mới
            </button>
          </motion.div>

          {/* League Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-4 sm:p-6 mb-6"
          >
            <div className="flex gap-1 border-b border-slate-200 dark:border-white/10 mb-5">
              {LEAGUES.map((l, i) => (
                <button
                  key={l.tournamentId}
                  onClick={() => setActiveLeagueIdx(i)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-semibold transition-colors relative whitespace-nowrap',
                    activeLeagueIdx === i
                      ? 'text-[#FF4444]'
                      : 'text-slate-500 dark:text-[#A8A29E] hover:text-foreground'
                  )}
                >
                  {l.name}
                  {activeLeagueIdx === i && (
                    <motion.div layoutId="matches-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4444]" />
                  )}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status pills */}
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'inprogress', label: '🔴 Trực tiếp' },
                { value: 'finished', label: 'Kết thúc' },
                { value: 'notstarted', label: 'Sắp diễn ra' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStatus(s.value as typeof selectedStatus)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-label font-medium transition-all border',
                    selectedStatus === s.value
                      ? 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/40'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] border-transparent hover:bg-slate-200 dark:hover:bg-white/10'
                  )}
                >
                  {s.label}
                </button>
              ))}

              {/* Divider */}
              {rounds.length > 0 && (
                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />
              )}

              {/* Round dropdown */}
              {rounds.length > 0 && (
                <select
                  value={selectedRound ?? ''}
                  onChange={(e) => setSelectedRound(e.target.value === '' ? null : Number(e.target.value))}
                  className="px-4 py-2 rounded-xl text-sm font-label font-medium bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#A8A29E] border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 cursor-pointer"
                >
                  <option value="">Tất cả vòng</option>
                  {rounds.map(r => (
                    <option key={r} value={r}>Vòng {r}</option>
                  ))}
                </select>
              )}
            </div>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-[#00D9FF] animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-[#A8A29E]">Đang tải trận đấu...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">Không có trận đấu</h3>
              <p className="text-slate-500 dark:text-[#A8A29E]">Thử thay đổi bộ lọc.</p>
            </div>
          ) : (
            <>
              {liveMatches.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
                  <div className="flex items-center gap-2 mb-5">
                    <Radio className="w-5 h-5 text-[#FF4444] animate-pulse" />
                    <h2 className="font-display font-bold text-xl text-foreground">Đang diễn ra</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    {liveMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
                  </div>
                </motion.div>
              )}

              {otherMatches.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-2 mb-5">
                    <Trophy className="w-5 h-5 text-[#A8A29E]" />
                    <h2 className="font-display font-bold text-xl text-foreground">
                      {selectedStatus === 'notstarted' ? 'Sắp diễn ra' : selectedStatus === 'finished' ? 'Kết quả' : 'Trận đấu'}
                    </h2>
                    <span className="text-sm text-slate-500 dark:text-[#A8A29E]">({otherMatches.length})</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    {otherMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
