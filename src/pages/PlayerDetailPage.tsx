import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, ChevronDown, ChevronUp, Users, Loader2, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getPlayerById } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { PlayerFromAPI, PlayerStats, leagueService } from '@/services/leagueService';
import { toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
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
  const [apiPlayer, setApiPlayer] = useState<PlayerFromAPI | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fromTeamId, setFromTeamId] = useState<string | null>(null);
  const [transfers] = useState<any[]>([]);
  const player = getPlayerById(playerId || '');
  const [expandedContribution, setExpandedContribution] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
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

      const allStats = await leagueService.getPlayerStatsByPlayerId(Number(playerId));
      setPlayerStats(allStats);

      // Fetch seasons to map seasonId → year for display
      if (allStats.length > 0 && allStats[0].leagueId) {
        try {
          const leagueSeasons = await leagueService.getSeasons(allStats[0].leagueId);
          setSeasons(leagueSeasons);
        } catch { /* ignore */ }
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

  // Generate radar data based on player position
  const getRadarData = () => {
    if (!player) {
      // Default radar for API players without position info
      return [
        { stat: 'Ghi bàn', value: 70, fullMark: 100 },
        { stat: 'Kiến tạo', value: 65, fullMark: 100 },
        { stat: 'Chuyền bóng', value: 75, fullMark: 100 },
        { stat: 'Phòng ngự', value: 60, fullMark: 100 },
        { stat: 'Thể lực', value: 80, fullMark: 100 },
        { stat: 'Kỹ thuật', value: 72, fullMark: 100 },
      ];
    }
    
    if (player.position === 'forward') {
      return [
        { stat: 'Finishing', value: 85, fullMark: 100 },
        { stat: 'Dribbling', value: 78, fullMark: 100 },
        { stat: 'Speed', value: 82, fullMark: 100 },
        { stat: 'Positioning', value: 80, fullMark: 100 },
        { stat: 'Heading', value: 65, fullMark: 100 },
        { stat: 'Passing', value: 70, fullMark: 100 },
      ];
    } else if (player.position === 'midfielder') {
      return [
        { stat: 'Passing', value: 90, fullMark: 100 },
        { stat: 'Vision', value: 88, fullMark: 100 },
        { stat: 'Dribbling', value: 82, fullMark: 100 },
        { stat: 'Tackling', value: 65, fullMark: 100 },
        { stat: 'Stamina', value: 85, fullMark: 100 },
        { stat: 'Shooting', value: 72, fullMark: 100 },
      ];
    } else if (player.position === 'defender') {
      return [
        { stat: 'Tackling', value: 88, fullMark: 100 },
        { stat: 'Heading', value: 85, fullMark: 100 },
        { stat: 'Positioning', value: 82, fullMark: 100 },
        { stat: 'Strength', value: 80, fullMark: 100 },
        { stat: 'Passing', value: 72, fullMark: 100 },
        { stat: 'Speed', value: 70, fullMark: 100 },
      ];
    } else {
      return [
        { stat: 'Reflexes', value: 88, fullMark: 100 },
        { stat: 'Handling', value: 85, fullMark: 100 },
        { stat: 'Positioning', value: 82, fullMark: 100 },
        { stat: 'Kicking', value: 75, fullMark: 100 },
        { stat: 'Diving', value: 86, fullMark: 100 },
        { stat: 'Communication', value: 78, fullMark: 100 },
      ];
    }
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
                        {playerPosition}
                      </span>
                      {apiPlayer?.number && (
                        <span className="text-slate-600 dark:text-[#A8A29E] text-sm">#{apiPlayer.number}</span>
                      )}
                    </div>
                  )}
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-foreground mb-2">
                    {playerName}
                  </h1>
                  
                  {/* Club Name - for API players */}
                  {apiPlayer?.team && (
                    <p className="text-lg text-[#00D9FF] font-semibold mb-4">{apiPlayer.team.teamName}</p>
                  )}
                  
                  {/* Club Name - for mock players */}
                  {player && !apiPlayer && (
                    <p className="text-lg text-slate-600 dark:text-[#A8A29E] mb-4">{player.team}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-[#A8A29E]">Quốc tịch: </span>
                      <span className="text-slate-900 dark:text-foreground font-semibold">
                        {playerNationality || 'N/A'}
                      </span>
                    </div>
                    {playerAge && (
                      <div>
                        <span className="text-slate-600 dark:text-[#A8A29E]">Tuổi: </span>
                        <span className="text-slate-900 dark:text-foreground font-semibold">
                          {playerAge}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-600 dark:text-[#A8A29E]">Chiều cao: </span>
                      <span className="text-slate-900 dark:text-foreground font-semibold">
                        {playerHeight ? `${playerHeight} cm` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-[#A8A29E]">Cân nặng: </span>
                      <span className="text-slate-900 dark:text-foreground font-semibold">
                        {playerWeight ? `${playerWeight} kg` : 'N/A'}
                      </span>
                    </div>
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
                <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm mb-4">
                  Thống kê thi đấu
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {playerStats.map((stat, index) => {
                    const season = seasons.find(s => s.seasonId === stat.seasonId);
                    return (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-label font-bold text-lg text-slate-900 dark:text-foreground">
                              Mùa {season?.year || stat.seasonId}
                            </span>
                          </div>
                          {stat.rating && (
                            <span className="font-mono-data text-xl font-bold text-[#00D9FF]">
                              {stat.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                          <div>
                            <span className="text-slate-600 dark:text-[#A8A29E]">Trận đấu</span>
                            <div className="font-mono-data text-lg font-semibold text-slate-900 dark:text-foreground">
                              {stat.appearances}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-[#A8A29E]">Đá chính</span>
                            <div className="font-mono-data text-lg font-semibold text-slate-900 dark:text-foreground">
                              {stat.lineups}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-[#A8A29E]">Phút</span>
                            <div className="font-mono-data text-lg font-semibold text-slate-900 dark:text-foreground">
                              {stat.minutes}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-[#A8A29E]">Bàn thắng</span>
                            <div className="font-mono-data text-lg font-semibold text-slate-900 dark:text-foreground">
                              {stat.goals}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-[#A8A29E]">Kiến tạo</span>
                            <div className="font-mono-data text-lg font-semibold text-slate-900 dark:text-foreground">
                              {stat.assists}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-[#A8A29E]">Thẻ vàng</span>
                            <div className="font-mono-data text-lg font-semibold text-slate-900 dark:text-foreground">
                              {stat.yellowCards}
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-[#A8A29E]">Thẻ đỏ</span>
                            <div className="font-mono-data text-lg font-semibold text-slate-900 dark:text-foreground">
                              {stat.redCards}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
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

          {/* Performance Trend - only show for mock data */}
          {player && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card rounded-2xl p-6 mb-8"
            >
              <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm mb-6">
                Xu hướng phong độ
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#A8A29E"
                      tick={{ fill: '#A8A29E', fontSize: 12 }}
                    />
                    <YAxis 
                      domain={[6, 10]}
                      stroke="#A8A29E"
                      tick={{ fill: '#A8A29E', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="url(#lineGradient)" 
                      strokeWidth={3}
                      dot={{ fill: '#00D9FF', strokeWidth: 2, r: 5 }}
                      activeDot={{ fill: '#FF4444', strokeWidth: 0, r: 8 }}
                    />
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF4444" />
                        <stop offset="100%" stopColor="#00D9FF" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Transfer History */}
          {transfers.length > 0 && (() => {
            let cachedTeams: any[] = [];
            try { cachedTeams = JSON.parse(localStorage.getItem('teams') || '[]'); } catch (e) {}
            const getTeamName = (id: number) => cachedTeams.find((t: any) => t.teamId === id)?.teamName ?? `Đội ${id}`;
            const getTeamLogo = (id: number) => cachedTeams.find((t: any) => t.teamId === id)?.logoUrl ?? null;
            const typeLabel: Record<string, string> = { Free: 'Tự do', Loan: 'Cho mượn', Transfer: 'Chuyển nhượng', 'N/A': 'N/A' };
            const typeColor: Record<string, string> = {
              Free: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
              Loan: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
              Transfer: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
              'N/A': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-[#A8A29E] dark:border-white/10',
            };
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="glass-card rounded-2xl p-6 mb-8"
              >
                <h3 className="font-label font-bold text-slate-900 dark:text-foreground uppercase tracking-wider text-sm mb-4">
                  Lịch sử chuyển nhượng
                </h3>
                <div className="space-y-3">
                  {[...transfers].sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime()).map(t => (
                    <div key={t.transferId} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                      {/* From */}
                      <Link to={`/teams/${t.fromTeamId}`} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {getTeamLogo(t.fromTeamId)
                            ? <img src={getTeamLogo(t.fromTeamId)} alt="" className="w-full h-full object-contain" />
                            : <span className="text-xs font-bold text-foreground">{getTeamName(t.fromTeamId).charAt(0)}</span>
                          }
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-foreground truncate">{getTeamName(t.fromTeamId)}</span>
                      </Link>
                      <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      {/* To */}
                      <Link to={`/teams/${t.toTeamId}`} className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {getTeamLogo(t.toTeamId)
                            ? <img src={getTeamLogo(t.toTeamId)} alt="" className="w-full h-full object-contain" />
                            : <span className="text-xs font-bold text-foreground">{getTeamName(t.toTeamId).charAt(0)}</span>
                          }
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-foreground truncate">{getTeamName(t.toTeamId)}</span>
                      </Link>
                      {/* Date & Type */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-slate-500 dark:text-[#A8A29E]">
                          {new Date(t.transferDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-md text-xs font-semibold border", typeColor[t.transferType] ?? typeColor['N/A'])}>
                          {typeLabel[t.transferType] ?? t.transferType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })()}

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
