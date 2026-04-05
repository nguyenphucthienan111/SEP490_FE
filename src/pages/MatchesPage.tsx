import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Radio, Loader2, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { leagueService, SofascoreTeamMatch } from '@/services/leagueService';
import { useLiveMatch, LiveMatchUpdate } from '@/hooks/useLiveMatch';
import { formatMinute } from '@/lib/utils';

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

function MatchCard({ match, index, liveUpdate }: { match: SofascoreTeamMatch; index: number; liveUpdate?: LiveMatchUpdate }) {
  // Merge live update nếu có
  const homeScore = liveUpdate?.homeScore ?? match.homeScore.current;
  const awayScore = liveUpdate?.awayScore ?? match.awayScore.current;
  const isLive = liveUpdate ? liveUpdate.status !== 'finished' : match.status.type === 'inprogress';
  const isFinished = liveUpdate?.status === 'finished' || match.status.type === 'finished';
  const currentMinute = liveUpdate?.currentMinute;
  // Ưu tiên status từ liveUpdate, fallback về match.status.type
  const st = liveUpdate?.status === 'finished' ? 'finished'
    : isLive ? 'inprogress'
    : match.status.type;
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
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-3">
                  <span className={cn('font-mono-data text-4xl font-bold', isLive ? 'text-[#FF4444]' : 'text-foreground')}>{homeScore}</span>
                  <span className="text-slate-400 text-2xl">-</span>
                  <span className={cn('font-mono-data text-4xl font-bold', isLive ? 'text-[#FF4444]' : 'text-foreground')}>{awayScore}</span>
                </div>
                {isLive && currentMinute && (
                  <span className="text-xs font-bold text-[#FF4444] animate-pulse">{formatMinute(currentMinute)}'</span>
                )}
                {(match.homeScore.penalties != null || match.awayScore.penalties != null) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#A8A29E]">
                    <span className="font-mono-data font-semibold">({match.homeScore.penalties ?? 0})</span>
                    <span>pen</span>
                    <span className="font-mono-data font-semibold">({match.awayScore.penalties ?? 0})</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-mono-data text-xl text-[#00D9FF]">
                {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-[#A8A29E] mt-1">
              {date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
  const { updates: liveUpdates, connected: liveConnected } = useLiveMatch();

  // Force reload matches khi nhận live update để cập nhật status từ DB
  const prevLiveCount = useRef(0);
  useEffect(() => {
    const count = Object.keys(liveUpdates).length;
    if (count > prevLiveCount.current) {
      prevLiveCount.current = count;
      // Clear cache và force reload để lấy status mới nhất từ DB
      sessionStorage.removeItem('sofascore-matches');
      loadMatches(activeLeague, true);
    }
  }, [liveUpdates]);
  const [teamSearch, setTeamSearch] = useState('');
  const [showAllFinished, setShowAllFinished] = useState(false);
  const [finishedPage, setFinishedPage] = useState(0); // for "Kết thúc" tab pagination
  const PAGE_SIZE = 10;

  const activeLeague = LEAGUES[activeLeagueIdx];

  const loadMatches = useCallback(async (league: typeof LEAGUES[0], force = false) => {
    if (!force && matchesByLeague[league.tournamentId]) return;
    setIsLoading(true);
    try {
      // Fetch from DB — fast, no scraping
      const data = await leagueService.getAllMatchesFromDb(league.tournamentId, league.seasonId);
      const matches: SofascoreTeamMatch[] = data.map((m: any) => ({
        id: m.apiFixtureId ?? m.matchId,
        homeTeam: { id: m.homeTeam?.apiTeamId ?? 0, name: m.homeTeam?.teamName ?? '' },
        awayTeam: { id: m.awayTeam?.apiTeamId ?? 0, name: m.awayTeam?.teamName ?? '' },
        homeScore: { current: m.homeGoals ?? 0, penalties: m.homePenalties ?? null },
        awayScore: { current: m.awayGoals ?? 0, penalties: m.awayPenalties ?? null },
        startTimestamp: m.matchDate ? Math.floor(new Date(m.matchDate).getTime() / 1000) : 0,
        status: { type: m.status ?? 'notstarted' },
        roundInfo: m.round ? { round: Number(m.round) } : undefined,
      }));
      matches.sort((a, b) => a.startTimestamp - b.startTimestamp);
      setMatchesByLeague(prev => {
        const updated = { ...prev, [league.tournamentId]: matches };
        const all = Object.values(updated).flat();
        try { sessionStorage.setItem('sofascore-matches', JSON.stringify(all)); } catch { /* ignore */ }
        return updated;
      });
    } catch {
      // fallback silent
    } finally {
      setIsLoading(false);
    }
  }, [matchesByLeague]);

  useEffect(() => {
    loadMatches(activeLeague);
    setSelectedRound(null);
    setSelectedStatus('all');
    setTeamSearch('');
    setShowAllFinished(false);
    setFinishedPage(0);
  }, [activeLeagueIdx]);

  const currentMatches = matchesByLeague[activeLeague.tournamentId] ?? [];

  // Inject live/finished matches từ SignalR nếu chưa có trong DB
  const allMatches = useMemo(() => {
    const existing = new Set(currentMatches.map(m => m.id));
    const injected: SofascoreTeamMatch[] = Object.values(liveUpdates)
      .filter(u => !existing.has(u.eventId))
      .map(u => ({
        id: u.eventId,
        homeTeam: { id: 0, name: u.homeTeam ?? 'Home' },
        awayTeam: { id: 0, name: u.awayTeam ?? 'Away' },
        homeScore: { current: u.homeScore ?? 0 },
        awayScore: { current: u.awayScore ?? 0 },
        startTimestamp: Date.now() / 1000,
        status: { type: u.status === 'finished' ? 'finished' : 'inprogress' },
      }));

    // Merge live score vào trận đã có trong DB
    const merged = currentMatches.map(m => {
      const live = liveUpdates[m.id];
      if (!live) return m;
      return {
        ...m,
        homeScore: { ...m.homeScore, current: live.homeScore ?? m.homeScore.current },
        awayScore: { ...m.awayScore, current: live.awayScore ?? m.awayScore.current },
        status: { type: live.status === 'finished' ? 'finished' : 'inprogress' },
        _currentMinute: live.currentMinute,
      } as SofascoreTeamMatch & { _currentMinute?: number };
    });

    return [...injected, ...merged];
  }, [liveUpdates, currentMatches]);

  // Extract unique teams from current league matches
  const teamsInLeague = [...new Map(
    allMatches.flatMap(m => [m.homeTeam, m.awayTeam]).map(t => [t.id, t])
  ).values()].sort((a, b) => a.name.localeCompare(b.name));
  const rounds = [...new Set(allMatches.map(m => m.roundInfo?.round).filter((r): r is number => r != null))].sort((a, b) => a - b);

  const filtered = allMatches.filter(m => {
    if (selectedStatus !== 'all') {
      const st = m.status.type;
      if (selectedStatus === 'finished' && st !== 'finished') return false;
      if (selectedStatus === 'inprogress' && st !== 'inprogress') return false;
      if (selectedStatus === 'notstarted' && st !== 'notstarted') return false;
    }
    if (selectedRound !== null && m.roundInfo?.round !== selectedRound) return false;
    if (selectedStatus === 'notstarted' && selectedRound === null) {
      const nextRound = Math.min(
        ...allMatches
          .filter(x => x.status.type === 'notstarted' && x.roundInfo?.round != null)
          .map(x => x.roundInfo!.round!)
      );
      if (isFinite(nextRound) && m.roundInfo?.round !== nextRound) return false;
    }
    if (teamSearch) {
      if (m.homeTeam.name !== teamSearch && m.awayTeam.name !== teamSearch) return false;
    }
    return true;
  });

  // Sort: finished → newest first; upcoming/live → earliest first
  const sortedFiltered = [...filtered].sort((a, b) =>
    selectedStatus === 'finished'
      ? b.startTimestamp - a.startTimestamp
      : a.startTimestamp - b.startTimestamp
  );
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
            {liveConnected && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-green-400">Live updates</span>
              </div>
            )}
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
                  onClick={() => { setSelectedStatus(s.value as typeof selectedStatus); setFinishedPage(0); setShowAllFinished(false); }}
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

              {/* Team dropdown */}
              <select
                value={teamSearch}
                onChange={e => { setTeamSearch(e.target.value); setShowAllFinished(false); setFinishedPage(0); }}
                className="px-4 py-2 rounded-xl text-sm font-label font-medium bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#A8A29E] border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/40 cursor-pointer min-w-[160px]"
              >
                <option value="">Tất cả đội</option>
                {teamsInLeague.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
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
                    {liveMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} liveUpdate={liveUpdates[m.id]} />)}
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

                  {selectedStatus === 'finished' ? (
                    // Pagination với mũi tên trái/phải
                    (() => {
                      const totalPages = Math.ceil(otherMatches.length / PAGE_SIZE);
                      const paged = otherMatches.slice(finishedPage * PAGE_SIZE, (finishedPage + 1) * PAGE_SIZE);
                      return (
                        <>
                          <div className="grid md:grid-cols-2 gap-5">
                            {paged.map((m, i) => <MatchCard key={m.id} match={m} index={i} liveUpdate={liveUpdates[m.id]} />)}
                          </div>
                          {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-6">
                              <button
                                onClick={() => setFinishedPage(p => Math.max(0, p - 1))}
                                disabled={finishedPage === 0}
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-200 dark:border-white/10"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <span className="text-sm text-slate-500 dark:text-[#A8A29E] font-medium">
                                Trang {finishedPage + 1} / {totalPages}
                              </span>
                              <button
                                onClick={() => setFinishedPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={finishedPage >= totalPages - 1}
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-200 dark:border-white/10"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    // Tất cả / các tab khác: Xem thêm
                    <>
                      <div className="grid md:grid-cols-2 gap-5">
                        {otherMatches.slice(0, showAllFinished ? otherMatches.length : PAGE_SIZE).map((m, i) => <MatchCard key={m.id} match={m} index={i} liveUpdate={liveUpdates[m.id]} />)}
                      </div>
                      {otherMatches.length > PAGE_SIZE && !showAllFinished && (
                        <div className="flex justify-center mt-6">
                          <button
                            onClick={() => setShowAllFinished(true)}
                            className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#A8A29E] text-sm font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/10"
                          >
                            Xem thêm ({otherMatches.length - PAGE_SIZE} trận)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
