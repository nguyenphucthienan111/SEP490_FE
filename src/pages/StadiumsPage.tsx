import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Calendar, Search, Leaf } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { stadiums, teams } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function StadiumsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStadiums = stadiums.filter(stadium =>
    stadium.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stadium.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHomeTeamsCount = (stadiumId: string) => {
    return teams.filter(team => team.homeStadium?.id === stadiumId).length;
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-foreground mb-4">
              Sân vận động
            </h1>
            <p className="text-slate-700 dark:text-[#A8A29E] font-body text-lg">
              Khám phá các sân vận động tại V.League
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-[#A8A29E]" />
              <Input
                type="text"
                placeholder="Tìm kiếm sân vận động..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white dark:bg-white/5 border-slate-300 dark:border-white/10"
              />
            </div>
          </motion.div>

          {/* Stadiums Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStadiums.map((stadium, index) => {
              const homeTeamsCount = getHomeTeamsCount(stadium.id);
              const surfaceLabel = stadium.surface === 'grass' ? 'Cỏ tự nhiên' : 
                                   stadium.surface === 'artificial' ? 'Cỏ nhân tạo' : 'Cỏ lai';

              return (
                <motion.div
                  key={stadium.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    to={`/stadiums/${stadium.id}`}
                    className="block glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Stadium Image */}
                    {stadium.imageUrl ? (
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={stadium.imageUrl} 
                          alt={stadium.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-display font-bold text-xl text-white mb-1">
                            {stadium.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-white/90 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{stadium.city}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-48 bg-gradient-to-br from-[#00D9FF]/20 to-[#FF4444]/20 flex items-center justify-center">
                        <div className="text-center p-4">
                          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-1">
                            {stadium.name}
                          </h3>
                          <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-[#A8A29E] text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{stadium.city}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stadium Info */}
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-mono-data text-lg font-bold text-slate-900 dark:text-foreground">
                              {(stadium.capacity / 1000).toFixed(0)}K
                            </p>
                            <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Sức chứa</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="font-mono-data text-lg font-bold text-slate-900 dark:text-foreground">
                              {stadium.yearBuilt}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-[#A8A29E]">Năm xây</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-slate-700 dark:text-[#A8A29E]">
                              {surfaceLabel}
                            </span>
                          </div>
                          {homeTeamsCount > 0 && (
                            <span className="px-2.5 py-1 bg-[#00D9FF]/10 text-[#00D9FF] rounded-full text-xs font-label font-semibold">
                              {homeTeamsCount} đội chủ nhà
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* No Results */}
          {filteredStadiums.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-slate-400 dark:text-[#A8A29E]" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-foreground mb-2">
                Không tìm thấy sân vận động
              </h3>
              <p className="text-slate-600 dark:text-[#A8A29E]">
                Thử tìm kiếm với từ khóa khác
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
