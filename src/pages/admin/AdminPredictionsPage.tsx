import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from './AdminLayout';
import { Plus, Trophy, Star, Target, Award, Crown, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { contestService, ContestDto, ContestType, CreateContestRequest, TeamPickerDto, PlayerPickerDto } from '@/services/contestService';
import { leagueService, League, Season } from '@/services/leagueService';
import { toast } from 'sonner';
import { sofaTeamLogo, sofaPlayerPhoto } from '@/utils/sofascoreImages';

const CONTEST_TYPES: { value: ContestType; label: string; icon: React.ReactNode; desc: string; defaultExact: number; defaultPartial: number }[] = [
  { value: 'TOP4',       label: 'Top 4 vòng đấu', icon: <Trophy className="w-4 h-4" />,  desc: 'Dự đoán 4 đội dẫn đầu theo thứ tự',    defaultExact: 5, defaultPartial: 2 },
  { value: 'POTM',       label: 'POTM',            icon: <Star className="w-4 h-4" />,    desc: 'Cầu thủ xuất sắc nhất tháng',           defaultExact: 10, defaultPartial: 0 },
  { value: 'TOP_SCORER', label: 'Top Scorer',      icon: <Target className="w-4 h-4" />,  desc: 'Vua phá lưới lượt đi/về',               defaultExact: 10, defaultPartial: 0 },
  { value: 'POTS',       label: 'POTS',            icon: <Award className="w-4 h-4" />,   desc: 'Cầu thủ xuất sắc nhất mùa giải',        defaultExact: 15, defaultPartial: 0 },
  { value: 'CHAMPION',   label: 'Nhà vô địch',     icon: <Crown className="w-4 h-4" />,   desc: 'Đội vô địch giải đấu',                  defaultExact: 20, defaultPartial: 0 },
];

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  OPEN:    { text: 'Đang mở',    cls: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
  CLOSED:  { text: 'Đã đóng',   cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' },
  SETTLED: { text: 'Đã chấm',   cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
};

function Top4RankPicker({ rank, teams, selected, otherSelected, onChange, onClear }: {
  rank: number;
  teams: { teamId: number; teamName: string; apiTeamId?: number }[];
  selected: number | null;
  otherSelected: number[];
  onChange: (teamId: number) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedTeam = teams.find(t => t.teamId === selected);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold flex-shrink-0">#{rank}</span>
      <div ref={ref} className="flex-1 relative">
        <button onClick={() => setOpen(v => !v)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${selected ? 'border-[#FF4444] bg-[#FF4444]/5' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}>
          {selectedTeam?.apiTeamId && (
            <img src={sofaTeamLogo(selectedTeam.apiTeamId)}
              className="w-5 h-5 object-contain flex-shrink-0"
              onError={e => (e.target as HTMLImageElement).style.display='none'} />
          )}
          <span className={`flex-1 truncate ${selected ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-400'}`}>
            {selectedTeam?.teamName ?? '-- Chọn đội --'}
          </span>
          {selected && (
            <span onClick={e => { e.stopPropagation(); onClear(); }} className="text-slate-400 hover:text-red-500 ml-1">✕</span>
          )}
          <span className="text-slate-400 text-xs">▾</span>
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-52 overflow-y-auto">
            {teams.map(t => {
              const disabled = otherSelected.includes(t.teamId);
              return (
                <button key={t.teamId} disabled={disabled}
                  onClick={() => { onChange(t.teamId); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                    ${t.teamId === selected ? 'bg-[#FF4444]/10 text-[#FF4444] font-semibold' : ''}
                    ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                  `}>
                  {t.apiTeamId
                    ? <img src={sofaTeamLogo(t.apiTeamId)} className="w-5 h-5 object-contain flex-shrink-0" onError={e => (e.target as HTMLImageElement).style.display='none'} />
                    : <div className="w-5 h-5 flex-shrink-0" />
                  }
                  {t.teamName}
                  {disabled && <span className="ml-auto text-xs text-slate-400">Đã chọn</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPredictionsPage() {
  const [contests, setContests] = useState<ContestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'settled'>('active');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [selectedType, setSelectedType] = useState<ContestType | null>(null);
  const [form, setForm] = useState<Partial<CreateContestRequest>>({});
  const [creating, setCreating] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  // Settle modal
  const [settleContest, setSettleContest] = useState<ContestDto | null>(null);
  const [teams, setTeams] = useState<TeamPickerDto[]>([]);
  const [players, setPlayers] = useState<PlayerPickerDto[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [top4Results, setTop4Results] = useState<(number | null)[]>([null, null, null, null]);
  const [singleTeam, setSingleTeam] = useState<number | null>(null);
  const [singlePlayer, setSinglePlayer] = useState<number | null>(null);
  const [settling, setSettling] = useState(false);
  const [detailContest, setDetailContest] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await contestService.getAll();
      setContests(data);
    } catch { toast.error('Không thể tải danh sách contest'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = (type: ContestType) => {
    const meta = CONTEST_TYPES.find(t => t.value === type)!;
    setSelectedType(type);
    setForm({ contestType: type, pointsExact: meta.defaultExact, pointsPartial: meta.defaultPartial });
    setShowCreate(true);
    // Load leagues
    leagueService.getLeagues().then(setLeagues).catch(() => {});
  };

  const handleLeagueChange = async (leagueId: number) => {
    setForm(f => ({ ...f, leagueId, seasonId: undefined }));
    setSeasons([]);
    if (leagueId) {
      const s = await leagueService.getSeasons(leagueId).catch(() => []);
      setSeasons(s);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.closesAt || !form.contestType) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    if (form.contestType === 'TOP4' && (form.pointsPartial ?? 0) >= (form.pointsExact ?? 0)) {
      toast.error('Điểm đúng một phần phải nhỏ hơn điểm đúng hoàn toàn'); return;
    }
    setCreating(true);
    try {
      // datetime-local gives local time (UTC+7), convert to UTC ISO string for BE
      const closesAtUtc = new Date(form.closesAt).toISOString();
      await contestService.create({ ...form, closesAt: closesAtUtc } as CreateContestRequest);
      toast.success('Đã tạo contest!');
      setShowCreate(false);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi tạo contest'); }
    finally { setCreating(false); }
  };

  const openSettle = async (c: ContestDto) => {
    setSettleContest(c);
    setTop4Results([null, null, null, null]);
    setSingleTeam(null);
    setSinglePlayer(null);
    setSelectedTeamId(null);
    setPlayers([]);
    const teamList = await contestService.getTeams(c.leagueId, c.seasonId).catch(() => []);
    setTeams(teamList);
  };

  const handleSettle = async () => {
    if (!settleContest) return;
    setSettling(true);
    try {
      let results: { rank: number; teamId?: number; playerId?: number }[] = [];
      if (settleContest.contestType === 'TOP4') {
        if (top4Results.some(r => r === null)) { toast.error('Chọn đủ 4 đội'); return; }
        results = top4Results.map((teamId, i) => ({ rank: i + 1, teamId: teamId! }));
      } else if (settleContest.contestType === 'CHAMPION') {
        if (!singleTeam) { toast.error('Chọn đội vô địch'); return; }
        results = [{ rank: 1, teamId: singleTeam }];
      } else {
        if (!singlePlayer) { toast.error('Chọn cầu thủ'); return; }
        results = [{ rank: 1, playerId: singlePlayer }];
      }
      await contestService.settle({ contestId: settleContest.contestId, results });
      toast.success('Đã chấm điểm!');
      setSettleContest(null);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi chấm điểm'); }
    finally { setSettling(false); }
  };

  const selectTeamForPlayer = async (teamId: number) => {
    setSelectedTeamId(teamId);
    setSinglePlayer(null);
    const list = await contestService.getPlayers(teamId).catch(() => []);
    setPlayers(list);
  };

  const active = contests.filter(c => c.status !== 'SETTLED');
  const settled = contests.filter(c => c.status === 'SETTLED');
  const displayed = activeTab === 'active' ? active : settled;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản Lý Dự Đoán</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tạo và quản lý các chiến dịch dự đoán</p>
          </div>
        </div>

        {/* Contest type cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CONTEST_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => openCreate(t.value)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card hover:border-[#00D9FF] hover:shadow-md transition-all text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                {t.icon}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{t.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-[#00D9FF] font-semibold">
                <Plus className="w-3 h-3" /> Tạo mới
              </span>
            </button>
          ))}
        </div>

        {/* Tabs + list */}
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === 'active' ? 'border-b-2 border-[#FF4444] text-[#FF4444]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Đang hoạt động ({active.length})
            </button>
            <button
              onClick={() => setActiveTab('settled')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === 'settled' ? 'border-b-2 border-[#FF4444] text-[#FF4444]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Đã kết thúc ({settled.length})
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#00D9FF]" /></div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Chưa có contest nào.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Loại</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Tiêu đề</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400">Đóng lúc</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400">Điểm</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600 dark:text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {displayed.map(c => {
                  const meta = CONTEST_TYPES.find(t => t.value === c.contestType);
                  const st = STATUS_LABEL[c.status] ?? STATUS_LABEL.CLOSED;
                  return (
                    <tr key={c.contestId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          {meta?.icon}{meta?.label ?? c.contestType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{c.title}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(c.closesAt.endsWith('Z') ? c.closesAt : c.closesAt + 'Z').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-[#00D9FF]">{c.pointsExact}đ</span>
                        {c.pointsPartial > 0 && <span className="text-slate-400 text-xs"> / {c.pointsPartial}đ</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.text}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status !== 'SETTLED' ? (
                          <Button size="sm" variant="outline"
                            disabled={c.status === 'OPEN'}
                            title={c.status === 'OPEN' ? 'Phải đóng contest trước khi chấm điểm' : ''}
                            onClick={() => c.status !== 'OPEN' && openSettle(c)}>
                            {c.status === 'OPEN' ? 'Đang mở' : 'Chấm điểm'}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={async () => {
                            setDetailLoading(true);
                            try {
                              const res = await contestService.getEntries(c.contestId);
                              setDetailContest((res as any).data ?? res);
                            } catch { toast.error('Không thể tải chi tiết'); }
                            finally { setDetailLoading(false); }
                          }}>
                            {detailLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Xem chi tiết'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo contest: {CONTEST_TYPES.find(t => t.value === selectedType)?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Tiêu đề *</Label>
              <Input className="mt-1" placeholder="VD: Top 4 Vòng 18" value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input className="mt-1" placeholder="Mô tả ngắn..." value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Đóng dự đoán lúc *</Label>
              <Input
                className="mt-1"
                type="datetime-local"
                min={new Date(Date.now() + 60000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                value={form.closesAt ?? ''}
                onChange={e => setForm(f => ({ ...f, closesAt: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Điểm đúng hoàn toàn</Label>
                <Input className="mt-1" type="number" min={0} value={form.pointsExact ?? 0} onChange={e => setForm(f => ({ ...f, pointsExact: Number(e.target.value) }))} />
              </div>
              {selectedType === 'TOP4' && (
                <div>
                  <Label>Điểm đúng một phần</Label>
                  <Input className="mt-1" type="number" min={0} max={(form.pointsExact ?? 1) - 1}
                    value={form.pointsPartial ?? 0}
                    onChange={e => setForm(f => ({ ...f, pointsPartial: Number(e.target.value) }))} />
                  {(form.pointsPartial ?? 0) >= (form.pointsExact ?? 0) && (
                    <p className="text-xs text-red-500 mt-1">Phải nhỏ hơn điểm đúng hoàn toàn</p>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Giải đấu (tùy chọn)</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={form.leagueId ?? ''}
                  onChange={e => handleLeagueChange(Number(e.target.value))}
                >
                  <option value="">-- Chọn giải --</option>
                  {leagues.map(l => <option key={l.leagueId} value={l.leagueId}>{l.leagueName}</option>)}
                </select>
              </div>
              <div>
                <Label>Mùa giải (tùy chọn)</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  value={form.seasonId ?? ''}
                  onChange={e => setForm(f => ({ ...f, seasonId: e.target.value ? Number(e.target.value) : undefined }))}
                  disabled={!form.leagueId}
                >
                  <option value="">-- Chọn mùa --</option>
                  {[...seasons].sort((a, b) => b.year - a.year).filter(s => s.year >= new Date().getFullYear() % 100).map(s => <option key={s.seasonId} value={s.seasonId}>{s.year}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Hủy</Button>
              <Button onClick={handleCreate} disabled={creating} className="flex-1 bg-[#FF4444] hover:bg-[#FF6666] text-white">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Tạo contest
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settle Modal */}
      <Dialog open={!!settleContest} onOpenChange={() => setSettleContest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chấm điểm: {settleContest?.title}</DialogTitle>
          </DialogHeader>
          {settleContest && (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-slate-500">Nhập kết quả chính thức để hệ thống tự động chấm điểm tất cả dự đoán.</p>

              {settleContest.contestType === 'TOP4' && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Kết quả Top 4:</p>
                  {[1, 2, 3, 4].map(rank => {
                    const selectedTeam = teams.find(t => t.teamId === top4Results[rank - 1]);
                    return (
                      <Top4RankPicker key={rank} rank={rank} teams={teams} selected={top4Results[rank - 1]}
                        otherSelected={top4Results.filter((_, i) => i !== rank - 1).filter(Boolean) as number[]}
                        onChange={teamId => {
                          const newR = [...top4Results];
                          const existing = newR.indexOf(teamId);
                          if (existing !== -1) newR[existing] = null;
                          newR[rank - 1] = teamId;
                          setTop4Results(newR);
                        }}
                        onClear={() => { const r = [...top4Results]; r[rank-1] = null; setTop4Results(r); }}
                      />
                    );
                  })}
                </div>
              )}

              {settleContest.contestType === 'CHAMPION' && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Đội vô địch:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {teams.map(t => (
                      <button key={t.teamId} onClick={() => setSingleTeam(t.teamId)}
                        className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-2 ${singleTeam === t.teamId ? 'border-[#FF4444] bg-red-50 dark:bg-red-500/10 text-[#FF4444]' : 'border-slate-200 dark:border-slate-700'}`}>
                        {t.apiTeamId && <img src={sofaTeamLogo(t.apiTeamId)} className="w-5 h-5 object-contain" onError={e => (e.target as HTMLImageElement).style.display='none'} />}
                        {t.teamName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {['POTM', 'TOP_SCORER', 'POTS'].includes(settleContest.contestType) && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">1. Chọn đội:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {teams.map(t => (
                        <button key={t.teamId} onClick={() => selectTeamForPlayer(t.teamId)}
                          className={`p-2.5 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-2 ${selectedTeamId === t.teamId ? 'border-[#00D9FF] bg-cyan-50 dark:bg-cyan-500/10 text-[#00D9FF]' : 'border-slate-200 dark:border-slate-700'}`}>
                          {t.apiTeamId && <img src={sofaTeamLogo(t.apiTeamId)} className="w-5 h-5 object-contain" onError={e => (e.target as HTMLImageElement).style.display='none'} />}
                          {t.teamName}
                        </button>
                      ))}
                    </div>
                  </div>
                  {players.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">2. Chọn cầu thủ:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {players.map(p => (
                          <button key={p.playerId} onClick={() => setSinglePlayer(p.playerId)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${singlePlayer === p.playerId ? 'border-[#FF4444] bg-red-50 dark:bg-red-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
                            <p className="font-semibold text-sm">{p.fullName}</p>
                            <p className="text-xs text-slate-500">{p.position}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setSettleContest(null)} className="flex-1">Hủy</Button>
                <Button onClick={handleSettle} disabled={settling} className="flex-1 bg-[#FF4444] hover:bg-[#FF6666] text-white">
                  {settling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Xác nhận kết quả
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail modal */}
      <Dialog open={!!detailContest} onOpenChange={() => setDetailContest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailContest?.title} — Chi tiết kết quả</DialogTitle>
          </DialogHeader>
          {detailContest && (
            <div className="space-y-4 mt-2">
              {/* Official results */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">Kết quả chính thức</p>
                <div className="flex flex-wrap gap-3">
                  {detailContest.officialResults?.map((r: any) => (
                    <span key={r.rank} className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {detailContest.contestType === 'TOP4' && <span className="text-slate-400">#{r.rank}</span>}
                      {r.apiTeamId && <img src={sofaTeamLogo(r.apiTeamId)} className="w-5 h-5 object-contain" onError={e => (e.target as HTMLImageElement).style.display='none'} />}
                      {r.teamName ?? r.playerName}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500">{detailContest.totalEntrants} người tham gia</p>
              {/* Entries leaderboard */}
              <div className="space-y-2">
                {detailContest.entries?.map((u: any, i: number) => (
                  <div key={u.userId} className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{u.username}</span>
                        {u.correctCount > 0 && <span className="text-xs text-green-600">✓✓ {u.correctCount} đúng vị trí</span>}
                        {u.partialCount > 0 && <span className="text-xs text-yellow-600">✓ {u.partialCount} đúng có mặt</span>}
                      </div>
                      <span className="text-sm font-bold text-[#00D9FF]">+{u.totalPoints}đ</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {u.picks?.map((p: any) => (
                        <span key={p.rank} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${p.isCorrect === 2 ? 'bg-green-100 text-green-700' : p.isCorrect === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                          {detailContest.contestType === 'TOP4' && <span className="font-bold">#{p.rank}</span>}
                          {p.apiTeamId && <img src={sofaTeamLogo(p.apiTeamId)} className="w-4 h-4 object-contain" onError={e => (e.target as HTMLImageElement).style.display='none'} />}
                          {p.teamName ?? p.playerName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
