import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";
import { forumService } from "@/services/forumService";
import { cloudinaryUpload } from "@/utils/cloudinaryUpload";
import { toast } from "sonner";

const LEAGUES = ["V-League 1", "V-League 2", "Vietnam Cup"];

interface Props { onClose: () => void; onCreated: () => void; }

export function CreatePostModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [league, setLeague] = useState(LEAGUES[0]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    for (const file of files) {
      const isVideo = file.type.startsWith("video");
      const isImage = file.type.startsWith("image");

      // Check video limit: only 1 video allowed
      if (isVideo) {
        if (mediaTypes.includes("video")) {
          toast.error("Chỉ được đăng tối đa 1 video."); continue;
        }
        if (file.size > 100 * 1024 * 1024) {
          toast.error("Video tối đa 100MB."); continue;
        }
      }

      // Check image limit: max 5 images
      if (isImage) {
        const currentImages = mediaTypes.filter(t => t === "image").length;
        if (currentImages >= 5) {
          toast.error("Chỉ được đăng tối đa 5 ảnh."); continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Ảnh "${file.name}" vượt quá 5MB.`); continue;
        }
      }

      if (!isVideo && !isImage) { toast.error("Chỉ chấp nhận ảnh hoặc video."); continue; }
    }

    const validFiles = files.filter(file => {
      const isVideo = file.type.startsWith("video");
      const isImage = file.type.startsWith("image");
      if (!isVideo && !isImage) return false;
      if (isVideo && (mediaTypes.includes("video") || file.size > 100 * 1024 * 1024)) return false;
      if (isImage) {
        const currentImages = mediaTypes.filter(t => t === "image").length;
        if (currentImages >= 5 || file.size > 5 * 1024 * 1024) return false;
      }
      return true;
    });

    if (!validFiles.length) return;
    setUploading(true);
    try {
      for (const file of validFiles) {
        const url = await cloudinaryUpload(file, "forum");
        const type = file.type.startsWith("video") ? "video" : "image";
        setMediaUrls(prev => [...prev, url]);
        setMediaTypes(prev => [...prev, type]);
      }
    } catch { toast.error("Upload thất bại"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
    if (!content.trim()) { toast.error("Vui lòng nhập nội dung"); return; }
    setSubmitting(true);
    try {
      await forumService.createPost({ title, content, leagueTag: league, mediaUrls, mediaTypes });
      toast.success("Bài đăng đang chờ kiểm duyệt!");
      onCreated();
    } catch (e: any) { toast.error(e.message || "Lỗi đăng bài"); }
    finally { setSubmitting(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl">Đăng bài thảo luận</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Giải đấu *</label>
            <div className="flex gap-2">
              {LEAGUES.map(l => (
                <button key={l} onClick={() => setLeague(l)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${league === l ? "border-[#FF4444] bg-[#FF4444]/10 text-[#FF4444]" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Tiêu đề *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề bài thảo luận..." maxLength={200} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Nội dung *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Nội dung thảo luận..."
              className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4444]/30"
              maxLength={5000} />
          </div>

          {/* Media upload */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Ảnh / Video (tùy chọn)</label>
            <button onClick={() => !uploading && fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-500 hover:border-[#FF4444]/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Đang upload..." : "Chọn ảnh hoặc video"}
            </button>
            <p className="text-xs text-slate-400 mt-1">Tối đa 5 ảnh (5MB/ảnh) hoặc 1 video (100MB)</p>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileUpload} />
            {mediaUrls.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {mediaUrls.map((url, i) => (
                  <div key={i} className="relative">
                    {mediaTypes[i] === "video"
                      ? <video src={url} className="w-20 h-16 object-cover rounded-lg" />
                      : <img src={url} alt="" className="w-20 h-16 object-cover rounded-lg" />
                    }
                    <button onClick={() => { setMediaUrls(p => p.filter((_, j) => j !== i)); setMediaTypes(p => p.filter((_, j) => j !== i)); }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3">
            ⚠️ Bài đăng sẽ được Admin kiểm duyệt trước khi hiển thị công khai. Chỉ chấp nhận nội dung liên quan đến 3 giải bóng đá Việt Nam.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white">
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Đăng bài
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
