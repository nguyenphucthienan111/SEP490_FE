import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, BarChart2, MessageSquare, ShoppingBag, Star } from 'lucide-react';
import { PrivacyModal } from '@/components/PrivacyModal';
import { TermsModal } from '@/components/TermsModal';
import { authService } from '@/services/authService';

export function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  const handleShopClick = (e: React.MouseEvent) => {
    if (!authService.isAuthenticated()) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <>
      <footer className="bg-slate-900 dark:bg-[#060D18] border-t border-slate-700/50 dark:border-white/5 mt-auto">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center shadow-md">
                  <span className="font-display font-extrabold text-white text-lg">VN</span>
                </div>
                <div>
                  <h2 className="font-display font-bold text-white">Player Rating</h2>
                  <p className="text-xs text-slate-400">Bóng đá Việt Nam</p>
                </div>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed">
                Nền tảng phân tích cầu thủ và xếp hạng hiệu suất dựa trên dữ liệu cho các giải bóng đá chuyên nghiệp Việt Nam.
              </p>
              <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 w-fit">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-slate-300 font-medium">Powered by Gemini AI</span>
              </div>
            </div>

            {/* Khám phá */}
            <div>
              <h3 className="font-label font-bold text-white uppercase tracking-wider text-xs mb-4">
                Khám phá
              </h3>
              <ul className="space-y-2.5">
                {[
                  { label: 'Cầu thủ', to: '/players', icon: <Users className="w-3.5 h-3.5" />, onClick: undefined },
                  { label: 'Trận đấu', to: '/matches', icon: <Trophy className="w-3.5 h-3.5" />, onClick: undefined },
                  { label: 'Giải đấu', to: '/leagues', icon: <BarChart2 className="w-3.5 h-3.5" />, onClick: undefined },
                  { label: 'Diễn đàn', to: '/forum', icon: <MessageSquare className="w-3.5 h-3.5" />, onClick: undefined },
                  { label: 'Cửa hàng', to: '/shop', icon: <ShoppingBag className="w-3.5 h-3.5" />, onClick: handleShopClick },
                ].map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={item.onClick}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
                    >
                      <span className="text-slate-600 group-hover:text-[#FF4444] transition-colors">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Giải đấu */}
            <div>
              <h3 className="font-label font-bold text-white uppercase tracking-wider text-xs mb-4">
                Giải đấu
              </h3>
              <ul className="space-y-3">
                {[
                  { label: 'V.League 1', desc: 'Giải VĐQG', id: 626 },
                  { label: 'V.League 2', desc: 'Hạng Nhất', id: 771 },
                  { label: 'Cúp Quốc Gia', desc: 'National Cup', id: 3087 },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={`/leagues/${item.id}`}
                      className="group block hover:translate-x-1 transition-transform"
                    >
                      <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors block">{item.label}</span>
                      <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{item.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Thống kê */}
            <div>
              <h3 className="font-label font-bold text-white uppercase tracking-wider text-xs mb-4">
                Thống kê nền tảng
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: '500+', label: 'Cầu thủ', color: 'text-[#FF4444]' },
                  { value: '1,200+', label: 'Trận đấu', color: 'text-[#00D9FF]' },
                  { value: '3', label: 'Giải đấu', color: 'text-amber-400' },
                  { value: 'AI', label: 'Phân tích', color: 'text-emerald-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                    <p className={`font-mono-data text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 dark:border-white/5 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © 2026 VN Player Rating. Bảo lưu mọi quyền.
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Chính sách bảo mật
              </button>
              <button
                onClick={() => setShowTerms(true)}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Điều khoản sử dụng
              </button>
            </div>
          </div>
        </div>
      </footer>

      <PrivacyModal open={showPrivacy} onOpenChange={setShowPrivacy} />
      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
    </>
  );
}
