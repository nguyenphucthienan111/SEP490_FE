import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, ChevronDown, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { PlayerFromAPI, PlayerStats, Team, leagueService } from '@/services/leagueService';

type PlayerWithStats = PlayerFromAPI & { statistics: PlayerStats[]; teamName?: string };

const POS_LABEL: Record<string, string> = { F: 'Tiền đạo', M: 'Tiền vệ', D: 'Hậu vệ', G: 'Thủ môn' };

function getLatestStats(stats: PlayerStats[]): PlayerStats | null {
  if (!stats.length) return null;
  // Ưu tiên stats có data thực (seasonId > 0 hoặc có appearances/goals/minutes)
  const real = stats.filter(s => (s.seasonId ?? 0) > 0 || s.appearances > 0 || s.minutes > 0 || s.goals > 0);
  const pool = real.length > 0 ? real : stats;
  // Sort: seasonId nhỏ nhất lên đầu (1 = mới nhất trong hệ thống này)
  // Nếu seasonId bằng nhau hoặc null, ưu tiên stats có nhiều appearances hơn
  return [...pool].sort((a, b) => {
    const sa = a.seasonId ?? 999;
    const sb = b.seasonId ?? 999;
    if (sa !== sb) return sa - sb;
    return (b.appearances ?? 0) - (a.appearances ?? 0);
  })[0];
}

// Aggregate tất cả mùa thành 1 stats object để so sánh tổng thể
function aggregateStats(stats: PlayerStats[]): PlayerStats | null {
  // Lọc bỏ placeholder (seasonId=0 và không có data)
  const real = stats.filter(s => s.appearances > 0 || s.minutes > 0 || s.goals > 0 || (s.seasonId ?? 0) > 0);
  if (!real.length) return stats.length ? stats[0] : null;

  const sum = (key: keyof PlayerStats) => real.reduce((acc, s) => acc + ((s[key] as number) ?? 0), 0);
  const avg = (key: keyof PlayerStats) => {
    const vals = real.map(s => s[key] as number | null).filter(v => v != null) as number[];
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  const first = real[0];
  return {
    ...first,
    appearances: sum('appearances'),
    lineups: sum('lineups'),
    minutes: sum('minutes'),
    goals: sum('goals'),
    assists: sum('assists'),
    yellowCards: sum('yellowCards'),
    redCards: sum('redCards'),
    rating: avg('rating'),
    shotsTotal: real.some(s => s.shotsTotal != null) ? real.reduce((a, s) => a + (s.shotsTotal ?? 0), 0) : null,
    shotsOnTarget: real.some(s => s.shotsOnTarget != null) ? real.reduce((a, s) => a + (s.shotsOnTarget ?? 0), 0) : null,
    passesTotal: real.some(s => s.passesTotal != null) ? real.reduce((a, s) => a + (s.passesTotal ?? 0), 0) : null,
    passesKey: real.some(s => s.passesKey != null) ? real.reduce((a, s) => a + (s.passesKey ?? 0), 0) : null,
    passesAccuracy: (() => {
      const totalPasses = real.reduce((a, s) => a + (s.passesTotal ?? 0), 0);
      const accuratePasses = real.reduce((a, s) => a + (s.passesAccuracy ?? 0), 0);
      return totalPasses > 0 ? Math.round((accuratePasses / totalPasses) * 100) : null;
    })(),
    dribblesAttempted: real.some(s => s.dribblesAttempted != null) ? real.reduce((a, s) => a + (s.dribblesAttempted ?? 0), 0) : null,
    dribblesSuccess: real.some(s => s.dribblesSuccess != null) ? real.reduce((a, s) => a + (s.dribblesSuccess ?? 0), 0) : null,
    duelsWon: real.some(s => s.duelsWon != null) ? real.reduce((a, s) => a + (s.duelsWon ?? 0), 0) : null,
    duelsTotal: real.some(s => s.duelsTotal != null) ? real.reduce((a, s) => a + (s.duelsTotal ?? 0), 0) : null,
    tackles: real.some(s => s.tackles != null) ? real.reduce((a, s) => a + (s.tackles ?? 0), 0) : null,
    interceptions: real.some(s => s.interceptions != null) ? real.reduce((a, s) => a + (s.interceptions ?? 0), 0) : null,
    saves: real.some(s => s.saves != null) ? real.reduce((a, s) => a + (s.saves ?? 0), 0) : null,
    goalsConceded: real.some(s => s.goalsConceded != null) ? real.reduce((a, s) => a + (s.goalsConceded ?? 0), 0) : null,
    cleanSheets: real.some(s => s.cleanSheets != null) ? real.reduce((a, s) => a + (s.cleanSheets ?? 0), 0) : null,
    penaltiesSaved: real.some(s => s.penaltiesSaved != null) ? real.reduce((a, s) => a + (s.penaltiesSaved ?? 0), 0) : null,
  };
}

// Stats groups by position — returns rows relevant for comparison
type StatRow = {
  label: string;
  key: keyof PlayerStats;
  lowerBetter?: boolean;
  isPercent?: boolean;
  max?: number; // for bar normalisation
};

function getStatRows(pos1: string, pos2: string): { section: string; rows: StatRow[] }[] {
  const common: StatRow[] = [
    { label: 'Đánh giá', key: 'rating', max: 10 },
    { label: 'Trận đấu', key: 'appearances', max: 30 },
    { label: 'Phút thi đấu', key: 'minutes', max: 2700 },
    { label: 'Thẻ vàng', key: 'yellowCards', lowerBetter: true, max: 10 },
  ];
  const attacking: StatRow[] = [
    { label: 'Bàn thắng', key: 'goals', max: 20 },
    { label: 'Kiến tạo', key: 'assists', max: 15 },
    { label: 'Tổng cú sút', key: 'shotsTotal', max: 80 },
    { label: 'Sút trúng đích', key: 'shotsOnTarget', max: 40 },
    { label: 'Rê bóng thành công', key: 'dribblesSuccess', max: 60 },
  ];
  const passing: StatRow[] = [
    { label: 'Chuyền then chốt', key: 'passesKey', max: 60 },
    { label: 'Độ chính xác chuyền', key: 'passesAccuracy', isPercent: true, max: 100 },
  ];
  const defending: StatRow[] = [
    { label: 'Tắc bóng', key: 'tackles', max: 80 },
    { label: 'Cắt bóng', key: 'interceptions', max: 60 },
    { label: 'Tranh chấp thắng', key: 'duelsWon', max: 100 },
  ];
  const gk: StatRow[] = [
    { label: 'Cứu thua', key: 'saves', max: 80 },
    { label: 'Thủng lưới', key: 'goalsConceded', lowerBetter: true, max: 30 },
    { label: 'Sạch lưới', key: 'cleanSheets', max: 20 },
    { label: 'Cản phá penalty', key: 'penaltiesSaved', max: 5 },
  ];

  const isGK = (p: string) => p === 'G';
  const isDef = (p: string) => p === 'D';
  const isMid = (p: string) => p === 'M';
  const isFwd = (p: string) => p === 'F';

  // If either is GK, show GK stats
  if (isGK(pos1) || isGK(pos2)) {
    return [
      { section: 'Tổng quan', rows: common },
      { section: 'Thủ môn', rows: gk },
      { section: 'Chuyền bóng', rows: passing },
    ];
  }
  // Both defenders
  if (isDef(pos1) && isDef(pos2)) {
    return [
      { section: 'Tổng quan', rows: common },
      { section: 'Phòng thủ', rows: defending },
      { section: 'Chuyền bóng', rows: passing },
      { section: 'Tấn công', rows: [attacking[0], attacking[1]] },
    ];
  }
  // Both forwards
  if (isFwd(pos1) && isFwd(pos2)) {
    return [
      { section: 'Tổng quan', rows: common },
      { section: 'Tấn công', rows: attacking },
      { section: 'Chuyền bóng', rows: passing },
    ];
  }
  // Mixed positions — show all relevant
  return [
    { section: 'Tổng quan', rows: common },
    { section: 'Tấn công', rows: attacking },
    { section: 'Chuyền bóng', rows: passing },
    { section: 'Phòng thủ', rows: defending },
  ];
}

// ─── Player Selector ──────────────────────────────────────────────────────────
function PlayerSelector({
  selected, onSelect, excludeId, label, allPlayers, teams, loading,
}: {
  selected: PlayerWithStats | null;
  onSelect: (p: PlayerWithStats) => void;
  excludeId?: number;
  label: string;
  allPlayers: PlayerWithStats[];
  teams: Team[];
  loading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = allPlayers.filter(p =>
    p.playerId !== excludeId &&
    p.fullName.toLowerCase().includes(search.toLowerCase()) &&
    (teamFilter === null || p.teamId === teamFilter)
  );

  const rating = selected ? getLatestStats(selected.statistics)?.rating : null;

  return (
    <div className="relative" ref={ref}>
      <p className="text-[11px] font-bold text-slate-500 dark:text-[#A8A29E] uppercase tracking-widest mb-2">{label}</p>
      <button
        onClick={() => setIsOpen(v => !v)}
        className={cn(
          'w-full rounded-2xl p-4 flex items-center gap-3 transition-all border',
          selected
            ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-[#00D9FF]/40'
            : 'bg-slate-50 dark:bg-white/5 border-dashed border-slate-300 dark:border-white/20 hover:border-[#00D9FF]/50'
        )}
      >
        {selected ? (
          <>
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/10 flex-shrink-0">
              {selected.photoUrl
                ? <img src={selected.photoUrl} alt={selected.fullName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">{selected.fullName[0]}</div>
              }
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-bold text-sm text-slate-900 dark:text-foreground truncate">{selected.fullName}</p>
              <p className="text-xs text-slate-500 dark:text-[#A8A29E] truncate">
                {POS_LABEL[selected.position] ?? selected.position} · {selected.teamName ?? ''}
              </p>
            </div>
            {rating != null && (
              <span className="font-mono-data text-lg font-black text-[#00D9FF] flex-shrink-0">{rating.toFixed(1)}</span>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center gap-2 text-slate-400">
            <Search className="w-4 h-4" />
            <span className="text-sm">Chọn cầu thủ...</span>
          </div>
        )}
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform flex-shrink-0', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-2 left-0 right-0 bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            {/* Search + team filter */}
            <div className="p-3 space-y-2 border-b border-slate-100 dark:border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/30"
                />
              </div>
              <select
                value={teamFilter ?? ''}
                onChange={e => setTeamFilter(e.target.value === '' ? null : Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-foreground focus:outline-none cursor-pointer border-0"
              >
                <option value="">Tất cả đội</option>
                {teams.map(t => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
              </select>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-[#00D9FF] animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-400">Không tìm thấy cầu thủ</p>
              ) : filtered.map(p => {
                const r = getLatestStats(p.statistics)?.rating;
                return (
                  <button
                    key={p.playerId}
                    onClick={() => { onSelect(p); setIsOpen(false); setSearch(''); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/10 flex-shrink-0">
                      {p.photoUrl
                        ? <img src={p.photoUrl} alt={p.fullName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">{p.fullName[0]}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{POS_LABEL[p.position] ?? p.position} · {p.teamName}</p>
                    </div>
                    {r != null && <span className="font-mono-data text-sm font-bold text-[#00D9FF]">{r.toFixed(1)}</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Stat comparison row ──────────────────────────────────────────────────────
function StatCompRow({ row, s1, s2, color1, color2 }: {
  row: StatRow;
  s1: PlayerStats | null;
  s2: PlayerStats | null;
  color1: string;
  color2: string;
}) {
  const v1 = s1 ? (s1[row.key] as number | null) : null;
  const v2 = s2 ? (s2[row.key] as number | null) : null;
  if (v1 == null && v2 == null) return null;

  const n1 = v1 ?? 0;
  const n2 = v2 ?? 0;
  const max = row.max ?? Math.max(n1, n2, 1);
  const pct1 = Math.min(100, (n1 / max) * 100);
  const pct2 = Math.min(100, (n2 / max) * 100);

  const p1Better = row.lowerBetter ? n1 < n2 : n1 > n2;
  const p2Better = row.lowerBetter ? n2 < n1 : n2 > n1;

  const fmt = (v: number | null) => {
    if (v == null) return '—';
    if (row.isPercent) return `${v.toFixed(0)}%`;
    if (row.key === 'rating') return v.toFixed(1);
    return Number.isInteger(v) ? v.toString() : v.toFixed(1);
  };

  return (
    <div className="py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className={cn('font-mono-data text-base font-bold w-16 text-left', p1Better ? 'text-green-400' : p2Better ? 'text-slate-500 dark:text-[#A8A29E]' : 'text-foreground')}>
          {fmt(v1)}
        </span>
        <span className="text-xs text-slate-500 dark:text-[#A8A29E] text-center flex-1 px-2">{row.label}</span>
        <span className={cn('font-mono-data text-base font-bold w-16 text-right', p2Better ? 'text-green-400' : p1Better ? 'text-slate-500 dark:text-[#A8A29E]' : 'text-foreground')}>
          {fmt(v2)}
        </span>
      </div>
      {/* Dual bar */}
      <div className="flex items-center gap-1 h-2">
        <div className="flex-1 flex justify-end">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct1}%`, backgroundColor: color1, opacity: p1Better ? 1 : 0.45 }} />
        </div>
        <div className="w-px h-3 bg-slate-300 dark:bg-white/20 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct2}%`, backgroundColor: color2, opacity: p2Better ? 1 : 0.45 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const [allPlayers, setAllPlayers] = useState<PlayerWithStats[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [player1, setPlayer1] = useState<PlayerWithStats | null>(null);
  const [player2, setPlayer2] = useState<PlayerWithStats | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const prevKey = useRef('');

  useEffect(() => {
    (async () => {
      try {
        setPlayersLoading(true);
        const [players, allTeams, ratingsMap] = await Promise.all([
          leagueService.getAllPlayers(),
          leagueService.getAllTeams(),
          leagueService.getAllPlayerSeasonRatings(),
        ]);
        setTeams(allTeams);
        const teamMap = new Map(allTeams.map(t => [t.teamId, t.teamName]));
        const withStats: PlayerWithStats[] = players.map(p => ({
          ...p,
          teamName: teamMap.get(p.teamId ?? 0) ?? '',
          statistics: ratingsMap[p.playerId]
            ? [{ playerStatisticsId: 0, playerId: p.playerId, teamId: p.teamId ?? 0, leagueId: 0, seasonId: 0,
                appearances: 0, lineups: 0, minutes: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0,
                rating: ratingsMap[p.playerId],
                substitutionsIn: null, substitutionsOut: null, shotsTotal: null, shotsOnTarget: null,
                passesTotal: null, passesKey: null, passesAccuracy: null, dribblesAttempted: null,
                dribblesSuccess: null, dribblesSuccessRate: null, duelsWon: null, duelsTotal: null,
                duelsWonRate: null, tackles: null, interceptions: null, foulsDrawn: null, foulsCommitted: null,
                penaltiesScored: null, penaltiesMissed: null, saves: null, savesInsideBox: null,
                cleanSheets: null, goalsConceded: null, penaltiesSaved: null, punches: null,
                runsOut: null, runsOutSuccessful: null, highClaims: null,
              } as PlayerStats]
            : [],
        }));
        setAllPlayers(withStats);
        const p1Id = searchParams.get('player1');
        if (p1Id) {
          const found = withStats.find(p => p.playerId === Number(p1Id));
          if (found) setPlayer1(found);
        }
      } catch (e) { console.error(e); }
      finally { setPlayersLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!player1 || !player2) return;
    const key = `${player1.playerId}-${player2.playerId}`;
    if (prevKey.current === key) return;
    prevKey.current = key;
    (async () => {
      try {
        setCompareLoading(true);
        const result = await leagueService.comparePlayers(player1.playerId, player2.playerId);
        setPlayer1(prev => prev ? { ...prev, statistics: result.player1.statistics } : prev);
        setPlayer2(prev => prev ? { ...prev, statistics: result.player2.statistics } : prev);
      } catch (e) { console.error(e); }
      finally { setCompareLoading(false); }
    })();
  }, [player1?.playerId, player2?.playerId]);

  const handleSelect1 = (p: PlayerWithStats) => { prevKey.current = ''; setPlayer1(p); };
  const handleSelect2 = (p: PlayerWithStats) => { prevKey.current = ''; setPlayer2(p); };

  const s1 = player1 ? aggregateStats(player1.statistics) : null;
  const s2 = player2 ? aggregateStats(player2.statistics) : null;
  const pos1 = player1?.position ?? 'F';
  const pos2 = player2?.position ?? 'F';
  const statGroups = getStatRows(pos1, pos2);

  const COLOR1 = '#FF4444';
  const COLOR2 = '#00D9FF';

  // Overall winner per section
  const getWinner = (rows: StatRow[]) => {
    let score1 = 0, score2 = 0;
    for (const row of rows) {
      const v1 = s1 ? (s1[row.key] as number | null) ?? 0 : 0;
      const v2 = s2 ? (s2[row.key] as number | null) ?? 0 : 0;
      if (row.lowerBetter) { if (v1 < v2) score1++; else if (v2 < v1) score2++; }
      else { if (v1 > v2) score1++; else if (v2 > v1) score2++; }
    }
    return score1 > score2 ? 1 : score2 > score1 ? 2 : 0;
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/players" className="inline-flex items-center gap-2 text-slate-500 dark:text-[#A8A29E] hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Quay lại danh sách cầu thủ</span>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display font-extrabold text-3xl text-foreground mb-1">So sánh cầu thủ</h1>
            <p className="text-sm text-slate-500 dark:text-[#A8A29E]">Chọn hai cầu thủ để so sánh chỉ số thi đấu theo vị trí.</p>
          </motion.div>

          {/* Selectors */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid md:grid-cols-2 gap-4 mb-8">
            <PlayerSelector selected={player1} onSelect={handleSelect1} excludeId={player2?.playerId} label="Cầu thủ 1" allPlayers={allPlayers} teams={teams} loading={playersLoading} />
            <PlayerSelector selected={player2} onSelect={handleSelect2} excludeId={player1?.playerId} label="Cầu thủ 2" allPlayers={allPlayers} teams={teams} loading={playersLoading} />
          </motion.div>

          {compareLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" />
            </div>
          )}

          {player1 && player2 && !compareLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {/* Player header banner */}
              <div className="glass-card rounded-3xl overflow-hidden mb-6">
                <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-white/10">
                  {[{ p: player1, s: aggregateStats(player1.statistics), color: COLOR1 }, { p: player2, s: aggregateStats(player2.statistics), color: COLOR2 }].map(({ p, s, color }, i) => (
                    <Link key={p.playerId} to={`/players/${p.playerId}`} className="p-5 flex flex-col items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2" style={{ borderColor: color }}>
                          {p.photoUrl
                            ? <img src={p.photoUrl} alt={p.fullName} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color }}>{p.fullName[0]}</div>
                          }
                        </div>
                        {s?.rating != null && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-black text-white shadow-lg" style={{ backgroundColor: color }}>
                            {s.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className={`text-center mt-1 ${i === 1 ? '' : ''}`}>
                        <p className="font-bold text-sm text-foreground group-hover:underline">{p.fullName}</p>
                        <p className="text-xs text-slate-500 dark:text-[#A8A29E]">{POS_LABEL[p.position] ?? p.position} · {p.teamName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.nationality}{p.age ? ` · ${p.age} tuổi` : ''}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* Legend bar */}
                <div className="flex border-t border-slate-100 dark:border-white/5">
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR1 }} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-[#A8A29E] truncate max-w-[120px]">{player1.fullName}</span>
                  </div>
                  <div className="w-px bg-slate-100 dark:bg-white/5" />
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR2 }} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-[#A8A29E] truncate max-w-[120px]">{player2.fullName}</span>
                  </div>
                </div>
              </div>

              {/* Position note if mixed */}
              {pos1 !== pos2 && (
                <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Đang so sánh <strong>{POS_LABEL[pos1] ?? pos1}</strong> với <strong>{POS_LABEL[pos2] ?? pos2}</strong> — hiển thị các chỉ số chung nhất giữa hai vị trí.</span>
                </div>
              )}

              {/* Stat sections */}
              <div className="space-y-4">
                {statGroups.map(group => {
                  const winner = (s1 && s2) ? getWinner(group.rows) : 0;
                  return (
                    <div key={group.section} className="glass-card rounded-2xl overflow-hidden">
                      {/* Section header */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#A8A29E]">{group.section}</span>
                        {winner !== 0 && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: winner === 1 ? COLOR1 : COLOR2 }}>
                            {winner === 1 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                            {winner === 1 ? player1.fullName.split(' ').slice(-1)[0] : player2.fullName.split(' ').slice(-1)[0]} nhỉnh hơn
                          </div>
                        )}
                      </div>
                      <div className="px-5 py-1">
                        {group.rows.map(row => (
                          <StatCompRow key={row.key as string} row={row} s1={s1} s2={s2} color1={COLOR1} color2={COLOR2} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {(!player1 || !player2) && !compareLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Chọn hai cầu thủ để so sánh</h3>
              <p className="text-sm text-slate-500 dark:text-[#A8A29E] max-w-sm mx-auto">
                Dùng dropdown ở trên để chọn cầu thủ. Có thể lọc theo đội để tìm nhanh hơn.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
