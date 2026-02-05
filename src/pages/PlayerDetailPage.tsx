import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Calendar, Clock, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { getPlayerById, players } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Mock performance trend data
const performanceTrend = [
  { match: 'M1', rating: 7.2, date: 'Mar 1' },
  { match: 'M2', rating: 7.8, date: 'Mar 5' },
  { match: 'M3', rating: 8.1, date: 'Mar 10' },
  { match: 'M4', rating: 7.5, date: 'Mar 15' },
  { match: 'M5', rating: 8.7, date: 'Mar 20' },
  { match: 'M6', rating: 8.4, date: 'Mar 25' },
];

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const player = getPlayerById(playerId || '');
  const [expandedContribution, setExpandedContribution] = useState<string | null>(null);

  if (!player) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="font-display font-bold text-2xl text-foreground mb-4">Player Not Found</h2>
            <Link to="/players">
              <Button variant="outline" className="border-[#00D9FF] text-[#00D9FF]">
                Back to Players
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Generate radar data based on player position
  const getRadarData = () => {
    if (player.position === 'forward') {
      return [
        { stat: 'Finishing', value: 85, fullMark: 100 },
        { stat: 'Dribbling', value: 78, fullMark: 100 },
        { stat: 'Speed', value: 82, fullMark: 100 },
        { stat: 'Positioning', value: 80, fullMark: 100 },
        { stat: 'Heading', value: 65, fullMark: 100 },
        { stat: 'Passing', value: 70, fullMark: 100 },
      ];
    } else if (player.position === 'midfielder') {
      return [
        { stat: 'Passing', value: 90, fullMark: 100 },
        { stat: 'Vision', value: 88, fullMark: 100 },
        { stat: 'Dribbling', value: 82, fullMark: 100 },
        { stat: 'Tackling', value: 65, fullMark: 100 },
        { stat: 'Stamina', value: 85, fullMark: 100 },
        { stat: 'Shooting', value: 72, fullMark: 100 },
      ];
    } else if (player.position === 'defender') {
      return [
        { stat: 'Tackling', value: 88, fullMark: 100 },
        { stat: 'Heading', value: 85, fullMark: 100 },
        { stat: 'Positioning', value: 82, fullMark: 100 },
        { stat: 'Strength', value: 80, fullMark: 100 },
        { stat: 'Passing', value: 72, fullMark: 100 },
        { stat: 'Speed', value: 70, fullMark: 100 },
      ];
    } else {
      return [
        { stat: 'Reflexes', value: 88, fullMark: 100 },
        { stat: 'Handling', value: 85, fullMark: 100 },
        { stat: 'Positioning', value: 82, fullMark: 100 },
        { stat: 'Kicking', value: 75, fullMark: 100 },
        { stat: 'Diving', value: 86, fullMark: 100 },
        { stat: 'Communication', value: 78, fullMark: 100 },
      ];
    }
  };

  const contributions = player.matchHistory[0]?.contributions || [
    { category: 'Goals', value: 0.6, positive: true, description: 'Excellent finishing in key moments' },
    { category: 'Key Passes', value: 0.4, positive: true, description: 'Created multiple chances' },
    { category: 'Dribbling', value: 0.3, positive: true, description: 'Beat defenders consistently' },
    { category: 'Defensive Work', value: -0.1, positive: false, description: 'Could track back more' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/players" className="inline-flex items-center gap-2 text-[#A8A29E] hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm">Back to Players</span>
            </Link>
          </motion.div>

          {/* Player Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-6 sm:p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Player Image & Basic Info */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-white/5 flex-shrink-0">
                  <img
                    src={player.photoUrl}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-label font-semibold uppercase tracking-wider border",
                      player.position === 'forward' && 'position-forward',
                      player.position === 'midfielder' && 'position-midfielder',
                      player.position === 'defender' && 'position-defender',
                      player.position === 'goalkeeper' && 'position-goalkeeper'
                    )}>
                      {player.position}
                    </span>
                    <span className="text-[#A8A29E] text-sm">#{player.number}</span>
                  </div>
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-foreground mb-2">
                    {player.name}
                  </h1>
                  <p className="text-lg text-[#A8A29E] mb-4">{player.team}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-[#A8A29E]">
                    <span>{player.nationality}</span>
                    <span>•</span>
                    <span>{player.age} years</span>
                    <span>•</span>
                    <span>{player.height} cm</span>
                    <span>•</span>
                    <span>{player.weight} kg</span>
                  </div>
                </div>
              </div>

              {/* Rating Display */}
              <div className="lg:ml-auto flex items-center gap-8">
                <div className="relative">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="url(#ratingGradient)"
                      strokeWidth="10"
                      strokeDasharray={`${(player.rating / 10) * 283} 283`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF4444" />
                        <stop offset="100%" stopColor="#00D9FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono-data text-4xl font-bold text-foreground">
                      {player.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#A8A29E] uppercase tracking-wider">Rating</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="font-mono-data text-lg text-green-400">+0.3</span>
                  <span className="text-xs text-[#A8A29E]">Last 5 games</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Season Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-label font-bold text-foreground uppercase tracking-wider text-sm mb-6">
                Season Statistics
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Matches', value: player.stats.matches },
                  { label: 'Goals', value: player.stats.goals },
                  { label: 'Assists', value: player.stats.assists },
                  { label: 'Minutes Played', value: player.stats.minutesPlayed },
                  { label: 'Pass Accuracy', value: `${player.stats.passAccuracy}%` },
                  { label: 'Yellow Cards', value: player.stats.yellowCards },
                ].map((stat, index) => (
                  <div key={stat.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-[#A8A29E] text-sm">{stat.label}</span>
                    <span className="font-mono-data text-lg font-semibold text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-label font-bold text-foreground uppercase tracking-wider text-sm mb-6">
                Player Attributes
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis 
                      dataKey="stat" 
                      tick={{ fill: '#A8A29E', fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#A8A29E', fontSize: 10 }}
                    />
                    <Radar
                      name="Attributes"
                      dataKey="value"
                      stroke="#00D9FF"
                      fill="#00D9FF"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Rating Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-label font-bold text-foreground uppercase tracking-wider text-sm mb-6">
                Rating Breakdown
              </h3>
              <p className="text-sm text-[#A8A29E] mb-4">
                Contributions from last match performance
              </p>
              <div className="space-y-3">
                {contributions.map((contrib, index) => (
                  <div key={index}>
                    <button
                      onClick={() => setExpandedContribution(expandedContribution === contrib.category ? null : contrib.category)}
                      className="w-full"
                    >
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          {contrib.positive ? (
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                          )}
                          <span className="text-sm text-foreground">{contrib.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-mono-data text-sm font-semibold",
                            contrib.positive ? "text-green-400" : "text-red-400"
                          )}>
                            {contrib.positive ? '+' : ''}{contrib.value.toFixed(1)}
                          </span>
                          {expandedContribution === contrib.category ? (
                            <ChevronUp className="w-4 h-4 text-[#A8A29E]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#A8A29E]" />
                          )}
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            contrib.positive ? "bg-green-400" : "bg-red-400"
                          )}
                          style={{ width: `${Math.abs(contrib.value) * 100}%` }}
                        />
                      </div>
                    </button>
                    {expandedContribution === contrib.category && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-5 py-2"
                      >
                        <p className="text-xs text-[#A8A29E]">{contrib.description}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Performance Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <h3 className="font-label font-bold text-foreground uppercase tracking-wider text-sm mb-6">
              Performance Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#A8A29E"
                    tick={{ fill: '#A8A29E', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[6, 10]}
                    stroke="#A8A29E"
                    tick={{ fill: '#A8A29E', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#00D9FF', strokeWidth: 2, r: 5 }}
                    activeDot={{ fill: '#FF4444', strokeWidth: 0, r: 8 }}
                  />
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF4444" />
                      <stop offset="100%" stopColor="#00D9FF" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Compare Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Link to={`/compare?player1=${player.id}`}>
              <Button className="bg-[#00D9FF] hover:bg-[#00E8FF] text-foreground font-label font-semibold px-8 h-12 rounded-xl">
                <Users className="w-4 h-4 mr-2" />
                Compare with Another Player
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
