import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Users, Calendar, Home, TrendingUp, Leaf } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getStadiumById, matches, teams } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function StadiumDetailPage() {
  const { stadiumId } = useParams<{ stadiumId: string }>();
  const stadium = getStadiumById(stadiumId || '');

  console.log('Stadium ID:', stadiumId);
  console.log('Stadium found:', stadium);

  if (!stadium) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-foreground mb-4">
              Không tìm thấy sân vận động
            </h2>
            <p className="text-slate-600 dark:text-[#A8A29E] mb-6">
              ID: {stadiumId}
            </p>
            <Link to="/stadiums">
              <Button variant="outline" className="border-[#00D9FF] text-[#00D9FF]">
                Xem tất cả sân vận động
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Find teams that use this stadium as home
  const homeTeams = teams.filter(team => team.homeStadium?.id === stadium.id);

  // Find matches played at this stadium
  const stadiumMatches = matches.filter(match => match.stadium?.id === stadium.id);
  const upcomingMatches = stadiumMatches.filter(m => m.status === 'scheduled');
  const recentMatches = stadiumMatches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const surfaceLabel = stadium.surface === 'grass' ? 'Cỏ tự nhiên' : 
                       stadium.surface === 'artificial' ? 'Cỏ nhân tạo' : 'Cỏ lai';

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
            <Link to="/leagues" className="inline-flex items-center gap-2 text-slate-700 dark:text-[#A8A29E] hover:text-slate-900 dark:hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-label text-sm font-medium">Quay lại</span>
            </Link>
          </motion.div>

          {/* Stadium Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl overflow-hidden mb-8"
          >
            {/* Stadium Image */}
            {stadium.imageUrl ? (
              <div className="relative h-64 sm:h-96 overflow-hidden">
                <img 
                  src={stadium.imageUrl} 
                  alt={stadium.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-2">
                    {stadium.name}
                  </h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="w-5 h-5" />
                    <span className="font-body text-lg">{stadium.city}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-gradient-to-br from-[#00D9FF]/10 to-[#FF4444]/10">
                <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-foreground mb-2">
                  {stadium.name}
                </h1>
                <div className="flex items-center gap-2 text-slate-700 dark:text-[#A8A29E]">
                  <MapPin className="w-5 h-5" />
                  <span className="font-body text-lg">{stadium.city}</span>
                </div>
              </div>
            )}

            {/* Stadium Info Grid */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <Users className="w-8 h-8 text-[#00D9FF] mx-auto mb-2" />
                  <p className="font-mono-data text-2xl font-bold text-slate-900 dark:text-foreground mb-1">
                    {stadium.capacity.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                    Sức chứa
                  </p>
                </div>

                <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <Calendar className="w-8 h-8 text-[#00D9FF] mx-auto mb-2" />
                  <p className="font-mono-data text-2xl font-bold text-slate-900 dark:text-foreground mb-1">
                    {stadium.yearBuilt}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                    Năm xây dựng
                  </p>
                </div>

                <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <Leaf className="w-8 h-8 text-[#00D9FF] mx-auto mb-2" />
                  <p className="font-body text-lg font-bold text-slate-900 dark:text-foreground mb-1">
                    {surfaceLabel}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                    Mặt sân
                  </p>
                </div>

                <div className="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <Home className="w-8 h-8 text-[#00D9FF] mx-auto mb-2" />
                  <p className="font-mono-data text-2xl font-bold text-slate-900 dark:text-foreground mb-1">
                    {homeTeams.length}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#A8A29E] font-label uppercase tracking-wider font-semibold">
                    Đội chủ nhà
                  </p>
                </div>
              </div>

              {stadium.address && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-label text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wider font-bold mb-1">
                        Địa chỉ
                      </p>
                      <p className="font-body text-blue-800 dark:text-blue-200">
                        {stadium.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Home Teams */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
          >
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
              Đội chủ nhà
            </h3>
            {homeTeams.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {homeTeams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/10">
                      <span className="font-display font-bold text-2xl text-slate-900 dark:text-foreground">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-foreground">
                        {team.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-[#A8A29E]">{team.league}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Home className="w-8 h-8 text-slate-400 dark:text-[#A8A29E]" />
                </div>
                <p className="text-slate-600 dark:text-[#A8A29E]">
                  Chưa có đội chủ nhà tại sân này
                </p>
              </div>
            )}
          </motion.div>

          {/* Upcoming Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 sm:p-8 mb-8"
          >
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
              Trận đấu sắp tới
            </h3>
            {upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/matches/${match.id}`}
                    className="block p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center min-w-[80px]">
                          <p className="text-xs text-slate-600 dark:text-[#A8A29E] mb-1">
                            {new Date(match.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </p>
                          <p className="font-mono-data text-lg text-[#00D9FF] font-bold">
                            {match.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-right flex-1">
                            <p className="font-body font-semibold text-slate-900 dark:text-foreground">
                              {match.homeTeam.name}
                            </p>
                          </div>
                          <span className="text-slate-400 dark:text-[#A8A29E] font-bold">vs</span>
                          <div className="text-left flex-1">
                            <p className="font-body font-semibold text-slate-900 dark:text-foreground">
                              {match.awayTeam.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-label font-semibold uppercase">
                        {match.league}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-slate-400 dark:text-[#A8A29E]" />
                </div>
                <p className="text-slate-600 dark:text-[#A8A29E]">
                  Chưa có trận đấu sắp tới tại sân này
                </p>
              </div>
            )}
          </motion.div>

          {/* Recent Matches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-2xl p-6 sm:p-8"
          >
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-6">
              Trận đấu gần đây
            </h3>
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/matches/${match.id}`}
                    className="block p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center min-w-[80px]">
                          <p className="text-xs text-slate-600 dark:text-[#A8A29E]">
                            {new Date(match.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-right flex-1">
                            <p className="font-body font-semibold text-slate-900 dark:text-foreground">
                              {match.homeTeam.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">
                              {match.homeScore}
                            </span>
                            <span className="text-slate-400 dark:text-[#A8A29E]">-</span>
                            <span className="font-mono-data text-xl font-bold text-slate-900 dark:text-foreground">
                              {match.awayScore}
                            </span>
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-body font-semibold text-slate-900 dark:text-foreground">
                              {match.awayTeam.name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-[#A8A29E] rounded-full text-xs font-label font-semibold">
                        Kết thúc
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-slate-400 dark:text-[#A8A29E]" />
                </div>
                <p className="text-slate-600 dark:text-[#A8A29E]">
                  Chưa có trận đấu nào diễn ra tại sân này
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
