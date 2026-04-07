import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Target, Award, Star, Check, Lock, Clock, Crown, Loader2, Swords, Plus, Minus, User, BarChart2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { contestService, ContestDto, ContestPickDto, TeamPickerDto, PlayerPickerDto } from "@/services/contestService";
import { predictionService, PredictionItemDto, UserPredictionStatsDto } from "@/services/predictionService";
import { checkInService } from "@/services/checkInService";
import CheckInCalendar from "@/components/predictions/CheckInCalendar";
import { leagueService, SofascoreTeamMatch } from "@/services/leagueService";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { toast } from "sonner";

const LEAGUES_CONFIG = [
  { tournamentId: 626, seasonId: 78589, name: "V-League 1" },
  { tournamentId: 771, seasonId: 80926, name: "V-League 2" },
  { tournamentId: 3087, seasonId: 81023, name: "Vietnam Cup" },
];

const CONTEST_TYPE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  TOP4:       { label: "Top 4",      color: "from-green-500 to-emerald-500", icon: <Trophy className="w-4 h-4" /> },
  POTM:       { label: "POTM",       color: "from-yellow-500 to-orange-500", icon: <Star className="w-4 h-4" /> },
  TOP_SCORER: { label: "Top Scorer", color: "from-red-500 to-pink-500",      icon: <Target className="w-4 h-4" /> },
  POTS:       { label: "POTS",       color: "from-purple-500 to-indigo-500", icon: <Award className="w-4 h-4" /> },
  CHAMPION:   { label: "Vô địch",    color: "from-amber-500 to-yellow-500",  icon: <Crown className="w-4 h-4" /> },
};

function timeLeft(closesAt: string) {
  const normalized = closesAt.endsWith("Z") ? closesAt : closesAt + "Z";
  const diff = new Date(normalized).getTime() - Date.now();
  if (diff <= 0) return "Đã đóng";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)} ngày`;
  return `${h}g ${m}p`;
}

function teamLogo(id: number) {
  return `https://api.sofascore.app/api/v1/team/${id}/image`;
}

type MatchWithDbId = SofascoreTeamMatch & { _leagueName?: string; _dbMatchId?: number };

export default function PredictionsPage() {
  const [tab, setTab] = useState<"special" | "match" | "mine">("special");
  const isLoggedIn = authService.isAuthenticated();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      userService.getMe().then(u => {
        setIsAdmin(u.roles?.some(r => r.toLowerCase() === 'admin') ?? false);
      }).catch(() => {});
    }
  }, [isLoggedIn]);

  const [contests, setContests] = useState<ContestDto[]>([]);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [activeContest, setActiveContest] = useState<ContestDto | null>(null);
  const [teams, setTeams] = useState<TeamPickerDto[]>([]);
  const [players, setPlayers] = useState<PlayerPickerDto[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [top4Picks, setTop4Picks] = useState<(number | null)[]>([null, null, null, null]);
  const [singleTeamPick, setSingleTeamPick] = useState<number | null>(null);
  const [singlePlayerPick, setSinglePlayerPick] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [allMatches, setAllMatches] = useState<(MatchWithDbId)[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [myPredictions, setMyPredictions] = useState<PredictionItemDto[]>([]);
  const [activeMatch, setActiveMatch] = useState<(MatchWithDbId) | null>(null);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [matchSubmitting, setMatchSubmitting] = useState(false);
  const [filterLeague, setFilterLeague] = useState<string>("all");
  const [filterRound, setFilterRound] = useState<string>("all");
  // All rounds available per league (from DB, not filtered by date)
  const [allRounds, setAllRounds] = useState<Record<string, string[]>>({});

  // My predictions tab state
  const [myStats, setMyStats] = useState<UserPredictionStatsDto | null>(null);
  const [myStatsLoading, setMyStatsLoading] = useState(false);
  const [myHistoryLoading, setMyHistoryLoading] = useState(false);
  const [showPointsBreakdown, setShowPointsBreakdown] = useState(false);

  useEffect(() => {
    contestService.getOpen()
      .then(setContests)
      .catch(() => toast.error("Không thể tải danh sách dự đoán"))
      .finally(() => setContestsLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== "match") return;
    setMatchesLoading(true);
    Promise.all(
      LEAGUES_CONFIG.map((l) =>
        leagueService.getAllMatchesFromDb(l.tournamentId, l.seasonId)
          .then((r: any[]) => r.map((m) => ({ ...m, _leagueName: l.name })))
          .catch(() => [] as any[])
      )
    ).then((results) => {
      const now = new Date();
      const in14days = new Date(now.getTime() + 14 * 24 * 3600 * 1000);
      const flat = results.flat();

      // Build rounds map for all leagues (all rounds, not filtered by date)
      const roundsMap: Record<string, string[]> = {};
      LEAGUES_CONFIG.forEach((l) => {
        const leagueMatches = flat.filter((m: any) => m._leagueName === l.name && m.round);
        const rounds = [...new Set(leagueMatches.map((m: any) => String(m.round)))].sort((a, b) => Number(a) - Number(b));
        roundsMap[l.name] = rounds;
      });
      setAllRounds(roundsMap);

      const upcoming = flat
        .filter((m: any) => {
          if (m.status === "FT" || m.status === "finished") return false;
          const kickoff = new Date(m.matchDate?.endsWith("Z") ? m.matchDate : m.matchDate + "Z");
          return kickoff >= now && kickoff <= in14days;
        })
        .map((m: any): MatchWithDbId => ({
          id: m.apiFixtureId,
          _dbMatchId: m.matchId,
          homeTeam: { id: m.homeTeam?.apiTeamId ?? 0, name: m.homeTeam?.teamName ?? "" },
          awayTeam: { id: m.awayTeam?.apiTeamId ?? 0, name: m.awayTeam?.teamName ?? "" },
          homeScore: { current: m.homeGoals ?? 0 },
          awayScore: { current: m.awayGoals ?? 0 },
          startTimestamp: m.matchDate ? Math.floor(new Date(m.matchDate.endsWith("Z") ? m.matchDate : m.matchDate + "Z").getTime() / 1000) : 0,
          status: { type: m.status === "inprogress" ? "inprogress" : "notstarted" },
          roundInfo: m.round ? { round: Number(m.round) } : undefined,
          _leagueName: m._leagueName,
        }))
        .sort((a, b) => a.startTimestamp - b.startTimestamp);
      setAllMatches(upcoming);
    })
    .catch(() => toast.error("Không thể tải lịch thi đấu"))
    .finally(() => setMatchesLoading(false));

    if (isLoggedIn) {
      predictionService.getMyPredictions().then(setMyPredictions).catch(() => {});
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "mine" || !isLoggedIn) return;
    setMyStatsLoading(true);
    setMyHistoryLoading(true);
    predictionService.getMyStats()
      .then(setMyStats)
      .catch(() => {})
      .finally(() => setMyStatsLoading(false));
    predictionService.getMyPredictions()
      .then(setMyPredictions)
      .catch(() => {})
      .finally(() => setMyHistoryLoading(false));
    // Load contests nếu chưa có
    if (contests.length === 0) {
      contestService.getOpen().then(setContests).catch(() => {});
    }
  }, [tab]);

  // When a specific round is selected, load all matches for that round (not just upcoming)
  useEffect(() => {
    if (filterRound === "all" || filterLeague === "all" || filterLeague === "Vietnam Cup") return;
    const leagueConfig = LEAGUES_CONFIG.find((l) => l.name === filterLeague);
    if (!leagueConfig) return;
    leagueService.getAllMatchesFromDb(leagueConfig.tournamentId, leagueConfig.seasonId)
      .then((r: any[]) => {
        const roundMatches = r
          .filter((m: any) => String(m.round) === filterRound)
          .map((m: any): MatchWithDbId => ({
            id: m.apiFixtureId,
            _dbMatchId: m.matchId,
            homeTeam: { id: m.homeTeam?.apiTeamId ?? 0, name: m.homeTeam?.teamName ?? "" },
            awayTeam: { id: m.awayTeam?.apiTeamId ?? 0, name: m.awayTeam?.teamName ?? "" },
            homeScore: { current: m.homeGoals ?? 0 },
            awayScore: { current: m.awayGoals ?? 0 },
            startTimestamp: m.matchDate ? Math.floor(new Date(m.matchDate.endsWith("Z") ? m.matchDate : m.matchDate + "Z").getTime() / 1000) : 0,
            status: { type: m.status === "FT" || m.status === "finished" ? "finished" : m.status === "inprogress" ? "inprogress" : "notstarted" },
            roundInfo: m.round ? { round: Number(m.round) } : undefined,
            _leagueName: filterLeague,
          }))
          .sort((a, b) => a.startTimestamp - b.startTimestamp);
        // Merge: keep upcoming matches from other leagues + replace current league with round matches
        setAllMatches((prev) => {
          const others = prev.filter((m: any) => m._leagueName !== filterLeague);
          return [...others, ...roundMatches].sort((a, b) => a.startTimestamp - b.startTimestamp);
        });
      })
      .catch(() => {});
  }, [filterRound, filterLeague]);

  const openContest = async (c: ContestDto) => {
    if (!isLoggedIn) { toast.error("Vui lòng đăng nhập để dự đoán"); return; }
    if (isAdmin) { toast.error("Admin không thể tham gia dự đoán"); return; }
    if (c.hasEntered) { toast.error("Bạn đã dự đoán rồi, không thể thay đổi."); return; }
    setActiveContest(c);
    setTop4Picks([null, null, null, null]);
    setSingleTeamPick(null); setSinglePlayerPick(null); setSelectedTeamId(null); setPlayers([]);
    if (c.myEntries?.length) {
      if (c.contestType === "TOP4") {
        const picks: (number | null)[] = [null, null, null, null];
        c.myEntries.forEach((e) => { if (e.rank >= 1 && e.rank <= 4) picks[e.rank - 1] = e.teamId ?? null; });
        setTop4Picks(picks);
      } else if (c.contestType === "CHAMPION") { setSingleTeamPick(c.myEntries[0]?.teamId ?? null); }
      else { setSinglePlayerPick(c.myEntries[0]?.playerId ?? null); }
    }
    const teamList = await contestService.getTeams(c.leagueId, c.seasonId).catch(() => []);
    setTeams(teamList);
  };

  const selectTeamForPlayer = async (teamId: number) => {
    setSelectedTeamId(teamId); setSinglePlayerPick(null);
    const list = await contestService.getPlayers(teamId).catch(() => []);
    setPlayers(list);
  };

  const handleTop4Pick = (rank: number, teamId: number) => {
    const p = [...top4Picks];
    const idx = p.indexOf(teamId);
    if (idx !== -1) p[idx] = null;
    p[rank - 1] = teamId;
    setTop4Picks(p);
  };

  const [confirmContest, setConfirmContest] = useState(false);
  const [confirmMatch, setConfirmMatch] = useState(false);

  const handleContestSubmit = async () => {
    if (!activeContest) return;
    // validate trước khi show confirm
    let picks: ContestPickDto[] = [];
    if (activeContest.contestType === "TOP4") {
      if (top4Picks.some((p) => p === null)) { toast.error("Chọn đủ 4 đội"); return; }
      picks = top4Picks.map((teamId, i) => ({ rank: i + 1, teamId: teamId! }));
    } else if (activeContest.contestType === "CHAMPION") {
      if (!singleTeamPick) { toast.error("Chọn 1 đội"); return; }
      picks = [{ rank: 1, teamId: singleTeamPick }];
    } else {
      if (!singlePlayerPick) { toast.error("Chọn 1 cầu thủ"); return; }
      picks = [{ rank: 1, playerId: singlePlayerPick }];
    }
    setConfirmContest(true);
  };

  const doContestSubmit = async () => {
    if (!activeContest) return;
    setConfirmContest(false);
    setSubmitting(true);
    try {
      let picks: ContestPickDto[] = [];
      if (activeContest.contestType === "TOP4") {
        picks = top4Picks.map((teamId, i) => ({ rank: i + 1, teamId: teamId! }));
      } else if (activeContest.contestType === "CHAMPION") {
        picks = [{ rank: 1, teamId: singleTeamPick! }];
      } else {
        picks = [{ rank: 1, playerId: singlePlayerPick! }];
      }
      await contestService.submitEntry({ contestId: activeContest.contestId, picks });
      toast.success("Đã lưu dự đoán!");
      setContests(await contestService.getOpen());
      setActiveContest(null);
    } catch (e: any) { toast.error(e.message || "Lỗi"); }
    finally { setSubmitting(false); }
  };

  const handleMatchSubmit = async () => {
    if (!activeMatch) return;
    setConfirmMatch(true);
  };

  const doMatchSubmit = async () => {
    if (!activeMatch) return;
    setConfirmMatch(false);
    setMatchSubmitting(true);
    try {
      const dbId = (activeMatch as any)._dbMatchId ?? activeMatch.id;
      await predictionService.submit(dbId, homeGoals, awayGoals);
      toast.success("Đã lưu dự đoán!");
      setMyPredictions(await predictionService.getMyPredictions());
      setActiveMatch(null);
    } catch (e: any) { toast.error(e.message || "Lỗi"); }
    finally { setMatchSubmitting(false); }
  };

  const openMatchPrediction = (match: MatchWithDbId) => {
    if (!isLoggedIn) { toast.error("Vui lòng đăng nhập"); return; }
    if (isAdmin) { toast.error("Admin không thể tham gia dự đoán"); return; }
    const dbId = (match as any)._dbMatchId ?? match.id;
    const ex = myPredictions.find((p) => p.matchId === dbId);
    setHomeGoals(ex?.predictedHomeGoals ?? 0);
    setAwayGoals(ex?.predictedAwayGoals ?? 0);
    setActiveMatch(match);
  };

  const isOpen = (c: ContestDto) => c.status === "OPEN" && new Date(c.closesAt.endsWith("Z") ? c.closesAt : c.closesAt + "Z") > new Date();
  const matchIsPredicted = (m: any) => {
    const dbId = m._dbMatchId ?? m.id;
    return myPredictions.some((p) => p.matchId === dbId);
  };

  const filteredMatches = allMatches.filter((m: any) => {
    if (filterLeague !== "all" && m._leagueName !== filterLeague) return false;
    if (filterRound !== "all" && String(m.roundInfo?.round) !== filterRound) return false;
    return true;
  });

  // availableRounds from allRounds map (all rounds in DB, not just upcoming)
  const availableRounds = filterLeague === "all" || filterLeague === "Vietnam Cup"
    ? []
    : allRounds[filterLeague] ?? [];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 mb-4">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Dự đoán & Nhận quà</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white mb-3">Dự Đoán Bóng Đá</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Thể hiện kiến thức bóng đá của bạn! Dự đoán chính xác để leo top và nhận quà hấp dẫn.</p>
        </motion.div>

        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setTab("special")} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === "special" ? "border-[#FF4444] text-[#FF4444]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            <Trophy className="w-4 h-4" /> Dự đoán đặc biệt
          </button>
          <button onClick={() => setTab("match")} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === "match" ? "border-[#FF4444] text-[#FF4444]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
            <Swords className="w-4 h-4" /> Dự đoán trận đấu
          </button>
          {isLoggedIn && !isAdmin && (
            <button onClick={() => setTab("mine")} className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === "mine" ? "border-[#FF4444] text-[#FF4444]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}>
              <User className="w-4 h-4" /> Dự đoán của tôi
            </button>
          )}
        </div>

        {tab === "special" && (
          contestsLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#00D9FF]" /></div>
          : contests.length === 0 ? <div className="text-center py-20 text-slate-500">Chưa có dự đoán đặc biệt nào đang mở.</div>
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {contests.map((c, i) => {
                const meta = CONTEST_TYPE_LABELS[c.contestType] ?? { label: c.contestType, color: "from-slate-500 to-slate-600", icon: <Target className="w-4 h-4" /> };
                const open = isOpen(c);
                return (
                  <motion.div key={c.contestId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`relative bg-white dark:bg-card border rounded-2xl overflow-hidden transition-all ${open ? "border-slate-200 dark:border-border hover:shadow-lg cursor-pointer" : "border-slate-200 dark:border-border opacity-70"}`}
                    onClick={() => open && openContest(c)}>
                    <div className={`h-1.5 bg-gradient-to-r ${meta.color}`} />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${meta.color} text-white`}>{meta.icon}{meta.label}</span>
                        {c.hasEntered && <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold"><Check className="w-3 h-3" /> Đã dự đoán</span>}
                      </div>
                      <h3 className="font-display font-bold text-slate-900 dark:text-white mb-1 leading-tight">{c.title}</h3>
                      {c.description && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.description}</p>}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3">
                        <span className="flex items-center gap-1">{open ? <Clock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}{open ? `Còn ${timeLeft(c.closesAt)}` : c.status === "SETTLED" ? "Đã chấm điểm" : "Đã đóng"}</span>
                        <span className="font-semibold text-[#00D9FF]">{c.pointsExact}đ</span>
                      </div>
                      {c.status === "SETTLED" && c.myEntries?.map((e) => (
                        <p key={e.entryId} className={`text-xs font-semibold mt-1 ${e.isCorrect === 2 ? "text-green-600" : e.isCorrect === 1 ? "text-yellow-600" : "text-slate-400"}`}>
                          {e.teamName ?? e.playerName} {e.points != null ? `+${e.points}đ` : ""}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
        )}

        {tab === "match" && (
          matchesLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#00D9FF]" /></div>
          : <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <select className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card px-3 py-2 text-sm font-medium"
                  value={filterLeague} onChange={(e) => { setFilterLeague(e.target.value); setFilterRound("all"); }}>
                  <option value="all">Tất cả giải</option>
                  <option value="V-League 1">V-League 1</option>
                  <option value="V-League 2">V-League 2</option>
                  <option value="Vietnam Cup">Vietnam Cup</option>
                </select>
                {filterLeague !== "all" && filterLeague !== "Vietnam Cup" && availableRounds.length > 0 && (
                  <select className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card px-3 py-2 text-sm font-medium"
                    value={filterRound} onChange={(e) => setFilterRound(e.target.value)}>
                    <option value="all">Tất cả vòng</option>
                    {availableRounds.map((r) => <option key={r} value={r}>Vòng {r}</option>)}
                  </select>
                )}
                <span className="text-xs text-slate-500 ml-auto">{filteredMatches.length} trận</span>
              </div>
              {filteredMatches.length === 0
                ? <div className="text-center py-12 text-slate-500">Không có trận nào phù hợp.</div>
                : <div className="space-y-3">
                    {filteredMatches.map((m: any, i) => {
                      const predicted = matchIsPredicted(m);
                      const myPred = myPredictions.find((p) => p.matchId === ((m as any)._dbMatchId ?? m.id));
                      const kickoff = new Date(m.startTimestamp * 1000);
                      const isPast = kickoff < new Date();
                      const isFinished = m.status?.type === "finished";
                      const hasScore = isFinished && m.homeScore?.current != null && m.awayScore?.current != null;
                      return (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 flex items-center gap-4">
                          <div className="hidden sm:block w-20 text-center flex-shrink-0">
                            {m._leagueName && <p className="text-xs font-semibold text-[#00D9FF] truncate">{m._leagueName}</p>}
                            <p className="text-xs text-slate-500">Vòng {m.roundInfo?.round ?? "?"}</p>
                            <p className="text-xs text-slate-400">{kickoff.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{kickoff.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                          <div className="flex-1 flex items-center gap-3 min-w-0">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <img src={teamLogo(m.homeTeam.id)} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{m.homeTeam.name}</span>
                            </div>
                            {hasScore
                              ? <span className="text-base font-bold text-slate-900 dark:text-white flex-shrink-0 px-2">{m.homeScore.current} - {m.awayScore.current}</span>
                              : <span className="text-slate-400 text-xs font-bold flex-shrink-0">vs</span>
                            }
                            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white truncate text-right">{m.awayTeam.name}</span>
                              <img src={teamLogo(m.awayTeam.id)} alt="" className="w-7 h-7 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            </div>
                          </div>
                          {myPred && (
                            <div className="hidden sm:flex flex-col items-end gap-0.5 text-xs flex-shrink-0">
                              <span className="text-slate-500">Dự đoán: <span className="font-semibold text-slate-700 dark:text-slate-300">{myPred.predictedHomeGoals} - {myPred.predictedAwayGoals}</span></span>
                              {myPred.isCorrect === 2 && <span className="text-green-600 font-bold">✓✓ Đúng tỉ số</span>}
                              {myPred.isCorrect === 1 && <span className="text-yellow-600 font-bold">✓ Đúng kết quả</span>}
                              {myPred.isCorrect === 0 && <span className="text-slate-400">Sai</span>}
                              {myPred.points != null && myPred.points > 0 && <span className="text-[#00D9FF] font-bold">+{myPred.points}đ</span>}
                            </div>
                          )}
                          <div className="flex-shrink-0">
                            {isPast
                              ? predicted
                                ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold"><Check className="w-3 h-3" /> Đã dự đoán</span>
                                : <span className="text-xs text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Đã đóng</span>
                              : predicted
                              ? <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold"><Check className="w-3 h-3" /> Đã dự đoán</span>
                              : <Button size="sm" onClick={() => openMatchPrediction(m)} className="bg-gradient-to-r from-[#00D9FF] to-[#00B8D4] text-white">Dự đoán</Button>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
              }
            </div>
        )}

        {tab === "mine" && (
          !isLoggedIn
            ? <div className="text-center py-20 text-slate-500">Vui lòng đăng nhập để xem lịch sử dự đoán.</div>
            : <div className="space-y-6">
                {myStatsLoading
                  ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#00D9FF]" /></div>
                  : myStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 text-center">
                        <BarChart2 className="w-5 h-5 mx-auto mb-1 text-[#00D9FF]" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{myStats.totalPredictions}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Tổng dự đoán</p>
                      </div>
                      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 text-center">
                        <Check className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{myStats.correctPredictions}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Đúng kết quả</p>
                      </div>
                      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 text-center">
                        <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{myStats.exactScorePredictions}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Đúng tỉ số</p>
                      </div>
                      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 text-center cursor-pointer hover:border-[#00D9FF] transition-colors group relative"
                        onClick={() => setShowPointsBreakdown(true)}>
                        <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <p className="text-2xl font-bold text-[#00D9FF]">{myStats.points}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Tổng điểm</p>
                        <span className="absolute top-1 right-1.5 text-[10px] text-slate-400 group-hover:text-[#00D9FF]">chi tiết</span>
                      </div>
                    </div>
                  )
                }
                {/* Contest entries */}
                {contests.filter(c => c.hasEntered && c.myEntries?.length).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Dự đoán đặc biệt của tôi</h3>
                    <div className="space-y-2">
                      {contests.filter(c => c.hasEntered && c.myEntries?.length).map(c => {
                        const meta = CONTEST_TYPE_LABELS[c.contestType] ?? { label: c.contestType, color: "from-slate-500 to-slate-600", icon: null };
                        return (
                          <div key={c.contestId} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r ${meta.color} text-white`}>{meta.icon}{meta.label}</span>
                              <span className="text-xs text-slate-500">{c.title}</span>
                              {c.status === "SETTLED" && <span className="text-xs text-slate-400">Đã chấm điểm</span>}
                              {c.status === "OPEN" && <span className="text-xs text-green-600 font-semibold">Đang mở</span>}
                            </div>
                            <div className="space-y-1">
                              {c.myEntries!.map(e => (
                                <div key={e.entryId} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">
                                    {c.contestType === "TOP4" && <span className="font-semibold mr-1">#{e.rank}</span>}
                                    {e.teamName ?? e.playerName ?? "?"}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {e.isCorrect === 2 && <span className="text-green-600 font-bold">✓✓ Đúng</span>}
                                    {e.isCorrect === 1 && <span className="text-yellow-600 font-bold">✓ Gần đúng</span>}
                                    {e.isCorrect === 0 && <span className="text-slate-400">Sai</span>}
                                    {e.points != null && e.points > 0 && <span className="text-[#00D9FF] font-bold">+{e.points}đ</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Lịch sử dự đoán trận đấu</h3>
                  {myHistoryLoading
                    ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#00D9FF]" /></div>
                    : myPredictions.length === 0
                      ? <div className="text-center py-10 text-slate-500 text-sm">Bạn chưa dự đoán trận nào.</div>
                      : <div className="space-y-2">
                          {[...myPredictions].reverse().map((p) => {
                            const isExact = p.isCorrect === 2;
                            const isResult = p.isCorrect === 1;
                            const isWrong = p.isCorrect === 0;
                            const settled = p.matchStatus === "FT" || p.matchStatus === "finished" || p.actualHomeGoals != null;
                            return (
                              <div key={p.predictionId} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl px-4 py-3 flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {p.homeTeamName ?? "?"} vs {p.awayTeamName ?? "?"}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Dự đoán: <span className="font-bold text-slate-700 dark:text-slate-300">{p.predictedHomeGoals} - {p.predictedAwayGoals}</span>
                                    {settled && p.actualHomeGoals != null && (
                                      <> · Thực tế: <span className="font-bold">{p.actualHomeGoals} - {p.actualAwayGoals}</span></>
                                    )}
                                  </p>
                                  {p.createdAt && (
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      {new Date(p.createdAt.endsWith("Z") ? p.createdAt : p.createdAt + "Z").toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  )}
                                </div>
                                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                  {!settled && <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Chờ kết quả</span>}
                                  {settled && isExact && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check className="w-3 h-3" />✓✓ Đúng tỉ số</span>}
                                  {settled && isResult && <span className="text-xs font-bold text-yellow-600 flex items-center gap-1"><Check className="w-3 h-3" />✓ Đúng kết quả</span>}
                                  {settled && isWrong && <span className="text-xs text-slate-400">Sai</span>}
                                  {p.points != null && p.points > 0 && (
                                    <span className="text-xs font-bold text-[#00D9FF]">+{p.points}đ</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                  }
                </div>
              </div>
        )}
      </div>

      <AnimatePresence>
        {activeContest && (
          <Dialog open onOpenChange={() => setActiveContest(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display text-xl">{activeContest.title}</DialogTitle></DialogHeader>
              <div className="space-y-5 mt-2">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Đóng: {new Date(activeContest.closesAt.endsWith("Z") ? activeContest.closesAt : activeContest.closesAt + "Z").toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
                  <span className="font-semibold text-[#00D9FF]">Đúng: {activeContest.pointsExact}đ{activeContest.pointsPartial > 0 ? ` / Gần đúng: ${activeContest.pointsPartial}đ` : ""}</span>
                </div>
                {activeContest.contestType === "TOP4" && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Chọn 4 đội theo thứ tự hạng:</p>
                    {[1,2,3,4].map((rank) => {
                      const picked = teams.find(t => t.teamId === top4Picks[rank-1]);
                      return (
                        <div key={rank} className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold flex-shrink-0">#{rank}</span>
                          {picked?.apiTeamId && <img src={`https://api.sofascore.app/api/v1/team/${picked.apiTeamId}/image`} alt="" className="w-6 h-6 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                          <select className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                            value={top4Picks[rank-1] ?? ""} onChange={(e) => handleTop4Pick(rank, Number(e.target.value))}>
                            <option value="">-- Chọn đội --</option>
                            {teams.map((t) => <option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}
                {activeContest.contestType === "CHAMPION" && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Chọn đội vô địch:</p>
                    {singleTeamPick && teams.find(t => t.teamId === singleTeamPick)?.apiTeamId && (
                      <div className="flex items-center justify-center">
                        <img src={`https://api.sofascore.app/api/v1/team/${teams.find(t => t.teamId === singleTeamPick)!.apiTeamId}/image`} alt="" className="w-12 h-12 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {teams.map((t) => (
                        <button key={t.teamId} onClick={() => setSingleTeamPick(t.teamId)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${singleTeamPick === t.teamId ? "border-[#FF4444] bg-red-50 dark:bg-red-500/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-400"}`}>
                          {t.apiTeamId && <img src={`https://api.sofascore.app/api/v1/team/${t.apiTeamId}/image`} alt="" className="w-6 h-6 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                          <span className="truncate text-xs font-medium">{t.teamName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {["POTM","TOP_SCORER","POTS"].includes(activeContest.contestType) && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">1. Chọn đội:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {teams.map((t) => (
                        <button key={t.teamId} onClick={() => selectTeamForPlayer(t.teamId)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${selectedTeamId === t.teamId ? "border-[#FF4444] bg-red-50 dark:bg-red-500/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-400"}`}>
                          {t.apiTeamId && <img src={`https://api.sofascore.app/api/v1/team/${t.apiTeamId}/image`} alt="" className="w-6 h-6 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                          <span className="truncate text-xs font-medium">{t.teamName}</span>
                        </button>
                      ))}
                    </div>
                    {players.length > 0 && <>
                      <p className="text-sm font-semibold">2. Chọn cầu thủ:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                        {players.map((p) => (
                          <button key={p.playerId} onClick={() => setSinglePlayerPick(p.playerId)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${singlePlayerPick === p.playerId ? "border-[#FF4444] bg-red-50 dark:bg-red-500/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-400"}`}>
                            {p.apiPlayerId && <img src={`https://api.sofascore.app/api/v1/player/${p.apiPlayerId}/image`} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 bg-slate-100" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                            <span className="truncate text-xs font-medium leading-tight">{p.fullName}</span>
                          </button>
                        ))}
                      </div>
                    </>}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setActiveContest(null)}>Hủy</Button>
                  <Button onClick={handleContestSubmit} disabled={submitting} className="bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Lưu dự đoán
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMatch && (
          <Dialog open onOpenChange={() => setActiveMatch(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle className="font-display text-lg">Dự đoán tỉ số</DialogTitle></DialogHeader>
              <div className="space-y-5 mt-2">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={teamLogo(activeMatch.homeTeam.id)} alt="" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-xs font-semibold text-center leading-tight">{activeMatch.homeTeam.name}</span>
                  </div>
                  <span className="text-slate-400 font-bold text-lg">vs</span>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={teamLogo(activeMatch.awayTeam.id)} alt="" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-xs font-semibold text-center leading-tight">{activeMatch.awayTeam.name}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors" onClick={() => setHomeGoals((v) => Math.max(0, v-1))}><Minus className="w-4 h-4" /></button>
                    <span className="w-10 text-center text-2xl font-bold">{homeGoals}</span>
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors" onClick={() => setHomeGoals((v) => v+1)}><Plus className="w-4 h-4" /></button>
                  </div>
                  <span className="text-slate-400 font-bold text-xl">-</span>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors" onClick={() => setAwayGoals((v) => Math.max(0, v-1))}><Minus className="w-4 h-4" /></button>
                    <span className="w-10 text-center text-2xl font-bold">{awayGoals}</span>
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors" onClick={() => setAwayGoals((v) => v+1)}><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-500">Đúng tỉ số: <span className="font-bold text-[#00D9FF]">3đ</span> · Đúng kết quả: <span className="font-bold text-[#00D9FF]">1đ</span></p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setActiveMatch(null)}>Hủy</Button>
                  <Button onClick={handleMatchSubmit} disabled={matchSubmitting} className="bg-gradient-to-r from-[#00D9FF] to-[#00B8D4] text-white">
                    {matchSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Lưu dự đoán
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Confirm modal - Contest */}
      <Dialog open={confirmContest} onOpenChange={setConfirmContest}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display text-lg">Xác nhận dự đoán</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Bạn chỉ được dự đoán <span className="font-semibold text-slate-900 dark:text-white">1 lần duy nhất</span> và không thể thay đổi sau khi xác nhận. Bạn có chắc chắn không?</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmContest(false)}>Hủy</Button>
            <Button onClick={doContestSubmit} disabled={submitting} className="bg-gradient-to-r from-[#FF4444] to-[#FF6B6B] text-white">
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm modal - Match */}
      <Dialog open={confirmMatch} onOpenChange={setConfirmMatch}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display text-lg">Xác nhận dự đoán</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Bạn chỉ được dự đoán <span className="font-semibold text-slate-900 dark:text-white">1 lần duy nhất</span> và không thể thay đổi sau khi xác nhận. Bạn có chắc chắn không?</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmMatch(false)}>Hủy</Button>
            <Button onClick={doMatchSubmit} disabled={matchSubmitting} className="bg-gradient-to-r from-[#00D9FF] to-[#00B8D4] text-white">
              {matchSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Points Breakdown Modal */}
      <Dialog open={showPointsBreakdown} onOpenChange={setShowPointsBreakdown}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" />Chi tiết điểm</DialogTitle></DialogHeader>
          {myStats && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Dự đoán trận đấu</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">+{myStats.matchPredictionPoints}đ</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Dự đoán đặc biệt</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">+{myStats.contestPoints}đ</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Điểm danh hàng ngày</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">+{myStats.checkInPoints}đ</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/20">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tổng cộng</span>
                <span className="font-bold text-xl text-[#00D9FF]">{myStats.points}đ</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
