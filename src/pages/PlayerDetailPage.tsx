import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Users, Loader2, ArrowRight, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getPlayerById } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { PlayerFromAPI, PlayerStats, leagueService } from '@/services/leagueService';
import { toast } from 'sonner';
import { 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

// Mock performance trend data
const performanceTrend = [
  { match: 'M1', rating: 7.2, date: 'Mar 1' },
  { match: 'M2', rating: 7.8, date: 'Mar 5' },
  { match: 'M3', rating: 8.1, date: 'Mar 10' },
  { match: 'M4', rating: 7.5, date: 'Mar 15' },
  { match: 'M5', rating: 8.7, date: 'Mar 20' },
  { match: 'M6', rating: 8.4, date: 'Mar 25' },
];

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const location = useLocation();
  const [playerTeam, setPlayerTeam] = useState<any>(null);
  const [apiPlayer, setApiPlayer] = useState<PlayerFromAPI | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromTeamId, setFromTeamId] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const [showTrend, setShowTrend] = useState(false);
  const [compareSeasonA, setCompareSeasonA] = useState(1); // index vào playerStats (mùa trước)
  const [compareSeasonB, setCompareSeasonB] = useState(0); // index vào playerStats (mùa hiện tại)
  const player = getPlayerById(playerId || '');
  const [expandedContribution, setExpandedContribution] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    setSelectedSeasonIdx(0); // reset về mùa mới nhất khi đổi cầu thủ
    
    // Check if we came from a team detail page
    const state = location.state as { fromTeamId?: string } | undefined;
    if (state?.fromTeamId) {
      setFromTeamId(state.fromTeamId);
    }

    loadPlayerData();
  }, [playerId, location.state]);

  const loadPlayerData = async () => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const foundPlayer = await leagueService.getPlayerById(Number(playerId));
      setApiPlayer(foundPlayer);

      // Load team info
      if (foundPlayer.teamId) {
        try {
          const team = await leagueService.getTeamById(foundPlayer.teamId);
          setPlayerTeam(team);
        } catch { /* ignore */ }
      }

      const allStats = await leagueService.getPlayerStatsByPlayerId(Number(playerId));
      // Sort mùa mới nhất lên đầu (seasonId 1 = mới nhất, số lớn hơn = cũ hơn)
      const sortedStats = [...allStats].sort((a, b) => (a.seasonId ?? 99) - (b.seasonId ?? 99));
      setPlayerStats(sortedStats);

      // Fetch seasons to map seasonId → year for display
      if (allStats.length > 0 && allStats[0].leagueId) {
        try {
          const leagueSeasons = await leagueService.getSeasons(allStats[0].leagueId);
          setSeasons(leagueSeasons);
        } catch { /* ignore */ }
      }

          // Fetch transfer history (chỉ khi đã đăng nhập)
          const token = localStorage.getItem('accessToken');
          if (foundPlayer.teamId && token) {
            try {
              setTransfersLoading(true);
              const LEAGUE_MAP: Record<number, { tournamentId: number; seasonId: number }> = {
                1: { tournamentId: 626, seasonId: 78589 },
                2: { tournamentId: 771, seasonId: 80926 },
                3: { tournamentId: 3087, seasonId: 81023 },
              };
              // Lấy leagueId từ stats (leagueId 1/2/3), fallback thử cả 3
              const statLeagueIds = [...new Set(allStats.map(s => s.leagueId).filter(id => LEAGUE_MAP[id]))];
              const leagueIdsToTry = statLeagueIds.length > 0 ? statLeagueIds : [1, 2, 3];
              for (const lid of leagueIdsToTry) {
                const mapping = LEAGUE_MAP[lid];
                if (!mapping) continue;
                try {
                  const res = await leagueService.getLeagueTransfers(mapping.tournamentId, mapping.seasonId);
                  const byPlayer: any[] = res?.transfersByPlayer ?? res?.data?.transfersByPlayer ?? [];
                  const playerData = byPlayer.find((p: any) =>
                    p.apiPlayerId === foundPlayer.apiPlayerId ||
                    p.playerId === foundPlayer.playerId ||
                    String(p.apiPlayerId) === String(foundPlayer.apiPlayerId) ||
                    String(p.playerId) === String(foundPlayer.playerId)
                  );
                  if (playerData?.transferHistory?.length) {
                    setTransfers(playerData.transferHistory);
                    break;
                  }
                } catch { /* try next */ }
              }
            } catch { /* ignore */ } finally {
              setTransfersLoading(false);
            }
          }
    } catch (error) {
      console.error('Failed to load player data:', error);
      toast.error('Không thể tải thông tin cầu thủ');
    } finally {
      setIsLoading(false);
    }
  };

  // Use API player if available, otherwise fallback to mock data
  const displayPlayer = apiPlayer || player;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#00D9FF] animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-[#A8A29E]">Đang tải...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!displayPlayer) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-foreground mb-4">
              Không tìm thấy cầu thủ
            </h2>
            <Link to="/players">
              <Button variant="outline" className="border-[#00D9FF] text-[#00D9FF]">
                Quay lại
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Get player data - handle both API and mock data
  const playerName = apiPlayer ? apiPlayer.fullName : player?.name || '';
  const playerPhoto = apiPlayer ? apiPlayer.photoUrl : player?.photoUrl;
  const playerNationality = apiPlayer ? apiPlayer.nationality : player?.nationality;
  const playerHeight = apiPlayer ? apiPlayer.heightCm : player?.height;
  const playerWeight = apiPlayer ? apiPlayer.weightKg : player?.weight;
  const playerPosition = apiPlayer ? apiPlayer.position : player?.position;
  const playerAge = apiPlayer ? apiPlayer.age : player?.age;
  
  // Calculate aggregate stats from player stats
  const aggregateStats = playerStats.length > 0 ? {
    matches: playerStats.reduce((sum, s) => sum + s.appearances, 0),
    goals: playerStats.reduce((sum, s) => sum + s.goals, 0),
    assists: playerStats.reduce((sum, s) => sum + s.assists, 0),
    minutesPlayed: playerStats.reduce((sum, s) => sum + s.minutes, 0),
    yellowCards: playerStats.reduce((sum, s) => sum + s.yellowCards, 0),
    redCards: playerStats.reduce((sum, s) => sum + s.redCards, 0),
    avgRating: playerStats.filter(s => s.rating).length > 0
      ? playerStats.reduce((sum, s) => sum + (s.rating || 0), 0) / playerStats.filter(s => s.rating).length
      : 0,
  } : null;

  // Generate radar data from real player stats (latest season)
  const getRadarData = () => {
    const latest = playerStats[0];
    if (!latest) return null;

    const norm = (val: number | null | undefined, max: number) =>
      Math.min(100, Math.round(((val ?? 0) / max) * 100));

    const data = [
      { stat: 'Ghi bàn',    value: norm(latest.goals, 20) },
      { stat: 'Kiến tạo',   value: norm(latest.assists, 15) },
      { stat: 'Sút cầu môn',value: norm(latest.shotsOnTarget, 50) },
      { stat: 'Chuyền bóng',value: norm(latest.passesKey, 60) },
      { stat: 'Rê bóng',    value: norm(latest.dribblesSuccess, 60) },
      { stat: 'Kỷ luật',    value: Math.max(0, 100 - norm((latest.yellowCards ?? 0) * 10 + (latest.redCards ?? 0) * 30, 100)) },
    ];

    if (data.every(d => d.value === 0)) return null;
    return data;
  };

  const contributions = player?.matchHistory?.[0]?.contributions || [
    { category: 'Goals', value: 0.6, positive: true, description: 'Excellent finishing in key moments' },
    { category: 'Key Passes', value: 0.4, positive: true, description: 'Created multiple chances' },
    { category: 'Dribbling', value: 0.3, positive: true, description: 'Beat defenders consistently' },
    { category: 'Defensive Work', value: -0.1, positive: false, description: 'Could track back more' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              to={fromTeamId ? `/teams/${fromTeamId}` : "/players"} 
              className="inline-flex items-center gap-2 text-slate-600 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm">Quay lại</span>
            </Link>
          </motion.div>

          {/* Player Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-6 sm:p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Player Image & Basic Info */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 flex-shrink-0">
                  {playerPhoto ? (
                    <img
                      src={playerPhoto}
                      alt={playerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-slate-400 dark:text-[#A8A29E]" />
                    </div>
                  )}
                </div>
                <div>
                  {playerPosition && (
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-label font-semibold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30">
                        {({'F':'Tiền đạo','M':'Tiền vệ','D':'Hậu vệ','G':'Thủ môn'} as Record<string,string>)[playerPosition] ?? playerPosition}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-6">
                    <div>
                      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-foreground mb-2">
                        {playerName}
                      </h1>
                      {(apiPlayer?.team || playerTeam) && (
                        <Link
                          to={`/teams/${playerTeam?.teamId ?? apiPlayer?.team?.teamId}`}
                          state={{ fromPlayerId: playerId }}
                          className="inline-flex items-center gap-2 mb-2 group"
                        >
                          {(playerTeam?.logoUrl ?? apiPlayer?.team?.logoUrl) && (
                            <img
                              src={playerTeam?.logoUrl ?? apiPlayer?.team?.logoUrl}
                              alt={playerTeam?.teamName ?? apiPlayer?.team?.teamName}
                              className="w-6 h-6 object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <span className="text-lg text-[#00D9FF] font-semibold group-hover:underline">
                            {playerTeam?.teamName ?? apiPlayer?.team?.teamName}
                          </span>
                        </Link>
                      )}
                      {player && !apiPlayer && (
                        <p className="text-lg text-slate-600 dark:text-[#A8A29E] mb-2">{player.team}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-slate-600 dark:text-[#A8A29E]">Quốc tịch: </span>
                          <span className="text-slate-900 dark:text-foreground font-semibold">{playerNationality || 'N/A'}</span>
                        </div>
                        {playerAge && (
                          <div>
                            <span className="text-slate-600 dark:text-[#A8A29E]">Tuổi: </span>
                            <span className="text-slate-900 dark:text-foreground font-semibold">{playerAge}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-600 dark:text-[#A8A29E]">Chiều cao: </span>
                          <span className="text-slate-900 dark:text-foreground font-semibold">{playerHeight ? `${playerHeight} cm` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Jersey */}
                    {apiPlayer?.number && (
                      <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 50 50" className="absolute inset-0 w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 5 L10 12 L4 9 L2 22 L10 22 L10 44 L40 44 L40 22 L48 22 L46 9 L40 12 L32 5 C30 8 27.5 9.5 25 9.5 C22.5 9.5 20 8 18 5Z"
                            fill="white" fillOpacity="0.08" stroke="#222" strokeWidth="2" strokeLinejoin="round"
                          />
                        </svg>
                        <span className="relative z-10 font-mono-data font-bold text-3xl text-slate-900 dark:text-white leading-none mt-2">
                          {apiPlayer.number}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Display */}
              <div className="lg:ml-auto flex items-center gap-8">
                <div className="relative">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="url(#ratingGradient)"
                      strokeWidth="10"
                      strokeDasharray={`${((playerStats[0]?.rating || player?.rating || 0) / 10) * 283} 283`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF4444" />
                        <stop offset="100%" stopColor="#00D9FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono-data text-4xl font-bold text-slate-900 dark:text-foreground">
                      {(playerStats[0]?.rating || player?.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider">Đánh giá</span>
                  </div>
                </div>
                {player && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="font-mono-data text-lg text-green-400">+0.3</span>
                    <span className="text-xs text-slate-600 dark:text-[#A8A29E]">5 trận gần nhất</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Season Stats - Detailed stats by season for API players */}
            {apiPlayer && playerStats.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card rounded-2xl p-6 lg:col-span-2"
              >
                {/* Header + season selector */}
                <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                  <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm">
                    Thống kê thi đấu
                  </h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedSeasonIdx(i => Math.max(0, i - 1))} disabled={selectedSeasonIdx === 0}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <select
                      value={selectedSeasonIdx}
                      onChange={e => setSelectedSeasonIdx(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-foreground focus:outline-none cursor-pointer"
                    >
                      {playerStats.map((stat, i) => {
                        const season = seasons.find(s => s.seasonId === stat.seasonId);
                        return <option key={i} value={i}>Mùa {season?.year || stat.seasonId}</option>;
                      })}
                    </select>
                    <button onClick={() => setSelectedSeasonIdx(i => Math.min(playerStats.length - 1, i + 1))} disabled={selectedSeasonIdx === playerStats.length - 1}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Selected season stats */}
                {(() => {
                  const stat = playerStats[selectedSeasonIdx];
                  if (!stat) return null;
                  const pos = playerPosition ?? '';
                  const ratingColor = stat.rating
                    ? stat.rating >= 8 ? '#22c55e' : stat.rating >= 7 ? '#84cc16' : stat.rating >= 6 ? '#eab308' : '#ef4444'
                    : '#6b7280';
                  type StatItem = { label: string; val: number | null | undefined; sub?: string; pct?: number };
                  const pct = (a?: number | null, b?: number | null) =>
                    a != null && b != null && b > 0 ? Math.round((a / b) * 100) : undefined;
                  const overview: StatItem[] = [
                    { label: 'Trận đấu', val: stat.appearances },
                    { label: 'Đá chính', val: stat.lineups },
                    { label: 'Phút', val: stat.minutes },
                    { label: 'Vào sân', val: stat.substitutionsIn },
                    { label: 'Ra sân', val: stat.substitutionsOut },
                    { label: 'Thẻ vàng', val: stat.yellowCards },
                    { label: 'Thẻ đỏ', val: stat.redCards },
                  ];
                  const attacking: StatItem[] = [
                    { label: 'Bàn thắng', val: stat.goals },
                    { label: 'Kiến tạo', val: stat.assists },
                    { label: 'Tổng cú sút', val: stat.shotsTotal },
                    { label: 'Sút trúng đích', val: stat.shotsOnTarget, sub: `${pct(stat.shotsOnTarget, stat.shotsTotal) ?? '—'}%`, pct: pct(stat.shotsOnTarget, stat.shotsTotal) },
                    { label: 'Penalty ghi', val: stat.penaltiesScored },
                    { label: 'Penalty hỏng', val: stat.penaltiesMissed },
                  ];
                  const passing: StatItem[] = [
                    { label: 'Tổng chuyền', val: stat.passesTotal },
                    { label: 'Chuyền chính xác', val: stat.passesAccuracy, sub: `${pct(stat.passesAccuracy, stat.passesTotal) ?? '—'}%`, pct: pct(stat.passesAccuracy, stat.passesTotal) },
                    { label: 'Chuyền then chốt', val: stat.passesKey },
                  ];
                  const dribbling: StatItem[] = [
                    { label: 'Rê bóng thành công', val: stat.dribblesSuccess, sub: `${pct(stat.dribblesSuccess, stat.dribblesAttempted) ?? '—'}%`, pct: pct(stat.dribblesSuccess, stat.dribblesAttempted) },
                    { label: 'Rê bóng thử', val: stat.dribblesAttempted },
                    { label: 'Tranh chấp thắng', val: stat.duelsWon, sub: `${pct(stat.duelsWon, stat.duelsTotal) ?? '—'}%`, pct: pct(stat.duelsWon, stat.duelsTotal) },
                    { label: 'Tranh chấp tổng', val: stat.duelsTotal },
                    { label: 'Phạm lỗi', val: stat.foulsCommitted },
                    { label: 'Bị phạm lỗi', val: stat.foulsDrawn },
                  ];
                  const defending: StatItem[] = [
                    { label: 'Tắc bóng', val: stat.tackles },
                    { label: 'Cắt bóng', val: stat.interceptions },
                  ];
                  type Group = { title: string; color: string; icon: string; items: StatItem[] };
                  const groups: Group[] = pos === 'G' ? [
                    { title: 'Tổng quan', color: 'text-slate-500', icon: '📋', items: overview },
                    { title: 'Chuyền bóng', color: 'text-cyan-500', icon: '🎯', items: passing },
                  ] : pos === 'D' ? [
                    { title: 'Tổng quan', color: 'text-slate-500', icon: '📋', items: overview },
                    { title: 'Phòng thủ', color: 'text-amber-500', icon: '🛡️', items: defending },
                    { title: 'Tranh chấp', color: 'text-orange-500', icon: '⚔️', items: dribbling },
                    { title: 'Chuyền bóng', color: 'text-cyan-500', icon: '🎯', items: passing },
                  ] : pos === 'M' ? [
                    { title: 'Tổng quan', color: 'text-slate-500', icon: '📋', items: overview },
                    { title: 'Chuyền bóng', color: 'text-cyan-500', icon: '🎯', items: passing },
                    { title: 'Tấn công', color: 'text-red-500', icon: '⚽', items: attacking },
                    { title: 'Tranh chấp', color: 'text-orange-500', icon: '⚔️', items: dribbling },
                    { title: 'Phòng thủ', color: 'text-amber-500', icon: '🛡️', items: defending },
                  ] : [
                    { title: 'Tổng quan', color: 'text-slate-500', icon: '📋', items: overview },
                    { title: 'Tấn công', color: 'text-red-500', icon: '⚽', items: attacking },
                    { title: 'Chuyền bóng', color: 'text-cyan-500', icon: '🎯', items: passing },
                    { title: 'Tranh chấp', color: 'text-orange-500', icon: '⚔️', items: dribbling },
                  ];
                  return (
                    <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                      {/* Rating bar */}
                      {stat.rating && (
                        <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                          <span className="text-xs text-slate-500 dark:text-[#A8A29E]">Đánh giá mùa này</span>
                          <span className="font-mono-data text-2xl font-black" style={{ color: ratingColor }}>{stat.rating.toFixed(1)}</span>
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
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
                              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${group.color}`}>{group.icon} {group.title}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                                {visible.map(item => (
                                  <div key={item.label}>
                                    <p className="text-[11px] text-slate-500 dark:text-[#A8A29E] mb-0.5">{item.label}</p>
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
                  );
                })()}

                {/* Season trend — collapsible, chỉ hiện khi có ≥2 mùa */}
                {playerStats.length >= 2 && (() => {
                  const trendData = [...playerStats].reverse().map(s => {
                    const season = seasons.find(x => x.seasonId === s.seasonId);
                    return {
                      name: `${season?.year || s.seasonId}`,
                      'Bàn thắng': s.goals ?? 0,
                      'Kiến tạo': s.assists ?? 0,
                      'Trận đấu': s.appearances ?? 0,
                      'Đánh giá': s.rating ? parseFloat(s.rating.toFixed(1)) : undefined,
                    };
                  });
                  return (
                    <div className="mt-4 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                      {/* Toggle button */}
                      <button
                        onClick={() => setShowTrend(v => !v)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#00D9FF]/15 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-[#00D9FF]" />
                          </div>
                          <span className="font-semibold text-sm text-slate-900 dark:text-foreground">Phân tích phong độ qua các mùa</span>
                          <span className="text-xs text-slate-400">{playerStats.length} mùa</span>
                        </div>
                        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-200', showTrend && 'rotate-180')} />
                      </button>

                      <AnimatePresence>
                        {showTrend && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden border-t border-slate-100 dark:border-white/5"
                          >
                            <div className="p-5 space-y-5">
                              {/* Goals + Assists area chart */}
                              <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mb-3">Bàn thắng & Kiến tạo</p>
                                <div className="h-44">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                      <defs>
                                        <linearGradient id="goalGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#FF4444" stopOpacity={0.3} />
                                          <stop offset="95%" stopColor="#FF4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="assistGrad" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                                          <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                      <XAxis dataKey="name" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
                                      <YAxis tick={{ fill: '#A8A29E', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                      <Area type="monotone" dataKey="Bàn thắng" stroke="#FF4444" strokeWidth={2} fill="url(#goalGrad)" dot={{ fill: '#FF4444', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                      <Area type="monotone" dataKey="Kiến tạo" stroke="#00D9FF" strokeWidth={2} fill="url(#assistGrad)" dot={{ fill: '#00D9FF', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="flex items-center gap-4 mt-2 justify-center">
                                  <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-[#FF4444] rounded inline-block" />Bàn thắng</span>
                                  <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-[#00D9FF] rounded inline-block" />Kiến tạo</span>
                                </div>
                              </div>

                              {/* Rating line chart */}
                              {trendData.some(d => d['Đánh giá'] != null) && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mb-3">Đánh giá trung bình</p>
                                  <div className="h-36">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                        <defs>
                                          <linearGradient id="ratingLineGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#FF4444" />
                                            <stop offset="100%" stopColor="#00D9FF" />
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={['auto', 'auto']} tick={{ fill: '#A8A29E', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                        <Line type="monotone" dataKey="Đánh giá" stroke="url(#ratingLineGrad)" strokeWidth={2.5} dot={{ fill: '#fff', stroke: '#00D9FF', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#00D9FF' }} connectNulls />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              )}

                              {/* Appearances bar */}
                              <div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider mb-3">Số trận thi đấu</p>
                                <div className="h-32">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                      <XAxis dataKey="name" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
                                      <YAxis tick={{ fill: '#A8A29E', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                      <Bar dataKey="Trận đấu" fill="#a78bfa" radius={[4,4,0,0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              {/* Season-over-season comparison: selectable */}
                              {(() => {
                                const sorted = [...playerStats].sort((a, b) => (a.seasonId ?? 99) - (b.seasonId ?? 99));
                                if (sorted.length < 2) return null;
                                // Clamp indices in case playerStats changed
                                const idxA = Math.min(compareSeasonA, sorted.length - 1);
                                const idxB = Math.min(compareSeasonB, sorted.length - 1);
                                const prev = sorted[idxA];
                                const curr = sorted[idxB];
                                const currSeason = seasons.find(s => s.seasonId === curr.seasonId);
                                const prevSeason = seasons.find(s => s.seasonId === prev.seasonId);
                                type CompRow = { label: string; curr: number | null; prev: number | null; lowerBetter?: boolean; isPercent?: boolean };
                                const rows: CompRow[] = [
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
                                    {/* Header + season selectors */}
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                      <p className="text-xs font-semibold text-slate-500 dark:text-[#A8A29E] uppercase tracking-wider">So sánh mùa</p>
                                      <select
                                        value={idxA}
                                        onChange={e => setCompareSeasonA(Number(e.target.value))}
                                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none cursor-pointer"
                                      >
                                        {sorted.map((s, i) => {
                                          const sea = seasons.find(x => x.seasonId === s.seasonId);
                                          return <option key={i} value={i} disabled={i === idxB}>Mùa {sea?.year ?? s.seasonId}</option>;
                                        })}
                                      </select>
                                      <span className="text-xs text-slate-400">vs</span>
                                      <select
                                        value={idxB}
                                        onChange={e => setCompareSeasonB(Number(e.target.value))}
                                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-foreground focus:outline-none cursor-pointer"
                                      >
                                        {sorted.map((s, i) => {
                                          const sea = seasons.find(x => x.seasonId === s.seasonId);
                                          return <option key={i} value={i} disabled={i === idxA}>Mùa {sea?.year ?? s.seasonId}</option>;
                                        })}
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
                  );
                })()}
              </motion.div>
            ) : apiPlayer ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card rounded-2xl p-6 lg:col-span-2"
              >
                <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm mb-6">
                  Thống kê chi tiết theo mùa giải
                </h3>
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-[#A8A29E]">
                    Chưa có thống kê cho cầu thủ này
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm mb-6">
                  Thống kê mùa giải
                </h3>
                <div className="space-y-4">
                  {player && [
                    { label: 'Trận đấu', value: player.stats.matches },
                    { label: 'Bàn thắng', value: player.stats.goals },
                    { label: 'Kiến tạo', value: player.stats.assists },
                    { label: 'Phút thi đấu', value: player.stats.minutesPlayed },
                    { label: 'Độ chính xác chuyền bóng', value: `${player.stats.passAccuracy}%` },
                    { label: 'Thẻ vàng', value: player.stats.yellowCards },
                  ].map((stat, index) => (
                    <div key={stat.label} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-white/5 last:border-0">
                      <span className="text-slate-600 dark:text-[#A8A29E] text-sm">{stat.label}</span>
                      <span className="font-mono-data text-lg font-semibold text-slate-900 dark:text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm mb-6">
                Chỉ số cầu thủ
              </h3>
              {(() => {
                const radarData = getRadarData();
                if (!radarData) {
                  return (
                    <div className="h-64 flex items-center justify-center text-slate-500 dark:text-[#A8A29E] text-sm">
                      Chưa có đủ dữ liệu thống kê
                    </div>
                  );
                }
                return (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                          dataKey="stat"
                          tick={{ fill: '#A8A29E', fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{ fill: '#A8A29E', fontSize: 10 }}
                        />
                        <Radar
                          name="Chỉ số"
                          dataKey="value"
                          stroke="#00D9FF"
                          fill="#00D9FF"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()}
            </motion.div>

            {/* Rating Breakdown - only show for mock data */}
            {player && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-card rounded-2xl p-6"
              >
                <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm mb-6">
                  Phân tích đánh giá
                </h3>
                <p className="text-sm text-slate-600 dark:text-[#A8A29E] mb-4">
                  Đóng góp từ trận đấu gần nhất
                </p>
                <div className="space-y-3">
                  {contributions.map((contrib, index) => (
                    <div key={index}>
                      <button
                        onClick={() => setExpandedContribution(expandedContribution === contrib.category ? null : contrib.category)}
                        className="w-full"
                      >
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            {contrib.positive ? (
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                            )}
                            <span className="text-sm text-slate-900 dark:text-foreground">{contrib.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-mono-data text-sm font-semibold",
                              contrib.positive ? "text-green-400" : "text-red-400"
                            )}>
                              {contrib.positive ? '+' : ''}{contrib.value.toFixed(1)}
                            </span>
                            {expandedContribution === contrib.category ? (
                              <ChevronUp className="w-4 h-4 text-slate-600 dark:text-[#A8A29E]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-[#A8A29E]" />
                            )}
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              contrib.positive ? "bg-green-400" : "bg-red-400"
                            )}
                            style={{ width: `${Math.abs(contrib.value) * 100}%` }}
                          />
                        </div>
                      </button>
                      {expandedContribution === contrib.category && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-5 py-2"
                        >
                          <p className="text-xs text-slate-600 dark:text-[#A8A29E]">{contrib.description}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Transfer History - chỉ hiện khi đã đăng nhập và có data */}
          {(transfers.length > 0 || transfersLoading) && localStorage.getItem('accessToken') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="glass-card rounded-2xl overflow-hidden mb-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
                <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm">
                  Lịch sử chuyển nhượng
                </h3>
                {transfers.length > 0 && (
                  <span className="text-xs text-slate-400">{transfers.length} lần</span>
                )}
              </div>
              {transfersLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#00D9FF] animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {[...transfers]
                    .sort((a, b) => new Date(b.transferDate ?? b.date ?? 0).getTime() - new Date(a.transferDate ?? a.date ?? 0).getTime())
                    .map((t, i) => {
                      const tType = t.transferType ?? t.type;
                      const rawDate = t.transferDate ?? t.date;
                      const date = rawDate ? new Date(rawDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
                      const fee = (t.transferFee && t.transferFee !== '') ? t.transferFee : null;
                      const fromTeam = (typeof t.fromTeam === 'string' ? t.fromTeam : null) ?? t.fromTeamName ?? t.fromTeamShortName ?? t.fromTeam?.name ?? (t.fromTeamId ? `Đội #${t.fromTeamId}` : null);
                      const toTeam = (typeof t.toTeam === 'string' ? t.toTeam : null) ?? t.toTeamName ?? t.toTeamShortName ?? t.toTeam?.name ?? (t.toTeamId ? `Đội #${t.toTeamId}` : null);
                      const typeMeta: Record<string, { label: string; cls: string }> = {
                        Transfer: { label: 'Chuyển nhượng', cls: 'bg-blue-500 text-white' },
                        Loan: { label: 'Cho mượn', cls: 'bg-amber-500 text-white' },
                        'Loan return': { label: 'Hết mượn', cls: 'bg-slate-400 text-white' },
                        'Loan Return': { label: 'Hết mượn', cls: 'bg-slate-400 text-white' },
                        Free: { label: 'Tự do', cls: 'bg-emerald-500 text-white' },
                      };
                      const meta = typeMeta[tType] ?? { label: tType ?? '—', cls: 'bg-slate-300 text-slate-700' };
                      return (
                        <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          {/* Timeline dot */}
                          <div className="flex flex-col items-center flex-shrink-0 self-stretch">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00D9FF] mt-1 flex-shrink-0" />
                            {i < transfers.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-white/10 mt-1" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-1">
                            {/* From → To */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-500 dark:text-[#A8A29E] truncate max-w-[140px]">{fromTeam ?? '—'}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#00D9FF] flex-shrink-0" />
                              <span className="text-sm font-semibold text-slate-900 dark:text-foreground truncate max-w-[140px]">{toTeam ?? '—'}</span>
                            </div>
                            {/* Date + fee */}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-400">{date}</span>
                              {fee && fee !== 'Free' && <span className="text-xs text-[#00D9FF] font-semibold">· {fee}</span>}
                              {(fee === 'Free' || tType === 'Free') && <span className="text-xs text-emerald-500 font-medium">· Tự do</span>}
                            </div>
                          </div>

                          {/* Badge */}
                          <span className={cn('px-2.5 py-1 rounded text-[10px] font-bold flex-shrink-0', meta.cls)}>{meta.label}</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>
          )}

          {/* Compare Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Link to={`/compare?player1=${apiPlayer ? apiPlayer.playerId : player?.id}`}>
              <Button className="bg-[#00D9FF] hover:bg-[#00E8FF] text-slate-900 font-label font-semibold px-8 h-12 rounded-xl">
                <Users className="w-4 h-4 mr-2" />
                So sánh với cầu thủ khác
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
