import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { leagues, teams, matches } from '@/data/mockData';

export default function LeaguesPage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-3">
              Vietnamese Leagues
            </h1>
            <p className="text-[#A8A29E] text-lg max-w-2xl">
              Comprehensive coverage of all Vietnamese football competitions.
            </p>
          </motion.div>

          {/* Leagues Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {leagues.map((league, index) => (
              <motion.div
                key={league.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/leagues/${league.id}`}>
                  <div className="group glass-card rounded-2xl p-8 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-[#FF4444]/20 h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4444]/20 to-[#00D9FF]/20 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-[#FF4444]" />
                      </div>
                      <span className="px-4 py-1.5 rounded-full bg-[#00D9FF]/10 text-[#00D9FF] text-sm font-label font-semibold">
                        {league.season}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-2xl text-foreground mb-2 group-hover:text-[#FF4444] transition-colors">
                      {league.name}
                    </h3>
                    <p className="text-[#A8A29E] mb-6">{league.country}</p>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-[#A8A29E]" />
                          <span className="font-mono-data text-xl font-bold text-foreground">{league.teamCount}</span>
                        </div>
                        <p className="text-xs text-[#A8A29E]">Teams</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-[#A8A29E]" />
                          <span className="font-mono-data text-xl font-bold text-foreground">{league.matchesPlayed}</span>
                        </div>
                        <p className="text-xs text-[#A8A29E]">Matches</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end text-[#00D9FF] text-sm font-label font-semibold group-hover:translate-x-1 transition-transform">
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Teams Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-2xl text-foreground mb-6">
              V.League 1 Teams
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="glass-card rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                      <span className="font-display font-bold text-lg text-foreground">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <h4 className="font-body font-medium text-sm text-foreground truncate">
                      {team.name}
                    </h4>
                    <p className="text-xs text-[#A8A29E]">{team.league}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
