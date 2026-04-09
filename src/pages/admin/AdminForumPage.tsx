import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminLayout";
import { Link } from "react-router-dom";
import { forumService, PostSummary, PostDetail, CommentDto } from "@/services/forumService";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, EyeOff, MessageSquare, Eye, Ban, ShieldOff, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const TABS = [
  { key: "pending",  label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "hidden",   label: "Đã ẩn" },
  { key: "rejected", label: "Từ chối" },
  { key: "reports",  label: "Báo cáo 🚩" },
];

export default function AdminForumPage() {
  const [tab, setTab] = useState("pending");
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<{ id: number } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailPost, setDetailPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [banModal, setBanModal] = useState<{ userId: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [dismissModal, setDismissModal] = useState<{ id: number } | null>(null);
  const [dismissReason, setDismissReason] = useState("");
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await forumService.adminGetReports("pending");
      const data = (res as any).data ?? res ?? [];
      setReports(data);
      setPendingReportsCount(Array.isArray(data) ? data.length : 0);
    } catch { toast.error("Không thể tải báo cáo"); }
    finally { setLoading(false); }
  };

  // Load pending reports count on mount for badge
  useEffect(() => {
    forumService.adminGetReports("pending")
      .then(res => {
        const data = (res as any).data ?? res ?? [];
        setPendingReportsCount(Array.isArray(data) ? data.length : 0);
      }).catch(() => {});
  }, []);

  const approveReport = async (id: number) => {
    try {
      await forumService.adminApproveReport(id);
      toast.success("Đã duyệt báo cáo — bình luận đã bị ẩn");
      loadReports();
    } catch (e: any) { toast.error(e.message || "Lỗi"); }
  };
  const dismissReport = async () => {
    if (!dismissModal) return;
    try {
      await forumService.adminDismissReport(dismissModal.id, dismissReason);
      toast.success("Đã từ chối báo cáo");
      setDismissModal(null); setDismissReason("");
      loadReports();
    } catch (e: any) { toast.error(e.message || "Lỗi"); }
  };

  const load = async () => {
    setLoading(true);
    try {
      if (tab === "comments" && selectedPostId) {
        const res = await forumService.getComments(selectedPostId);
        setComments((res as any).data ?? res);
      } else if (tab !== "comments") {
        const res = await forumService.adminGetPosts(tab);
        setPosts((res as any).data ?? res);
      }
    } catch { toast.error("Không thể tải dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "reports") {
      loadReports();
    } else if (tab === "comments" && !selectedPostId) {
      // Load approved posts for comment management
      setLoading(true);
      forumService.adminGetPosts("approved", 1, 50)
        .then(res => setPosts((res as any).data ?? res))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      load();
    }
  }, [tab]);

  const approve = async (id: number) => {
    await forumService.adminApprove(id);
    toast.success("Đã duyệt bài");
    load();
  };

  const reject = async () => {
    if (!rejectModal) return;
    await forumService.adminReject(rejectModal.id, rejectReason);
    toast.success("Đã từ chối bài");
    setRejectModal(null); setRejectReason("");
    load();
  };

  const hide = async (id: number) => {
    await forumService.adminHidePost(id);
    toast.success("Đã ẩn bài");
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Quản lý Diễn đàn</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${tab === t.key ? "border-[#FF4444] text-[#FF4444]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.label}
              {t.key === "reports" && pendingReportsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#FF4444] text-white text-[10px] font-bold leading-none">
                  {pendingReportsCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading
          ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#00D9FF]" /></div>
          : posts.length === 0
          ? <div className="text-center py-12 text-slate-500">Không có bài nào.</div>
          : <div className="space-y-3">
              {posts.map(p => (
                <div key={p.postId} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 flex items-start gap-4">
                  {p.firstMediaUrl && (
                    <div className="w-16 h-12 rounded-lg flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer hover:opacity-80"
                      onClick={() => forumService.getPost(p.postId).then(r => setDetailPost((r as any).data ?? r))}>
                      <img src={p.firstMediaUrl} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer"
                        onError={e => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = 'none';
                          el.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px">🖼️</div>';
                        }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate cursor-pointer hover:text-[#FF4444]"
                      onClick={() => forumService.getPost(p.postId).then(r => setDetailPost((r as any).data ?? r))}>
                      {p.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{p.authorName}</span>
                      {p.leagueTag && <><span>·</span><span className="text-[#FF4444]">{p.leagueTag}</span></>}
                      <span>·</span>
                      <span>{new Date(p.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.commentCount}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => forumService.getPost(p.postId).then(r => setDetailPost((r as any).data ?? r))} className="gap-1">
                      <Eye className="w-3 h-3" />Xem
                    </Button>
                    {tab === "pending" && (
                      <>
                        <Button size="sm" onClick={() => approve(p.postId)} className="bg-green-500 hover:bg-green-600 text-white gap-1">
                          <Check className="w-3 h-3" />Duyệt
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectModal({ id: p.postId })} className="text-red-500 border-red-300 gap-1">
                          <X className="w-3 h-3" />Từ chối
                        </Button>
                      </>
                    )}
                    {tab === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => hide(p.postId)} className="text-slate-500 gap-1">
                        <EyeOff className="w-3 h-3" />Ẩn
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Comments tab content */}
      {tab === "comments" && (
        <div className="p-6">
          {!selectedPostId ? (
            <div>
              <p className="text-sm text-slate-500 mb-4">Chọn bài đăng để xem bình luận:</p>
              {loading
                ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#00D9FF]" /></div>
                : <div className="space-y-2">
                    {posts.map(p => (
                      <button key={p.postId} onClick={() => { setSelectedPostId(p.postId); load(); }}
                        className="w-full text-left bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-3 hover:border-[#FF4444]/50 transition-all">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{p.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{p.authorName} · {p.commentCount} bình luận</p>
                      </button>
                    ))}
                  </div>
              }
            </div>
          ) : (
            <div>
              <button onClick={() => { setSelectedPostId(null); setPosts([]); load(); }}
                className="text-sm text-[#00D9FF] hover:underline mb-4 block">← Quay lại</button>
              {loading
                ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#00D9FF]" /></div>
                : comments.length === 0
                ? <p className="text-slate-500 text-sm text-center py-8">Không có bình luận nào.</p>
                : <div className="space-y-2">
                    {comments.map(c => (
                      <div key={c.commentId} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-3 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{c.authorName}</span>
                            <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{c.content}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={async () => { await forumService.adminHideComment(c.commentId); load(); toast.success("Đã ẩn"); }} className="gap-1 text-xs">
                            <EyeOff className="w-3 h-3" />Ẩn
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setBanModal({ userId: c.userId, name: c.authorName })} className="gap-1 text-xs text-red-500 border-red-300">
                            <Ban className="w-3 h-3" />Cấm
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      <Dialog open={!!detailPost} onOpenChange={() => setDetailPost(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-lg">{detailPost?.title}</DialogTitle></DialogHeader>
          {detailPost && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700 dark:text-slate-300">{detailPost.authorName}</span>
                <span>·</span>
                {detailPost.leagueTag && <span className="text-[#FF4444] font-semibold">{detailPost.leagueTag}</span>}
                <span>·</span>
                <span>{new Date(detailPost.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{detailPost.content}</p>
              {detailPost.mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {detailPost.mediaUrls.map((url, i) => (
                    detailPost.mediaTypes[i] === "video"
                      ? <video key={i} src={url} controls className="rounded-xl w-full max-h-64" />
                      : <img key={i} src={url} alt="" className="rounded-xl w-full object-contain max-h-64 cursor-pointer bg-slate-50 dark:bg-slate-900"
                          onClick={() => window.open(url, '_blank')} />
                  ))}
                </div>
              )}
              {detailPost.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
                  Lý do từ chối: {detailPost.rejectionReason}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Từ chối bài đăng</DialogTitle></DialogHeader>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối..."
            className="w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRejectModal(null)}>Hủy</Button>
            <Button onClick={reject} className="bg-red-500 hover:bg-red-600 text-white">Từ chối</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Reports tab */}
      {tab === "reports" && (
        <div className="p-6">
          {loading
            ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#FF4444]" /></div>
            : reports.length === 0
            ? <p className="text-center text-slate-500 py-8">Không có báo cáo nào đang chờ xử lý.</p>
            : <div className="space-y-3">
                {reports.map((r: any) => (
                  <div key={r.reportId} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-semibold text-[#FF4444]">Báo cáo #{r.reportId}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">Bài: <span className="font-medium text-slate-700 dark:text-slate-300">{r.postTitle}</span></span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{r.totalReports} báo cáo</span>
                          {r.postId && (
                            <Link to={`/forum/${r.postId}`} target="_blank"
                              className="text-xs text-[#00D9FF] hover:underline ml-1">
                              Xem bài →
                            </Link>
                          )}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 mb-2">
                          <p className="text-xs text-slate-400 mb-0.5">Nội dung bình luận:</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{r.commentContent}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span>Người báo cáo: <span className="font-medium">{r.reporterName}</span></span>
                          <span>·</span>
                          <span>Lý do: <span className="font-medium text-orange-600 dark:text-orange-400">{r.reason}</span></span>
                          <span>·</span>
                          <span>{r.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" onClick={() => approveReport(r.reportId)}
                          className="bg-red-500 hover:bg-red-600 text-white gap-1 text-xs">
                          <EyeOff className="w-3 h-3" />Ẩn bình luận
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDismissModal({ id: r.reportId })}
                          className="gap-1 text-xs">
                          <X className="w-3 h-3" />Từ chối
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Ban modal */}
      <Dialog open={!!banModal} onOpenChange={() => setBanModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cấm bình luận: {banModal?.name}</DialogTitle></DialogHeader>
          <textarea value={banReason} onChange={e => setBanReason(e.target.value)}
            placeholder="Lý do cấm..."
            className="w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBanModal(null)}>Hủy</Button>
            <Button onClick={async () => {
              if (!banModal) return;
              await forumService.adminBanComment(banModal.userId, banReason || "Vi phạm quy định");
              toast.success(`Đã cấm bình luận ${banModal.name} 2 ngày`);
              setBanModal(null); setBanReason("");
            }} className="bg-red-500 hover:bg-red-600 text-white">Cấm 2 ngày</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dismiss report modal */}
      <Dialog open={!!dismissModal} onOpenChange={() => { setDismissModal(null); setDismissReason(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Từ chối báo cáo</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Lý do từ chối (tùy chọn, sẽ gửi cho người báo cáo)</p>
          <textarea value={dismissReason} onChange={e => setDismissReason(e.target.value)}
            placeholder="Bình luận không vi phạm quy định..."
            className="w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setDismissModal(null); setDismissReason(""); }}>Hủy</Button>
            <Button onClick={dismissReport} className="bg-slate-600 hover:bg-slate-700 text-white">Xác nhận từ chối</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
