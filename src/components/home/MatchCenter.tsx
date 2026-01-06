import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Clock, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRecentMatches, getLiveMatches } from '@/data/mockData';
import { Match } from '@/types';
import { cn } from '@/lib/utils';

function MatchCard({ match, featured = false }: { match: Match; featured?: boolean }) {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  return (
    <Link to={`/matches/${match.id}`}>
      <div className={cn(
        "group glass-card rounded-2xl p-5 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent",
        isLive ? "border-[#FF4444]/30 hover:border-[#FF4444]/50" : "hover:border-[#00D9FF]/20",
        featured && "lg:p-6"
      )}>
        {/* Match Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A8A29E] font-label uppercase tracking-wider">
              {match.league}
            </span>
          </div>
          {isLive && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF4444]/20 rounded-full">
              <Radio className="w-3 h-3 text-[#FF4444] animate-pulse" />
              <span className="text-xs font-label font-semibold text-[#FF4444] uppercase">Live</span>
            </span>
          )}
          {isCompleted && (
            <span className="px-2.5 py-1 bg-white/5 rounded-full text-xs font-label text-[#A8A29E]">
              FT
            </span>
          )}
          {match.status === 'scheduled' && (
            <span className="px-2.5 py-1 bg-[#00D9FF]/10 rounded-full text-xs font-label text-[#00D9FF]">
              Upcoming
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Home Team */}
          <div className="flex-1 text-left">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 mx-0">
              <span className="font-display font-bold text-lg text-white">
                {match.homeTeam.name.charAt(0)}
              </span>
            </div>
            <h4 className="font-body font-semibold text-white text-sm truncate">
              {match.homeTeam.name}
            </h4>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            {(isLive || isCompleted) ? (
              <>
                <span className="font-mono-data text-3xl font-bold text-white">
                  {match.homeScore}
                </span>
                <span className="text-[#A8A29E] text-lg">-</span>
                <span className="font-mono-data text-3xl font-bold text-white">
                  {match.awayScore}
                </span>
              </>
            ) : (
              <span className="font-mono-data text-lg text-[#A8A29E]">VS</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-right">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-2 ml-auto">
              <span className="font-display font-bold text-lg text-white">
                {match.awayTeam.name.charAt(0)}
              </span>
            </div>
            <h4 className="font-body font-semibold text-white text-sm truncate">
              {match.awayTeam.name}
            </h4>
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/5 text-xs text-[#A8A29E]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{match.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{match.venue}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MatchCenter() {
  const liveMatches = getLiveMatches();
  const recentMatches = getRecentMatches(4);

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-2">
              Match Center
            </h2>
            <p className="text-[#A8A29E] max-w-md">
              Live scores, recent results, and upcoming fixtures.
            </p>
          </div>
          <Link 
            to="/matches" 
            className="text-[#00D9FF] hover:text-[#00E8FF] font-label font-semibold text-sm flex items-center gap-2 group"
          >
            View All Matches
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Live Matches Section */}
        {liveMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-[#FF4444] animate-pulse" />
              <h3 className="font-label font-bold text-white uppercase tracking-wider text-sm">
                Live Now
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <MatchCard match={match} featured />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent & Upcoming */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MatchCard match={match} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
