import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Users, Loader2, ArrowRight, ChevronLeft, ChevronRight, TrendingUp, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getPlayerById } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { PlayerFromAPI, PlayerStats, leagueService } from '@/services/leagueService';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumGate } from '@/components/subscription/PremiumGate';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart,
} from 'recharts';

type TabKey = 'overview' | 'stats' | 'transfers' | 'matches';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview',  label: 'Tổng quan',    icon: '⚡' },
  { key: 'stats',     label: 'Thống kê',      icon: '📊' },
  { key: 'matches',   label: 'Lịch sử trận',  icon: '🏟️' },
  { key: 'transfers', label: 'Chuyển nhượng', icon: '🔄' },
];

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const location = useLocation();
  const { isPremium } = useSubscription();
  const [playerTeam, setPlayerTeam] = useState<any>(null);
  const [apiPlayer, setApiPlayer] = useState<PlayerFromAPI | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromTeamId, setFromTeamId] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [matchHistoryLoading, setMatchHistoryLoading] = useState(false);
  const [matchHistoryLoaded, setMatchHistoryLoaded] = useState(false);
  const [selectedMatchStat, setSelectedMatchStat] = useState<{ match: any; stats: any } | null>(null);
  const [matchVisibleCount, setMatchVisibleCount] = useState(5);
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const [showTrend, setShowTrend] = useState(false);
  const [compareSeasonA, setCompareSeasonA] = useState(1);
  const [compareSeasonB, setCompareSeasonB] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const player = getPlayerById(playerId || '');

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedSeasonIdx(0);
    const state = location.state as { fromTeamId?: string } | undefined;
    if (state?.fromTeamId) setFromTeamId(state.fromTeamId);
    loadPlayerData();
  }, [playerId, location.state]);

  const loadPlayerData = async () => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const foundPlayer = await leagueService.getPlayerById(Number(playerId));
      setApiPlayer(foundPlayer);
      if (foundPlayer.teamId) {
        try { setPlayerTeam(await leagueService.getTeamById(foundPlayer.teamId)); } catch {}
      }
      const allStats = await leagueService.getPlayerStatsByPlayerId(Number(playerId));
      setPlayerStats([...allStats].sort((a, b) => (a.seasonId ?? 99) - (b.seasonId ?? 99)));
      if (allStats.length > 0 && allStats[0].leagueId) {
        try { setSeasons(await leagueService.getSeasons(allStats[0].leagueId)); } catch {}
      }
      const token = localStorage.getItem('accessToken');
      if (foundPlayer.teamId && token) {
        try {
          setTransfersLoading(true);
          const LEAGUE_MAP: Record<number, { tournamentId: number; seasonId: number }> = {
            1: { tournamentId: 626, seasonId: 78589 },
            2: { tournamentId: 771, seasonId: 80926 },
            3: { tournamentId: 3087, seasonId: 81023 },
          };
          const ids = [...new Set(allStats.map(s => s.leagueId).filter(id => LEAGUE_MAP[id]))];
          for (const lid of (ids.length > 0 ? ids : [1, 2, 3])) {
            const mapping = LEAGUE_MAP[lid];
            if (!mapping) continue;
            try {
              const res = await leagueService.getLeagueTransfers(mapping.tournamentId, mapping.seasonId);
              const byPlayer: any[] = res?.transfersByPlayer ?? res?.data?.transfersByPlayer ?? [];
              const pd = byPlayer.find((p: any) =>
                p.apiPlayerId === foundPlayer.apiPlayerId || p.playerId === foundPlayer.playerId ||
                String(p.apiPlayerId) === String(foundPlayer.apiPlayerId) || String(p.playerId) === String(foundPlayer.playerId)
              );
              if (pd?.transferHistory?.length) { setTransfers(pd.transferHistory); break; }
            } catch {}
          }
        } catch {} finally { setTransfersLoading(false); }
      }
    } catch {
      toast.error('Không thể tải thông tin cầu thủ');
    } finally {
      setIsLoading(false);
    }
  };

  const LEAGUE_MAP: Record<number, { tournamentId: number; seasonId: number }> = {
    1: { tournamentId: 626, seasonId: 78589 },
    2: { tournamentId: 771, seasonId: 80926 },
    3: { tournamentId: 3087, seasonId: 81023 },
  };

  const loadMatchHistory = async () => {
    if (!apiPlayer || matchHistoryLoaded || matchHistoryLoading) return;
    setMatchHistoryLoading(true);
    try {
      // Lấy tất cả trận của tất cả giải
      const allMatches: any[] = [];
      await Promise.all(
        Object.values(LEAGUE_MAP).map(async ({ tournamentId, seasonId }) => {
          try {
            const matches = await leagueService.getAllMatchesFromDb(tournamentId, seasonId);
            allMatches.push(...matches);
          } catch {}
        })
      );

      // Lọc trận mà cầu thủ có trong lineup (dùng apiPlayerId)
      const apiPlayerId = apiPlayer.apiPlayerId;
      const teamApiId = playerTeam?.apiTeamId ?? apiPlayer?.team?.apiTeamId;

      // Lọc trận của đội cầu thủ đang chơi trước (nhanh hơn)
      const teamMatches = allMatches.filter(m => {
        const homeId = m.homeTeam?.apiTeamId ?? m.homeTeam?.id;
        const awayId = m.awayTeam?.apiTeamId ?? m.awayTeam?.id;
        return homeId === teamApiId || awayId === teamApiId;
      });

      // Với mỗi trận đã kết thúc, lấy player match stats từ DB
      const finishedMatches = teamMatches
        .filter(m => m.status === 'finished' || m.status?.type === 'finished')
        .sort((a, b) => {
          const da = a.matchDate ? new Date(a.matchDate).getTime() : (a.startTimestamp ?? 0) * 1000;
          const db = b.matchDate ? new Date(b.matchDate).getTime() : (b.startTimestamp ?? 0) * 1000;
          return db - da;
        })
        .slice(0, 30); // giới hạn 30 trận gần nhất

      const results: any[] = [];
      await Promise.all(
        finishedMatches.map(async (match) => {
          const fixtureId = match.apiFixtureId ?? match.matchId ?? match.id;
          if (!fixtureId) return;
          try {
            const stats = await leagueService.getPlayerMatchStatsByMatch(fixtureId);
            const playerStat = stats.find((s: any) =>
              s.apiPlayerId === apiPlayerId ||
              s.playerId === apiPlayer.playerId ||
              String(s.apiPlayerId) === String(apiPlayerId)
            );
            if (playerStat) {
              results.push({ match, stats: playerStat });
            }
          } catch {}
        })
      );

      results.sort((a, b) => {
        const da = a.match.matchDate ? new Date(a.match.matchDate).getTime() : 0;
        const db = b.match.matchDate ? new Date(b.match.matchDate).getTime() : 0;
        return db - da;
      });

      setMatchHistory(results);
      setMatchHistoryLoaded(true);
    } catch {}
    setMatchHistoryLoading(false);
  };

  const displayPlayer = apiPlayer || player;

  if (isLoading) return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00D9FF] animate-spin" />
      </div>
    </MainLayout>
  );

  if (!displayPlayer) return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-slate-500 mb-4">Không tìm thấy cầu thủ</p>
          <Link to="/players"><Button variant="outline" className="border-[#00D9FF] text-[#00D9FF]">Quay lại</Button></Link>
        </div>
      </div>
    </MainLayout>
  );

  const playerName        = apiPlayer?.fullName ?? player?.name ?? '';
  const playerPhoto       = apiPlayer?.photoUrl ?? player?.photoUrl;
  const playerNationality = apiPlayer?.nationality ?? player?.nationality;
  const playerHeight      = apiPlayer?.heightCm ?? player?.height;
  const playerPosition    = apiPlayer?.position ?? player?.position;
  const playerAge         = apiPlayer?.age ?? player?.age;
  const currentRating = (() => {
    if (playerStats.length === 0) return (player as any)?.rating ?? 0;
    const withRating = playerStats.filter(s => s.rating != null && s.rating > 0);
    if (withRating.length === 0) return (player as any)?.rating ?? 0;
    // Trung bình toàn sự nghiệp
    const avg = withRating.reduce((sum, s) => sum + (s.rating ?? 0), 0) / withRating.length;
    return parseFloat(avg.toFixed(2));
  })();
  const posLabel = ({'F':'Tiền đạo','M':'Tiền vệ','D':'Hậu vệ','G':'Thủ môn'} as Record<string,string>)[playerPosition ?? ''] ?? playerPosition;

  const getRadarData = () => {
    const s = playerStats[0];
    if (!s) return null;
    const norm = (v: number | null | undefined, max: number) => Math.min(100, Math.round(((v ?? 0) / max) * 100));
    const data = [
      { stat: 'Ghi bàn',     value: norm(s.goals, 20) },
      { stat: 'Kiến tạo',    value: norm(s.assists, 15) },
      { stat: 'Sút cầu môn', value: norm(s.shotsOnTarget, 50) },
      { stat: 'Chuyền bóng', value: norm(s.passesKey, 60) },
      { stat: 'Rê bóng',     value: norm(s.dribblesSuccess, 60) },
      { stat: 'Kỷ luật',     value: Math.max(0, 100 - norm((s.yellowCards ?? 0) * 10 + (s.redCards ?? 0) * 30, 100)) },
    ];
    return data.every(d => d.value === 0) ? null : data;
  };

  // ── MATCH STAT MODAL ──
  const MatchStatModal = ({ item, onClose }: { item: { match: any; stats: any }; onClose: () => void }) => {
    const s = item.stats;
    const [statTab, setStatTab] = useState<'shot' | 'pass' | 'drib' | 'def' | 'gk'>('shot');
    const isGK = (apiPlayer?.position ?? '') === 'G';
    const rating = s?.rating != null ? Number(s.rating) : null;
    const ratingColor = rating == null ? '#6b7280' : rating >= 8 ? '#22c55e' : rating >= 7 ? '#84cc16' : rating >= 6 ? '#eab308' : '#ef4444';

    const isHome = (item.match.homeTeam?.apiTeamId ?? item.match.homeTeam?.id) === (playerTeam?.apiTeamId ?? apiPlayer?.team?.apiTeamId);
    const opponent = isHome ? item.match.awayTeam : item.match.homeTeam;
    const myGoals = isHome ? (item.match.homeGoals ?? 0) : (item.match.awayGoals ?? 0);
    const oppGoals = isHome ? (item.match.awayGoals ?? 0) : (item.match.homeGoals ?? 0);
    const date = item.match.matchDate ? new Date(item.match.matchDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

    const sections: Record<string, { label: string; rows: { label: string; val: any }[] }> = {
      shot: { label: 'Sút', rows: [
        { label: 'Bàn thắng', val: s?.goals },
        { label: 'Tổng cú sút', val: s?.shots ?? s?.totalShots },
        { label: 'Sút trúng đích', val: s?.shotsOnTarget },
        { label: 'Cơ hội lớn bỏ lỡ', val: s?.bigChanceMissed ?? s?.bigChancesMissed },
      ]},
      pass: { label: 'Chuyền', rows: [
        { label: 'Kiến tạo', val: s?.assists },
        { label: 'Chuyền chính xác', val: s?.passes != null && s?.passesAccuracy != null ? `${Math.round(s.passes * s.passesAccuracy / 100)}/${s.passes}` : s?.accuratePasses != null ? `${s.accuratePasses}/${s.totalPasses ?? '?'}` : null },
        { label: 'Chuyền then chốt', val: s?.passesKey ?? s?.keyPasses },
        { label: 'Tạt bóng chính xác', val: s?.accurateCrosses != null ? `${s.accurateCrosses}/${s.totalCrosses ?? '?'}` : null },
        { label: 'Cơ hội lớn tạo ra', val: s?.bigChanceCreated ?? s?.bigChancesCreated },
      ]},
      drib: { label: 'Rê bóng', rows: [
        { label: 'Rê bóng thành công', val: s?.dribblesSuccess != null ? `${s.dribblesSuccess}/${s.dribblesAttempted ?? '?'}` : null },
        { label: 'Chạm bóng', val: s?.touches },
        { label: 'Mất bóng', val: s?.possessionLost },
        { label: 'Bị phạm lỗi', val: s?.wasFouled },
        { label: 'Phạm lỗi', val: s?.foulsCommitted },
      ]},
      def: { label: 'Phòng thủ', rows: [
        { label: 'Tắc bóng', val: s?.tackles },
        { label: 'Cắt bóng', val: s?.interceptions },
        { label: 'Phá bóng', val: s?.clearances },
        { label: 'Tranh chấp trên không', val: s?.aerialDuelsWon != null ? `${s.aerialDuelsWon}/${(s.aerialDuelsWon ?? 0) + (s.aerialDuelsLost ?? 0)}` : null },
        { label: 'Thẻ vàng', val: s?.yellowCards },
        { label: 'Thẻ đỏ', val: s?.redCards },
      ]},
      gk: { label: 'Thủ môn', rows: [
        { label: 'Cứu thua', val: s?.saves },
        { label: 'Cứu thua trong vòng cấm', val: s?.savesInsideBox },
        { label: 'Thủng lưới', val: s?.goalsConceded },
        { label: 'Cản phá penalty', val: s?.penaltiesSaved },
        { label: 'Ra khỏi khung thành', val: s?.runsOut != null ? `${s.runsOutSuccessful ?? 0}/${s.runsOut}` : null },
        { label: 'Bắt bóng bổng', val: s?.highClaims },
      ]},
    };

    const visibleTabs = isGK ? (['gk', 'pass', 'def'] as const) : (['shot', 'pass', 'drib', 'def'] as const);
    const activeRows = sections[statTab]?.rows.filter(r => r.val != null) ?? [];

    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }} transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="glass-card rounded-2xl w-full max-w-sm relative overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Header trận đấu */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/10 flex-shrink-0">
              <img src={`https://api.sofascore.app/api/v1/team/${opponent?.apiTeamId ?? opponent?.id}/image`}
                alt={opponent?.teamName ?? ''} className="w-8 h-8 object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-foreground truncate">
                  {isHome ? 'vs' : '@'} {opponent?.teamName ?? opponent?.name ?? '—'}
                </p>
                <p className="text-[10px] text-slate-400">{date}{item.match.round ? ` · Vòng ${item.match.round}` : ''}</p>
              </div>
              <div className="text-center px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/10">
                <span className="font-mono-data text-sm font-black text-slate-900 dark:text-foreground">{myGoals} - {oppGoals}</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Quick stats row */}
            <div className="flex divide-x divide-slate-100 dark:divide-white/10 border-b border-slate-100 dark:border-white/10 flex-shrink-0">
              {[
                { label: 'Phút', val: s?.minutes != null ? `${s.minutes}'` : null },
                { label: 'Bàn thắng', val: s?.goals },
                { label: 'Kiến tạo', val: s?.assists },
                { label: 'Đánh giá', val: rating != null ? rating.toFixed(1) : null, color: ratingColor },
              ].filter(x => x.val != null).map(x => (
                <div key={x.label} className="flex-1 flex flex-col items-center py-2.5">
                  <span className="font-mono-data font-bold text-base text-foreground" style={x.color ? { color: x.color } : {}}>{x.val}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{x.label}</span>
                </div>
              ))}
            </div>

            {/* Stat tabs */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-1 mb-3">
                {visibleTabs.map(tab => (
                  <button key={tab} onClick={() => setStatTab(tab as any)}
                    className={cn('flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all',
                      statTab === tab ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-foreground shadow-sm' : 'text-slate-500 dark:text-[#A8A29E]')}>
                    {sections[tab].label}
                  </button>
                ))}
              </div>
              {activeRows.length > 0 ? (
                <div className="space-y-1">
                  {activeRows.map(row => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                      <span className="text-xs text-slate-500 dark:text-[#A8A29E]">{row.label}</span>
                      <span className="font-mono-data text-sm font-semibold text-foreground">{row.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400 py-6">Không có dữ liệu</p>
              )}
            </div>

            {/* Link sang trang trận đấu */}
            <div className="px-4 pb-4 flex-shrink-0">
              <Link to={`/matches/${item.match.apiFixtureId ?? item.match.matchId}`}
                className="block w-full text-center py-2 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] text-xs font-semibold hover:bg-[#00D9FF]/20 transition-colors"
                onClick={onClose}>
                Xem chi tiết trận đấu →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
    <MainLayout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-5xl">

          <Link to={fromTeamId ? `/teams/${fromTeamId}` : '/players'}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors mb-5">
            <ArrowLeft className="w-4 h-4" />Quay lại
          </Link>

          {/* ── HERO CARD ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="relative glass-card rounded-2xl overflow-hidden mb-2">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/5 via-transparent to-[#a78bfa]/5 pointer-events-none" />
            <div className="relative p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Avatar */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 flex-shrink-0 shadow-lg border border-white/10">
                  {playerPhoto
                    ? <img src={playerPhoto} alt={playerName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Users className="w-10 h-10 text-slate-300 dark:text-[#A8A29E]" /></div>
                  }
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {posLabel && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-500 border border-cyan-500/20">{posLabel}</span>
                    )}
                    {apiPlayer?.number && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-500 dark:text-[#A8A29E] border border-white/10">#{apiPlayer.number}</span>
                    )}
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-foreground leading-tight mb-1.5">{playerName}</h1>
                  {(apiPlayer?.team || playerTeam) && (
                    <Link to={`/teams/${playerTeam?.teamId ?? apiPlayer?.team?.teamId}`} state={{ fromPlayerId: playerId }} className="inline-flex items-center gap-1.5 mb-3 group">
                      {(playerTeam?.logoUrl ?? apiPlayer?.team?.logoUrl) && (
                        <img src={playerTeam?.logoUrl ?? apiPlayer?.team?.logoUrl} alt={playerTeam?.teamName ?? apiPlayer?.team?.teamName}
                          className="w-5 h-5 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                      <span className="text-sm text-[#00D9FF] font-semibold group-hover:underline">{playerTeam?.teamName ?? apiPlayer?.team?.teamName}</span>
                    </Link>
                  )}
                  {player && !apiPlayer && <p className="text-sm text-slate-500 dark:text-[#A8A29E] mb-3">{player.team}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {([
                      { label: 'Quốc tịch', value: playerNationality },
                      playerAge    ? { label: 'Tuổi', value: String(playerAge) }    : null,
                      playerHeight ? { label: 'Cao',  value: `${playerHeight} cm` } : null,
                    ] as ({ label: string; value: string | null | undefined } | null)[]).filter(Boolean).map(item => (
                      <div key={item!.label} className="flex items-center gap-1 text-xs">
                        <span className="text-slate-400 dark:text-[#A8A29E]">{item!.label}</span>
                        <span className="font-semibold text-slate-700 dark:text-foreground">{item!.value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Rating ring */}
                {currentRating > 0 && (
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 sm:self-center">
                    <div className="relative w-[68px] h-[68px]">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 68 68">
                        <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                        <circle cx="34" cy="34" r="28" fill="none" stroke="url(#rg)" strokeWidth="6"
                          strokeDasharray={`${(currentRating / 10) * 175.9} 175.9`} strokeLinecap="round" />
                        <defs>
                          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FF4444" /><stop offset="100%" stopColor="#00D9FF" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-mono-data text-lg font-black text-slate-900 dark:text-foreground leading-none">{currentRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400">Avg. Rating</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tab bar */}
            <div className="border-t border-slate-100 dark:border-white/5 px-5 sm:px-7">
              <div className="flex">
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => { setActiveTab(tab.key); if (tab.key === 'matches') loadMatchHistory(); }}
                    className={cn('relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap',
                      activeTab === tab.key ? 'text-[#00D9FF]' : 'text-slate-500 dark:text-[#A8A29E] hover:text-slate-700 dark:hover:text-foreground')}>
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {(tab.key === 'stats' || tab.key === 'transfers' || tab.key === 'matches') && !isPremium && (
                      <span className="ml-0.5 text-[10px]">🔒</span>
                    )}
                    {tab.key === 'transfers' && transfers.length > 0 && (
                      <span className="ml-0.5 text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-[#A8A29E] px-1.5 py-0.5 rounded-full">{transfers.length}</span>
                    )}
                    {activeTab === tab.key && (
                      <motion.div layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D9FF] rounded-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── TAB CONTENT ── */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

              {/* ── TỔNG QUAN ── */}
              {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-3 gap-4 mt-4">
                  {/* Radar */}
                  <div className="glass-card rounded-2xl p-5">
                    <p className="font-semibold text-sm text-slate-900 dark:text-foreground mb-4">Chỉ số cầu thủ</p>
                    {(() => {
                      const rd = getRadarData();
                      if (!rd) return <div className="h-56 flex items-center justify-center text-slate-400 text-sm">Chưa có đủ dữ liệu</div>;
                      return (
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={rd}>
                              <PolarGrid stroke="rgba(255,255,255,0.1)" />
                              <PolarAngleAxis dataKey="stat" tick={{ fill: '#A8A29E', fontSize: 11 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#A8A29E', fontSize: 9 }} />
                              <Radar name="Chỉ số" dataKey="value" stroke="#00D9FF" fill="#00D9FF" fillOpacity={0.25} strokeWidth={2} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })()}
                  </div>
                  {/* Career summary */}
                  <div className="lg:col-span-2 glass-card rounded-2xl p-5">
                    <p className="font-semibold text-sm text-slate-900 dark:text-foreground mb-4">Tổng hợp sự nghiệp</p>
                    {playerStats.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Trận đấu',     value: playerStats.reduce((s, x) => s + x.appearances, 0) },
                          { label: 'Bàn thắng',    value: playerStats.reduce((s, x) => s + x.goals, 0) },
                          { label: 'Kiến tạo',     value: playerStats.reduce((s, x) => s + x.assists, 0) },
                          { label: 'Phút thi đấu', value: playerStats.reduce((s, x) => s + x.minutes, 0).toLocaleString('vi-VN') },
                          { label: 'Thẻ vàng',     value: playerStats.reduce((s, x) => s + x.yellowCards, 0) },
                          { label: 'Thẻ đỏ',       value: playerStats.reduce((s, x) => s + x.redCards, 0) },
                          { label: 'Mùa giải',     value: playerStats.length },
                          { label: 'Rating TB',    value: playerStats.filter(s => s.rating).length > 0 ? (playerStats.reduce((s, x) => s + (x.rating ?? 0), 0) / playerStats.filter(s => s.rating).length).toFixed(1) : '—' },
                        ].map(item => (
                          <div key={item.label} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                            <p className="text-[11px] text-slate-400 dark:text-[#A8A29E] mb-1">{item.label}</p>
                            <p className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    ) : player ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'Trận đấu',  value: player.stats.matches },
                          { label: 'Bàn thắng', value: player.stats.goals },
                          { label: 'Kiến tạo',  value: player.stats.assists },
                          { label: 'Phút',      value: player.stats.minutesPlayed },
                          { label: 'Chuyền %',  value: `${player.stats.passAccuracy}%` },
                          { label: 'Thẻ vàng',  value: player.stats.yellowCards },
                        ].map(item => (
                          <div key={item.label} className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                            <p className="text-[11px] text-slate-400 dark:text-[#A8A29E] mb-1">{item.label}</p>
                            <p className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-slate-400 text-sm">Chưa có dữ liệu</p>}
                  </div>
                </div>
              )}

              {/* ── THỐNG KÊ ── */}
              {activeTab === 'stats' && (
                <PremiumGate locked={!isPremium} message="Đăng ký Premium để xem thống kê chi tiết theo mùa và phân tích phong độ.">
                <div className="mt-4 space-y-4">
                  {apiPlayer && playerStats.length > 0 ? (() => {
                    const stat = playerStats[selectedSeasonIdx];
                    if (!stat) return null;
                    const pos = playerPosition ?? '';
                    const ratingColor = stat.rating ? stat.rating >= 8 ? '#22c55e' : stat.rating >= 7 ? '#84cc16' : stat.rating >= 6 ? '#eab308' : '#ef4444' : '#6b7280';
                    type SI = { label: string; val: number | null | undefined; sub?: string; pct?: number };
                    const pct = (a?: number | null, b?: number | null) => a != null && b != null && b > 0 ? Math.round((a / b) * 100) : undefined;
                    const overview: SI[] = [
                      { label: 'Trận đấu', val: stat.appearances }, { label: 'Đá chính', val: stat.lineups },
                      { label: 'Phút', val: stat.minutes }, { label: 'Vào sân', val: stat.substitutionsIn },
                      { label: 'Ra sân', val: stat.substitutionsOut }, { label: 'Thẻ vàng', val: stat.yellowCards }, { label: 'Thẻ đỏ', val: stat.redCards },
                    ];
                    const attacking: SI[] = [
                      { label: 'Bàn thắng', val: stat.goals }, { label: 'Kiến tạo', val: stat.assists },
                      { label: 'Tổng cú sút', val: stat.shotsTotal },
                      { label: 'Sút trúng đích', val: stat.shotsOnTarget, sub: `${pct(stat.shotsOnTarget, stat.shotsTotal) ?? '—'}%`, pct: pct(stat.shotsOnTarget, stat.shotsTotal) },
                      { label: 'Penalty ghi', val: stat.penaltiesScored }, { label: 'Penalty hỏng', val: stat.penaltiesMissed },
                    ];
                    const passing: SI[] = [
                      { label: 'Tổng chuyền', val: stat.passesTotal },
                      { label: 'Chuyền chính xác', val: stat.passesAccuracy, sub: `${pct(stat.passesAccuracy, stat.passesTotal) ?? '—'}%`, pct: pct(stat.passesAccuracy, stat.passesTotal) },
                      { label: 'Chuyền then chốt', val: stat.passesKey },
                    ];
                    const dribbling: SI[] = [
                      { label: 'Rê bóng thành công', val: stat.dribblesSuccess, sub: `${pct(stat.dribblesSuccess, stat.dribblesAttempted) ?? '—'}%`, pct: pct(stat.dribblesSuccess, stat.dribblesAttempted) },
                      { label: 'Rê bóng thử', val: stat.dribblesAttempted },
                      { label: 'Tranh chấp thắng', val: stat.duelsWon, sub: `${pct(stat.duelsWon, stat.duelsTotal) ?? '—'}%`, pct: pct(stat.duelsWon, stat.duelsTotal) },
                      { label: 'Tranh chấp tổng', val: stat.duelsTotal },
                      { label: 'Phạm lỗi', val: stat.foulsCommitted }, { label: 'Bị phạm lỗi', val: stat.foulsDrawn },
                    ];
                    const defending: SI[] = [{ label: 'Tắc bóng', val: stat.tackles }, { label: 'Cắt bóng', val: stat.interceptions }];
                    type G = { title: string; color: string; icon: string; items: SI[] };
                    const groups: G[] = pos === 'G'
                      ? [{ title: 'Tổng quan', color: 'text-slate-500', icon: '📋', items: overview }, { title: 'Chuyền bóng', color: 'text-cyan-500', icon: '🎯', items: passing }]
                      : pos === 'D'
                      ? [{ title: 'Tổng quan', color: 'text-slate-500', icon: '📋', items: overview }, { title: 'Phòng thủ', color: 'text-amber-500', icon: '🛡️', items: defending }, { title: 'Tranh chấp', color: 'text-orange-500', icon: '⚔️', items: dribbling }, { title: 'Chuyền bóng', color: 'text-cyan-500', icon: '🎯', items: passing }]
                      : pos === 'M'
                      ? [{ title: 'Tổng quan', color: 'text-slate-500', icon: '📋', items: overview }, { title: 'Chuyền bóng', color: 'text-cyan-500', icon: '🎯', items: passing }, { title: 'Tấn công', color: 'text-red-500', icon: '⚽', items: attacking }, { title: 'Tranh chấp', color: 'text-orange-500', icon: '⚔️', items: dribbling }, { title: 'Phòng thủ', color: 'text-amber-500', icon: '🛡️', items: defending }]
                      : [{ title: 'Tổng quan', color: 'text-slate-500', icon: '📋', items: overview }, { title: 'Tấn công', color: 'text-red-500', icon: '⚽', items: attacking }, { title: 'Chuyền bóng', color: 'text-cyan-500', icon: '🎯', items: passing }, { title: 'Tranh chấp', color: 'text-orange-500', icon: '⚔️', items: dribbling }];

                    const trendData = [...playerStats].reverse().map(s => {
                      const season = seasons.find(x => x.seasonId === s.seasonId);
                      return { name: `${season?.year || s.seasonId}`, 'Bàn thắng': s.goals ?? 0, 'Kiến tạo': s.assists ?? 0, 'Trận đấu': s.appearances ?? 0, 'Đánh giá': s.rating ? parseFloat(s.rating.toFixed(1)) : undefined };
                    });

                    return (
                      <>
                        {/* Season selector */}
                        <div className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900 dark:text-foreground">Mùa giải</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedSeasonIdx(i => Math.max(0, i - 1))} disabled={selectedSeasonIdx === 0}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <select value={selectedSeasonIdx} onChange={e => setSelectedSeasonIdx(Number(e.target.value))}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-foreground focus:outline-none cursor-pointer">
                              {playerStats.map((s, i) => { const season = seasons.find(x => x.seasonId === s.seasonId); return <option key={i} value={i}>Mùa {season?.year || s.seasonId}</option>; })}
                            </select>
                            <button onClick={() => setSelectedSeasonIdx(i => Math.min(playerStats.length - 1, i + 1))} disabled={selectedSeasonIdx === playerStats.length - 1}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stats detail */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                          {stat.rating && (
                            <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                              <span className="text-xs text-slate-400">Đánh giá</span>
                              <span className="font-mono-data text-xl font-black" style={{ color: ratingColor }}>{stat.rating.toFixed(1)}</span>
                              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${(stat.rating / 10) * 100}%`, backgroundColor: ratingColor }} />
                              </div>
                            </div>
                          )}
                          <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {groups.map(group => {
                              const visible = group.items.filter(i => i.val != null);
                              if (!visible.length) return null;
                              return (
                                <div key={group.title} className="px-5 py-4">
                                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${group.color}`}>{group.icon} {group.title}</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                                    {visible.map(item => (
                                      <div key={item.label}>
                                        <p className="text-[11px] text-slate-400 dark:text-[#A8A29E] mb-0.5">{item.label}</p>
                                        <p className="font-mono-data text-lg font-bold text-slate-900 dark:text-foreground leading-none">{item.val}</p>
                                        {item.pct != null && (
                                          <div className="mt-1">
                                            <div className="h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                              <div className="h-full rounded-full bg-[#00D9FF]" style={{ width: `${item.pct}%` }} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{item.sub}</p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Trend + Season comparison — chỉ hiện khi ≥2 mùa */}
                        {playerStats.length >= 2 && (
                          <div className="glass-card rounded-2xl overflow-hidden">
                            <button onClick={() => setShowTrend(v => !v)}
                              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-[#00D9FF]" />
                                <span className="font-medium text-sm text-slate-900 dark:text-foreground">Phân tích phong độ qua các mùa</span>
                                <span className="text-xs text-slate-400">{playerStats.length} mùa</span>
                              </div>
                              <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', showTrend && 'rotate-180')} />
                            </button>
                            <AnimatePresence>
                              {showTrend && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                                  className="overflow-hidden border-t border-slate-100 dark:border-white/5">
                                  <div className="p-5 space-y-6">
                                    {/* Goals + Assists */}
                                    <div>
                                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Bàn thắng & Kiến tạo</p>
                                      <div className="h-44">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <defs>
                                              <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#FF4444" stopOpacity={0} /></linearGradient>
                                              <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} /><stop offset="95%" stopColor="#00D9FF" stopOpacity={0} /></linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#A8A29E', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }} />
                                            <Area type="monotone" dataKey="Bàn thắng" stroke="#FF4444" strokeWidth={2} fill="url(#gG)" dot={{ fill: '#FF4444', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                            <Area type="monotone" dataKey="Kiến tạo" stroke="#00D9FF" strokeWidth={2} fill="url(#aG)" dot={{ fill: '#00D9FF', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                          </AreaChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                    {/* Rating */}
                                    {trendData.some(d => d['Đánh giá'] != null) && (
                                      <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Đánh giá trung bình</p>
                                        <div className="h-36">
                                          <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                              <XAxis dataKey="name" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
                                              <YAxis domain={['auto', 'auto']} tick={{ fill: '#A8A29E', fontSize: 10 }} axisLine={false} tickLine={false} />
                                              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }} />
                                              <Line type="monotone" dataKey="Đánh giá" stroke="#00D9FF" strokeWidth={2.5} dot={{ fill: '#fff', stroke: '#00D9FF', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#00D9FF' }} connectNulls />
                                            </LineChart>
                                          </ResponsiveContainer>
                                        </div>
                                      </div>
                                    )}
                                    {/* Appearances */}
                                    <div>
                                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Số trận thi đấu</p>
                                      <div className="h-32">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <BarChart data={trendData} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: '#A8A29E', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }} />
                                            <Bar dataKey="Trận đấu" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>

                                    {/* ── SO SÁNH MÙA ── */}
                                    {(() => {
                                      const sorted = [...playerStats].sort((a, b) => (a.seasonId ?? 99) - (b.seasonId ?? 99));
                                      if (sorted.length < 2) return null;
                                      const idxA = Math.min(compareSeasonA, sorted.length - 1);
                                      const idxB = Math.min(compareSeasonB, sorted.length - 1);
                                      const prev = sorted[idxA];
                                      const curr = sorted[idxB];
                                      const currSeason = seasons.find(s => s.seasonId === curr.seasonId);
                                      const prevSeason = seasons.find(s => s.seasonId === prev.seasonId);
                                      type CR = { label: string; curr: number | null; prev: number | null; lowerBetter?: boolean; isPercent?: boolean };
                                      const rows: CR[] = [
                                        { label: 'Đánh giá', curr: curr.rating ? parseFloat(curr.rating.toFixed(2)) : null, prev: prev.rating ? parseFloat(prev.rating.toFixed(2)) : null },
                                        { label: 'Bàn thắng', curr: curr.goals, prev: prev.goals },
                                        { label: 'Kiến tạo', curr: curr.assists, prev: prev.assists },
                                        { label: 'Trận đấu', curr: curr.appearances, prev: prev.appearances },
                                        { label: 'Phút thi đấu', curr: curr.minutes, prev: prev.minutes },
                                        { label: 'Sút trúng đích', curr: curr.shotsOnTarget, prev: prev.shotsOnTarget },
                                        { label: 'Chuyền chính xác', curr: curr.passesAccuracy != null && curr.passesTotal ? Math.round((curr.passesAccuracy / curr.passesTotal) * 100) : null, prev: prev.passesAccuracy != null && prev.passesTotal ? Math.round((prev.passesAccuracy / prev.passesTotal) * 100) : null, isPercent: true },
                                        { label: 'Rê bóng thành công', curr: curr.dribblesSuccess, prev: prev.dribblesSuccess },
                                        { label: 'Thẻ vàng', curr: curr.yellowCards, prev: prev.yellowCards, lowerBetter: true },
                                      ].filter(r => r.curr != null || r.prev != null);
                                      return (
                                        <div>
                                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">So sánh mùa</p>
                                            <select value={idxA} onChange={e => setCompareSeasonA(Number(e.target.value))}
                                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none cursor-pointer">
                                              {sorted.map((s, i) => { const sea = seasons.find(x => x.seasonId === s.seasonId); return <option key={i} value={i} disabled={i === idxB}>Mùa {sea?.year ?? s.seasonId}</option>; })}
                                            </select>
                                            <span className="text-xs text-slate-400">vs</span>
                                            <select value={idxB} onChange={e => setCompareSeasonB(Number(e.target.value))}
                                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none cursor-pointer">
                                              {sorted.map((s, i) => { const sea = seasons.find(x => x.seasonId === s.seasonId); return <option key={i} value={i} disabled={i === idxA}>Mùa {sea?.year ?? s.seasonId}</option>; })}
                                            </select>
                                          </div>
                                          <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                                            <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 py-2 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                                              <span>Mùa {prevSeason?.year ?? prev.seasonId}</span>
                                              <span className="text-center">Chỉ số</span>
                                              <span className="text-right">Mùa {currSeason?.year ?? curr.seasonId}</span>
                                            </div>
                                            {rows.map(row => {
                                              const c = row.curr ?? 0;
                                              const p = row.prev ?? 0;
                                              const improved = row.lowerBetter ? c < p : c > p;
                                              const declined = row.lowerBetter ? c > p : c < p;
                                              const diff = c - p;
                                              const fmt = (v: number | null) => v == null ? '—' : row.isPercent ? `${v.toFixed(0)}%` : Number.isInteger(v) ? v.toString() : v.toFixed(1);
                                              return (
                                                <div key={row.label} className="grid grid-cols-3 items-center px-4 py-2.5 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                  <span className="font-mono-data text-sm text-slate-500 dark:text-[#A8A29E]">{fmt(row.prev)}</span>
                                                  <div className="text-center">
                                                    <p className="text-[11px] text-slate-500 dark:text-[#A8A29E]">{row.label}</p>
                                                    {row.curr != null && row.prev != null && diff !== 0 && (
                                                      <span className={`text-[10px] font-bold ${improved ? 'text-green-400' : declined ? 'text-red-400' : 'text-slate-400'}`}>
                                                        {diff > 0 ? '+' : ''}{row.isPercent ? `${diff.toFixed(0)}%` : Number.isInteger(diff) ? diff : diff.toFixed(1)}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <span className={`font-mono-data text-sm font-bold text-right ${improved ? 'text-green-400' : declined ? 'text-red-400' : 'text-slate-900 dark:text-foreground'}`}>
                                                    {fmt(row.curr)}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </>
                    );
                  })() : (
                    <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-sm">Chưa có thống kê cho cầu thủ này</div>
                  )}
                </div>
                </PremiumGate>
              )}

              {/* ── LỊCH SỬ TRẬN ── */}
              {activeTab === 'matches' && (
                <PremiumGate locked={!isPremium} message="Đăng ký Premium để xem lịch sử trận đấu và thông số chi tiết từng trận.">
                <div className="mt-4 space-y-3">
                  {matchHistoryLoading ? (
                    <div className="glass-card rounded-2xl flex items-center justify-center py-16">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-[#00D9FF] animate-spin mx-auto mb-3" />
                        <p className="text-sm text-slate-400">Đang tải lịch sử trận đấu...</p>
                      </div>
                    </div>
                  ) : matchHistory.length === 0 && matchHistoryLoaded ? (
                    <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-16 text-slate-400">
                      <span className="text-4xl mb-3">🏟️</span>
                      <p className="text-sm">Không tìm thấy dữ liệu trận đấu</p>
                    </div>
                  ) : matchHistory.length === 0 ? (
                    <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-16 text-slate-400">
                      <span className="text-4xl mb-3">🏟️</span>
                      <p className="text-sm">Nhấn tab để tải lịch sử trận đấu</p>
                    </div>
                  ) : (
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900 dark:text-foreground">Lịch sử trận đấu</span>
                        <span className="text-xs text-slate-400">{matchHistory.length} trận</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {matchHistory.slice(0, matchVisibleCount).map(({ match, stats: s }, i) => {
                          const isHome = (match.homeTeam?.apiTeamId ?? match.homeTeam?.id) === (playerTeam?.apiTeamId ?? apiPlayer?.team?.apiTeamId);
                          const opponent = isHome ? match.awayTeam : match.homeTeam;
                          const myGoals = isHome ? (match.homeGoals ?? 0) : (match.awayGoals ?? 0);
                          const oppGoals = isHome ? (match.awayGoals ?? 0) : (match.homeGoals ?? 0);
                          const result = myGoals > oppGoals ? 'T' : myGoals < oppGoals ? 'B' : 'H';
                          const resultCls = result === 'T' ? 'bg-green-500 text-white' : result === 'B' ? 'bg-red-500 text-white' : 'bg-slate-400 text-white';
                          const date = match.matchDate ? new Date(match.matchDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
                          const rating = s?.rating != null ? Number(s.rating) : null;
                          const ratingColor = rating == null ? '#6b7280' : rating >= 8 ? '#22c55e' : rating >= 7 ? '#84cc16' : rating >= 6 ? '#eab308' : '#ef4444';
                          const round = match.round ? `Vòng ${match.round}` : '';
                          return (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                              <div onClick={() => setSelectedMatchStat({ match, stats: s })}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer">
                                  {/* Kết quả */}
                                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0', resultCls)}>
                                    {result}
                                  </div>
                                  {/* Đối thủ */}
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <img
                                      src={`https://api.sofascore.app/api/v1/team/${opponent?.apiTeamId ?? opponent?.id}/image`}
                                      alt={opponent?.teamName ?? opponent?.name ?? ''}
                                      className="w-6 h-6 object-contain flex-shrink-0"
                                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 dark:text-foreground truncate group-hover:text-[#00D9FF] transition-colors">
                                        {isHome ? 'vs' : '@'} {opponent?.teamName ?? opponent?.name ?? '—'}
                                      </p>
                                      <p className="text-[10px] text-slate-400">{date}{round ? ` · ${round}` : ''}</p>
                                    </div>
                                  </div>
                                  {/* Tỉ số */}
                                  <div className="text-center flex-shrink-0 min-w-[48px]">
                                    <span className="font-mono-data text-sm font-bold text-slate-900 dark:text-foreground">
                                      {myGoals} - {oppGoals}
                                    </span>
                                  </div>
                                  {/* Thông số nhanh */}
                                  <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-[#A8A29E] flex-shrink-0">
                                    {s?.minutes != null && <span>{s.minutes}'</span>}
                                    {s?.goals > 0 && <span className="text-[#FF4444] font-bold">⚽ {s.goals}</span>}
                                    {s?.assists > 0 && <span className="text-[#00D9FF] font-bold">🎯 {s.assists}</span>}
                                    {s?.yellowCards > 0 && <span>🟨</span>}
                                    {s?.redCards > 0 && <span>🟥</span>}
                                  </div>
                                  {/* Rating */}
                                  {rating != null && (
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2"
                                      style={{ borderColor: ratingColor, background: `${ratingColor}15` }}>
                                      <span className="font-mono-data text-sm font-black" style={{ color: ratingColor }}>
                                        {rating.toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                          );
                        })}
                      </div>
                      {matchVisibleCount < matchHistory.length && (
                        <button
                          onClick={() => setMatchVisibleCount(c => c + 5)}
                          className="w-full py-3 text-xs font-semibold text-[#00D9FF] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          Xem thêm ({matchHistory.length - matchVisibleCount} trận còn lại)
                        </button>
                      )}
                    </div>
                  )}
                </div>
                </PremiumGate>
              )}

              {/* ── CHUYỂN NHƯỢNG ── */}
              {activeTab === 'transfers' && (
                <PremiumGate locked={!isPremium} message="Đăng ký Premium để xem lịch sử chuyển nhượng.">
                <div className="mt-4">
                  {transfersLoading ? (
                    <div className="glass-card rounded-2xl flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-[#00D9FF] animate-spin" /></div>
                  ) : transfers.length === 0 ? (
                    <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-sm">Không có dữ liệu chuyển nhượng</div>
                  ) : (
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900 dark:text-foreground">Lịch sử chuyển nhượng</span>
                        <span className="text-xs text-slate-400">{transfers.length} lần</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-white/5">
                        {[...transfers]
                          .sort((a, b) => new Date(b.transferDate ?? b.date ?? 0).getTime() - new Date(a.transferDate ?? a.date ?? 0).getTime())
                          .map((t, i) => {
                            const tType = t.transferType ?? t.type;
                            const rawDate = t.transferDate ?? t.date;
                            const date = rawDate ? new Date(rawDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
                            const fee = (t.transferFee && t.transferFee !== '') ? t.transferFee : null;
                            let cachedTeams: any[] = [];
                            try { const raw = JSON.parse(localStorage.getItem('teams') || '[]'); cachedTeams = Array.isArray(raw) ? raw : (raw?.data ?? raw?.teams ?? []); } catch {}
                            const getTeamName = (id: number) => cachedTeams.find((x: any) => x.teamId === id)?.teamName ?? (id ? `Đội #${id}` : '—');
                            const fromTeamName = (typeof t.fromTeam === 'string' ? t.fromTeam : null) ?? t.fromTeamName ?? getTeamName(t.fromTeamId);
                            const toTeamName   = (typeof t.toTeam   === 'string' ? t.toTeam   : null) ?? t.toTeamName   ?? getTeamName(t.toTeamId);
                            const typeMeta: Record<string, { label: string; cls: string }> = {
                              Transfer:      { label: 'Chuyển nhượng', cls: 'bg-blue-500/15 text-blue-500 border border-blue-500/20' },
                              Loan:          { label: 'Cho mượn',      cls: 'bg-amber-500/15 text-amber-500 border border-amber-500/20' },
                              'Loan return': { label: 'Hết mượn',      cls: 'bg-slate-400/15 text-slate-500 border border-slate-400/20' },
                              'Loan Return': { label: 'Hết mượn',      cls: 'bg-slate-400/15 text-slate-500 border border-slate-400/20' },
                              Free:          { label: 'Tự do',         cls: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' },
                            };
                            const meta = typeMeta[tType] ?? { label: tType ?? '—', cls: 'bg-slate-100 text-slate-500 border border-slate-200' };
                            return (
                              <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <div className="flex-shrink-0 w-10 text-center">
                                  <span className="text-xs font-bold text-slate-400 dark:text-[#A8A29E]">{rawDate ? new Date(rawDate).getFullYear() : '—'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500 dark:text-[#A8A29E] truncate max-w-[130px]">{fromTeamName ?? '—'}</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#00D9FF] flex-shrink-0" />
                                    <span className="text-sm font-semibold text-slate-900 dark:text-foreground truncate max-w-[130px]">{toTeamName ?? '—'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-400">{date}</span>
                                    {fee && fee !== 'Free' && <span className="text-xs text-[#00D9FF] font-semibold">· {fee}</span>}
                                    {(fee === 'Free' || tType === 'Free') && <span className="text-xs text-emerald-500 font-medium">· Tự do</span>}
                                  </div>
                                </div>
                                <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0', meta.cls)}>{meta.label}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
                </PremiumGate>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Compare button */}
          <div className="text-center py-8">
            <Link to={`/compare?player1=${apiPlayer ? apiPlayer.playerId : player?.id}`}>
              <Button className="bg-[#00D9FF] hover:bg-[#00E8FF] text-slate-900 font-semibold px-6 h-10 rounded-xl text-sm">
                <Users className="w-4 h-4 mr-2" />
                So sánh với cầu thủ khác
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
    {selectedMatchStat && <MatchStatModal item={selectedMatchStat} onClose={() => setSelectedMatchStat(null)} />}
    </>
  );
}
