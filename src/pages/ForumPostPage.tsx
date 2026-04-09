import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Send, Loader2, Eye, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { forumService, PostDetail, CommentDto } from "@/services/forumService";
import { authService } from "@/services/authService";
import { UserAvatar, UserDisplayName } from "@/components/cosmetics/UserAvatar";
import { userService } from "@/services/userService";
import { toast } from "sonner";

const REACTIONS = [
  { type: "like",  emoji: "👍", label: "Thích" },
  { type: "love",  emoji: "❤️", label: "Yêu thích" },
  { type: "haha",  emoji: "😂", label: "Haha" },
  { type: "wow",   emoji: "😮", label: "Wow" },
  { type: "angry", emoji: "😡", label: "Phẫn nộ" },
];

function timeAgo(dateStr: string) {
  const d = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return d.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" });
}

function CommentItem({ c, onReply, currentUserId, userIdLoaded, onRefresh, isReply = false }: {
  c: CommentDto;
  onReply: (name: string, id: number) => void;
  currentUserId: string | null;
  userIdLoaded: boolean;
  onRefresh: () => void;
  isReply?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(c.content);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadout = c.authorNameColorPreview || c.authorFramePreview || c.authorBadgePreview
    ? { nameColorPreview: c.authorNameColorPreview, framePreview: c.authorFramePreview, badgePreview: c.authorBadgePreview } as any
    : null;

  const parentLoadout = c.parentAuthorNameColorPreview
    ? { nameColorPreview: c.parentAuthorNameColorPreview } as any
    : null;

  const isOwner = currentUserId === c.userId;

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await forumService.editComment(c.commentId, editContent);
      setEditing(false);
      onRefresh();
      toast.success("Đã cập nhật bình luận");
    } catch { toast.error("Lỗi"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await forumService.deleteComment(c.commentId);
      setConfirmDelete(false);
      onRefresh();
      toast.success("Đã xóa bình luận");
    } catch { toast.error("Lỗi"); }
  };

  // Render content - strip @mention from text and show it separately with styling
  const renderContent = (text: string) => {
    if (!c.parentAuthorName) return <span>{text}</span>;
    // Try to strip any @mention at start of content
    const atPattern = /^@\S+(\s+\S+)*\s*/;
    const stripped = text.replace(/^@[^\s]+(\s+[^\s]+)*\s*/, '').trim();
    return <span>{stripped || text}</span>;
  };

  return (
    <div className={`flex gap-3 ${isReply ? "ml-10" : ""}`}>
      <UserAvatar avatarUrl={c.authorAvatar} username={c.authorName} size={32} loadout={loadout} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {/* Show warned comments to author with warning, show placeholder to others */}
        {userIdLoaded && currentUserId !== null && c.status === "warned" && c.userId !== currentUserId
          ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl px-3 py-2">
          <p className="text-xs text-red-500 dark:text-red-400 italic flex items-center gap-1.5">
            <span>🚫</span> Bình luận đã bị ẩn do vi phạm tiêu chuẩn cộng đồng.
          </p>
        </div>
          )
          : (
        <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-3 py-2 ${c.status === "warned" ? "opacity-60" : ""}`}>
          {c.status === "warned" && (
            <div className="flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <span className="text-xs">⚠️</span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Bình luận vi phạm ngôn từ - chỉ bạn mới thấy</span>
            </div>
          )}
          <UserDisplayName username={c.authorName} loadout={loadout} className="text-sm font-semibold" />
          {c.parentAuthorName && !editing && (
            <p className="text-xs mt-0.5 flex items-center gap-1">
              <span className="text-slate-400">↩</span>
              <UserDisplayName username={`@${c.parentAuthorName}`} loadout={parentLoadout} className="font-semibold" />
            </p>
          )}
          {editing ? (
            <div className="mt-1 space-y-2">
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                className="w-full min-h-[60px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm resize-none focus:outline-none"
                maxLength={1000} />
              <div className="flex gap-2">
                <button onClick={handleEdit} disabled={saving} className="text-xs px-3 py-1 rounded-full bg-[#00D9FF] text-white font-medium">
                  {saving ? "..." : "Lưu"}
                </button>
                <button onClick={() => { setEditing(false); setEditContent(c.content); }} className="text-xs px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{renderContent(c.content)}</p>
          )}
        </div>
        )}
        <div className="flex items-center gap-3 mt-1 px-1">
          <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
          <button onClick={() => onReply(c.authorName, c.commentId)}
            className="text-xs text-slate-500 hover:text-[#00D9FF] flex items-center gap-1 transition-colors">
            <Reply className="w-3 h-3" />Trả lời
          </button>
          {isOwner && !editing && (
            <>
              <button onClick={() => setEditing(true)} className="text-xs text-slate-500 hover:text-[#00D9FF] transition-colors">Chỉnh sửa</button>
              <button onClick={() => setConfirmDelete(true)} className="text-xs text-slate-500 hover:text-red-500 transition-colors">Xóa</button>
            </>
          )}
        </div>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-xs shadow-xl">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">Xóa bình luận?</p>
            <p className="text-sm text-slate-500 mb-4">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">Hủy</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>();
  const isLoggedIn = authService.isAuthenticated();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ name: string; id: number } | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);
  const reactionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showReactionPicker = () => {
    if (reactionTimeout.current) clearTimeout(reactionTimeout.current);
    setShowReactions(true);
  };

  const hideReactionPicker = () => {
    reactionTimeout.current = setTimeout(() => setShowReactions(false), 200);
  };
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userIdLoaded, setUserIdLoaded] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      forumService.getPost(Number(id)),
      forumService.getComments(Number(id)),
      isLoggedIn ? forumService.getReactions(Number(id)) : Promise.resolve(null),
    ]).then(([p, c, r]) => {
      const postData = (p as any).data ?? p;
      const commentData = (c as any).data ?? c;
      setPost(postData);
      setComments(commentData);
      setReactions(postData.reactions ?? {});
      if (r) {
        const rd = (r as any).data ?? r;
        setReactions(rd.counts ?? {});
        setMyReaction(rd.myReaction ?? null);
      }
    }).catch(() => toast.error("Không thể tải bài đăng"))
      .finally(() => setLoading(false));

    if (isLoggedIn) {
      userService.getMe().then(u => { setCurrentUserId(u.userId); setUserIdLoaded(true); }).catch(() => setUserIdLoaded(true));
    } else {
      setUserIdLoaded(true);
    }
  }, [id]);

  const refreshComments = async () => {
    const c = await forumService.getComments(Number(id));
    const data = (c as any).data ?? c;
    if (Array.isArray(data)) setComments(data);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await forumService.addComment(Number(id), comment, replyTo?.id);
      setComment(""); setReplyTo(null);
      await refreshComments();
      toast.success("Đã thêm bình luận!");
    } catch (e: any) { toast.error(e.message || "Lỗi"); }
    finally { setSubmitting(false); }
  };

  const handleReply = (name: string, commentId: number) => {
    setReplyTo({ name, id: commentId });
    setComment(`@${name} `);
    commentRef.current?.focus();
  };

  const handleReaction = async (type: string) => {
    if (!isLoggedIn) { toast.error("Vui lòng đăng nhập"); return; }
    setShowReactions(false);
    try {
      const res = await forumService.toggleReaction(Number(id), type);
      const rd = (res as any).data ?? res;
      setReactions(rd.counts ?? {});
      setMyReaction(rd.myReaction ?? null);
    } catch { toast.error("Lỗi"); }
  };

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  if (loading) return <MainLayout><div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#00D9FF]" /></div></MainLayout>;
  if (!post) return <MainLayout><div className="text-center py-20 text-slate-500">Không tìm thấy bài đăng.</div></MainLayout>;

  const authorLoadout = post.authorNameColorPreview || post.authorFramePreview || post.authorBadgePreview
    ? { nameColorPreview: post.authorNameColorPreview, framePreview: post.authorFramePreview, badgePreview: post.authorBadgePreview, effectPreview: (post as any).authorEffectPreview } as any
    : null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/forum" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Quay lại diễn đàn
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Post */}
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 mb-6">
            {post.leagueTag && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4444]/10 text-[#FF4444] font-semibold mb-3 inline-block">{post.leagueTag}</span>
            )}
            <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-3">{post.title}</h1>

            {/* Author info */}
            <div className="flex items-center gap-3 mb-4">
              <UserAvatar avatarUrl={post.authorAvatar} username={post.authorName} size={36} loadout={authorLoadout} />
              <div>
                <UserDisplayName username={post.authorName} loadout={authorLoadout} className="text-sm font-semibold text-slate-900 dark:text-white" />
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{timeAgo(post.createdAt)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount} lượt xem</span>
                </div>
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>

            {/* Media */}
            {post.mediaUrls.length > 0 && (
              <div className="grid grid-cols-1 gap-3 mb-4">
                {post.mediaUrls.map((url, i) => (
                  post.mediaTypes[i] === "video"
                    ? <video key={i} src={url} controls className="rounded-xl w-full" />
                    : <img key={i} src={url} alt="" className="rounded-xl w-full object-contain max-h-96 bg-slate-50 dark:bg-slate-900 cursor-pointer"
                        onClick={() => window.open(url, '_blank')} />
                ))}
              </div>
            )}

            {/* Reactions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              {/* Reaction summary */}
              {totalReactions > 0 && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  {REACTIONS.filter(r => reactions[r.type] > 0).map(r => (
                    <span key={r.type}>{r.emoji}</span>
                  ))}
                  <span className="ml-1">{totalReactions}</span>
                </div>
              )}

              {/* Reaction button */}
              <div className="relative ml-auto">
                <button
                  onMouseEnter={showReactionPicker}
                  onMouseLeave={hideReactionPicker}
                  onClick={() => isLoggedIn ? handleReaction(myReaction ? myReaction : "like") : toast.error("Vui lòng đăng nhập")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${myReaction ? "border-[#FF4444]/30 bg-[#FF4444]/10 text-[#FF4444]" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}
                >
                  {myReaction ? REACTIONS.find(r => r.type === myReaction)?.emoji : "👍"}
                  {myReaction ? REACTIONS.find(r => r.type === myReaction)?.label : "Thích"}
                </button>

                {/* Reaction picker */}
                {showReactions && (
                  <div
                    className="absolute bottom-full left-0 mb-1 flex gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-2 shadow-xl z-10"
                    onMouseEnter={showReactionPicker}
                    onMouseLeave={hideReactionPicker}
                  >
                    {REACTIONS.map(r => (
                      <button key={r.type} onClick={() => handleReaction(r.type)}
                        title={r.label}
                        className={`text-2xl hover:scale-125 transition-transform ${myReaction === r.type ? "scale-125" : ""}`}>
                        {r.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> {comments.filter(c => c.status !== "warned" || c.userId === currentUserId).length} bình luận
            </h2>

            <div className="space-y-4 mb-6">
              {comments.length === 0
                ? <p className="text-slate-500 text-sm text-center py-4">Chưa có bình luận nào.</p>
                : (() => {
                    const topLevel = comments.filter(c => !c.parentCommentId);
                    const replies = comments.filter(c => c.parentCommentId);
                    // Build a map to find the root top-level ancestor of any comment
                    const commentMap = new Map(comments.map(c => [c.commentId, c]));
                    const getRootId = (commentId: number): number => {
                      const c = commentMap.get(commentId);
                      if (!c || !c.parentCommentId) return commentId;
                      return getRootId(c.parentCommentId);
                    };
                    return topLevel.map(c => (
                      <div key={c.commentId} className="space-y-2">
                        <CommentItem c={c} onReply={handleReply} currentUserId={currentUserId} userIdLoaded={userIdLoaded} onRefresh={refreshComments} />
                        {replies.filter(r => getRootId(r.parentCommentId!) === c.commentId).map(r => (
                          <CommentItem key={r.commentId} c={r} onReply={handleReply} currentUserId={currentUserId} userIdLoaded={userIdLoaded} onRefresh={refreshComments} isReply />
                        ))}
                      </div>
                    ));
                  })()
              }
            </div>

            {isLoggedIn ? (
              <div className="space-y-2">
                {replyTo && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5">
                    <Reply className="w-3 h-3" />
                    <span>Đang trả lời <span className="font-semibold text-[#00D9FF]">@{replyTo.name}</span></span>
                    <button onClick={() => { setReplyTo(null); setComment(""); }} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                )}
                <div className="flex gap-3">
                  <textarea ref={commentRef} value={comment} onChange={e => setComment(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                    placeholder="Viết bình luận... (Enter để gửi)"
                    className="flex-1 min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/30"
                    maxLength={1000} />
                  <Button onClick={handleComment} disabled={submitting || !comment.trim()}
                    className="self-end bg-gradient-to-r from-[#00D9FF] to-[#00B8D4] text-white">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-3">
                <Link to="/login" className="text-[#00D9FF] hover:underline">Đăng nhập</Link> để bình luận
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
