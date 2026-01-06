import { motion } from 'framer-motion';
import { Users, Trophy, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { players, matches, leagues, articles } from '@/data/mockData';

const stats = [
  { 
    label: 'Total Players', 
    value: players.length, 
    change: '+12',
    changeType: 'positive',
    icon: Users,
    href: '/admin/players'
  },
  { 
    label: 'Matches Tracked', 
    value: matches.length, 
    change: '+5',
    changeType: 'positive',
    icon: Calendar,
    href: '/admin/matches'
  },
  { 
    label: 'Active Leagues', 
    value: leagues.length, 
    change: '0',
    changeType: 'neutral',
    icon: Trophy,
    href: '/admin/leagues'
  },
  { 
    label: 'Articles Published', 
    value: articles.length, 
    change: '+2',
    changeType: 'positive',
    icon: BarChart3,
    href: '/admin/content'
  },
];

const recentActivity = [
  { action: 'Match stats updated', target: 'Hà Nội FC vs HAGL', time: '5 mins ago', type: 'match' },
  { action: 'Player rating calculated', target: 'Nguyễn Quang Hải', time: '15 mins ago', type: 'player' },
  { action: 'Article published', target: 'V.League Season Preview', time: '1 hour ago', type: 'content' },
  { action: 'New match created', target: 'Viettel vs Nam Định', time: '2 hours ago', type: 'match' },
  { action: 'Player profile updated', target: 'Đoàn Văn Hậu', time: '3 hours ago', type: 'player' },
];

const quickActions = [
  { label: 'Add New Match', href: '/admin/matches/new', icon: Calendar },
  { label: 'Add New Player', href: '/admin/players/new', icon: Users },
  { label: 'Input Match Stats', href: '/admin/matches', icon: BarChart3 },
  { label: 'Create Article', href: '/admin/content/new', icon: TrendingUp },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display font-extrabold text-3xl text-white mb-2">
            Dashboard
          </h1>
          <p className="text-[#A8A29E]">
            Welcome back! Here's an overview of your platform.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={stat.href}>
                <div className="glass-card rounded-2xl p-6 hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FF4444]/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-[#FF4444]" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-mono-data ${
                      stat.changeType === 'positive' ? 'text-green-400' : 
                      stat.changeType === 'negative' ? 'text-red-400' : 'text-[#A8A29E]'
                    }`}>
                      {stat.changeType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
                      {stat.changeType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <p className="font-mono-data text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[#A8A29E] group-hover:text-white transition-colors">
                    {stat.label}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-display font-bold text-xl text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <div className="glass-card rounded-xl p-4 hover:bg-white/5 transition-colors flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-[#00D9FF]/10 flex items-center justify-center">
                    <action.icon className="w-5 h-5 text-[#00D9FF]" />
                  </div>
                  <span className="font-body font-medium text-white group-hover:text-[#00D9FF] transition-colors">
                    {action.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity & Top Players */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-display font-bold text-xl text-white mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'match' ? 'bg-[#00D9FF]' :
                    activity.type === 'player' ? 'bg-[#FF4444]' :
                    'bg-green-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.action}</p>
                    <p className="text-xs text-[#A8A29E] truncate">{activity.target}</p>
                  </div>
                  <span className="text-xs text-[#A8A29E] whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Rated Players */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-white">
                Top Rated Players
              </h2>
              <Link to="/admin/players" className="text-sm text-[#00D9FF] hover:text-[#00E8FF] font-label">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {players.slice(0, 5).map((player, index) => (
                <div 
                  key={player.id}
                  className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
                >
                  <span className="font-mono-data text-lg font-bold text-[#A8A29E] w-6">
                    {index + 1}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                    <img 
                      src={player.photoUrl} 
                      alt={player.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{player.name}</p>
                    <p className="text-xs text-[#A8A29E]">{player.team}</p>
                  </div>
                  <span className="font-mono-data text-lg font-bold text-[#00D9FF]">
                    {player.rating.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
