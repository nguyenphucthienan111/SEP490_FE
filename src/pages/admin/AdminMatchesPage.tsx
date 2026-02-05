import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, BarChart3, Calendar, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { matches } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function AdminMatchesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredMatches = matches.filter((match) => {
    const matchesSearch = 
      match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus;
    return matchesSearch && matchesStatus;
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
              Match Management
            </h1>
            <p className="text-[#A8A29E]">
              Create matches and input performance statistics.
            </p>
          </div>
          <Button className="bg-[#FF4444] hover:bg-[#FF5555] text-white font-label font-semibold px-6 h-11 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Create Match
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
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder-[#A8A29E] focus:outline-none focus:border-[#00D9FF]/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'scheduled', 'live', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-4 py-2.5 rounded-xl font-label text-sm font-medium transition-all duration-200 capitalize",
                  selectedStatus === status
                    ? "bg-[#00D9FF]/20 text-[#00D9FF]"
                    : "bg-white/5 text-[#A8A29E] hover:bg-white/10"
                )}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Matches List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredMatches.map((match, index) => {
            const isLive = match.status === 'live';
            const isCompleted = match.status === 'completed';

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "glass-card rounded-2xl p-6 border border-transparent",
                  isLive && "border-[#FF4444]/30"
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Match Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs text-[#A8A29E] font-label uppercase tracking-wider">
                        {match.league}
                      </span>
                      <span className="text-xs text-[#A8A29E]">•</span>
                      <span className="text-xs text-[#A8A29E]">{match.date}</span>
                      {isLive && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF4444]/20 rounded-full">
                          <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
                          <span className="text-xs font-label font-semibold text-[#FF4444] uppercase">Live</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-1 bg-green-400/20 rounded-full text-xs font-label text-green-400">
                          Completed
                        </span>
                      )}
                      {match.status === 'scheduled' && (
                        <span className="px-2.5 py-1 bg-[#00D9FF]/10 rounded-full text-xs font-label text-[#00D9FF]">
                          Scheduled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Home Team */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <span className="font-display font-bold text-foreground">
                            {match.homeTeam.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{match.homeTeam.name}</span>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-3 px-4">
                        {(isLive || isCompleted) ? (
                          <>
                            <span className="font-mono-data text-2xl font-bold text-foreground">{match.homeScore}</span>
                            <span className="text-[#A8A29E]">-</span>
                            <span className="font-mono-data text-2xl font-bold text-foreground">{match.awayScore}</span>
                          </>
                        ) : (
                          <span className="font-mono-data text-lg text-[#00D9FF]">{match.time}</span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <span className="font-medium text-foreground">{match.awayTeam.name}</span>
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <span className="font-display font-bold text-foreground">
                            {match.awayTeam.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 lg:border-l lg:border-white/10 lg:pl-6">
                    {(isLive || isCompleted) && (
                      <Button 
                        variant="outline" 
                        className="border-[#00D9FF]/50 text-[#00D9FF] hover:bg-[#00D9FF]/10"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {isCompleted ? 'View Stats' : 'Input Stats'}
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="text-[#A8A29E] hover:text-foreground hover:bg-white/5"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Link to={`/matches/${match.id}`}>
                      <Button 
                        variant="ghost" 
                        className="text-[#A8A29E] hover:text-foreground hover:bg-white/5"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredMatches.length === 0 && (
          <div className="glass-card rounded-2xl py-12 text-center">
            <Calendar className="w-12 h-12 text-[#A8A29E] mx-auto mb-4" />
            <p className="text-[#A8A29E]">No matches found matching your criteria.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
