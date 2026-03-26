import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { PlayerFromAPI, Team, leagueService } from '@/services/leagueService';

// V-League 1 = leagueId 1, V-League 2 = leagueId 2, Cup = leagueId 3 (adjust if needed)
const LEAGUES = [
  { id: 1, name: 'V-League 1' },
  { id: 2, name: 'V-League 2' },
];

const POSITIONS = [
  { value: 'all', label: 'Tất cả vị trí' },
  { value: 'G', label: 'Thủ môn' },
  { value: 'D', label: 'Hậu vệ' },
  { value: 'M', label: 'Tiền vệ' },
  { value: 'F', label: 'Tiền đạo' },
];

const POS_COLOR: Record<string, string> = {
  G: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  D: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  M: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  F: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};
const POS_LABEL: Record<string, string> = { G: 'TM', D: 'HV', M: 'TV', F: 'TĐ' };

function PlayerCard({ player }: { player: PlayerFromAPI & { teamName?: string } }) {
  const [imgError, setImgError] = useState(false);
  const pos = player.position ?? '';

  return (
    <Link to={`/players/${player.playerId}`}>
      <div className="group glass-card rounded-2xl overflow-hidden hover:translate-y-[-3px] hover:shadow-lg transition-all duration-200 border border-transparent hover:border-[#FF4444]/20">
        <div className="relative h-24 bg-gradient-to-br from-slate-700 to-slate-900 p-4">
          <div className="absolute -bottom-7 right-4 w-14 h-14 rounded-xl overflow-hidden border-2 border-background bg-slate-800 flex items-center justify-center">
            {player.photoUrl && !imgError
              ? <img src={player.photoUrl} alt={player.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setImgError(true)} />
              : <User className="w-7 h-7 text-slate-400" />
            }
          </div>
          {pos && (
            <span className={cn("absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold", POS_COLOR[pos] ?? 'bg-slate-200 text-slate-600')}>
              {POS_LABEL[pos] ?? pos}
            </span>
          )}
        </div>
        <div className="p-4 pt-10">
          <h3 className="font-display font-bold text-sm text-foreground truncate group-hover:text-[#FF4444] transition-colors">{player.fullName}</h3>
          <p className="text-xs text-slate-500 dark:text-[#A8A29E] truncate mt-0.5">{(player as any).teamName ?? ''}</p>
          {player.nationality && <p className="text-xs text-slate-400 mt-0.5">{player.nationality}</p>}
        </div>
      </div>
    </Link>
  );
}

export default function PlayersPage() {
  const [search, setSearch] = useState('');
  const [leagueFilter, setLeagueFilter] = useState<number | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<number | 'all'>('all');
  const [posFilter, setPosFilter] = useState('all');
  const [allPlayers, setAllPlayers] = useState<(PlayerFromAPI & { teamName?: string })[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      // Load teams
      let allTeams: Team[] = [];
      try {
        const cached = localStorage.getItem('teams');
        if (cached && !forceRefresh) {
          allTeams = JSON.parse(cached);
        } else {
          allTeams = await leagueService.getTeams();
          localStorage.setItem('teams', JSON.stringify(allTeams));
        }
      } catch (e) {}
      setTeams(allTeams);

      // Load all players — single request
      let players: PlayerFromAPI[] = [];
      try {
        const cached = localStorage.getItem('all-players');
        if (cached && !forceRefresh) {
          players = JSON.parse(cached);
        } else {
          players = await leagueService.getAllPlayers();
          localStorage.setItem('all-players', JSON.stringify(players));
        }
      } catch (e) {}

      // Attach teamName
      const teamMap = new Map(allTeams.map(t => [t.teamId, t]));
      const enriched = players.map(p => ({
        ...p,
        teamName: teamMap.get(p.teamId ?? 0)?.teamName ?? '',
      }));
      setAllPlayers(enriched);
    } catch (e) {}
    setLoading(false);
  };

  // Teams filtered by selected league
  const teamsInLeague = leagueFilter === 'all'
    ? teams
    : teams.filter(t => t.leagueId === leagueFilter);

  // Reset team filter when league changes
  const handleLeagueChange = (val: number | 'all') => {
    setLeagueFilter(val);
    setTeamFilter('all');
  };

  const filtered = allPlayers.filter(p => {
    const matchSearch = !search || p.fullName.toLowerCase().includes(search.toLowerCase()) || (p as any).teamName?.toLowerCase().includes(search.toLowerCase());
    const matchLeague = leagueFilter === 'all' || teams.find(t => t.teamId === p.teamId)?.leagueId === leagueFilter;
    const matchTeam = teamFilter === 'all' || p.teamId === teamFilter;
    const matchPos = posFilter === 'all' || p.position === posFilter;
    return matchSearch && matchLeague && matchTeam && matchPos;
  });

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-2">Cầu thủ</h1>
            <p className="text-slate-500 dark:text-[#A8A29E]">Thông tin chi tiết các cầu thủ bóng đá Việt Nam</p>
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 mb-6">
            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm cầu thủ..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-foreground placeholder-slate-400 dark:placeholder-[#A8A29E] focus:outline-none focus:border-[#00D9FF]/50 text-sm transition-colors" />
            </div>

            {/* 3 filter dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: 'Giải đấu',
                  value: leagueFilter === 'all' ? 'all' : String(leagueFilter),
                  onChange: (v: string) => handleLeagueChange(v === 'all' ? 'all' : Number(v)),
                  options: [{ value: 'all', label: 'Tất cả giải' }, ...LEAGUES.map(l => ({ value: String(l.id), label: l.name }))],
                },
                {
                  label: 'Đội bóng',
                  value: teamFilter === 'all' ? 'all' : String(teamFilter),
                  onChange: (v: string) => setTeamFilter(v === 'all' ? 'all' : Number(v)),
                  options: [{ value: 'all', label: 'Tất cả đội' }, ...teamsInLeague.map(t => ({ value: String(t.teamId), label: t.teamName }))],
                },
                {
                  label: 'Vị trí',
                  value: posFilter,
                  onChange: (v: string) => setPosFilter(v),
                  options: POSITIONS.map(p => ({ value: p.value, label: p.label })),
                },
              ].map(f => (
                <div key={f.label} className="relative">
                  <label className="absolute -top-2 left-3 px-1 text-xs font-semibold text-slate-500 dark:text-[#A8A29E] bg-white dark:bg-card z-10">
                    {f.label}
                  </label>
                  <select value={f.value} onChange={e => f.onChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-white/15 text-slate-900 dark:text-foreground text-sm focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/30 transition-all appearance-none cursor-pointer">
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Active filters summary */}
            {(leagueFilter !== 'all' || teamFilter !== 'all' || posFilter !== 'all' || search) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex-wrap">
                <span className="text-xs text-slate-400">Đang lọc:</span>
                {leagueFilter !== 'all' && <span className="px-2 py-0.5 rounded-full bg-[#FF4444]/10 text-[#FF4444] text-xs font-medium">{LEAGUES.find(l => l.id === leagueFilter)?.name}</span>}
                {teamFilter !== 'all' && <span className="px-2 py-0.5 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] text-xs font-medium">{teamsInLeague.find(t => t.teamId === teamFilter)?.teamName}</span>}
                {posFilter !== 'all' && <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium">{POSITIONS.find(p => p.value === posFilter)?.label}</span>}
                {search && <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium">"{search}"</span>}
                <button onClick={() => { setLeagueFilter('all'); setTeamFilter('all'); setPosFilter('all'); setSearch(''); }}
                  className="ml-auto text-xs text-slate-400 hover:text-[#FF4444] transition-colors">
                  Xóa tất cả
                </button>
              </div>
            )}
          </motion.div>

          {/* Count */}
          <p className="text-sm text-slate-500 dark:text-[#A8A29E] mb-5">
            Hiển thị <span className="font-mono-data font-semibold text-foreground">{filtered.length}</span> / {allPlayers.length} cầu thủ
          </p>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-[#A8A29E]">
              <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{allPlayers.length === 0 ? 'Chưa có dữ liệu cầu thủ' : 'Không tìm thấy cầu thủ phù hợp'}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((player, i) => (
                <motion.div key={player.playerId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}>
                  <PlayerCard player={player} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
