import { MainLayout } from "@/components/layout/MainLayout";
import { HeroSection } from "@/components/home/HeroSection";
import { LeagueGrid } from "@/components/home/LeagueGrid";
import { FeaturedPlayers } from "@/components/home/FeaturedPlayers";
import { MatchCenter } from "@/components/home/MatchCenter";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BarChart2, Users, Trophy, Zap, ArrowRight,
  MessageCircle, ThumbsUp, Eye, Flame, Star, Hash,
  GitCompare, TrendingUp, Target, Award,
} from "lucide-react";

const FEATURES = [
  { icon: BarChart2, title: 'Phân tích chuyên sâu', desc: 'Chỉ số chi tiết cho từng cầu thủ và đội bóng', color: '#FF4444', to: '/analytics' },
  { icon: Users, title: 'So sánh cầu thủ', desc: 'Đặt hai cầu thủ cạnh nhau để so sánh hiệu suất', color: '#00D9FF', to: '/compare' },
  { icon: Trophy, title: 'Dự đoán kết quả', desc: 'Tham gia dự đoán và tích điểm thưởng mỗi ngày', color: '#a78bfa', to: '/predictions' },
  { icon: Zap, title: 'Dữ liệu thời gian thực', desc: 'Cập nhật liên tục từ các nguồn chính thức', color: '#fbbf24', to: '/matches' },
];

// Mock community posts — sau này thay bằng API thật
const COMMUNITY_POSTS = [
  {
    id: 1,
    type: 'hot',
    tag: 'Phân tích',
    title: 'Nguyễn Văn Toàn đang có phong độ tốt nhất sự nghiệp mùa này',
    excerpt: 'Với 7 bàn thắng và 5 kiến tạo sau 12 vòng đấu, tiền đạo HAGL đang chứng minh đẳng cấp...',
    author: 'VNFootball_Fan',
    avatar: null,
    likes: 142,
    comments: 38,
    views: 1240,
    time: '2 giờ trước',
    color: '#FF4444',
  },
  {
    id: 2,
    type: 'trending',
    tag: 'Thảo luận',
    title: 'Hà Nội FC vs Công An Hà Nội — Derby thủ đô vòng 13 ai sẽ thắng?',
    excerpt: 'Trận derby thủ đô đang được cộng đồng mong chờ nhất vòng 13. Cùng dự đoán kết quả...',
    author: 'HanoiDerby2025',
    avatar: null,
    likes: 89,
    comments: 67,
    views: 3100,
    time: '5 giờ trước',
    color: '#00D9FF',
  },
  {
    id: 3,
    type: 'new',
    tag: 'Tin tức',
    title: 'V-League 2025/26 chính thức khởi tranh với nhiều gương mặt mới',
    excerpt: 'Mùa giải mới mang đến nhiều bất ngờ với sự xuất hiện của các ngoại binh chất lượng cao...',
    author: 'VLeague_Official',
    avatar: null,
    likes: 56,
    comments: 21,
    views: 890,
    time: '1 ngày trước',
    color: '#a78bfa',
  },
  {
    id: 4,
    type: 'hot',
    tag: 'Bình luận',
    title: 'Top 5 pha kiến tạo đẹp nhất vòng 12 — Ai xứng đáng nhất?',
    excerpt: 'Vòng 12 để lại nhiều pha bóng đẹp mắt. Hãy bình chọn pha kiến tạo yêu thích của bạn...',
    author: 'GoalHighlights',
    avatar: null,
    likes: 203,
    comments: 94,
    views: 5600,
    time: '3 ngày trước',
    color: '#fbbf24',
  },
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
              <Link to={f.to} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:shadow-md transition-all duration-200 group block">
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
          <Link to="/predictions" className="flex items-center gap-2 text-sm font-semibold text-[#a78bfa] hover:text-foreground transition-colors group">
            Xem tất cả bài viết
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-5">
          {COMMUNITY_POSTS.map((post, i) => (
            <motion.div key={post.id}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
              <div className="group relative rounded-3xl border border-border bg-card hover:bg-muted/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-3xl" style={{ backgroundColor: post.color }} />
                <div className="p-6 pl-7">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${TAG_COLORS[post.tag] ?? 'bg-muted text-muted-foreground border-border'}`}>
                        {post.tag}
                      </span>
                      {post.type === 'hot' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF4444]/15 border border-[#FF4444]/25 text-[10px] font-bold text-[#FF4444]">
                          <Flame className="w-2.5 h-2.5" /> Hot
                        </span>
                      )}
                      {post.type === 'trending' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00D9FF]/15 border border-[#00D9FF]/25 text-[10px] font-bold text-[#00D9FF]">
                          <Hash className="w-2.5 h-2.5" /> Trending
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{post.time}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground group-hover:text-[#a78bfa] transition-colors mb-2 line-clamp-2 leading-snug">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {post.author[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><ThumbsUp className="w-3 h-3" />{post.likes}</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><MessageCircle className="w-3 h-3" />{post.comments}</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Eye className="w-3 h-3" />{post.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-10 p-8 rounded-3xl border border-[#a78bfa]/20 bg-gradient-to-br from-[#a78bfa]/8 to-[#00D9FF]/5 text-center">
          <Star className="w-8 h-8 text-[#a78bfa] mx-auto mb-3" />
          <h3 className="font-display font-bold text-xl text-foreground mb-2">Tham gia cộng đồng ngay</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
            Đăng ký miễn phí để bình luận, dự đoán kết quả và tương tác với hàng nghìn fan bóng đá Việt Nam.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-white font-label font-bold rounded-xl text-sm shadow-lg shadow-purple-500/20">
                Đăng ký miễn phí
              </motion.button>
            </Link>
            <Link to="/predictions">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 border border-border text-muted-foreground hover:text-foreground font-label font-semibold rounded-xl text-sm transition-all">
                Xem dự đoán
              </motion.button>
            </Link>
          </div>
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
      <LeagueGrid />
      <MatchCenter />
      <FeaturedPlayers />
      <CompareSection />
      <CommunitySection />
    </MainLayout>
  );
}
