import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { LeagueGrid } from "@/components/home/LeagueGrid";
import { FeaturedPlayers } from "@/components/home/FeaturedPlayers";
import { MatchCenter } from "@/components/home/MatchCenter";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BarChart2, Users, Trophy, Zap, ArrowRight,
  MessageCircle, ThumbsUp, Eye, Flame, Star, Hash,
  GitCompare, TrendingUp, Target, Award, Puzzle, Sparkles, Chrome,
} from "lucide-react";
import { forumService, PostSummary } from "@/services/forumService";

const CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/VN%20Football/ggdbpkdphapeckchnakjifbinabfeloa';

const FEATURES = [
  { icon: BarChart2, title: 'Phân tích chuyên sâu', desc: 'Chỉ số chi tiết cho từng cầu thủ và đội bóng', color: '#FF4444', to: '/analytics' },
  { icon: Users, title: 'So sánh cầu thủ', desc: 'Đặt hai cầu thủ cạnh nhau để so sánh hiệu suất', color: '#00D9FF', to: '/compare' },
  { icon: Trophy, title: 'Dự đoán kết quả', desc: 'Tham gia dự đoán và tích điểm thưởng mỗi ngày', color: '#a78bfa', to: '/predictions' },
  { icon: Zap, title: 'Dữ liệu thời gian thực', desc: 'Cập nhật liên tục từ các nguồn chính thức', color: '#fbbf24', to: '/matches' },
];

const TAG_COLORS: Record<string, string> = {
  'Phân tích': 'bg-[#FF4444]/15 text-[#FF4444] border-[#FF4444]/25',
  'Thảo luận': 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/25',
  'Tin tức': 'bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/25',
  'Bình luận': 'bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/25',
};

function FeatureBanner() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#FF4444]/5 via-transparent to-[#00D9FF]/5" />
      <div className="container mx-auto px-4 relative">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="h-full"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
              <Link to={f.to} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:shadow-md transition-all duration-200 group h-full">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExtensionBanner() {
  return (
    <section className="py-12 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden border border-[#00D9FF]/30 bg-gradient-to-r from-[#00D9FF]/8 via-card to-[#FF4444]/8 p-8 md:p-10">
          {/* Background glow */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00D9FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FF4444]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Icon */}
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[#00D9FF]/15 border border-[#00D9FF]/25 flex items-center justify-center">
              <Puzzle className="w-10 h-10 text-[#00D9FF]" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#00D9FF]/15 text-[#00D9FF] border border-[#00D9FF]/25">
                  Browser Extension
                </span>
                <span className="text-xs text-muted-foreground">Miễn phí cài đặt</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Phân tích bài viết bóng đá <span className="text-[#00D9FF]">ngay trên trình duyệt</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl">
                Cài extension VN Football Analytics để phân tích bất kỳ bài viết bóng đá Việt Nam nào bằng AI — ngay khi đang đọc báo, không cần chuyển tab.
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                {[
                  { icon: Sparkles, text: 'Phân tích AI tức thì' },
                  { icon: Users, text: 'Nhận diện cầu thủ & CLB' },
                  { icon: BarChart2, text: 'Link nhanh đến thống kê' },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-1.5 text-xs text-foreground/70 bg-muted px-3 py-1.5 rounded-full border border-border">
                    <f.icon className="w-3.5 h-3.5 text-[#00D9FF]" />
                    {f.text}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 flex flex-col gap-3 items-center">
              <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00D9FF] to-[#0099bb] text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#00D9FF]/20 whitespace-nowrap">
                <Chrome className="w-4 h-4" />
                Cài trên Chrome
              </a>
              <a href="https://microsoftedge.microsoft.com/addons" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#0078d4] to-[#005a9e] text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#0078d4]/20 whitespace-nowrap">
                <span className="text-base leading-none">🌐</span>
                Cài trên Edge
              </a>
              <Link to="/pricing" className="text-xs text-muted-foreground hover:text-[#00D9FF] transition-colors">
                Xem gói Premium →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CompareSection() {
  const COMPARE_FEATURES = [
    { icon: TrendingUp, label: 'Rating mùa giải', desc: 'So sánh chỉ số đánh giá tổng thể' },
    { icon: Target, label: 'Bàn thắng & Kiến tạo', desc: 'Hiệu suất tấn công chi tiết' },
    { icon: Award, label: 'Phong độ gần đây', desc: 'Thống kê 5 trận gần nhất' },
    { icon: BarChart2, label: 'Chỉ số kỹ thuật', desc: 'Chuyền, dribble, phòng thủ...' },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-[500px] h-[500px] bg-[#00D9FF]/5 rounded-full blur-[120px]" />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#00D9FF] to-[#FF4444]" />
              <span className="text-xs font-label font-bold text-[#00D9FF] uppercase tracking-widest">Tính năng</span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground mb-4">
              So sánh<br />
              <span className="bg-gradient-to-r from-[#00D9FF] to-[#FF4444] bg-clip-text text-transparent">cầu thủ</span>
              <br />trực quan
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md leading-relaxed">
              Đặt 2 cầu thủ cạnh nhau, xem ngay ai vượt trội hơn qua từng chỉ số — từ rating, bàn thắng đến kỹ thuật cá nhân.
            </p>
            <Link to="/compare">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 bg-[#00D9FF] hover:bg-[#00c8ee] text-[#0A1628] font-label font-bold rounded-xl shadow-lg shadow-[#00D9FF]/25 transition-colors group">
                <GitCompare className="w-4 h-4" />
                So sánh ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right — feature grid */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 gap-4">
            {COMPARE_FEATURES.map((f, i) => (
              <motion.div key={f.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="p-5 rounded-2xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/20 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-[#00D9FF]" />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">{f.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const [posts, setPosts] = useState<PostSummary[]>([]);

  useEffect(() => {
    forumService.getPosts(undefined, 1, 4)
      .then(res => setPosts((res as any)?.data ?? res ?? []))
      .catch(() => {});
  }, []);

  const fmtTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  const TAG_COLOR_MAP: Record<string, { cls: string; color: string }> = {
    'vleague1':  { cls: 'bg-[#FF4444]/15 text-[#FF4444] border-[#FF4444]/25',   color: '#FF4444' },
    'vleague2':  { cls: 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/25',   color: '#00D9FF' },
    'cup':       { cls: 'bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/25',   color: '#a78bfa' },
    'general':   { cls: 'bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/25',   color: '#fbbf24' },
  };
  const getTagMeta = (tag?: string) => TAG_COLOR_MAP[tag?.toLowerCase() ?? ''] ?? { cls: 'bg-muted text-muted-foreground border-border', color: '#a78bfa' };
  const tagLabel: Record<string, string> = { vleague1: 'V-League 1', vleague2: 'V-League 2', cup: 'Cúp QG', general: 'Chung' };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a78bfa]/5 rounded-full blur-[120px]" />
      </div>
      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#a78bfa] to-[#00D9FF]" />
              <span className="text-xs font-label font-bold text-[#a78bfa] uppercase tracking-widest">Cộng đồng</span>
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-foreground">
              Thảo luận &<br />
              <span className="bg-gradient-to-r from-[#a78bfa] to-[#00D9FF] bg-clip-text text-transparent">Bình luận</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md">Tham gia cộng đồng fan bóng đá Việt Nam — chia sẻ, phân tích và dự đoán cùng nhau.</p>
          </div>
          <Link to="/forum" className="flex items-center gap-2 text-sm font-semibold text-[#a78bfa] hover:text-foreground transition-colors group">
            Xem tất cả bài viết
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-5">
          {posts.slice(0, 4).map((post, i) => {
            const meta = getTagMeta(post.leagueTag);
            return (
            <motion.div key={post.postId}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <Link to={`/forum/${post.postId}`}>
              <div className="group relative rounded-3xl border border-border bg-card hover:bg-muted/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-3xl" style={{ backgroundColor: meta.color }} />
                <div className="p-6 pl-7">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.cls}`}>
                        {tagLabel[post.leagueTag?.toLowerCase() ?? ''] ?? post.leagueTag ?? 'Chung'}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{fmtTime(post.createdAt)}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground group-hover:text-[#a78bfa] transition-colors mb-2 line-clamp-2 leading-snug">{post.title}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {post.authorName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><MessageCircle className="w-3 h-3" />{post.commentCount}</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Eye className="w-3 h-3" />{post.viewCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              </Link>
            </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-10 relative overflow-hidden rounded-3xl border border-[#a78bfa]/20 bg-gradient-to-br from-[#a78bfa]/8 to-[#7c3aed]/5 text-center p-10">
          {/* Background glow blobs */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-[#a78bfa]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#7c3aed]/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a78bfa]/20 border border-[#a78bfa]/30 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
            <span className="text-[11px] font-bold text-[#a78bfa] uppercase tracking-widest">Tính năng nổi bật</span>
          </div>

          <h3 className="font-display font-extrabold text-3xl text-foreground mb-3">
            Dự đoán kết quả — <span className="text-[#a78bfa]">Thắng điểm thưởng</span>
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
            Dự đoán tỉ số trước mỗi trận, tích điểm và leo bảng xếp hạng cộng đồng fan bóng đá Việt Nam.
          </p>

          {/* Mini stats */}
          <div className="flex justify-center gap-8 mb-8">
            {[
              { label: 'Dự đoán mỗi tuần', value: '500+' },
              { label: 'Người tham gia', value: '1.2K' },
              { label: 'Điểm thưởng tối đa', value: '×3' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-foreground font-mono-data">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {isLoggedIn ? (
            <Link to="/predictions">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-3 bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-white font-label font-bold rounded-xl text-sm shadow-lg shadow-purple-500/30 inline-flex items-center gap-2">
                Dự đoán ngay
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          ) : (
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-white font-label font-bold rounded-xl text-sm shadow-lg shadow-purple-500/30 inline-flex items-center gap-2">
                  Đăng ký miễn phí
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/predictions">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 border border-[#a78bfa]/40 text-[#a78bfa] hover:bg-[#a78bfa]/10 font-label font-bold rounded-xl text-sm transition-all">
                  Xem dự đoán
                </motion.button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureBanner />
      <ExtensionBanner />
      <LeagueGrid />
      <MatchCenter />
      <FeaturedPlayers />
      <CompareSection />
      <CommunitySection />
    </MainLayout>
  );
}
