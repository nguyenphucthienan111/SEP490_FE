import { motion } from 'framer-motion';
import { ArrowRight, Clock, User, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { articles } from '@/data/mockData';

export function AnalyticsHub() {
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <section className="py-20 relative bg-gradient-to-b from-transparent via-[#1A0F2E]/20 to-transparent">
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
              Analytics Hub
            </h2>
            <p className="text-[#A8A29E] max-w-md">
              Data-driven insights and in-depth analysis from our team of experts.
            </p>
          </div>
          <Link 
            to="/analytics" 
            className="text-[#00D9FF] hover:text-[#00E8FF] font-label font-semibold text-sm flex items-center gap-2 group"
          >
            View All Articles
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Article */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link to={`/analytics/${featuredArticle.id}`}>
              <div className="group glass-card rounded-2xl overflow-hidden hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 h-full">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={featuredArticle.imageUrl}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-navy via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {featuredArticle.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-[#FF4444]/90 rounded-full text-xs font-label font-semibold text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-3 group-hover:text-[#FF4444] transition-colors line-clamp-2">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-[#A8A29E] text-sm leading-relaxed mb-4 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#A8A29E]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Other Articles */}
          <div className="space-y-6">
            {otherArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/analytics/${article.id}`}>
                  <div className="group glass-card rounded-2xl p-4 hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 flex gap-4">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {article.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-[#00D9FF]/10 rounded-full text-xs font-label text-[#00D9FF]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-display font-bold text-base sm:text-lg text-foreground group-hover:text-[#00D9FF] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#A8A29E] mt-2">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
