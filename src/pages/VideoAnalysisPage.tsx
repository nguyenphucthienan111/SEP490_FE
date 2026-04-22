import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Video, Loader2, Sparkles, AlertCircle, CheckCircle2, ArrowLeft, Trash2, History, ChevronDown, ChevronUp, Play, Lock, Crown, BarChart2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { cn } from '@/lib/utils';
import { apiClient } from '@/services/api';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useSubscription } from '@/hooks/useSubscription';
import { AIMatchAnalysis } from '@/components/ai/AIMatchAnalysis';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'your_cloud_name';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? 'football_videos';
const MAX_SIZE_MB = 100;

interface HistoryItem {
  id: number;
  videoUrl: string;
  videoFileName: string;
  prompt: string;
  result: string;
  createdAt: string;
}

export default function VideoAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'match'>('video');
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { isPremium, aiCredits, refresh: refreshSub } = useSubscription();
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const getUserId = () => {
    const user = authService.getCurrentUser() as any;
    return user?.userId ?? user?.id ?? null;
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    setHistoryLoading(true);
    apiClient.get<HistoryItem[]>(`/api/Chat/video-history?userId=${userId}`)
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

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

  const uploadToCloudinary = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', f);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'video');
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url);
        else reject(new Error('Upload thất bại'));
      };
      xhr.onerror = () => reject(new Error('Lỗi kết nối khi upload'));
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`);
      xhr.send(formData);
    });

  const analyze = async () => {
    if (!file) return;
    setError('');
    setResult('');
    try {
      setUploading(true);
      const videoUrl = await uploadToCloudinary(file);
      setUploading(false);
      setAnalyzing(true);
      const data = await apiClient.post<{ id: number; response: string }>('/api/Chat/analyze-video', {
        VideoUrl: videoUrl,
        VideoFileName: file.name,
        Prompt: prompt || undefined,
        UserId: getUserId() || undefined,
      });
      setResult(data.response);
      // Refresh subscription credits
      refreshSub();
      // Refresh history
      const userId = getUserId();
      if (userId) {
        const h = await apiClient.get<HistoryItem[]>(`/api/Chat/video-history?userId=${userId}`).catch(() => []);
        setHistory(Array.isArray(h) ? h : []);
      }
    } catch (e: any) {
      setError(e.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const isProcessing = uploading || analyzing;

  return (
    <MainLayout>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-[#A8A29E] hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Quay lại trang chủ</span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-3xl text-foreground">AI Phân tích</h1>
                <p className="text-sm text-slate-500 dark:text-[#A8A29E]">Powered by Gemini · Phân tích video & trận đấu bóng đá</p>
              </div>
            </div>
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
              <button onClick={() => !isProcessing && setActiveTab('video')}
                className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  isProcessing && 'cursor-not-allowed opacity-50',
                  activeTab === 'video' ? 'bg-white dark:bg-white/10 text-[#FF4444] shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-foreground')}>
                <Video className="w-4 h-4" />AI Phân tích Video
              </button>
              <button onClick={() => !isProcessing && setActiveTab('match')}
                className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  isProcessing && 'cursor-not-allowed opacity-50',
                  activeTab === 'match' ? 'bg-white dark:bg-white/10 text-[#FF4444] shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-foreground')}>
                <BarChart2 className="w-4 h-4" />AI Phân tích Trận/Cầu thủ
              </button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
          {activeTab === 'match' ? (
            <motion.div key="match" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <AIMatchAnalysis />
            </motion.div>
          ) : (
            <motion.div key="video" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
          {/* Processing overlay */}
          {isProcessing && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white dark:bg-card rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl mx-4 max-w-sm w-full">
                <Loader2 className="w-10 h-10 text-[#FF4444] animate-spin" />
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-foreground">
                    {uploading ? 'Đang upload video...' : 'Gemini đang phân tích...'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Vui lòng không thao tác trong lúc này</p>
                  {uploading && (
                    <div className="mt-3 w-full">
                      <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF4444] to-[#FF6666] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-xs text-[#FF4444] font-bold mt-1">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-5">
            {['V-League 1', 'V-League 2', 'Vietnam Cup'].map(l => (
              <span key={l} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#A8A29E]">{l}</span>
            ))}
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 px-4 py-3 mb-5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <span className="text-amber-500 text-base flex-shrink-0 mt-0.5">⚠️</span>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Lưu ý: Chỉ upload video thuộc <span className="font-semibold">V-League 1, V-League 2 hoặc Vietnam Cup</span>. Video không liên quan đến 3 giải này sẽ không được AI chấp nhận phân tích, nhưng lượt phân tích vẫn sẽ bị trừ.
            </p>
          </div>
          <div className="space-y-5">            {/* Drop zone */}
            {!result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => !file && fileRef.current?.click()}
                  className={cn(
                    'relative border-2 border-dashed rounded-2xl transition-all',
                    file
                      ? 'border-green-400 bg-green-50 dark:bg-green-500/10 cursor-default'
                      : 'border-slate-300 dark:border-white/20 hover:border-[#FF4444]/60 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer'
                  )}
                >
                  <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

                  {file ? (
                    <div className="flex items-center gap-4 p-5">
                      <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB · {file.type}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); reset(); }}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-14">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Kéo thả video vào đây</p>
                        <p className="text-sm text-slate-500 mt-1">hoặc <span className="text-[#FF4444] font-semibold">click để chọn file</span></p>
                        <p className="text-xs text-slate-400 mt-2">MP4, MOV, AVI, MKV · Tối đa 100MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Prompt */}
            {!result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-5">
                <label className="text-xs font-bold text-slate-600 dark:text-[#A8A29E] uppercase tracking-wider mb-2 block">
                  Câu hỏi / Yêu cầu phân tích <span className="text-slate-400 font-normal normal-case">(tuỳ chọn)</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Ví dụ: Phân tích tình huống phạm lỗi trong video này, ai có lỗi và quyết định của trọng tài có đúng không?"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4444]/30 border border-slate-200 dark:border-white/10 resize-none"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Phân tích chiến thuật', 'Đánh giá kỹ thuật cầu thủ', 'Nhận xét tình huống phạm lỗi', 'Phân tích bàn thắng'].map(s => (
                    <button key={s} onClick={() => setPrompt(s)} className="px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#A8A29E] hover:bg-[#FF4444]/10 hover:text-[#FF4444] transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Upload progress */}
            {uploading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI đang thực hiện phân tích video...</span>
                  <span className="text-sm font-bold text-[#FF4444]">{uploadProgress}%</span>
                </div>
                <div className="h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FF4444] to-[#FF6666] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </motion.div>
            )}

            {/* Analyzing */}
            {analyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF4444]/10 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-6 h-6 text-[#FF4444] animate-spin" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-foreground">Gemini đang phân tích video...</p>
                  <p className="text-sm text-slate-500 mt-0.5">Quá trình này có thể mất 30–60 giây tuỳ độ dài video</p>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Result */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-[#FF4444]/10 to-transparent">
                    <Sparkles className="w-5 h-5 text-[#FF4444]" />
                    <span className="font-bold text-sm text-slate-900 dark:text-foreground">Kết quả phân tích từ Gemini</span>
                  </div>
                  <div className="p-5 text-sm text-slate-900 dark:text-foreground leading-relaxed whitespace-pre-wrap">
                    {result}
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-[#A8A29E] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Phân tích video khác
                </button>
              </motion.div>
            )}

            {/* Analyze button */}
            {!result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-between">
                {/* Credits display */}
                <div className="text-sm">
                  {isPremium
                    ? <span className="text-slate-500">Còn <span className="font-bold text-[#FF4444]">{aiCredits}</span> lượt phân tích</span>
                    : <Link to="/pricing" className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium hover:underline">
                        <Crown className="w-4 h-4" />Nâng cấp để dùng AI Video
                      </Link>
                  }
                </div>
                <button
                  onClick={analyze}
                  disabled={!file || isProcessing || !isPremium || aiCredits <= 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white disabled:opacity-40 hover:opacity-90 transition-opacity shadow-lg shadow-[#FF4444]/20"
                >
                  {!isPremium || aiCredits <= 0 ? <Lock className="w-4 h-4" /> : isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {uploading ? 'Đang upload...' : analyzing ? 'Đang phân tích...' : !isPremium ? 'Cần Premium' : aiCredits <= 0 ? 'Hết lượt' : 'Phân tích video'}
                </button>
              </motion.div>
            )}
          </div>
          </motion.div>
          )}
          </AnimatePresence>

        </div>

        {/* History section - only for video tab */}
        {activeTab === 'video' && (history.length > 0 || historyLoading) && (
          <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
            <button
              onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-foreground transition-colors"
            >
              <History className="w-4 h-4 text-[#FF4444]" />
              Lịch sử phân tích ({history.length})
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                  {historyLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
                    </div>
                  ) : history.map(item => (
                    <div key={item.id} className="glass-card rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FF4444]/10 flex items-center justify-center flex-shrink-0">
                          <Play className="w-4 h-4 text-[#FF4444]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{item.videoFileName || 'Video'}</p>
                          <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                        {expandedId === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {expandedId === item.id && (
                        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-white/5 pt-3">
                          <video src={item.videoUrl} controls className="w-full rounded-xl max-h-48 bg-black" />
                          {item.prompt && <p className="text-xs text-slate-500 italic">"{item.prompt}"</p>}
                          <p className="text-sm text-slate-900 dark:text-foreground leading-relaxed whitespace-pre-wrap">{item.result}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
