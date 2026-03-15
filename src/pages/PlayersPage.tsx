import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { leagueService, League, Team, Player as PlayerFromAPI } from '@/services/leagueService';

type PositionFilter = 'all' | 'Forward' | 'Attacker' | 'Midfielder' | 'Defender' | 'Goalkeeper';

const positionFilters: { value: PositionFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả vị trí' },
  { value: 'Forward', label: 'Tiền đạo' },
  { value: 'Midfielder', label: 'Tiền vệ' },
  { value: 'Defender', label: 'Hậu vệ' },
  { value: 'Goalkeeper', label: 'Thủ môn' },
];

function getPositionLabel(pos: string | null | undefined): string {
  if (!pos) return 'Không rõ';
  const map: Record<string, string> = {
    Forward: 'Tiền đạo',
    Attacker: 'Tiền đạo',
    Midfielder: 'Tiền vệ',
    Defender: 'Hậu vệ',
    Goalkeeper: 'Thủ môn',
  };
  return map[pos] || pos;
}

function getPositionColor(pos: string | null | undefined) {
  if (!pos) return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
  if (pos === 'Forward' || pos === 'Attacker')
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
  if (pos === 'Midfielder')
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30';
  if (pos === 'Defender')
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
  if (pos === 'Goalkeeper')
    return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30';
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
}

interface PlayerWithTeam extends PlayerFromAPI {
  teamName?: string;
  teamLogo?: string;
}

function PlayerCard({ player, index }: { player: PlayerWithTeam; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Link to={`/players/${player.playerId}`}>
        <div className="group glass-card rounded-2xl overflow-hidden hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-[#FF4444]/20">
          {/* Header */}
          <div className="relative h-28 bg-gradient-to-br from-slate-200 dark:from-dark-purple to-slate-300 dark:to-midnight-navy p-4">
            <div className="absolute top-4 left-4">
              <span className="font-mono-data text-5xl font-extralight text-foreground/10">
                #{player.number ?? player.playerId}
              </span>
            </div>
            <div className="absolute -bottom-8 right-4 w-16 h-16 rounded-xl overflow-hidden border-2 border-background bg-slate-100 dark:bg-white/5">
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.fullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-7 h-7 text-slate-400" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-5 pt-3">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-display font-bold text-base text-foreground truncate group-hover:text-[#FF4444] transition-colors">
                  {player.fullName}
                </h3>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E] truncate">
                  {player.teamName || ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-label font-semibold uppercase tracking-wider border",
                getPositionColor(player.position)
              )}>
                {getPositionLabel(player.position)}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">
                  {player.statistics?.[0]?.goals ?? 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Bàn thắng</p>
              </div>
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">
                  {player.statistics?.[0]?.assists ?? 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Kiến tạo</p>
              </div>
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">
                  {player.statistics?.[0]?.appearances ?? 0}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Trận</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<PositionFilter>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [apiTeams, setApiTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerWithTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load teams — check dedicated 'teams' cache first
      let teams: Team[] = [];
      const cachedTeams = localStorage.getItem('teams');
      if (cachedTeams) {
        teams = JSON.parse(cachedTeams);
      }

      // If no teams in cache, fetch from API
      if (teams.length === 0) {
        try {
          teams = await leagueService.getTeams();
          if (teams.length > 0) {
            localStorage.setItem('teams', JSON.stringify(teams));
          }
        } catch (e) {}
      }

      setApiTeams(teams);

      // 2. Load players from localStorage
      const cachedPlayers = localStorage.getItem('players');
      let players: PlayerWithTeam[] = [];

      if (cachedPlayers) {
        const raw: PlayerFromAPI[] = JSON.parse(cachedPlayers);
        players = raw.map(p => enrichPlayerWithTeam(p, teams));
      } else {
        // Fetch all players from GET endpoint
        try {
          const fetched = await leagueService.getPlayers();
          players = fetched.map(p => enrichPlayerWithTeam(p, teams));
          if (players.length > 0) {
            localStorage.setItem('players', JSON.stringify(fetched));
          }
        } catch (e) {}
      }

      setAllPlayers(players);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const enrichPlayerWithTeam = (player: PlayerFromAPI, teams: Team[]): PlayerWithTeam => {
    const team = player.teamId ? teams.find(t => t.teamId === player.teamId) : undefined;
    return {
      ...player,
      teamName: team?.teamName,
      teamLogo: team?.logoUrl,
    };
  };

  const filteredPlayers = allPlayers.filter((player) => {
    const matchesSearch =
      player.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.teamName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition =
      selectedPosition === 'all' ||
      player.position === selectedPosition ||
      (selectedPosition === 'Forward' && player.position === 'Attacker');
    const matchesTeam =
      selectedTeamId === 'all' ||
      player.teamId?.toString() === selectedTeamId;
    return matchesSearch && matchesPosition && matchesTeam;
  });

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-3">
              Cầu thủ
            </h1>
            <p className="text-slate-600 dark:text-[#A8A29E] text-lg max-w-2xl">
              Dữ liệu và thống kê cầu thủ các giải đấu bóng đá Việt Nam.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-4 sm:p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-[#A8A29E]" />
                <input
                  type="text"
                  placeholder="Tìm cầu thủ hoặc đội bóng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-foreground placeholder-[#A8A29E] focus:outline-none focus:border-[#00D9FF]/50 transition-colors"
                />
              </div>

              {/* Position Filter */}
              <div className="flex flex-wrap gap-2">
                {positionFilters.map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => setSelectedPosition(pos.value)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-label text-sm font-medium transition-all duration-200",
                      selectedPosition === pos.value
                        ? "bg-[#FF4444] text-white"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10 hover:text-foreground"
                    )}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Filter */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
              <button
                onClick={() => setSelectedTeamId('all')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all duration-200",
                  selectedTeamId === 'all'
                    ? "bg-[#00D9FF]/20 text-[#00D9FF]"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10"
                )}
              >
                Tất cả đội
              </button>
              {apiTeams.map((team) => (
                <button
                  key={team.teamId}
                  onClick={() => setSelectedTeamId(team.teamId.toString())}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all duration-200",
                    selectedTeamId === team.teamId.toString()
                      ? "bg-[#00D9FF]/20 text-[#00D9FF]"
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10"
                  )}
                >
                  {team.logoUrl && (
                    <img src={team.logoUrl} alt={team.teamName} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                  )}
                  {team.teamName}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <p className="text-sm text-slate-600 dark:text-[#A8A29E]">
              Hiển thị <span className="font-mono-data text-foreground">{filteredPlayers.length}</span> cầu thủ
            </p>
          </motion.div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Players Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlayers.map((player, index) => (
                  <PlayerCard key={player.playerId} player={player} index={index} />
                ))}
              </div>

              {/* Empty State */}
              {filteredPlayers.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-slate-600 dark:text-[#A8A29E]" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">
                    Không tìm thấy cầu thủ
                  </h3>
                  <p className="text-slate-600 dark:text-[#A8A29E]">
                    Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
