import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getTopRatedPlayers } from '@/data/mockData';

const stats = [
  { icon: Users, label: 'Players Tracked', value: 500, suffix: '+' },
  { icon: Trophy, label: 'Matches Analyzed', value: 1200, suffix: '+' },
  { icon: TrendingUp, label: 'Data Points', value: 50, suffix: 'K+' },
];

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-mono-data">
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function HeroSection() {
  const topPlayers = getTopRatedPlayers(3);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlayerIndex((prev) => (prev + 1) % topPlayers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [topPlayers.length]);

  const currentPlayer = topPlayers[currentPlayerIndex];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-label text-muted-foreground uppercase tracking-wider">
                Season 2025 Active
              </span>
            </motion.div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-slate-900 dark:text-foreground leading-[1.1] mb-6">
              Data-Driven{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Player Analysis</span>{' '}
              for Vietnamese Football
            </h1>

            <p className="text-lg text-slate-800 dark:text-slate-300 max-w-xl mb-8 leading-relaxed font-medium">
              Nền tảng phân tích và đánh giá cầu thủ bóng đá Việt Nam với hệ thống chấm điểm minh bạch, khách quan.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/players">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-label font-semibold px-8 h-12 rounded-xl shadow-lg transition-all duration-200 hover:scale-[0.98] group">
                  Explore Players
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/matches">
                <Button variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10 font-label font-semibold px-8 h-12 rounded-xl transition-all duration-200">
                  View Matches
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-left"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-300 font-bold">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Featured Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="absolute -top-3 -right-3 px-4 py-2 bg-primary rounded-xl font-label font-bold text-primary-foreground text-sm shadow-lg">
                Featured Player
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPlayer.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={currentPlayer.photoUrl}
                        alt={currentPlayer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground truncate">
                        {currentPlayer.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">{currentPlayer.team}</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-label font-semibold uppercase tracking-wider border
                        ${currentPlayer.position === 'forward' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                        ${currentPlayer.position === 'midfielder' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${currentPlayer.position === 'defender' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${currentPlayer.position === 'goalkeeper' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                      `}>
                        {currentPlayer.position}
                      </span>
                    </div>
                  </div>

                  {/* Rating Display */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          strokeDasharray={`${(currentPlayer.rating / 10) * 283} 283`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--secondary))" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono-data text-4xl sm:text-5xl font-bold text-foreground">
                          {currentPlayer.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Rating</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-xl bg-muted">
                      <p className="font-mono-data text-xl font-bold text-blue-600 dark:text-[#00D9FF]">
                        {currentPlayer.stats.goals}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Goals</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-muted">
                      <p className="font-mono-data text-xl font-bold text-blue-600 dark:text-[#00D9FF]">
                        {currentPlayer.stats.assists}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Assists</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-muted">
                      <p className="font-mono-data text-xl font-bold text-blue-600 dark:text-[#00D9FF]">
                        {currentPlayer.stats.matches}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Matches</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Player Navigation Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {topPlayers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPlayerIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentPlayerIndex 
                        ? 'w-6 bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
