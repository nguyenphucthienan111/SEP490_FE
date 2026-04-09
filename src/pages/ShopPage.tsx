import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Trophy, Loader2, Check, Lock, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cosmeticService, CosmeticItemDto } from "@/services/cosmeticService";
import { predictionService } from "@/services/predictionService";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { CosmeticPreview } from "@/components/cosmetics/CosmeticPreview";

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  all:       { label: "Tất cả",    icon: "🛍️" },
  nameColor: { label: "Màu tên",   icon: "🎨" },
  frame:     { label: "Khung",     icon: "🖼️" },
  badge:     { label: "Huy hiệu",     icon: "🏅" },
  banner:    { label: "Banner",    icon: "🎌" },
  effect:    { label: "Hiệu ứng", icon: "✨" },
  card:      { label: "Card",      icon: "💳" },
};

export default function ShopPage() {
  const isLoggedIn = authService.isAuthenticated();
  const [tab, setTab] = useState<"shop" | "inventory">("shop");
  const [filterCat, setFilterCat] = useState("all");
  const [items, setItems] = useState<CosmeticItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPoints, setMyPoints] = useState(0);
  const [buying, setBuying] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [shopItems, stats] = await Promise.all([
        tab === "shop" ? cosmeticService.getShop() : cosmeticService.getInventory(),
        isLoggedIn ? predictionService.getMyStats() : Promise.resolve(null),
      ]);
      setItems(shopItems);
      if (stats) setMyPoints(stats.points);
    } catch { toast.error("Không thể tải dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const handleBuy = async (item: CosmeticItemDto) => {
    if (!isLoggedIn) { toast.error("Vui lòng đăng nhập"); return; }
    setBuying(item.itemId);
    try {
      await cosmeticService.purchase(item.itemId);
      toast.success(`Mua thành công "${item.name}"!`);
      await load();
    } catch (e: any) { toast.error(e.message || "Mua thất bại"); }
    finally { setBuying(null); }
  };

  const filtered = filterCat === "all" ? items : items.filter(i => i.category === filterCat);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Cửa hàng cosmetics</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl text-slate-900 dark:text-white mb-2">Shop Trang Trí</h1>
          <p className="text-slate-500 dark:text-slate-400">Dùng điểm tích lũy để mua cosmetics độc đáo</p>
          {isLoggedIn && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-[#00D9FF]/10 border border-[#00D9FF]/20">
              <Star className="w-4 h-4 text-[#00D9FF]" />
              <span className="font-bold text-[#00D9FF]">{myPoints} điểm</span>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setTab("shop")} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === "shop" ? "border-[#FF4444] text-[#FF4444]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            <ShoppingBag className="w-4 h-4" /> Cửa hàng
          </button>
          {isLoggedIn && (
            <button onClick={() => setTab("inventory")} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === "inventory" ? "border-[#FF4444] text-[#FF4444]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
              <Package className="w-4 h-4" /> Tủ đồ
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => (
            <button key={key} onClick={() => setFilterCat(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterCat === key ? "bg-[#FF4444] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {loading
          ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#00D9FF]" /></div>
          : filtered.length === 0
          ? <div className="text-center py-16 text-slate-500">{tab === "inventory" ? "Tủ đồ trống. Hãy mua một số items!" : "Không có items."}</div>
          : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map((item, i) => (
                <motion.div key={item.itemId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className={`relative bg-white dark:bg-card border rounded-2xl overflow-hidden transition-all hover:shadow-lg ${item.isOwned ? "border-green-300 dark:border-green-500/40" : "border-slate-200 dark:border-border"}`}>
                  {/* Preview */}
                  <div className="h-28 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 relative">
                    <CosmeticPreview item={item} size="lg" />
                    {item.isOwned && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {item.unlockType === "achievement" && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                        <Trophy className="w-3 h-3 text-amber-500" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                    {item.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{item.description}</p>}

                    <div className="mt-2">
                      {item.unlockType === "achievement"
                        ? <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1"><Trophy className="w-3 h-3" />Achievement</span>
                        : item.isOwned
                        ? <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1"><Check className="w-3 h-3" />Đã sở hữu</span>
                        : tab === "shop"
                        ? <Button size="sm" className="w-full h-7 text-xs bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white"
                            onClick={() => handleBuy(item)} disabled={buying === item.itemId || myPoints < (item.pointCost ?? 0)}>
                            {buying === item.itemId ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Star className="w-3 h-3 mr-1" />{item.pointCost}đ</>}
                          </Button>
                        : null
                      }
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
        }

        {/* Achievement section */}
        {tab === "shop" && (
          <div className="mt-10">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Mở khoá qua các Thành tựu
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: "streak_7", label: "Streak 7 ngày", reward: "Khung đồng 🥉", desc: "Điểm danh 7 ngày liên tiếp" },
                { key: "streak_30", label: "Streak 30 ngày", reward: "Khung lửa đỏ 🔥", desc: "Điểm danh 30 ngày liên tiếp" },
                { key: "streak_100", label: "Streak 100 ngày", reward: "Khung kim cương 💎", desc: "Điểm danh 100 ngày liên tiếp" },
                { key: "correct_10", label: "Tiên tri ⚽", reward: "Huy hiệu Tiên tri", desc: "Dự đoán đúng 10 trận" },
                { key: "exact_10", label: "Bắn tỉa 🎯", reward: "Huy hiệu Bắn tỉa", desc: "Đúng tỉ số 10 lần" },
                { key: "correct_50", label: "Huyền thoại 👑", reward: "Huy hiệu Huyền thoại", desc: "Dự đoán đúng 50 trận" },
              ].map(a => (
                <div key={a.key} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{a.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.desc}</p>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">→ {a.reward}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
