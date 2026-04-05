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

const PAGE_SIZE = 10;

function teamLogo(id: number) {
  return `https://api.sofascore.app/api/v1/team/${id}/image`;
}

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function fmtTime(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function MatchCard({ match, liveUpdate, index }: { match: SofascoreTeamMatch; liveUpdate?: LiveMatchUpdate; index: number }) {
  const homeScore = liveUpdate?.homeScore ?? match.homeScore.current;
  const awayScore = liveUpdate?.awayScore ?? match.awayScore.current;
  const isLive = liveUpdate ? liveUpdate.status !== 'finished' : match.status.type === 'inprogress';
  const isFinished = liveUpdate?.status === 'finished' || match.status.type === 'finished';
  const isPostponed = match.status.type === 'postponed';
  const currentMinute = liveUpdate?.currentMinute;
  const homeWin = isFinished && homeScore > awayScore;
  const awayWin = isFinished && awayScore > homeScore;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.02 }}>
      <Link to={`/matches/${match.id}`}>
        <div className={cn(
          'group relative flex items-center hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer',
          isLive && 'bg-[#FF4444]/[0.04]'
        )}>
          {isLive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#FF4444] rounded-full" />}

          {/* Time / Status */}
          <div className="flex-shrink-0 w-[72px] px-3 py-3.5 text-center">
            {isLive ? (
              <div className="flex flex-col items-center gap-0.5">
                <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                <span className="text-[11px] font-bold text-[#FF4444]">
                  {currentMinute ? `${formatMinute(currentMinute)}'` : 'Live'}
                </span>
              </div>
            ) : isPostponed ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-bold text-amber-500 uppercase">Hoãn</span>
                <span className="text-[10px] text-slate-400">{fmtDate(match.startTimestamp)}</span>
              </div>
            ) : isFinished ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[11px] font-bold text-slate-400 dark:text-[#A8A29E]">FT</span>
                <span className="text-[10px] text-slate-400 dark:text-[#A8A29E]/70">{fmtDate(match.startTimestamp)}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[13px] font-mono-data font-bold text-[#00D9FF]">{fmtTime(match.startTimestamp)}</span>
                <span className="text-[10px] text-slate-400 dark:text-[#A8A29E]/70">{fmtDate(match.startTimestamp)}</span>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-slate-100 dark:bg-white/5 flex-shrink-0" />

          {/* Home */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3.5 justify-end min-w-0">
            <span className={cn(
              'text-sm font-semibold truncate text-right group-hover:text-[#00D9FF] transition-colors',
              isFinished && !homeWin ? 'text-slate-400 dark:text-[#A8A29E]' : 'text-slate-900 dark:text-foreground'
            )}>
              {match.homeTeam.name}
            </span>
            <img src={teamLogo(match.homeTeam.id)} alt="" className="w-7 h-7 object-contain flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>

          {/* Score */}
          <div className="flex-shrink-0 w-[72px] text-center">
            {(isFinished || isLive) ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className={cn('font-mono-data text-lg font-black w-6 text-right',
                    homeWin ? 'text-slate-900 dark:text-foreground' : isLive ? 'text-[#FF4444]' : 'text-slate-400 dark:text-[#A8A29E]')}>
                    {homeScore}
                  </span>
                  <span className="text-slate-300 dark:text-white/20 font-bold text-sm">-</span>
                  <span className={cn('font-mono-data text-lg font-black w-6 text-left',
                    awayWin ? 'text-slate-900 dark:text-foreground' : isLive ? 'text-[#FF4444]' : 'text-slate-400 dark:text-[#A8A29E]')}>
                    {awayScore}
                  </span>
                </div>
                {match.homeScore.penalties != null && (
                  <span className="text-[10px] text-slate-400">
                    ({match.homeScore.penalties}-{match.awayScore.penalties}) p
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-300 dark:text-white/20">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3.5 min-w-0">
            <img src={teamLogo(match.awayTeam.id)} alt="" className="w-7 h-7 object-contain flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className={cn(
              'text-sm font-semibold truncate group-hover:text-[#00D9FF] transition-colors',
              isFinished && !awayWin ? 'text-slate-400 dark:text-[#A8A29E]' : 'text-slate-900 dark:text-foreground'
            )}>
              {match.awayTeam.name}
            </span>
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
  const [teamSearch, setTeamSearch] = useState('');
  const [page, setPage] = useState(0);
  const { updates: liveUpdates, connected: liveConnected } = useLiveMatch();
  const prevLiveCount = useRef(0);

  const activeLeague = LEAGUES[activeLeagueIdx];

  const loadMatches = useCallback(async (league: typeof LEAGUES[0], force = false) => {
    if (!force && matchesByLeague[league.tournamentId]) return;
    setIsLoading(true);
    try {
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
      setMatchesByLeague(prev => ({ ...prev, [league.tournamentId]: matches }));
    } catch {}
    finally { setIsLoading(false); }
  }, [matchesByLeague]);

  useEffect(() => {
    const count = Object.keys(liveUpdates).length;
    if (count > prevLiveCount.current) {
      prevLiveCount.current = count;
      loadMatches(activeLeague, true);
    }
  }, [liveUpdates]);

  useEffect(() => {
    loadMatches(activeLeague);
    setSelectedRound(null);
    setSelectedStatus('all');
    setTeamSearch('');
    setPage(0);
  }, [activeLeagueIdx]);

  const currentMatches = matchesByLeague[activeLeague.tournamentId] ?? [];

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
    const merged = currentMatches.map(m => {
      const live = liveUpdates[m.id];
      if (!live) return m;
      return {
        ...m,
        homeScore: { ...m.homeScore, current: live.homeScore ?? m.homeScore.current },
        awayScore: { ...m.awayScore, current: live.awayScore ?? m.awayScore.current },
        status: { type: live.status === 'finished' ? 'finished' : 'inprogress' },
      } as SofascoreTeamMatch;
    });
    return [...injected, ...merged];
  }, [liveUpdates, currentMatches]);

  const teamsInLeague = [...new Map(
    allMatches.flatMap(m => [m.homeTeam, m.awayTeam]).map(t => [t.id, t])
  ).values()].sort((a, b) => a.name.localeCompare(b.name));

  const rounds = [...new Set(
    allMatches.map(m => m.roundInfo?.round).filter((r): r is number => r != null)
  )].sort((a, b) => a - b);

  const liveCount = allMatches.filter(m => m.status.type === 'inprogress').length;

  const filtered = allMatches.filter(m => {
    if (selectedStatus !== 'all' && m.status.type !== selectedStatus) return false;
    if (selectedRound !== null && m.roundInfo?.round !== selectedRound) return false;
    if (selectedStatus === 'notstarted' && selectedRound === null) {
      const nextRound = Math.min(...allMatches.filter(x => x.status.type === 'notstarted' && x.roundInfo?.round != null).map(x => x.roundInfo!.round!));
      if (isFinite(nextRound) && m.roundInfo?.round !== nextRound) return false;
    }
    if (teamSearch && m.homeTeam.name !== teamSearch && m.awayTeam.name !== teamSearch) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) =>
    selectedStatus === 'finished' ? b.startTimestamp - a.startTimestamp : a.startTimestamp - b.startTimestamp
  );

  const liveMatches = sorted.filter(m => m.status.type === 'inprogress');
  const otherMatches = sorted.filter(m => m.status.type !== 'inprogress');
  const totalPages = Math.ceil(otherMatches.length / PAGE_SIZE);
  const paged = otherMatches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const grouped: { round: number | null; label: string; matches: SofascoreTeamMatch[] }[] = [];
  for (const m of paged) {
    const r = m.roundInfo?.round ?? null;
    const label = r != null ? `Vòng ${r}` : 'Cup';
    const existing = grouped.find(g => g.round === r);
    if (existing) existing.matches.push(m);
    else grouped.push({ round: r, label, matches: [m] });
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-4xl">

          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="relative glass-card rounded-2xl overflow-hidden mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF4444]/5 via-transparent to-[#00D9FF]/5 pointer-events-none" />
            <div className="relative px-6 pt-5 pb-0">
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-foreground">
                  Lịch thi đấu
                </h1>
                {liveConnected && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] font-semibold text-green-400">Live</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-[#A8A29E] mb-4">Kết quả và lịch đấu các giải Việt Nam</p>
            </div>
            <div className="flex border-t border-slate-100 dark:border-white/5 px-2">
              {LEAGUES.map((l, i) => (
                <button key={l.tournamentId} onClick={() => setActiveLeagueIdx(i)}
                  className={cn('relative px-4 py-3.5 text-sm font-semibold transition-colors whitespace-nowrap',
                    activeLeagueIdx === i ? 'text-[#FF4444]' : 'text-slate-500 dark:text-[#A8A29E] hover:text-slate-700 dark:hover:text-foreground')}>
                  {l.name}
                  {activeLeagueIdx === i && (
                    <motion.div layoutId="matches-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4444] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
            className="glass-card rounded-2xl overflow-hidden mb-4">
            <div className="flex border-b border-slate-100 dark:border-white/5 px-2">
              {([
                { value: 'all',        label: 'Tất cả',      live: false },
                { value: 'inprogress', label: 'Trực tiếp',   live: true  },
                { value: 'finished',   label: 'Kết quả',     live: false },
                { value: 'notstarted', label: 'Sắp diễn ra', live: false },
              ] as const).map(tab => (
                <button key={tab.value}
                  onClick={() => { setSelectedStatus(tab.value); setPage(0); }}
                  className={cn('relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap',
                    selectedStatus === tab.value ? 'text-[#00D9FF]' : 'text-slate-500 dark:text-[#A8A29E] hover:text-slate-700 dark:hover:text-foreground')}>
                  {tab.live && <Radio className="w-3.5 h-3.5" />}
                  {tab.label}
                  {tab.live && liveCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#FF4444] text-white px-1.5 py-0.5 rounded-full leading-none">{liveCount}</span>
                  )}
                  {selectedStatus === tab.value && (
                    <motion.div layoutId="status-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D9FF] rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
              {rounds.length > 0 && (
                <select value={selectedRound ?? ''} onChange={e => { setSelectedRound(e.target.value === '' ? null : Number(e.target.value)); setPage(0); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#A8A29E] border border-slate-200 dark:border-white/10 focus:outline-none cursor-pointer">
                  <option value="">Tất cả vòng</option>
                  {rounds.map(r => <option key={r} value={r}>Vòng {r}</option>)}
                </select>
              )}
              <select value={teamSearch} onChange={e => { setTeamSearch(e.target.value); setPage(0); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-[#A8A29E] border border-slate-200 dark:border-white/10 focus:outline-none cursor-pointer min-w-[140px]">
                <option value="">Tất cả đội</option>
                {teamsInLeague.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
              {(selectedRound !== null || teamSearch) && (
                <button onClick={() => { setSelectedRound(null); setTeamSearch(''); setPage(0); }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-foreground transition-colors">
                  ✕ Xóa lọc
                </button>
              )}
              <span className="ml-auto text-xs text-slate-400 dark:text-[#A8A29E]">{filtered.length} trận</span>
            </div>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="glass-card rounded-2xl flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-white/20 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Không có trận đấu nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveMatches.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FF4444]/5 border-b border-[#FF4444]/10">
                    <Radio className="w-3.5 h-3.5 text-[#FF4444] animate-pulse" />
                    <span className="text-xs font-bold text-[#FF4444] uppercase tracking-wider">Đang diễn ra</span>
                    <span className="ml-auto text-xs text-[#FF4444]/60">{liveMatches.length} trận</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {liveMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} liveUpdate={liveUpdates[m.id]} />)}
                  </div>
                </div>
              )}

              {grouped.map(group => (
                <div key={group.round ?? 'cup'} className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/5">
                    <div className="w-5 h-5 rounded-md bg-[#00D9FF]/15 flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-3 h-3 text-[#00D9FF]" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">{group.label}</span>
                    <span className="ml-auto text-xs text-slate-400">{group.matches.length} trận</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {group.matches.map((m, i) => <MatchCard key={m.id} match={m} index={i} liveUpdate={liveUpdates[m.id]} />)}
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="glass-card rounded-2xl flex items-center justify-between px-5 py-3">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-[#A8A29E] hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-4 h-4" />Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const p = totalPages <= 7 ? i : page < 4 ? i : page > totalPages - 4 ? totalPages - 7 + i : page - 3 + i;
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className={cn('w-8 h-8 rounded-lg text-sm font-semibold transition-colors',
                            p === page ? 'bg-[#00D9FF] text-slate-900' : 'text-slate-500 dark:text-[#A8A29E] hover:bg-slate-100 dark:hover:bg-white/5')}>
                          {p + 1}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-[#A8A29E] hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    Sau<ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
