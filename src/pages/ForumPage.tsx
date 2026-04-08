import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Loader2, Lock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { forumService, PostSummary, PostDetail } from "@/services/forumService";
import { authService } from "@/services/authService";
import { useSubscription } from "@/hooks/useSubscription";
import { CreatePostModal } from "@/components/forum/CreatePostModal";
import { toast } from "sonner";

const LEAGUES = ["Tất cả", "V-League 1", "V-League 2", "Vietnam Cup"];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  approved: { label: "Đã duyệt", cls: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  pending:  { label: "Chờ duyệt", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" },
  rejected: { label: "Từ chối", cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  hidden:   { label: "Đã ẩn", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400" },
};

export default function ForumPage() {
  const isLoggedIn = authService.isAuthenticated();
  const { isPremium, forumCredits } = useSubscription();
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [myPosts, setMyPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [league, setLeague] = useState("Tất cả");
  const [tab, setTab] = useState<"public" | "mine">("public");
  const [showCreate, setShowCreate] = useState(false);
  const [detailPost, setDetailPost] = useState<PostDetail | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await forumService.getPosts(league === "Tất cả" ? undefined : league);
      setPosts((res as any).data ?? res);
    } catch { toast.error("Không thể tải diễn đàn"); }
    finally { setLoading(false); }
  };

  const loadMyPosts = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res = await forumService.getMyPosts();
      const data = (res as any).data ?? res;
      setMyPosts(data);
    } catch { toast.error("Không thể tải bài của bạn"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "public") load();
    else loadMyPosts();
  }, [league, tab]);

  const openDetail = async (postId: number) => {
    setDetailLoadingId(postId);
    try {
      const res = await forumService.getPost(postId);
      setDetailPost((res as any).data ?? res);
    } catch { toast.error("Không thể tải chi tiết"); }
    finally { setDetailLoadingId(null); }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
                Diễn đàn bóng đá
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Thảo luận về V-League 1, V-League 2 và Vietnam Cup</p>
            </div>
            {isLoggedIn && (
              <div className="flex flex-col items-end gap-1">
                {isPremium && (
                  <span className="text-xs text-slate-500">Còn <span className="font-bold text-[#00D9FF]">{forumCredits}</span> lượt đăng</span>
                )}
                <Button
                  onClick={() => {
                    if (!isPremium) { toast.error("Cần đăng ký gói để đăng bài"); return; }
                    if (forumCredits <= 0) { toast.error("Bạn đã hết lượt đăng bài"); return; }
                    setShowCreate(true);
                  }}
                  className="bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white gap-2"
                >
                  {isPremium ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  Đăng bài
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        {isLoggedIn && (
          <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700">
            <button onClick={() => setTab("public")} className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === "public" ? "border-[#FF4444] text-[#FF4444]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
              Tất cả bài đăng
            </button>
            <button onClick={() => setTab("mine")} className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${tab === "mine" ? "border-[#FF4444] text-[#FF4444]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
              Bài của tôi
            </button>
          </div>
        )}

        {/* League filter - only for public tab */}
        {tab === "public" && (
        <div className="flex gap-2 flex-wrap mb-6">
          {LEAGUES.map(l => (
            <button key={l} onClick={() => setLeague(l)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${league === l ? "bg-[#FF4444] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              {l}
            </button>
          ))}
        </div>
        )}

        {/* Posts */}
        {loading
          ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#00D9FF]" /></div>
          : tab === "mine"
          ? myPosts.length === 0
            ? <div className="text-center py-16 text-slate-500">Bạn chưa đăng bài nào.</div>
            : <div className="space-y-3">
                {myPosts.map((p, i) => {
                  const badge = STATUS_BADGE[p.status];
                  return (
                    <motion.div key={p.postId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          {p.firstMediaUrl && (
                            p.firstMediaUrl.includes('/video/') || p.firstMediaUrl.match(/\.(mp4|mov|avi|mkv|webm)$/i)
                              ? <video src={p.firstMediaUrl} className="w-16 h-12 object-cover rounded-xl flex-shrink-0" muted />
                              : <img src={p.firstMediaUrl} alt="" referrerPolicy="no-referrer" className="w-16 h-12 object-contain rounded-xl flex-shrink-0 bg-slate-100 dark:bg-slate-800" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {p.leagueTag && <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4444]/10 text-[#FF4444] font-semibold">{p.leagueTag}</span>}
                              {badge && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>{badge.label}</span>}
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{p.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">{new Date(p.createdAt).toLocaleDateString("vi-VN")}</p>
                            {p.status === "rejected" && p.rejectionReason && (
                              <p className="text-xs text-red-500 mt-1">Lý do: {p.rejectionReason}</p>
                            )}
                          </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={() => openDetail(p.postId)} className="gap-1 text-xs h-7">
                            {detailLoadingId === p.postId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}Xem
                          </Button>
                          {p.status === "approved" && (
                            <Link to={`/forum/${p.postId}`} className="text-xs text-[#00D9FF] hover:underline">Trang bài</Link>
                          )}
                        </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
          : posts.length === 0
          ? <div className="text-center py-16 text-slate-500">Chưa có bài đăng nào.</div>
          : <div className="space-y-4">
              {posts.map((p, i) => (
                <motion.div key={p.postId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={`/forum/${p.postId}`}
                    className="block bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-5 hover:shadow-md transition-all">
                    <div className="flex items-start gap-4">
                      {p.firstMediaUrl && (
                        p.firstMediaUrl.includes('/video/') || p.firstMediaUrl.match(/\.(mp4|mov|avi|mkv|webm)$/i)
                          ? <video src={p.firstMediaUrl} className="w-20 h-16 object-contain rounded-xl flex-shrink-0 bg-slate-100 dark:bg-slate-800" muted />
                          : <img src={p.firstMediaUrl} alt="" referrerPolicy="no-referrer" className="w-20 h-16 object-contain rounded-xl flex-shrink-0 bg-slate-100 dark:bg-slate-800" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {p.leagueTag && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4444]/10 text-[#FF4444] font-semibold">{p.leagueTag}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{p.title}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>{p.authorName}</span>
                          <span>·</span>
                          <span>{new Date(p.createdAt).toLocaleDateString("vi-VN")}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.commentCount}</span>
                          {p.viewCount > 0 && <><span>·</span><span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.viewCount}</span></>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
        }
      </div>

      {showCreate && (
        <CreatePostModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      )}

      {/* Detail modal */}
      <Dialog open={!!detailPost} onOpenChange={() => setDetailPost(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{detailPost?.title}</DialogTitle>
          </DialogHeader>
          {detailPost && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                {detailPost.leagueTag && <span className="text-[#FF4444] font-semibold">{detailPost.leagueTag}</span>}
                {(() => { const b = STATUS_BADGE[detailPost.status]; return b ? <span className={`px-2 py-0.5 rounded-full font-semibold ${b.cls}`}>{b.label}</span> : null; })()}
                <span>·</span>
                <span>{new Date(detailPost.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{detailPost.content}</p>
              {detailPost.mediaUrls?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {detailPost.mediaUrls.map((url, i) => (
                    detailPost.mediaTypes?.[i] === "video" || url.includes('/video/')
                      ? <video key={i} src={url} controls className="rounded-xl w-full max-h-64" />
                      : <img key={i} src={url} alt="" className="rounded-xl w-full object-contain max-h-96 bg-slate-50 dark:bg-slate-900 cursor-pointer" onClick={() => window.open(url, '_blank')} />
                  ))}
                </div>
              )}
              {detailPost.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
                  <span className="font-semibold">Lý do từ chối:</span> {detailPost.rejectionReason}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
