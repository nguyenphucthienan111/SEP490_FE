import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Video, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/services/api';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'your_cloud_name';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? 'football_videos';
const MAX_SIZE_MB = 100;

interface VideoAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoAnalysisModal({ isOpen, onClose }: VideoAnalysisModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setFile(null);
    setResult('');
    setError('');
    setUploadProgress(0);
    setPrompt('');
  };

  const handleFile = (f: File) => {
    setError('');
    setResult('');
    if (!f.type.startsWith('video/')) {
      setError('Chỉ chấp nhận file video (mp4, mov, avi...)');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File quá lớn. Tối đa ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const uploadToCloudinary = async (f: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', f);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'video');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } else {
          reject(new Error('Upload thất bại'));
        }
      };
      xhr.onerror = () => reject(new Error('Lỗi kết nối khi upload'));
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`);
      xhr.send(formData);
    });
  };

  const analyze = async () => {
    if (!file) return;
    setError('');
    setResult('');
    try {
      setUploading(true);
      const videoUrl = await uploadToCloudinary(file);
      setUploading(false);
      setAnalyzing(true);
      const data = await apiClient.post<{ response: string }>('/api/Chat/analyze-video', {
        VideoUrl: videoUrl,
        Prompt: prompt || undefined,
      });
      setResult(data.response);
    } catch (e: any) {
      setError(e.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white dark:bg-[#0f0f1a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-[#FF4444]/10 to-[#FF6666]/5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-foreground">Phân tích tình huống video</h2>
                <p className="text-xs text-slate-500 dark:text-[#A8A29E]">Powered by Gemini · Tối đa 100MB</p>
              </div>
              <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Drop zone */}
              {!result && (
                <div
                  ref={dropRef}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                    file
                      ? 'border-green-400 bg-green-50 dark:bg-green-500/10'
                      : 'border-slate-300 dark:border-white/20 hover:border-[#FF4444]/50 hover:bg-slate-50 dark:hover:bg-white/5'
                  )}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                      <p className="font-semibold text-sm text-slate-900 dark:text-foreground">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                      <button onClick={e => { e.stopPropagation(); reset(); }} className="text-xs text-red-500 hover:underline mt-1">Xoá</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-slate-400" />
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Kéo thả video vào đây</p>
                      <p className="text-xs text-slate-500">hoặc click để chọn file · MP4, MOV, AVI · Tối đa 100MB</p>
                    </div>
                  )}
                </div>
              )}

              {/* Prompt */}
              {!result && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider mb-1.5 block">
                    Câu hỏi / Yêu cầu phân tích (tuỳ chọn)
                  </label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Ví dụ: Phân tích tình huống phạm lỗi trong video này..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4444]/30 border border-slate-200 dark:border-white/10 resize-none"
                  />
                </div>
              )}

              {/* Upload progress */}
              {uploading && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-600 dark:text-[#A8A29E]">AI đang thực hiện phân tích video...</span>
                    <span className="text-xs font-bold text-[#FF4444]">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF4444] to-[#FF6666] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Analyzing */}
              {analyzing && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-white/5">
                  <Loader2 className="w-5 h-5 text-[#FF4444] animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-foreground">Gemini đang phân tích video...</p>
                    <p className="text-xs text-slate-500">Quá trình này có thể mất 30-60 giây</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF4444]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#A8A29E]">Kết quả phân tích</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-foreground leading-relaxed whitespace-pre-wrap">
                    {result}
                  </div>
                  <button onClick={reset} className="text-xs text-[#FF4444] hover:underline">Phân tích video khác</button>
                </div>
              )}
            </div>

            {/* Footer */}
            {!result && (
              <div className="px-5 py-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-[#A8A29E] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  Huỷ
                </button>
                <button
                  onClick={analyze}
                  disabled={!file || uploading || analyzing}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {(uploading || analyzing) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {uploading ? 'Đang upload...' : analyzing ? 'Đang phân tích...' : 'Phân tích'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
