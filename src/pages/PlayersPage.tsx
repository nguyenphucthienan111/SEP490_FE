import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { PlayerFromAPI, Team, League, leagueService } from '@/services/leagueService';

const positionColors: Record<string, string> = {
  Forward: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
  Attacker: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
  Midfielder: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/20 dark:text-cyan-400 dark:border-cyan-500/30',
  Defender: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
  Goalkeeper: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
};

function getPositionColor(position: string): string {
  for (const key of Object.keys(positionColors)) {
    if (position?.toLowerCase().includes(key.toLowerCase())) return positionColors[key];
  }
  return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-[#A8A29E] dark:border-white/10';
}

function PlayerCard({ player, index }: { player: PlayerFromAPI; index: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Link to={`/players/${player.playerId}`}>
        <div className="group glass-card rounded-2xl overflow-hidden hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-[#FF4444]/20">
          {/* Header */}
          <div className="relative h-28 bg-gradient-to-br from-slate-700 dark:from-dark-purple to-slate-900 dark:to-midnight-navy p-4">
            <div className="absolute top-4 left-4">
              <span className="font-mono-data text-5xl font-extralight text-white/10">
                #{player.number ?? '—'}
              </span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-mono-data">+0.1</span>
            </div>
            <div className="absolute -bottom-8 right-4 w-16 h-16 rounded-xl overflow-hidden border-2 border-background bg-slate-800 flex items-center justify-center">
              {player.photoUrl && !imgError ? (
                <img
                  src={player.photoUrl}
                  alt={player.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-5 pt-3">
            <div className="mb-1">
              <h3 className="font-display font-bold text-base text-foreground truncate group-hover:text-[#FF4444] transition-colors">
                {player.fullName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#A8A29E] truncate">
                {player.team?.teamName ?? ''}
              </p>
            </div>

            <div className="mb-3 mt-2">
              {player.position ? (
                <span className={cn(
                  "inline-flex px-2.5 py-0.5 rounded-full text-xs font-label font-semibold uppercase tracking-wider border",
                  getPositionColor(player.position)
                )}>
                  {player.position}
                </span>
              ) : (
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-label font-semibold uppercase tracking-wider border bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-[#A8A29E] dark:border-white/10">
                  N/A
                </span>
              )}
            </div>

            {/* Stats placeholder - will be filled when stats are loaded */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">—</p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Bàn thắng</p>
              </div>
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">—</p>
                <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Kiến tạo</p>
              </div>
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-[#00D9FF]">—</p>
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
  const [selectedTeamId, setSelectedTeamId] = useState<number | 'all'>('all');
  const [allPlayers, setAllPlayers] = useState<PlayerFromAPI[]>([]);
  const [apiTeams, setApiTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async () => {
    // Always load teams first (from cache or API)
    let teams: Team[] = [];

    const cachedLeagues = localStorage.getItem('leagues');
    if (cachedLeagues) {
      try {
        const leagues: League[] = JSON.parse(cachedLeagues);
        for (const league of leagues) {
          if (league.teams && Array.isArray(league.teams)) teams.push(...league.teams);
        }
      } catch (e) {}
    }

    // If no teams in cache, fetch from API
    if (teams.length === 0) {
      try {
        const leagues = await leagueService.getLeagues();
        for (const league of leagues) {
          try {
            const t = await leagueService.getTeams(league.leagueId);
            teams.push(...t);
          } catch (e) {}
        }
      } catch (e) {}
    }

    if (teams.length > 0) setApiTeams(teams);

    // Load players from cache
    const cachedPlayers = localStorage.getItem('playersFromAPI');
    if (cachedPlayers) {
      try {
        const parsed = JSON.parse(cachedPlayers);
        if (parsed.length > 0) {
          setAllPlayers(parsed);
          return;
        }
      } catch (e) {}
    }

    // Fetch players from API
    if (teams.length > 0) {
      setIsLoading(true);
      try {
        const results = await Promise.all(
          teams.map(team =>
            leagueService.getPlayers(team.teamId).catch(() => [] as PlayerFromAPI[])
          )
        );
        const players = results.flat();
        setAllPlayers(players);
        if (players.length > 0) {
          localStorage.setItem('playersFromAPI', JSON.stringify(players));
        }
      } catch (e) {
        console.error('Failed to load players:', e);
      }
      setIsLoading(false);
    }
  };

  const filteredPlayers = allPlayers.filter((player) => {
    const matchesSearch =
      player.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.team?.teamName ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = selectedTeamId === 'all' || player.teamId === selectedTeamId;
    return matchesSearch && matchesTeam;
  });

  // Unique teamIds that have players
  const teamIdsWithPlayers = [...new Set(allPlayers.map(p => p.teamId))];
  const teamMap = new Map(apiTeams.map(t => [t.teamId, t]));

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-3">Cầu thủ</h1>
                <p className="text-slate-600 dark:text-[#A8A29E] text-lg max-w-2xl">
                  Thống kê và thông tin chi tiết các cầu thủ bóng đá Việt Nam.
                </p>
              </div>
              <button
                onClick={() => { localStorage.removeItem('playersFromAPI'); loadData(); }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D9FF] hover:bg-[#00E8FF] text-slate-900 font-medium text-sm disabled:opacity-50"
              >
                <Search className={cn("w-4 h-4", isLoading && "animate-spin")} />
                {isLoading ? 'Đang tải...' : 'Tải lại dữ liệu'}
              </button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="glass-card rounded-2xl p-4 sm:p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-[#A8A29E]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cầu thủ hoặc đội bóng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-foreground placeholder-[#A8A29E] focus:outline-none focus:border-[#00D9FF]/50 transition-colors"
                />
              </div>
            </div>

            {/* Team filter buttons */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
              <button
                onClick={() => setSelectedTeamId('all')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all",
                  selectedTeamId === 'all' ? "bg-[#FF4444] text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10"
                )}
              >
                Tất cả đội
              </button>
              {apiTeams.map((team) => (
                <button
                  key={team.teamId}
                  onClick={() => setSelectedTeamId(team.teamId)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-label font-medium transition-all flex items-center gap-1.5",
                    selectedTeamId === team.teamId ? "bg-[#FF4444] text-white" : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#A8A29E] hover:bg-slate-200 dark:hover:bg-white/10"
                  )}
                >
                  {team.logoUrl && <img src={team.logoUrl} alt={team.teamName} className="w-4 h-4 object-contain" />}
                  {team.teamName}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Count */}
          <div className="mb-6">
            <p className="text-sm text-slate-600 dark:text-[#A8A29E]">
              Hiển thị <span className="font-mono-data text-foreground">{filteredPlayers.length}</span> cầu thủ
            </p>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPlayers.length > 0 || selectedTeamId === 'all' ? (
            selectedTeamId === 'all' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlayers.map((player, index) => (
                  <PlayerCard key={player.playerId} player={player} index={index} />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlayers.map((player, index) => (
                  <PlayerCard key={player.playerId} player={player} index={index} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-slate-600 dark:text-[#A8A29E]" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                {allPlayers.length === 0 ? 'Chưa có dữ liệu cầu thủ' : 'Không tìm thấy cầu thủ'}
              </h3>
              <p className="text-slate-600 dark:text-[#A8A29E]">
                {allPlayers.length === 0
                  ? 'Vui lòng đồng bộ dữ liệu đội bóng trước.'
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
