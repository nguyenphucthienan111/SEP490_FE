import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Award,
  Star,
  Users,
  TrendingUp,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock matches data
const matches = [
  {
    id: 1,
    homeTeam: { name: 'Hà Nội FC', logo: '🔴' },
    awayTeam: { name: 'HAGL', logo: '🟡' },
    date: '14/03/2026',
    time: '18:30',
    aiPrediction: { home: 88, draw: 4, away: 8 },
    round: 'Vòng 2',
  },
  {
    id: 2,
    homeTeam: { name: 'Viettel FC', logo: '🔴' },
    awayTeam: { name: 'Công An HN', logo: '🔵' },
    date: '14/03/2026',
    time: '19:00',
    aiPrediction: { home: 65, draw: 20, away: 15 },
    round: 'Vòng 2',
  },
  {
    id: 3,
    homeTeam: { name: 'HCM City', logo: '🔵' },
    awayTeam: { name: 'Bình Dương', logo: '🔵' },
    date: '15/03/2026',
    time: '17:00',
    aiPrediction: { home: 55, draw: 25, away: 20 },
    round: 'Vòng 2',
  },
  {
    id: 4,
    homeTeam: { name: 'SLNA', logo: '🟠' },
    awayTeam: { name: 'Thanh Hóa', logo: '🔵' },
    date: '15/03/2026',
    time: '18:00',
    aiPrediction: { home: 45, draw: 30, away: 25 },
    round: 'Vòng 2',
  },
  {
    id: 5,
    homeTeam: { name: 'Nam Định', logo: '🟡' },
    awayTeam: { name: 'Hải Phòng', logo: '🔵' },
    date: '15/03/2026',
    time: '19:00',
    aiPrediction: { home: 50, draw: 28, away: 22 },
    round: 'Vòng 2',
  },
  {
    id: 6,
    homeTeam: { name: 'Quảng Nam', logo: '🟡' },
    awayTeam: { name: 'Đà Nẵng', logo: '🔴' },
    date: '16/03/2026',
    time: '17:00',
    aiPrediction: { home: 42, draw: 32, away: 26 },
    round: 'Vòng 2',
  },
];

// Special campaigns
const specialCampaigns = [
  {
    id: 'top6',
    title: 'DỰ ĐOÁN BIG 6',
    subtitle: 'Đội Top 6 (Vòng 2)',
    endDate: '08/03 00:00',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'potm',
    title: 'DỰ ĐOÁN POTM',
    subtitle: 'Cầu thủ xuất sắc nhất tháng',
    endDate: '02/03 00:00',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'topscorer',
    title: 'DỰ ĐOÁN TOP SCORER',
    subtitle: 'Vua phá lưới',
    endDate: '01/03 17:00',
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'pots',
    title: 'DỰ ĐOÁN POTS',
    subtitle: 'Cầu thủ xuất sắc nhất giải',
    endDate: '02/03 00:00',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'champion',
    title: 'DỰ ĐOÁN VÔ ĐỊCH',
    subtitle: 'Đội vô địch giải đấu',
    endDate: '02/03 00:00',
    color: 'from-amber-500 to-yellow-500',
  },
];

// Teams and players data
const vleagueTeams = [
  { id: 1, name: 'Hà Nội FC', logo: '🔴' },
  { id: 2, name: 'Công An Hà Nội', logo: '🔵' },
  { id: 3, name: 'Viettel FC', logo: '🔴' },
  { id: 4, name: 'Hoàng Anh Gia Lai', logo: '🟡' },
  { id: 5, name: 'Hồ Chí Minh City', logo: '🔵' },
  { id: 6, name: 'Bình Dương', logo: '🔵' },
  { id: 7, name: 'Thanh Hóa', logo: '🔵' },
  { id: 8, name: 'Sông Lam Nghệ An', logo: '🟠' },
  { id: 9, name: 'Nam Định', logo: '🟡' },
  { id: 10, name: 'Hải Phòng', logo: '🔵' },
  { id: 11, name: 'Quảng Nam', logo: '🟡' },
  { id: 12, name: 'Đà Nẵng', logo: '🔴' },
];

const vleaguePlayers = [
  { id: 1, name: 'Nguyễn Văn Toàn', team: 'Hoàng Anh Gia Lai', goals: 12, logo: '⚽' },
  { id: 2, name: 'Nguyễn Tiến Linh', team: 'Bình Dương', goals: 11, logo: '⚽' },
  { id: 3, name: 'Rafaelson', team: 'Viettel FC', goals: 10, logo: '⚽' },
  { id: 4, name: 'Brandão', team: 'Hà Nội FC', goals: 9, logo: '⚽' },
  { id: 5, name: 'Phan Văn Đức', team: 'Sông Lam Nghệ An', goals: 8, logo: '⚽' },
  { id: 6, name: 'Nguyễn Công Phượng', team: 'Hồ Chí Minh City', goals: 8, logo: '⚽' },
  { id: 7, name: 'Rimario', team: 'Thanh Hóa', goals: 7, logo: '⚽' },
  { id: 8, name: 'Nguyễn Quang Hải', team: 'Công An Hà Nội', goals: 6, logo: '⚽' },
];

export default function PredictionsPage() {
  const [selectedMatch, setSelectedMatch] = useState<typeof matches[0] | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [matchPrediction, setMatchPrediction] = useState<'home' | 'draw' | 'away' | null>(null);
  const [activeTab, setActiveTab] = useState<'predicted' | 'unpredicted'>('unpredicted');
  const [selectedRound, setSelectedRound] = useState(30);
  const [isRoundDropdownOpen, setIsRoundDropdownOpen] = useState(false);

  const rounds = [
    { number: 30, status: 'active', label: 'Vòng 30' },
    { number: 29, status: 'closed', label: 'Vòng 29' },
    { number: 28, status: 'closed', label: 'Vòng 28' },
    { number: 27, status: 'closed', label: 'Vòng 27' },
  ];

  const handleMatchClick = (match: typeof matches[0]) => {
    setSelectedMatch(match);
    setMatchPrediction(null);
  };

  const handleCampaignClick = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setSelectedTeams([]);
    setSelectedTeam(null);
    setSelectedPlayer(null);
  };

  const handleTeamSelect = (teamId: number) => {
    if (selectedCampaign === 'top6') {
      if (selectedTeams.includes(teamId)) {
        setSelectedTeams(selectedTeams.filter(id => id !== teamId));
      } else if (selectedTeams.length < 6) {
        setSelectedTeams([...selectedTeams, teamId]);
      }
    } else if (['potm', 'topscorer', 'pots'].includes(selectedCampaign || '')) {
      setSelectedTeam(teamId);
      setSelectedPlayer(null);
    } else {
      setSelectedTeams([teamId]);
    }
  };

  const getPlayersForTeam = (teamId: number) => {
    const team = vleagueTeams.find(t => t.id === teamId);
    if (!team) return [];
    return vleaguePlayers.filter(p => p.team === team.name);
  };

  const handleSubmit = () => {
    console.log('Submitting prediction');
    setSelectedMatch(null);
    setSelectedCampaign(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-200 dark:border-amber-500/30 mb-6">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Dự đoán & Nhận quà
            </span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white mb-4">
            Dự Đoán Bóng Đá
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Thể hiện kiến thức bóng đá của bạn! Dự đoán chính xác để leo top và nhận quà hấp dẫn.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Users, label: "Người tham gia", value: "8,234", color: "blue" },
            { icon: Target, label: "Dự đoán hôm nay", value: "2,847", color: "green" },
            { icon: Award, label: "Phần quà đã trao", value: "156", color: "amber" },
            { icon: TrendingUp, label: "Độ chính xác TB", value: "68%", color: "purple" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 text-center"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              <p className="font-mono text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Special Campaigns Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {specialCampaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => handleCampaignClick(campaign.id)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                selectedCampaign === campaign.id
                  ? 'bg-gradient-to-r ' + campaign.color + ' text-white shadow-lg'
                  : 'bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {campaign.title}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Matches List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Round Selector */}
            <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setIsRoundDropdownOpen(!isRoundDropdownOpen)}
                  className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-[#FF4444] transition-colors"
                >
                  Vòng {selectedRound}
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isRoundDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl shadow-lg py-2 min-w-[150px] z-10">
                    {rounds.map((round) => (
                      <button
                        key={round.number}
                        onClick={() => {
                          setSelectedRound(round.number);
                          setIsRoundDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          selectedRound === round.number ? 'bg-slate-50 dark:bg-slate-800' : ''
                        }`}
                      >
                        <span className={round.status === 'closed' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}>
                          {round.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('unpredicted')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'unpredicted'
                      ? 'bg-[#FF4444] text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Chưa dự đoán
                </button>
                <button
                  onClick={() => setActiveTab('predicted')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'predicted'
                      ? 'bg-[#FF4444] text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Đã dự đoán
                </button>
              </div>
            </div>

            {/* Matches */}
            {matches.map((match, index) => {
              const currentRound = rounds.find(r => r.number === selectedRound);
              const isClosed = currentRound?.status === 'closed';
              
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-6 hover:shadow-lg transition-all ${
                    isClosed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {match.time}, {match.date}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-4 items-center">
                    {/* Home Team */}
                    <div className="col-span-2 text-center">
                      <div className="text-3xl mb-2">{match.homeTeam.logo}</div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {match.homeTeam.name}
                      </p>
                      <div className="mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {match.aiPrediction.home}%
                        </p>
                      </div>
                    </div>

                    {/* Draw */}
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Hoà</p>
                      <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {match.aiPrediction.draw}%
                        </p>
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="col-span-2 text-center">
                      <div className="text-3xl mb-2">{match.awayTeam.logo}</div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">
                        {match.awayTeam.name}
                      </p>
                      <div className="mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {match.aiPrediction.away}%
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="col-span-2 text-right">
                      {isClosed ? (
                        <Button
                          disabled
                          className="bg-slate-400 text-white cursor-not-allowed"
                        >
                          Dừng dự đoán
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleMatchClick(match)}
                          className="bg-gradient-to-r from-[#00D9FF] to-[#00B8D4] hover:from-[#00E8FF] hover:to-[#00C8E4] text-white font-semibold"
                        >
                          Dự đoán ngay
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Leaderboard */}
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                BXH V.League
              </h3>
            </div>

            {/* Table Header */}
            <div className="flex items-center gap-3 px-3 pb-3 mb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="w-8 text-center">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hạng</p>
              </div>
              <div className="text-2xl opacity-0">🔴</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Đội</p>
              </div>
              <div className="w-12 text-center">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Điểm</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { rank: 1, team: 'Hà Nội FC', points: '52', logo: '🔴' },
                { rank: 2, team: 'Công An HN', points: '48', logo: '🔵' },
                { rank: 3, team: 'Viettel FC', points: '45', logo: '🔴' },
                { rank: 4, team: 'HAGL', points: '42', logo: '🟡' },
                { rank: 5, team: 'HCM City', points: '40', logo: '🔵' },
                { rank: 6, team: 'Bình Dương', points: '38', logo: '🔵' },
                { rank: 7, team: 'Thanh Hóa', points: '35', logo: '🔵' },
                { rank: 8, team: 'SLNA', points: '33', logo: '🟠' },
                { rank: 9, team: 'Nam Định', points: '30', logo: '🟡' },
                { rank: 10, team: 'Hải Phòng', points: '28', logo: '🔵' },
              ].map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    item.rank <= 3
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.rank}
                  </div>
                  <div className="text-2xl">{item.logo}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {item.team}
                    </p>
                  </div>
                  <p className="font-mono text-lg font-bold text-slate-900 dark:text-white w-12 text-center">
                    {item.points}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Match Prediction Modal */}
        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Dự đoán trận đấu</DialogTitle>
            </DialogHeader>

            {selectedMatch && (
              <div className="space-y-6 mt-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h3 className="font-display font-bold text-xl mb-2">
                    {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedMatch.time}, {selectedMatch.date}
                  </p>
                </div>

                {/* AI Prediction */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 rounded-xl p-6 border border-purple-200 dark:border-purple-500/30">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Dự đoán AI
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {selectedMatch.homeTeam.name}
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {selectedMatch.aiPrediction.home}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Hoà</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {selectedMatch.aiPrediction.draw}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {selectedMatch.awayTeam.name}
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">
                        {selectedMatch.aiPrediction.away}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Selection */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Dự đoán của bạn
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'home', label: selectedMatch.homeTeam.name, logo: selectedMatch.homeTeam.logo },
                      { value: 'draw', label: 'Hoà', logo: '🤝' },
                      { value: 'away', label: selectedMatch.awayTeam.name, logo: selectedMatch.awayTeam.logo },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setMatchPrediction(option.value as any)}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          matchPrediction === option.value
                            ? 'border-[#FF4444] bg-red-50 dark:bg-red-500/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="text-4xl mb-2">{option.logo}</div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {option.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMatch(null)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!matchPrediction}
                    className="flex-1 bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Xác nhận dự đoán
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Special Campaign Modal */}
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">
                {specialCampaigns.find(c => c.id === selectedCampaign)?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedCampaign && (
              <div className="space-y-6 mt-4">
                {/* Campaign Info */}
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <h3 className="font-display font-bold text-xl mb-2">
                    {specialCampaigns.find(c => c.id === selectedCampaign)?.subtitle}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Kết thúc: {specialCampaigns.find(c => c.id === selectedCampaign)?.endDate}
                  </p>
                </div>

                {/* Top 6 Selection */}
                {selectedCampaign === 'top6' && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                      Chọn 6 đội ({selectedTeams.length}/6)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vleagueTeams.map((team) => {
                        const index = selectedTeams.indexOf(team.id);
                        const isSelected = index !== -1;
                        return (
                          <button
                            key={team.id}
                            onClick={() => handleTeamSelect(team.id)}
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-[#FF4444] bg-red-50 dark:bg-red-500/10'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#FF4444] text-white flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                            )}
                            <div className="text-3xl mb-2">{team.logo}</div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">
                              {team.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* POTM/Top Scorer/POTS - Two Step Selection */}
                {['potm', 'topscorer', 'pots'].includes(selectedCampaign || '') && (
                  <div className="space-y-6">
                    {/* Step 1: Select Team */}
                    {!selectedTeam && (
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                          Bước 1: Chọn đội bóng
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {vleagueTeams.map((team) => (
                            <button
                              key={team.id}
                              onClick={() => handleTeamSelect(team.id)}
                              className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#FF4444] hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                            >
                              <div className="text-3xl mb-2">{team.logo}</div>
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                {team.name}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Select Player */}
                    {selectedTeam && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            Bước 2: Chọn cầu thủ từ {vleagueTeams.find(t => t.id === selectedTeam)?.name}
                          </h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTeam(null)}
                          >
                            Đổi đội
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getPlayersForTeam(selectedTeam).map((player) => (
                            <button
                              key={player.id}
                              onClick={() => setSelectedPlayer(player.id)}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                selectedPlayer === player.id
                                  ? 'border-[#FF4444] bg-red-50 dark:bg-red-500/10'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{player.logo}</div>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900 dark:text-white">
                                    {player.name}
                                  </p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {player.goals} bàn thắng
                                  </p>
                                </div>
                                {selectedPlayer === player.id && (
                                  <Check className="w-5 h-5 text-[#FF4444]" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Champion Selection */}
                {selectedCampaign === 'champion' && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                      Chọn đội vô địch
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vleagueTeams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => handleTeamSelect(team.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedTeams.includes(team.id)
                              ? 'border-[#FF4444] bg-red-50 dark:bg-red-500/10'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="text-3xl mb-2">{team.logo}</div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {team.name}
                          </p>
                          {selectedTeams.includes(team.id) && (
                            <div className="mt-2">
                              <Check className="w-5 h-5 text-[#FF4444] mx-auto" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCampaign(null);
                      setSelectedTeams([]);
                      setSelectedTeam(null);
                      setSelectedPlayer(null);
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      (selectedCampaign === 'top6' && selectedTeams.length !== 6) ||
                      (['potm', 'topscorer', 'pots'].includes(selectedCampaign || '') && !selectedPlayer) ||
                      (selectedCampaign === 'champion' && selectedTeams.length !== 1)
                    }
                    className="flex-1 bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Xác nhận dự đoán
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
