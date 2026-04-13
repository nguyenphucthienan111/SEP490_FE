import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ChevronDown, ChevronUp, History, Trophy, User, AlertCircle, RefreshCw, Search, ChevronRight } from 'lucide-react';
import { apiClient } from '@/services/api';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface League { leagueId: number; leagueName: string; logoUrl?: string; }
interface Season { seasonId: number; year: string; }
interface MatchItem { matchId: number; homeTeam?: { teamName: string }; awayTeam?: { teamName: string }; homeTeamName?: string; awayTeamName?: string; matchDate: string; round: string; homeGoals?: number; awayGoals?: number; status?: string; }
interface PlayerItem { playerId: number; fullName: string; position: string; teamName: string; photoUrl?: string; }
interface HistoryItem { id: string; analysisType: string; matchId: number; playerId?: number; analysisVi: string; createdAt: string; }

type AnalysisMode = 'match' | 'player';
type Step = 'league' | 'season' | 'round' | 'match' | 'player' | 'result';

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-foreground mt-4 mb-1.5 border-b border-slate-100 dark:border-white/5 pb-1">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-[#FF4444] mt-3 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\n/g, '<br/>');
}

const POSITION_MAP: Record<string, string> = { F: 'Tiền đạo', M: 'Tiền vệ', D: 'Hậu vệ', G: 'Thủ môn' };

export function AIMatchAnalysis() {
  const { isPremium, aiMatchCredits, refresh: refreshSub } = useSubscription();
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [mode, setMode] = useState<AnalysisMode>('match');

  // Selection state
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [rounds, setRounds] = useState<string[]>([]);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerItem | null>(null);

  // Loading states
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState('');

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load leagues on mount
  useEffect(() => {
    setLoadingLeagues(true);
    apiClient.get<any>('/api/Football/leagues')
      .then(r => setLeagues(Array.isArray(r) ? r : (r?.data ?? [])))
      .catch(() => {})
      .finally(() => setLoadingLeagues(false));
  }, []);

  // Load history
  useEffect(() => {
    apiClient.get<any>('/api/ai-analysis/history?pageSize=10')
      .then(r => {
        const list = Array.isArray(r) ? r : (r?.data ?? []);
        setHistory(list);
        if (list.length > 0) setShowHistory(true); // tự mở khi có data
      })
      .catch(() => {});
  }, [result]);

  // Load seasons when league selected
  useEffect(() => {
    if (!selectedLeague) return;
    setLoadingSeasons(true);
    setSeasons([]); setSelectedSeason(null); setRounds([]); setSelectedRound(null); setMatches([]); setSelectedMatch(null);
    apiClient.get<any>(`/api/Football/seasons?leagueId=${selectedLeague.leagueId}`)
      .then(r => {
        const list: any[] = Array.isArray(r) ? r : (r?.data ?? []);
        // Chỉ hiện mùa có year (không null)
        setSeasons(list.filter(s => s.year != null));
      })
      .catch(() => {})
      .finally(() => setLoadingSeasons(false));
  }, [selectedLeague]);

  // Load rounds when season selected
  useEffect(() => {
    if (!selectedSeason) return;
    setLoadingRounds(true);
    setRounds([]); setSelectedRound(null); setMatches([]); setSelectedMatch(null);
    apiClient.get<any>(`/api/Football/rounds?seasonId=${selectedSeason.seasonId}`)
      .then(r => {
        const list: any[] = Array.isArray(r) ? r : (r?.data ?? []);
        // API có thể trả về string[] hoặc {round, matchCount}[]
        setRounds(list.map(item => typeof item === 'string' ? item : (item?.round ?? String(item))));
      })
      .catch(() => {})
      .finally(() => setLoadingRounds(false));
  }, [selectedSeason]);

  // Load matches when round selected
  useEffect(() => {
    if (!selectedSeason || !selectedRound) return;
    setLoadingMatches(true);
    setMatches([]); setSelectedMatch(null);
    apiClient.get<any>(`/api/Football/matches/by-round?seasonId=${selectedSeason.seasonId}&round=${encodeURIComponent(selectedRound)}`)
      .then(r => {
        const list: any[] = Array.isArray(r) ? r : (r?.data ?? []);
        // Lọc bỏ trận chưa có đội (vòng chưa diễn ra)
        setMatches(list.filter(m => (m?.homeTeam?.teamName || m?.homeTeamName) && (m?.awayTeam?.teamName || m?.awayTeamName)));
      })
      .catch(() => {})
      .finally(() => setLoadingMatches(false));
  }, [selectedRound]);

  // Load players when match selected (player mode)
  useEffect(() => {
    if (!selectedMatch || mode !== 'player') return;
    setLoadingPlayers(true);
    setPlayers([]); setSelectedPlayer(null);
    apiClient.get<any>(`/api/Football/matches/${selectedMatch.matchId}/players`)
      .then(r => {
        const items: any[] = Array.isArray(r) ? r : (r?.data ?? []);
        setPlayers(items.map(p => ({
          playerId: p.playerId ?? p.PlayerId,
          fullName: p.fullName ?? p.FullName ?? `#${p.playerId}`,
          position: p.position ?? p.Position ?? '',
          teamName: p.teamName ?? p.TeamName ?? '',
          photoUrl: p.photoUrl ?? p.PhotoUrl,
        })));
      })
      .catch(() => {})
      .finally(() => setLoadingPlayers(false));
  }, [selectedMatch, mode]);

  const analyze = async () => {
    if (!selectedMatch) return;
    if (mode === 'player' && !selectedPlayer) return;
    setError(''); setResult(''); setFromCache(false);
    setAnalyzing(true);
    try {
      let res: any;
      if (mode === 'match') {
        res = await apiClient.post<any>('/api/ai-analysis/match', { matchId: selectedMatch.matchId });
      } else {
        res = await apiClient.post<any>('/api/ai-analysis/player-rating', {
          matchId: selectedMatch.matchId,
          playerId: selectedPlayer!.playerId,
        });
      }
      setResult(res?.analysisVi ?? res?.AnalysisVi ?? '');
      setFromCache(res?.warning === 'Kết quả từ cache');
      if (res?.creditsRemaining != null) setCreditsRemaining(res.creditsRemaining);
      refreshSub();
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
        setError('Gemini AI đang quá tải, vui lòng thử lại sau ít phút.');
      } else if (msg.includes('502') || msg.includes('Bad Gateway')) {
        setError('Không thể kết nối đến AI. Vui lòng thử lại.');
      } else {
        setError(msg || 'Có lỗi xảy ra');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => { setResult(''); setError(''); setFromCache(false); };

  const getHomeName = (m: MatchItem) => m.homeTeam?.teamName ?? m.homeTeamName ?? '?';
  const getAwayName = (m: MatchItem) => m.awayTeam?.teamName ?? m.awayTeamName ?? '?';

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const filteredPlayers = players.filter(p =>
    p.fullName.toLowerCase().includes(playerSearch.toLowerCase()) ||
    p.teamName.toLowerCase().includes(playerSearch.toLowerCase())
  );

  // Current step indicator
  const getStep = (): Step => {
    if (result) return 'result';
    if (mode === 'player' && selectedMatch) return 'player';
    if (selectedMatch) return 'match';
    if (selectedRound) return 'round';
    if (selectedSeason) return 'season';
    if (selectedLeague) return 'league';
    return 'league';
  };

  const Breadcrumb = () => (
    <div className="flex items-center gap-1 flex-wrap text-xs text-slate-400 mb-4">
      {selectedLeague && <><span className="text-[#FF4444] font-medium">{selectedLeague.leagueName}</span><ChevronRight className="w-3 h-3" /></>}
      {selectedSeason && <><span className="text-[#FF4444] font-medium">{selectedSeason.year}</span><ChevronRight className="w-3 h-3" /></>}
      {selectedRound && <><span className="text-[#FF4444] font-medium">{selectedRound}</span><ChevronRight className="w-3 h-3" /></>}
      {selectedMatch && <span className="text-[#FF4444] font-medium">{getHomeName(selectedMatch)} vs {getAwayName(selectedMatch)}</span>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
        {([['match', Trophy, 'Phân tích trận đấu'], ['player', User, 'Phân tích cầu thủ']] as const).map(([m, Icon, label]) => (
          <button key={m} onClick={() => { setMode(m); setSelectedPlayer(null); setResult(''); setError(''); }}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
              mode === m ? 'bg-white dark:bg-white/10 text-[#FF4444] shadow-sm' : 'text-slate-500 hover:text-foreground')}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Credit indicator - always visible */}
      {isPremium && (
        <div className={cn('flex items-center justify-between px-4 py-2.5 rounded-xl text-sm',
          (creditsRemaining ?? aiMatchCredits) <= 3
            ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
            : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10')}>
          <span className="text-slate-500 dark:text-slate-400">Lượt AI Phân tích còn lại</span>
          <span className={cn('font-bold text-base', (creditsRemaining ?? aiMatchCredits) <= 3 ? 'text-red-500' : 'text-[#FF4444]')}>
            {creditsRemaining ?? aiMatchCredits}
            {(creditsRemaining ?? aiMatchCredits) <= 3 && <span className="text-xs font-normal ml-1">· <Link to="/pricing" className="underline">Nạp thêm</Link></span>}
          </span>
        </div>
      )}
      {!isPremium && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <span className="text-amber-700 dark:text-amber-400">Cần Premium để dùng tính năng này</span>
          <Link to="/pricing" className="text-xs font-bold text-[#FF4444] hover:underline">Nâng cấp →</Link>
        </div>
      )}

      {result ? (
        /* ── RESULT ── */
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Breadcrumb />
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-[#FF4444]/10 to-transparent">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF4444]" />
                <span className="font-bold text-sm text-foreground">
                  {mode === 'match' ? `Phân tích: ${selectedMatch ? getHomeName(selectedMatch) : ''} vs ${selectedMatch ? getAwayName(selectedMatch) : ''}` : `Phân tích: ${selectedPlayer?.fullName}`}
                </span>
                {fromCache && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400">Cache</span>}
              </div>
              <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-400 hover:text-foreground transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />Phân tích lại
              </button>
            </div>
            <div className="p-5 text-sm text-slate-900 dark:text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }} />
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <Breadcrumb />

          {/* ── STEP 1: LEAGUE ── */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Chọn giải đấu</p>
            {loadingLeagues ? <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
              : <div className="grid grid-cols-1 gap-1.5">
                {leagues.map(l => (
                  <button key={l.leagueId} onClick={() => setSelectedLeague(l)}
                    className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border',
                      selectedLeague?.leagueId === l.leagueId
                        ? 'border-[#FF4444]/40 bg-[#FF4444]/5 text-[#FF4444]'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-foreground')}>
                    {l.logoUrl && <img src={l.logoUrl} className="w-6 h-6 object-contain" />}
                    <span className="text-sm font-medium">{l.leagueName}</span>
                    {selectedLeague?.leagueId === l.leagueId && <span className="ml-auto text-[10px] bg-[#FF4444]/10 px-2 py-0.5 rounded-full">Đã chọn</span>}
                  </button>
                ))}
              </div>
            }
          </div>

          {/* ── STEP 2: SEASON ── */}
          {selectedLeague && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Chọn mùa giải</p>
              {loadingSeasons ? <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
                : seasons.length === 0 ? <p className="text-sm text-slate-400">Không có mùa giải</p>
                : <div className="flex flex-wrap gap-2">
                  {seasons.map(s => (
                    <button key={s.seasonId} onClick={() => setSelectedSeason(s)}
                      className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all border',
                        selectedSeason?.seasonId === s.seasonId
                          ? 'border-[#FF4444]/40 bg-[#FF4444]/10 text-[#FF4444]'
                          : 'border-slate-200 dark:border-white/10 hover:border-[#FF4444]/30 text-slate-600 dark:text-slate-400')}>
                      {s.year}
                    </button>
                  ))}
                </div>
              }
            </motion.div>
          )}

          {/* ── STEP 3: ROUND ── */}
          {selectedSeason && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Chọn vòng đấu</p>
              {loadingRounds ? <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
                : rounds.length === 0 ? <p className="text-sm text-slate-400">Không có vòng đấu</p>
                : <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {rounds.map(r => (
                    <button key={r} onClick={() => setSelectedRound(r)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                        selectedRound === r
                          ? 'border-[#FF4444]/40 bg-[#FF4444]/10 text-[#FF4444]'
                          : 'border-slate-200 dark:border-white/10 hover:border-[#FF4444]/30 text-slate-600 dark:text-slate-400')}>
                      {r}
                    </button>
                  ))}
                </div>
              }
            </motion.div>
          )}

          {/* ── STEP 4: MATCH ── */}
          {selectedRound && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">4. Chọn trận đấu</p>
              {loadingMatches ? <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
                : matches.length === 0 ? <p className="text-sm text-slate-400">Không có trận đấu</p>
                : <div className="space-y-1.5">
                  {matches.map(m => {
                    const isFinished = m.status && (m.status.toLowerCase() === 'ft' || m.status.toLowerCase() === 'finished');
                    const hasScore = m.homeGoals != null && m.awayGoals != null;
                    const canAnalyze = isFinished || hasScore;
                    return (
                    <button key={m.matchId} onClick={() => canAnalyze && setSelectedMatch(m)}
                      className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border',
                        !canAnalyze ? 'opacity-50 cursor-not-allowed border-transparent' :
                        selectedMatch?.matchId === m.matchId
                          ? 'border-[#FF4444]/40 bg-[#FF4444]/5'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5')}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-sm font-semibold truncate', selectedMatch?.matchId === m.matchId ? 'text-[#FF4444]' : 'text-foreground')}>
                            {getHomeName(m)}
                          </span>
                          <span className="text-xs font-bold text-slate-400 flex-shrink-0">
                            {hasScore ? `${m.homeGoals} - ${m.awayGoals}` : 'vs'}
                          </span>
                          <span className={cn('text-sm font-semibold truncate', selectedMatch?.matchId === m.matchId ? 'text-[#FF4444]' : 'text-foreground')}>
                            {getAwayName(m)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400">{fmtDate(m.matchDate)}</p>
                          {!canAnalyze && <span className="text-[10px] text-amber-500 font-medium">Chưa diễn ra</span>}
                        </div>
                      </div>
                      {selectedMatch?.matchId === m.matchId && <span className="text-[10px] bg-[#FF4444]/10 text-[#FF4444] px-2 py-0.5 rounded-full flex-shrink-0">Đã chọn</span>}
                    </button>
                    );
                  })}
                </div>
              }
            </motion.div>
          )}

          {/* ── STEP 5: PLAYER (player mode only) ── */}
          {mode === 'player' && selectedMatch && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">5. Chọn cầu thủ</p>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={playerSearch} onChange={e => setPlayerSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc đội..."
                  className="w-full pl-9 pr-4 h-9 rounded-xl bg-slate-100 dark:bg-white/5 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF4444]/30 border border-slate-200 dark:border-white/10" />
              </div>
              {loadingPlayers ? <div className="flex items-center gap-2 text-slate-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Đang tải...</div>
                : filteredPlayers.length === 0 ? <p className="text-sm text-slate-400">{players.length === 0 ? 'Không có dữ liệu cầu thủ' : 'Không tìm thấy'}</p>
                : <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredPlayers.map(p => (
                    <button key={p.playerId} onClick={() => setSelectedPlayer(p)}
                      className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all border',
                        selectedPlayer?.playerId === p.playerId
                          ? 'border-[#FF4444]/40 bg-[#FF4444]/5'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5')}>
                      {p.photoUrl
                        ? <img src={p.photoUrl} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-500">
                            {p.position?.charAt(0) ?? '?'}
                          </div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-semibold truncate', selectedPlayer?.playerId === p.playerId ? 'text-[#FF4444]' : 'text-foreground')}>{p.fullName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{POSITION_MAP[p.position] ?? p.position} · {p.teamName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              }
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Analyze button */}
          {selectedMatch && (mode === 'match' || selectedPlayer) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end gap-2">
              {/* Credit indicator */}
              {isPremium && (
                <p className={`text-xs ${(creditsRemaining ?? aiMatchCredits) <= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                  Còn <span className="font-bold">{creditsRemaining ?? aiMatchCredits}</span> lượt phân tích
                </p>
              )}
              <button onClick={analyze} disabled={analyzing || !isPremium || (creditsRemaining ?? aiMatchCredits) <= 0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white disabled:opacity-40 hover:opacity-90 transition-opacity shadow-lg shadow-[#FF4444]/20">
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {analyzing ? 'Đang phân tích...' : !isPremium ? 'Cần Premium' : (creditsRemaining ?? aiMatchCredits) <= 0 ? 'Hết lượt' : mode === 'match' ? 'Phân tích trận đấu' : 'Phân tích cầu thủ'}
              </button>
              {!isPremium && <p className="text-xs text-slate-400"><Link to="/pricing" className="text-[#FF4444] hover:underline font-medium">Nâng cấp Premium</Link> để dùng tính năng này</p>}
            </motion.div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-white/5">
          <button onClick={() => setShowHistory(v => !v)}
            className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-foreground transition-colors">
            <History className="w-4 h-4 text-[#FF4444]" />
            Lịch sử phân tích ({history.length})
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                {history.map(item => (
                  <div key={item.id} className="glass-card rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                        item.analysisType === 'match' ? 'bg-blue-500/10' : 'bg-[#FF4444]/10')}>
                        {item.analysisType === 'match' ? <Trophy className="w-3.5 h-3.5 text-blue-500" /> : <User className="w-3.5 h-3.5 text-[#FF4444]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {item.analysisType === 'match' ? `Trận #${item.matchId}` : `Cầu thủ #${item.playerId} · Trận #${item.matchId}`}
                        </p>
                        <p className="text-[10px] text-slate-400">{new Date(item.createdAt.endsWith('Z') ? item.createdAt : item.createdAt + 'Z').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {expandedId === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expandedId === item.id && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-white/5 text-sm text-slate-900 dark:text-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(item.analysisVi) }} />
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
