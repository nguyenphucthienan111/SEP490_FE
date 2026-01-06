import { motion } from 'framer-motion';
import { Clock, User, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { articles } from '@/data/mockData';

export default function AnalyticsPage() {
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

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
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-3">
              Analytics Hub
            </h1>
            <p className="text-[#A8A29E] text-lg max-w-2xl">
              Data-driven insights, in-depth analysis, and expert commentary on Vietnamese football.
            </p>
          </motion.div>

          {/* Featured Article */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <Link to={`/analytics/${featuredArticle.id}`}>
              <div className="group glass-card rounded-3xl overflow-hidden hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300">
                <div className="grid lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto overflow-hidden">
                    <img
                      src={featuredArticle.imageUrl}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628] via-transparent to-transparent lg:block hidden" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent lg:hidden" />
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredArticle.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[#FF4444]/20 rounded-full text-xs font-label font-semibold text-[#FF4444]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4 group-hover:text-[#FF4444] transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-[#A8A29E] leading-relaxed mb-6">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-[#A8A29E]">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{featuredArticle.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Articles Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-display font-bold text-xl text-white">
              Latest Analysis
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <Link to={`/analytics/${article.id}`}>
                  <div className="group glass-card rounded-2xl overflow-hidden hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-[#00D9FF]/90 rounded-full text-xs font-label font-semibold text-[#0A1628]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display font-bold text-lg text-white mb-3 group-hover:text-[#00D9FF] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[#A8A29E] leading-relaxed mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[#A8A29E]">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5" />
                          <span>{article.author}</span>
                        </div>
                        <span>{new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 glass-card rounded-3xl p-8 sm:p-12 text-center"
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4">
              Want Deeper Insights?
            </h2>
            <p className="text-[#A8A29E] max-w-xl mx-auto mb-8">
              Explore individual player profiles for comprehensive performance data, historical trends, and detailed rating breakdowns.
            </p>
            <Link to="/players">
              <button className="inline-flex items-center gap-2 bg-[#FF4444] hover:bg-[#FF5555] text-white font-label font-semibold px-8 py-3 rounded-xl glow-red transition-all duration-200 group">
                Explore Player Database
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
