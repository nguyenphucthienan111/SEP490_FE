import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { players, teams } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function AdminPlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');

  const filteredPlayers = players.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="font-display font-extrabold text-3xl text-foreground mb-1">
              Player Management
            </h1>
            <p className="text-[#A8A29E]">
              Add, edit, and manage player profiles.
            </p>
          </div>
          <Button className="bg-[#FF4444] hover:bg-[#FF5555] text-white font-label font-semibold px-6 h-11 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder-[#A8A29E] focus:outline-none focus:border-[#00D9FF]/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'forward', 'midfielder', 'defender', 'goalkeeper'].map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={cn(
                  "px-4 py-2.5 rounded-xl font-label text-sm font-medium transition-all duration-200 capitalize",
                  selectedPosition === pos
                    ? "bg-[#00D9FF]/20 text-[#00D9FF]"
                    : "bg-white/5 text-[#A8A29E] hover:bg-white/10"
                )}
              >
                {pos === 'all' ? 'All' : pos}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Players Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 font-label text-xs text-[#A8A29E] uppercase tracking-wider">Player</th>
                  <th className="text-left py-4 px-6 font-label text-xs text-[#A8A29E] uppercase tracking-wider">Team</th>
                  <th className="text-center py-4 px-6 font-label text-xs text-[#A8A29E] uppercase tracking-wider">Position</th>
                  <th className="text-center py-4 px-6 font-label text-xs text-[#A8A29E] uppercase tracking-wider">Rating</th>
                  <th className="text-center py-4 px-6 font-label text-xs text-[#A8A29E] uppercase tracking-wider">Matches</th>
                  <th className="text-center py-4 px-6 font-label text-xs text-[#A8A29E] uppercase tracking-wider">Goals</th>
                  <th className="text-right py-4 px-6 font-label text-xs text-[#A8A29E] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden">
                          <img 
                            src={player.photoUrl} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{player.name}</p>
                          <p className="text-xs text-[#A8A29E]">#{player.number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-[#A8A29E]">{player.team}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={cn(
                        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-label font-semibold uppercase tracking-wider border",
                        player.position === 'forward' && 'position-forward',
                        player.position === 'midfielder' && 'position-midfielder',
                        player.position === 'defender' && 'position-defender',
                        player.position === 'goalkeeper' && 'position-goalkeeper'
                      )}>
                        {player.position}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-mono-data text-lg font-bold text-[#00D9FF]">
                        {player.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-mono-data text-foreground">{player.stats.matches}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-mono-data text-foreground">{player.stats.goals}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/players/${player.id}`}>
                            <button className="p-2 rounded-lg hover:bg-white/5 text-[#A8A29E] hover:text-foreground transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button className="p-2 rounded-lg hover:bg-white/5 text-[#A8A29E] hover:text-[#00D9FF] transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/5 text-[#A8A29E] hover:text-[#FF4444] transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPlayers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-[#A8A29E]">No players found matching your criteria.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
