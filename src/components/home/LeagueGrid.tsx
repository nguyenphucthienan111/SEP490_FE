import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { leagues } from '@/data/mockData';

export function LeagueGrid() {
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
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-2">
              Vietnamese Leagues
            </h2>
            <p className="text-[#A8A29E] max-w-md">
              Explore comprehensive player data across all major Vietnamese football competitions.
            </p>
          </div>
          <Link 
            to="/leagues" 
            className="text-[#00D9FF] hover:text-[#00E8FF] font-label font-semibold text-sm flex items-center gap-2 group"
          >
            View All Leagues
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league, index) => (
            <motion.div
              key={league.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/leagues/${league.id}`}>
                <div className="group glass-card rounded-2xl p-6 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-[#00D9FF]/20">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF4444]/20 to-[#00D9FF]/20 flex items-center justify-center">
                      <Trophy className="w-7 h-7 text-[#FF4444]" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] text-xs font-label font-semibold">
                      {league.season}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-[#00D9FF] transition-colors">
                    {league.name}
                  </h3>
                  <p className="text-sm text-[#A8A29E] mb-6">{league.country}</p>

                  <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#A8A29E]" />
                      <span className="font-mono-data text-sm text-foreground">{league.teamCount}</span>
                      <span className="text-xs text-[#A8A29E]">Teams</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#A8A29E]" />
                      <span className="font-mono-data text-sm text-foreground">{league.matchesPlayed}</span>
                      <span className="text-xs text-[#A8A29E]">Matches</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
