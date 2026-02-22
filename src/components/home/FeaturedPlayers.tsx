import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTopRatedPlayers } from '@/data/mockData';

export function FeaturedPlayers() {
  const topPlayers = getTopRatedPlayers(6);

  return (
    <section className="py-20 relative bg-gradient-to-b from-transparent via-muted/30 to-transparent">
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
              Top Rated Players
            </h2>
            <p className="text-muted-foreground max-w-md">
              Highest performing players based on our position-aware rating system.
            </p>
          </div>
          <Link 
            to="/players" 
            className="text-secondary hover:text-secondary/80 font-label font-semibold text-sm flex items-center gap-2 group"
          >
            View All Players
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/players/${player.id}`}>
                <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-primary/20">
                  {/* Player Header */}
                  <div className="relative h-32 bg-gradient-to-br from-muted to-accent p-4">
                    <div className="absolute top-4 left-4">
                      <span className="font-mono-data text-6xl font-extralight text-foreground/20">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-mono-data">+0.2</span>
                    </div>
                    <div className="absolute -bottom-10 right-4 w-20 h-20 rounded-xl overflow-hidden border-4 border-background bg-muted">
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="p-6 pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-display font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                          {player.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{player.team}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-mono-data text-2xl font-bold text-foreground">
                          {player.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">Rating</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-label font-semibold uppercase tracking-wider border
                        ${player.position === 'forward' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        ${player.position === 'midfielder' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${player.position === 'defender' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${player.position === 'goalkeeper' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                      `}>
                        {player.position}
                      </span>
                      <span className="text-xs text-muted-foreground">#{player.number}</span>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="font-mono-data text-lg font-semibold text-foreground">
                          {player.stats.goals}
                        </p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                      </div>
                      <div className="text-center">
                        <p className="font-mono-data text-lg font-semibold text-foreground">
                          {player.stats.assists}
                        </p>
                        <p className="text-xs text-muted-foreground">Assists</p>
                      </div>
                      <div className="text-center">
                        <p className="font-mono-data text-lg font-semibold text-foreground">
                          {player.stats.matches}
                        </p>
                        <p className="text-xs text-muted-foreground">Matches</p>
                      </div>
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
