import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Radio, Filter, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { leagueService, ApiMatch, Team } from '@/services/leagueService';

function getMatchStatus(status: string): 'live' | 'completed' | 'scheduled' {
  const s = status.toLowerCase();
  if (s.includes('live') || s.includes('progress') || s.includes('halftime')) return 'live';
  if (s.includes('finished') || s.includes('completed') || s.includes('ft')) return 'completed';
  return 'scheduled';
}

function MatchCard({ match, teams, index }: { match: ApiMatch; teams: Team[]; index: number }) {
  const status = getMatchStatus(match.status);
  const isLive = status === 'live';
  const isCompleted = status === 'completed';
  const homeTeam = teams.find(t => t.teamId === match.homeTeamId);
  const awayTeam = teams.find(t => t.teamId === match.awayTeamId);
  const homeName = homeTeam?.teamName ?? `Đội ${match.homeTeamId}`;
  const awayName = awayTeam?.teamName ?? `Đội ${match.awayTeamId}`;

  const matchDate = new Date(match.matchDate);
  const dateStr = matchDate.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' });

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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider">
                {match.round}
              </span>
            </div>
            {isLive && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4444]/20 rounded-full">
                <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                <span className="text-xs font-label font-semibold text-[#FF4444] uppercase">Trực tiếp</span>
              </span>
            )}
            {isCompleted && (
              <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-label text-slate-600 dark:text-[#A8A29E]">
                Kết thúc
              </span>
            )}
            {status === 'scheduled' && (
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-[#00D9FF]/10 rounded-full text-xs font-label text-[#00D9FF]">
                Sắp diễn ra
              </span>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between gap-6 mb-6">
            {/* Home */}
            <div className="flex-1">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 overflow-hidden">
                {homeTeam?.logoUrl ? (
                  <img src={homeTeam.logoUrl} alt={homeName} className="w-12 h-12 object-contain" />
                ) : (
                  <span className="font-display font-bold text-xl text-foreground">{homeName.charAt(0)}</span>
                )}
              </div>
              <h4 className="font-body font-semibold text-foreground text-sm">{homeName}</h4>
              <span className="text-xs text-slate-600 dark:text-[#A8A29E]">Chủ nhà</span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              {(isLive || isCompleted) ? (
                <div className="flex items-center gap-4">
                  <span className="font-mono-data text-4xl font-bold text-foreground">{match.homeGoals ?? 0}</span>
                  <span className="text-slate-600 dark:text-[#A8A29E] text-2xl">-</span>
                  <span className="font-mono-data text-4xl font-bold text-foreground">{match.awayGoals ?? 0}</span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-mono-data text-xl text-[#00D9FF] mb-1">{match.kickOffTime}</p>
                  <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Giờ đá</p>
                </div>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 text-right">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 ml-auto overflow-hidden">
                {awayTeam?.logoUrl ? (
                  <img src={awayTeam.logoUrl} alt={awayName} className="w-12 h-12 object-contain" />
                ) : (
                  <span className="font-display font-bold text-xl text-foreground">{awayName.charAt(0)}</span>
                )}
              </div>
              <h4 className="font-body font-semibold text-foreground text-sm">{awayName}</h4>
              <span className="text-xs text-slate-600 dark:text-[#A8A29E]">Khách</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200 dark:border-white/5 text-sm text-slate-600 dark:text-[#A8A29E]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{dateStr}</span>
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
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Load teams
    try {
      const cached = localStorage.getItem('teams');
      if (cached) setTeams(JSON.parse(cached));
    } catch (e) {}

    // Load matches
    try {
      const cached = localStorage.getItem('matches');
      if (cached) {
        setMatches(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch (e) {}

    try {
      const data = await leagueService.getMatches();
      localStorage.setItem('matches', JSON.stringify(data));
      setMatches(data);
    } catch (e) {}
    setLoading(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await leagueService.getMatches();
      localStorage.setItem('matches', JSON.stringify(data));
      setMatches(data);
    } catch (e) {}
    setLoading(false);
  };

  const rounds = ['all', ...Array.from(new Set(matches.map(m => m.round))).sort((a, b) => {
    // "Final" luôn xuống cuối
    if (a === 'Final') return 1;
    if (b === 'Final') return -1;
    // Lấy số trong tên vòng để sort
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  })];

  const filtered = matches.filter(m => {
    const roundOk = selectedRound === 'all' || m.round === selectedRound;
    const statusOk = selectedStatus === 'all' || getMatchStatus(m.status) === selectedStatus;
    return roundOk && statusOk;
  });

  const liveMatches = filtered.filter(m => getMatchStatus(m.status) === 'live');
  const otherMatches = filtered.filter(m => getMatchStatus(m.status) !== 'live');

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
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00D9FF] hover:bg-[#00E8FF] text-slate-900 font-label font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
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
            <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
              {/* Round filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-slate-500 dark:text-[#A8A29E]" />
                <select
                  value={selectedRound}
                  onChange={e => setSelectedRound(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white dark:bg-card border border-slate-200 dark:border-white/10 text-slate-900 dark:text-foreground text-sm"
                >
                  <option value="all">Tất cả vòng</option>
                  {rounds.filter(r => r !== 'all').map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="flex gap-2 sm:ml-auto flex-wrap">
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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400 dark:text-slate-500" />
            </div>
          ) : (
            <>
              {/* Live */}
              {liveMatches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-12"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Radio className="w-5 h-5 text-[#FF4444] animate-pulse" />
                    <h2 className="font-display font-bold text-xl text-foreground">Đang diễn ra</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {liveMatches.map((m, i) => (
                      <MatchCard key={m.matchId} match={m} teams={teams} index={i} />
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
                      <MatchCard key={m.matchId} match={m} teams={teams} index={i} />
                    ))}
                  </div>
                </>
              )}

              {/* Empty */}
              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-8 h-8 text-slate-600 dark:text-[#A8A29E]" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">Không có trận đấu</h3>
                  <p className="text-slate-600 dark:text-[#A8A29E]">Thử thay đổi bộ lọc.</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
