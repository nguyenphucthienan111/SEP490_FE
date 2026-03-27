import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { leagueService, SofascoreStandingRow } from '@/services/leagueService';

interface LeagueConfig {
  name: string;
  tournamentId: number;
  seasonId: number;
  season: string;
}

export const VIETNAM_LEAGUES: LeagueConfig[] = [
  { name: 'V-League 1', tournamentId: 626, seasonId: 78589, season: '25/26' },
  { name: 'V-League 2', tournamentId: 771, seasonId: 80926, season: '25/26' },
];

interface StandingsTableProps {
  league: LeagueConfig;
}

export function StandingsTable({ league }: StandingsTableProps) {
  const [rows, setRows] = React.useState<SofascoreStandingRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    leagueService
      .getHybridStandings(league.tournamentId, league.seasonId)
      .then((rows) => {
        if (rows.length > 0) { setRows(rows); return; }
        return leagueService.getSofascoreStandings(league.tournamentId, league.seasonId).then(setRows);
      })
      .catch(() => setError('Không thể tải bảng xếp hạng'))
      .finally(() => setLoading(false));
  }, [league.tournamentId, league.seasonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#FF4444] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-[#A8A29E]">
        <Trophy className="w-12 h-12 mb-3 opacity-30" />
        <p>{error || 'Chưa có dữ liệu bảng xếp hạng'}</p>
      </div>
    );
  }

  const total = rows.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-slate-300 dark:border-white/10">
            {['POS', 'ĐỘI', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'].map((h) => (
              <th
                key={h}
                className={cn(
                  'py-4 px-3 text-xs text-slate-700 dark:text-[#A8A29E] uppercase tracking-wider font-bold',
                  h === 'ĐỘI' ? 'text-left' : 'text-center'
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isTop = row.position <= 3;
            const isRel = row.position > total - 2;
            const gd = row.scoresFor - row.scoresAgainst;

            return (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.025 }}
                className={cn(
                  'border-b border-slate-200 dark:border-white/5 transition-colors',
                  isTop && 'bg-green-50 dark:bg-green-500/5 hover:bg-green-100 dark:hover:bg-green-500/10',
                  isRel && 'bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10',
                  !isTop && !isRel && 'hover:bg-slate-50 dark:hover:bg-white/5'
                )}
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      'font-mono text-sm font-bold',
                      isTop && 'text-green-600 dark:text-green-400',
                      isRel && 'text-red-600 dark:text-red-400',
                      !isTop && !isRel && 'text-slate-700 dark:text-slate-400'
                    )}>
                      {row.position}
                    </span>
                    {isTop && <TrendingUp className="w-3.5 h-3.5 text-green-500" />}
                    {isRel && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                </td>

                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    {row.team.logo ? (
                      <img
                        src={row.team.logo}
                        alt={row.team.name}
                        className="w-7 h-7 object-contain rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold">
                        {row.team.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-sm text-slate-900 dark:text-foreground">
                      {row.team.name}
                    </span>
                  </div>
                </td>

                {[row.matches, row.wins, row.draws, row.losses, row.scoresFor, row.scoresAgainst].map((val, i) => (
                  <td key={i} className="py-3 px-3 text-center">
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-400">{val}</span>
                  </td>
                ))}

                <td className="py-3 px-3 text-center">
                  <span className={cn(
                    'font-mono text-sm font-semibold',
                    gd > 0 ? 'text-green-600 dark:text-green-400' : gd < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-400'
                  )}>
                    {gd > 0 ? '+' : ''}{gd}
                  </span>
                </td>

                <td className="py-3 px-3 text-center">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-foreground">
                    {row.points}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-500 dark:text-[#A8A29E]">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <span>Thăng hạng / Dự AFC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          <span>Xuống hạng</span>
        </div>
        <span className="ml-auto">P: Trận | W: Thắng | D: Hòa | L: Thua | GF/GA: Bàn thắng/thua | GD: Hiệu số | PTS: Điểm</span>
      </div>
    </div>
  );
}
