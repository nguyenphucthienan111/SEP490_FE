import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, User, Loader2, Calendar, Users, ChevronDown, ChevronUp, Shield, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';
import { Team, PlayerFromAPI, SofascoreTeamMatch, leagueService } from '@/services/leagueService';
import { toast } from 'sonner';

const ALLOWED = new Set([626, 771, 3087]);
const TABS = ['Tổng quan', 'Đội hình', 'Lịch thi đấu', 'Kết quả'] as const;
type Tab = typeof TABS[number];

const POSITION_COLOR: Record<string, string> = {
  Goalkeeper: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  Defender:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Midfielder: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  Attacker:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: 'TM',
  Defender:   'HV',
  Midfielder: 'TV',
  Attacker:   'TĐ',
};

function MatchRow({ match, sofaId }: { match: SofascoreTeamMatch; sofaId: number }) {
  const isHome = match.homeTeam.id === sofaId;
  const opp = isHome ? match.awayTeam : match.homeTeam;
  const finished = match.status.type === 'finished';
  const postponed = match.status.type === 'postponed';
  const notStarted = match.status.type === 'notstarted';
  const my = isHome ? match.homeScore.current : match.awayScore.current;
  const op = isHome ? match.awayScore.current : match.homeScore.current;
  const result = finished ? (my > op ? 'W' : my < op ? 'L' : 'D') : null;
  const date = new Date(match.startTimestamp * 1000);
  const tournament = (match as any).tournament?.uniqueTournament?.name ?? '';
  const round = (match.roundInfo as any)?.name ?? `Vòng ${match.roundInfo?.round ?? ''}`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
      {/* Result / Date badge */}
      {result !== null ? (
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
          result === 'W' && "bg-green-500 text-white",
          result === 'D' && "bg-slate-400 text-white",
          result === 'L' && "bg-red-500 text-white",
        )}>{result}</div>
      ) : postponed ? (
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">P</div>
      ) : (
        <div className="flex-shrink-0 text-center min-w-[36px]">
          <p className="font-mono-data text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            {String(date.getDate()).padStart(2,'0')}/{String(date.getMonth()+1).padStart(2,'0')}/{date.getFullYear()}
          </p>
        </div>
      )}

      {/* Opponent logo */}
      <img src={`https://api.sofascore.app/api/v1/team/${opp.id}/image`} alt={opp.name}
        className="w-8 h-8 object-contain flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 dark:text-foreground truncate group-hover:text-[#00D9FF] transition-colors">{opp.name}</p>
        <p className="text-xs text-slate-400 dark:text-[#A8A29E] truncate">{isHome ? 'Sân nhà' : 'Sân khách'} · {tournament} · {round}</p>
      </div>

      {/* Score / Time */}
      <div className="flex-shrink-0 text-right">
        {finished ? (
          <p className="font-mono-data font-bold text-sm text-slate-900 dark:text-foreground">
            {isHome ? `${my} - ${op}` : `${op} - ${my}`}
          </p>
        ) : postponed ? (
          <span className="text-xs font-semibold text-amber-500">Hoãn</span>
        ) : (
          <p className="font-mono-data text-sm font-bold text-[#00D9FF]">
            {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        {(finished || postponed) && (
          <p className="text-xs text-slate-400 dark:text-[#A8A29E]">
            {String(date.getDate()).padStart(2,'0')}/{String(date.getMonth()+1).padStart(2,'0')}/{date.getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [apiTeam, setApiTeam] = React.useState<Team | null>(null);
  const [players, setPlayers] = React.useState<PlayerFromAPI[]>([]);
  const [recentMatches, setRecentMatches] = React.useState<SofascoreTeamMatch[]>([]);
  const [recentHasMore, setRecentHasMore] = React.useState(false);
  const [recentLoading, setRecentLoading] = React.useState(false);
  const [upcomingMatches, setUpcomingMatches] = React.useState<SofascoreTeamMatch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<Tab>('Tổng quan');
  const [posFilter, setPosFilter] = React.useState('all');
  const [matchFilter, setMatchFilter] = React.useState('all');
  const [showRecent, setShowRecent] = React.useState(5);
  const [showUpcoming, setShowUpcoming] = React.useState(5);
  const [contracts, setContracts] = React.useState<any[]>([]);
  const [contractsLoading, setContractsLoading] = React.useState(false);
  const [contractsLoaded, setContractsLoaded] = React.useState(false);
  const [contractPosFilter, setContractPosFilter] = React.useState('all');
  const [squadView, setSquadView] = React.useState<'general' | 'contract' | 'transfers'>('general');
  const [transfersIn, setTransfersIn] = React.useState<any[]>([]);
  const [transfersOut, setTransfersOut] = React.useState<any[]>([]);
  const [transfersLoading, setTransfersLoading] = React.useState(false);
  const [transfersLoaded, setTransfersLoaded] = React.useState(false);

  React.useEffect(() => { window.scrollTo(0, 0); loadData(); }, [teamId]);

  // League → tournamentId + seasonId mapping
  const LEAGUE_TOURNAMENT: Record<number, { tournamentId: number; seasonId: number }> = {
    1: { tournamentId: 626, seasonId: 78589 },
    2: { tournamentId: 771, seasonId: 80926 },
    3: { tournamentId: 3087, seasonId: 81023 },
  };

  const loadContracts = async (team: typeof apiTeam) => {
    if (!team || contractsLoaded || contractsLoading) return;
    setContractsLoading(true);
    try {
      const mapping = LEAGUE_TOURNAMENT[team.leagueId];
      if (!mapping) { setContractsLoading(false); return; }
      const res = await leagueService.getTeamContracts(mapping.tournamentId, mapping.seasonId);
      const byTeam: any[] = res?.contractsByTeam ?? res?.data?.contractsByTeam ?? [];
      const teamData = byTeam.find((t: any) => t.teamId === team.teamId || t.apiTeamId === team.apiTeamId);
      setContracts(teamData?.contracts ?? []);
      setContractsLoaded(true);
    } catch { /* ignore */ }
    setContractsLoading(false);
  };

  const loadMoreRecent = async () => {
    if (!apiTeam || recentLoading) return;
    setRecentLoading(true);
    try {
      const ALLOWED_SET = ALLOWED;
      const [r1, r2, r3] = await Promise.allSettled([
        leagueService.getTeamLastMatches(apiTeam.apiTeamId, 1),
        leagueService.getTeamLastMatches(apiTeam.apiTeamId, 2),
        leagueService.getTeamLastMatches(apiTeam.apiTeamId, 3),
      ]);
      const extra = [
        ...(r1.status === 'fulfilled' ? r1.value : []),
        ...(r2.status === 'fulfilled' ? r2.value : []),
        ...(r3.status === 'fulfilled' ? r3.value : []),
      ].filter(m => ALLOWED_SET.has((m as any).tournament?.uniqueTournament?.id));
      setRecentMatches(prev => {
        const ids = new Set(prev.map(m => m.id));
        const merged = [...prev, ...extra.filter(m => !ids.has(m.id))].sort((a, b) => b.startTimestamp - a.startTimestamp);
        return merged;
      });
      setRecentHasMore(false);
    } catch (e) {}
    setRecentLoading(false);
  };

  const loadData = async () => {
    if (!teamId) return;
    setLoading(true);

    // Check session cache trước
    const cacheKey = `team-detail-${teamId}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { team, players: p, recent, upcoming, recentHasMore: hasMore } = JSON.parse(cached);
        setApiTeam(team);
        setPlayers(p);
        setRecentMatches(recent);
        setUpcomingMatches(upcoming);
        setRecentHasMore(hasMore ?? false);
        setLoading(false);
        return;
      }
    } catch (e) {}

    try {
      const team = await leagueService.getTeamById(Number(teamId));
      setApiTeam(team);
      setLoading(false);

      const sofaId = team.apiTeamId;

      // Load tất cả song song
      const [playersRes, upcomingRes, r0] = await Promise.allSettled([
        leagueService.getPlayers(team.teamId),
        leagueService.getTeamNextMatches(sofaId, 0),
        leagueService.getTeamLastMatches(sofaId, 0),
      ]);

      const p = playersRes.status === 'fulfilled' ? playersRes.value : [];
      setPlayers(p);

      const upcomingRaw = upcomingRes.status === 'fulfilled' ? upcomingRes.value as SofascoreTeamMatch[] : [];
      const upcoming = upcomingRaw.filter(m => ALLOWED.has((m as any).tournament?.uniqueTournament?.id)).sort((a, b) => a.startTimestamp - b.startTimestamp);
      setUpcomingMatches(upcoming);

      // Recent — chỉ fetch page 0 ban đầu
      const r0val = r0.status === 'fulfilled' ? r0.value : [];
      const recent = r0val
        .filter(m => ALLOWED.has((m as any).tournament?.uniqueTournament?.id))
        .sort((a, b) => b.startTimestamp - a.startTimestamp)
        .slice(0, 5);
      setRecentMatches(recent);
      setRecentHasMore(r0val.length >= 10);

      // Lưu cache
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ team, players: p, recent, upcoming, recentHasMore: r0val.length >= 10 }));
      } catch (e) {}

    } catch {
      toast.error('Không thể tải thông tin đội bóng');
      setLoading(false);
    }
  };

  if (loading) return (
    <MainLayout><div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#00D9FF] animate-spin" /></div></MainLayout>
  );
  if (!apiTeam) return (
    <MainLayout><div className="min-h-screen flex items-center justify-center text-center">
      <div><p className="text-slate-500 mb-4">Không tìm thấy câu lạc bộ</p>
      <Link to="/leagues"><Button variant="outline" className="border-[#00D9FF] text-[#00D9FF]">Quay lại</Button></Link></div>
    </div></MainLayout>
  );

  const leagueName = apiTeam.leagueId === 1 ? 'V.League 1' : apiTeam.leagueId === 2 ? 'V.League 2' : 'Vietnam Cup';
  const filteredRecent = matchFilter === 'all' ? recentMatches : recentMatches.filter(m => ((m as any).tournament?.uniqueTournament?.name ?? '') === matchFilter);
  // Normalize position từ API (có thể là "G","D","M","F" hoặc "Goalkeeper" etc.)
  const normalizePos = (pos: string | null | undefined): string => {
    if (!pos) return '';
    const p = pos.trim();
    if (p === 'G' || p.toLowerCase().startsWith('goal')) return 'Goalkeeper';
    if (p === 'D' || p.toLowerCase().startsWith('def')) return 'Defender';
    if (p === 'M' || p.toLowerCase().startsWith('mid')) return 'Midfielder';
    if (p === 'F' || p === 'A' || p.toLowerCase().startsWith('att') || p.toLowerCase().startsWith('for')) return 'Attacker';
    return p;
  };

  const filteredPlayers = posFilter === 'all'
    ? players
    : players.filter(p => normalizePos(p.position) === posFilter);

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/leagues" className="inline-flex items-center gap-2 text-slate-500 dark:text-[#A8A29E] hover:text-[#FF4444] transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />Quay lại
          </Link>

          {/* Hero Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="relative glass-card rounded-3xl overflow-hidden mb-6">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF4444]/5 via-transparent to-[#00D9FF]/5 pointer-events-none" />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start gap-5">
                {/* Logo */}
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-white/5 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 dark:border-white/10">
                  {apiTeam.logoUrl
                    ? <img src={apiTeam.logoUrl} alt={apiTeam.teamName} className="w-20 h-20 object-contain" />
                    : <Shield className="w-10 h-10 text-slate-400" />
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF4444]/10 text-[#FF4444] border border-[#FF4444]/20">{leagueName}</span>
                    {apiTeam.national && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">Đội tuyển QG</span>}
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-foreground leading-tight">{apiTeam.teamName}</h1>
                  {apiTeam.shortName && apiTeam.shortName !== apiTeam.teamName && (
                    <p className="text-slate-500 dark:text-[#A8A29E] text-sm mt-0.5">{apiTeam.shortName}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600 dark:text-[#A8A29E]">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Est. {apiTeam.founded ?? '—'}</span>
                    {apiTeam.coachName && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{apiTeam.coachName}</span>}
                    {apiTeam.stadium && (
                      <Link to={`/stadiums/${apiTeam.stadium.stadiumId}`} state={{ fromTeamId: teamId }}
                        className="flex items-center gap-1.5 text-[#00D9FF] hover:underline">
                        <MapPin className="w-3.5 h-3.5" />{apiTeam.stadium.stadiumName}
                        {apiTeam.stadium.capacity && ` (${apiTeam.stadium.capacity.toLocaleString('vi-VN')})`}
                      </Link>
                    )}
                  </div>
                </div>
                {/* Player count */}
                <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex-shrink-0">
                  <p className="font-mono-data font-bold text-xl text-slate-900 dark:text-foreground">{players.length}</p>
                  <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Cầu thủ</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-0.5 bg-slate-100 dark:bg-white/5 rounded-xl p-1 mb-6">
            {TABS.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'Đội hình') loadContracts(apiTeam); }}
                className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                  activeTab === tab
                    ? "bg-white dark:bg-white/10 text-slate-900 dark:text-foreground shadow-sm"
                    : "text-slate-500 dark:text-[#A8A29E] hover:text-slate-700 dark:hover:text-foreground"
                )}>
                {tab}
                {tab === 'Đội hình' && players.length > 0 && <span className="ml-1 text-xs opacity-60">({players.length})</span>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

              {/* ── Tổng quan ── */}
              {activeTab === 'Tổng quan' && (
                <div className="space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Thành lập', value: apiTeam.founded ?? '—' },
                      { label: 'Cầu thủ', value: players.length || '—' },
                      { label: 'Sức chứa', value: apiTeam.stadium?.capacity ? apiTeam.stadium.capacity.toLocaleString('vi-VN') : '—' },
                      { label: 'Giải đấu', value: leagueName },
                    ].map(s => (
                      <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                        <p className="font-mono-data font-bold text-lg text-slate-900 dark:text-foreground truncate">{s.value}</p>
                        <p className="text-xs text-slate-500 dark:text-[#A8A29E] mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent preview */}
                  {recentMatches.length > 0 && (
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-foreground">Kết quả gần đây</h3>
                        <button onClick={() => setActiveTab('Kết quả')} className="text-xs text-[#00D9FF] hover:underline font-medium">Xem tất cả →</button>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {recentMatches.slice(0, 5).map(m => <MatchRow key={m.id} match={m} sofaId={apiTeam.apiTeamId} />)}
                      </div>
                    </div>
                  )}

                  {/* Upcoming preview */}
                  {upcomingMatches.length > 0 && (
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
                        <h3 className="font-display font-bold text-base text-slate-900 dark:text-foreground">Lịch thi đấu sắp tới</h3>
                        <button onClick={() => setActiveTab('Lịch thi đấu')} className="text-xs text-[#00D9FF] hover:underline font-medium">Xem tất cả →</button>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {upcomingMatches.slice(0, 3).map(m => <MatchRow key={m.id} match={m} sofaId={apiTeam.apiTeamId} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Đội hình ── */}
              {activeTab === 'Đội hình' && (() => {
                const posOrderGeneral = ['Attacker', 'Midfielder', 'Defender', 'Goalkeeper'];
                const posOrderContract = ['F', 'M', 'D', 'G'];
                const posLabelVI: Record<string, string> = {
                  Goalkeeper: 'Thủ môn', Defender: 'Hậu vệ', Midfielder: 'Tiền vệ', Attacker: 'Tiền đạo',
                  G: 'Thủ môn', D: 'Hậu vệ', M: 'Tiền vệ', F: 'Tiền đạo',
                };
                const posColorBadge: Record<string, string> = {
                  Goalkeeper: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
                  Defender:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                  Midfielder: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
                  Attacker:   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
                  G: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
                  D: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
                  M: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
                  F: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
                };
                const posPillActive: Record<string, string> = {
                  Goalkeeper: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40',
                  Defender:   'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
                  Midfielder: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40',
                  Attacker:   'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40',
                  G: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40',
                  D: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
                  M: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40',
                  F: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40',
                };
                const fmtDate = (d: string | null) => d
                  ? new Date(d).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })
                  : null;

                // Group players
                const playerGroups: Record<string, PlayerFromAPI[]> = {};
                players.forEach(p => {
                  const pos = normalizePos(p.position) || 'Other';
                  if (!playerGroups[pos]) playerGroups[pos] = [];
                  playerGroups[pos].push(p);
                });

                // Group contracts
                const contractGroups: Record<string, any[]> = {};
                contracts.forEach(c => {
                  const pos = c.playerPosition ?? 'X';
                  if (!contractGroups[pos]) contractGroups[pos] = [];
                  contractGroups[pos].push(c);
                });

                const activeFilter = squadView === 'general' ? posFilter : contractPosFilter;
                const setActiveFilter = squadView === 'general' ? setPosFilter : setContractPosFilter;
                const filterKeys = squadView === 'general'
                  ? ['all', 'Attacker', 'Midfielder', 'Defender', 'Goalkeeper']
                  : ['all', 'F', 'M', 'D', 'G'];

                return (
                  <div>
                    {/* Sub-tab switcher */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1">
                        {(['general', 'contract'] as const).map(v => (
                          <button key={v} onClick={() => { setSquadView(v); if (v === 'contract' && !contractsLoaded) loadContracts(apiTeam); }}
                            className={cn('px-4 py-1.5 rounded-md text-xs font-semibold transition-all',
                              squadView === v
                                ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-foreground shadow-sm'
                                : 'text-slate-500 dark:text-[#A8A29E] hover:text-slate-700 dark:hover:text-foreground'
                            )}>
                            {v === 'general' ? 'Tổng quan' : 'Hợp đồng'}
                          </button>
                        ))}
                      </div>
                      {/* Position filter pills */}
                      <div className="flex gap-1.5 flex-wrap">
                        {filterKeys.map(pos => (
                          <button key={pos} onClick={() => setActiveFilter(pos)}
                            className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                              activeFilter === pos
                                ? pos === 'all'
                                  ? 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/40'
                                  : cn(posPillActive[pos], 'border')
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-[#A8A29E] border-transparent hover:bg-slate-200 dark:hover:bg-white/10'
                            )}>
                            {pos === 'all' ? 'Tất cả' : posLabelVI[pos]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── General view ── */}
                    {squadView === 'general' && (
                      players.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 dark:text-[#A8A29E]">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Chưa có thông tin cầu thủ</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {posOrderGeneral
                            .filter(pos => posFilter === 'all' ? playerGroups[pos]?.length : pos === posFilter)
                            .map(pos => {
                              const group = playerGroups[pos] ?? [];
                              if (!group.length) return null;
                              return (
                                <div key={pos}>
                                  <h3 className={cn('font-bold text-lg mb-3',
                                    pos === 'Attacker' ? 'text-red-600 dark:text-red-400' :
                                    pos === 'Midfielder' ? 'text-cyan-600 dark:text-cyan-400' :
                                    pos === 'Defender' ? 'text-amber-600 dark:text-amber-400' :
                                    'text-purple-600 dark:text-purple-400'
                                  )}>{posLabelVI[pos]}</h3>
                                  <div className="glass-card rounded-2xl overflow-hidden">
                                    {/* Header */}
                                    <div className="hidden sm:grid px-4 py-2 border-b border-slate-100 dark:border-white/5 text-xs text-slate-400 dark:text-[#A8A29E]"
                                      style={{ gridTemplateColumns: '2rem 2.5rem 1fr 8rem 4.5rem 3rem', gap: '0.75rem', alignItems: 'center' }}>
                                      <span />
                                      <span />
                                      <span className="pl-1">Cầu thủ</span>
                                      <span className="text-center">Quốc tịch</span>
                                      <span className="text-right">Cao</span>
                                      <span className="text-right">Tuổi</span>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                      {group.map(p => {
                                        const isForeign = p.nationality && p.nationality.toLowerCase() !== 'vietnam';
                                        const numBg: Record<string, string> = {
                                          Attacker: 'bg-red-500', Midfielder: 'bg-cyan-500',
                                          Defender: 'bg-amber-500', Goalkeeper: 'bg-purple-500',
                                        };
                                        return (
                                          <Link key={p.playerId} to={`/players/${p.playerId}`} state={{ fromTeamId: teamId }}
                                            className="hidden sm:grid items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                                            style={{ gridTemplateColumns: '2rem 2.5rem 1fr 8rem 4.5rem 3rem', gap: '0.75rem', alignItems: 'center' }}>
                                            {/* Number */}
                                            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0', numBg[normalizePos(p.position)] ?? 'bg-slate-700')}>
                                              <span className="font-mono-data text-[10px] font-bold text-white">{p.number ?? '—'}</span>
                                            </div>
                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden border-2 border-slate-200 dark:border-white/10 flex-shrink-0">
                                              {p.photoUrl ? <img src={p.photoUrl} alt={p.fullName} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-slate-400 m-auto mt-2" />}
                                            </div>
                                            {/* Name + sub */}
                                            <div className="min-w-0 pl-1">
                                              <p className="font-semibold text-sm text-slate-900 dark:text-foreground group-hover:text-[#00D9FF] transition-colors truncate">{p.fullName}</p>
                                              <p className={cn('text-xs truncate',
                                                pos === 'Attacker' ? 'text-red-400' :
                                                pos === 'Midfielder' ? 'text-cyan-400' :
                                                pos === 'Defender' ? 'text-amber-400' : 'text-purple-400'
                                              )}>{posLabelVI[normalizePos(p.position)] ?? normalizePos(p.position)}</p>
                                            </div>
                                            {/* Nationality */}
                                            <div className="flex items-center justify-center">
                                              {p.nationality ? (
                                                <span className={cn('inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-medium w-full text-center',
                                                  isForeign
                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-[#A8A29E]'
                                                )}>
                                                  {p.nationality}
                                                </span>
                                              ) : <span className="text-xs text-slate-300 dark:text-white/20 text-center w-full block">—</span>}
                                            </div>
                                            {/* Height */}
                                            <span className="text-xs text-slate-500 dark:text-[#A8A29E] text-right">
                                              {(p as any).heightCm ? `${(p as any).heightCm}` : '—'}
                                            </span>
                                            {/* Age */}
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 text-right">
                                              {p.age ? `${p.age}` : '—'}
                                            </span>
                                          </Link>
                                        );
                                      })}
                                      {/* Mobile fallback */}
                                      {group.map(p => (
                                        <Link key={`m-${p.playerId}`} to={`/players/${p.playerId}`} state={{ fromTeamId: teamId }}
                                          className="sm:hidden flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                                            pos === 'Attacker' ? 'bg-red-500' : pos === 'Midfielder' ? 'bg-cyan-500' : pos === 'Defender' ? 'bg-amber-500' : 'bg-purple-500'
                                          )}>
                                            <span className="font-mono-data text-[10px] font-bold text-white">{p.number ?? '—'}</span>
                                          </div>
                                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0">
                                            {p.photoUrl ? <img src={p.photoUrl} alt={p.fullName} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-slate-400 m-auto mt-2" />}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-foreground group-hover:text-[#00D9FF] truncate">{p.fullName}</p>
                                            <p className="text-xs text-slate-400">{p.nationality ?? ''}{p.age ? ` · ${p.age}t` : ''}</p>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )
                    )}

                    {/* ── Contract view ── */}
                    {squadView === 'contract' && (
                      contractsLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin" />
                        </div>
                      ) : contracts.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 dark:text-[#A8A29E]">
                          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>Chưa có thông tin hợp đồng</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {posOrderContract
                            .filter(pos => contractPosFilter === 'all' ? contractGroups[pos]?.length : pos === contractPosFilter)
                            .map(pos => {
                              const group = contractGroups[pos] ?? [];
                              if (!group.length) return null;
                              return (
                                <div key={pos}>
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-foreground mb-3">{posLabelVI[pos]}</h3>
                                  <div className="glass-card rounded-2xl overflow-hidden">
                                    <div className="hidden sm:flex items-center px-4 py-2 border-b border-slate-100 dark:border-white/5 text-xs text-slate-400 dark:text-[#A8A29E]">
                                      <span className="flex-1">Cầu thủ</span>
                                      <span className="w-28 text-right">Gia nhập</span>
                                      <span className="w-28 text-right">Hết hạn</span>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                                      {group.map((c: any) => {
                                        const joined = fmtDate(c.startDate);
                                        const expires = fmtDate(c.endDate);
                                        const isExpiringSoon = c.endDate && new Date(c.endDate).getTime() - Date.now() < 180 * 24 * 3600 * 1000;
                                        return (
                                          <div key={c.contractId} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            {/* Number */}
                                            <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                              <span className="font-mono-data text-xs font-bold text-white">{c.playerNumber ?? '—'}</span>
                                            </div>
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10 flex-shrink-0">
                                              <img src={c.playerPhotoUrl} alt={c.playerName} className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            </div>
                                            {/* Name */}
                                            <div className="flex-1 min-w-0">
                                              <p className="font-semibold text-sm text-slate-900 dark:text-foreground truncate">{c.playerName}</p>
                                              <p className={cn('text-xs', posColorBadge[pos]?.split(' ')[1] ?? 'text-slate-400')}>
                                                {posLabelVI[pos]}
                                              </p>
                                            </div>
                                            {/* Joined */}
                                            <span className="text-sm text-slate-500 dark:text-[#A8A29E] hidden sm:block w-28 text-right">{joined ?? '-'}</span>
                                            {/* Expires */}
                                            <span className={cn('text-sm hidden sm:block w-28 text-right font-medium',
                                              isExpiringSoon ? 'text-orange-500' : expires ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-[#A8A29E]'
                                            )}>
                                              {expires ?? '-'}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )
                    )}
                  </div>
                );
              })()}

              {/* ── Lịch thi đấu ── */}
              {activeTab === 'Lịch thi đấu' && (
                <div>
                  {upcomingMatches.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 dark:text-[#A8A29E]">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Không có lịch thi đấu sắp tới</p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {upcomingMatches.slice(0, showUpcoming).map(m => <MatchRow key={m.id} match={m} sofaId={apiTeam.apiTeamId} />)}
                      </div>
                      {upcomingMatches.length > showUpcoming ? (
                        <button onClick={() => setShowUpcoming(v => v + 5)}
                          className="w-full py-3 text-sm font-semibold text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 border-t border-slate-100 dark:border-white/5">
                          <ChevronDown className="w-4 h-4" />Xem thêm ({upcomingMatches.length - showUpcoming} trận)
                        </button>
                      ) : showUpcoming > 5 ? (
                        <button onClick={() => setShowUpcoming(5)}
                          className="w-full py-3 text-sm font-semibold text-slate-500 dark:text-[#A8A29E] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 border-t border-slate-100 dark:border-white/5">
                          <ChevronUp className="w-4 h-4" />Thu gọn
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* ── Kết quả ── */}
              {activeTab === 'Kết quả' && (
                <div>
                  <div className="flex justify-end mb-4">
                    <select value={matchFilter} onChange={e => { setMatchFilter(e.target.value); setShowRecent(5); }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 text-sm">
                      <option value="all">Tất cả giải</option>
                      <option value="V-League 1">V-League 1</option>
                      <option value="V-League 2">V-League 2</option>
                      <option value="Vietnam Cup">Vietnam Cup</option>
                    </select>
                  </div>
                  {filteredRecent.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 dark:text-[#A8A29E]"><p>Không có kết quả</p></div>
                  ) : (
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredRecent.slice(0, showRecent).map(m => <MatchRow key={m.id} match={m} sofaId={apiTeam.apiTeamId} />)}
                      </div>
                      {filteredRecent.length > showRecent ? (
                        <button onClick={() => setShowRecent(v => v + 5)}
                          className="w-full py-3 text-sm font-semibold text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 border-t border-slate-100 dark:border-white/5">
                          <ChevronDown className="w-4 h-4" />Xem thêm ({filteredRecent.length - showRecent} trận)
                        </button>
                      ) : recentHasMore ? (
                        <button onClick={loadMoreRecent} disabled={recentLoading}
                          className="w-full py-3 text-sm font-semibold text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 border-t border-slate-100 dark:border-white/5 disabled:opacity-50">
                          <ChevronDown className="w-4 h-4" />{recentLoading ? 'Đang tải...' : 'Tải thêm kết quả'}
                        </button>
                      ) : showRecent > 5 ? (
                        <button onClick={() => setShowRecent(5)}
                          className="w-full py-3 text-sm font-semibold text-slate-500 dark:text-[#A8A29E] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2 border-t border-slate-100 dark:border-white/5">
                          <ChevronUp className="w-4 h-4" />Thu gọn
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}
