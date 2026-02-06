import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingUp,
  Clock,
  Users,
  Target,
  Award,
  Flame,
  Star,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data cho upcoming matches
const upcomingMatches = [
  {
    id: "1",
    homeTeam: "Hà Nội FC",
    awayTeam: "Hoàng Anh Gia Lai",
    date: "2024-12-25",
    time: "19:00",
    venue: "Sân Hàng Đẫy",
    league: "V.League 1",
    totalPredictions: 1247,
    status: "open",
  },
  {
    id: "2",
    homeTeam: "Công An Hà Nội",
    awayTeam: "Viettel FC",
    date: "2024-12-26",
    time: "18:00",
    venue: "Sân Hàng Đẫy",
    league: "V.League 1",
    totalPredictions: 892,
    status: "open",
  },
  {
    id: "3",
    homeTeam: "Hồ Chí Minh City",
    awayTeam: "Bình Dương",
    date: "2024-12-27",
    time: "17:00",
    venue: "Sân Thống Nhất",
    league: "V.League 1",
    totalPredictions: 654,
    status: "open",
  },
];

// Mock data cho leaderboard
const leaderboard = [
  {
    rank: 1,
    username: "NguyenVanA",
    avatar: "🏆",
    correctPredictions: 45,
    totalPredictions: 52,
    accuracy: 86.5,
    points: 450,
    streak: 8,
    rewards: ["🎁 Áo đấu V.League", "🎟️ Vé VIP trận chung kết"],
  },
  {
    rank: 2,
    username: "TranThiB",
    avatar: "⚽",
    correctPredictions: 42,
    totalPredictions: 50,
    accuracy: 84.0,
    points: 420,
    streak: 5,
    rewards: ["🎟️ Vé trận đấu"],
  },
  {
    rank: 3,
    username: "LeVanC",
    avatar: "🎯",
    correctPredictions: 38,
    totalPredictions: 48,
    accuracy: 79.2,
    points: 380,
    streak: 3,
    rewards: [],
  },
  {
    rank: 4,
    username: "PhamThiD",
    avatar: "⭐",
    correctPredictions: 35,
    totalPredictions: 47,
    accuracy: 74.5,
    points: 350,
    streak: 2,
    rewards: [],
  },
  {
    rank: 5,
    username: "HoangVanE",
    avatar: "🔥",
    correctPredictions: 33,
    totalPredictions: 46,
    accuracy: 71.7,
    points: 330,
    streak: 4,
    rewards: [],
  },
];

export default function PredictionsPage() {
  const [selectedMatch, setSelectedMatch] = useState<typeof upcomingMatches[0] | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [isPredictionDialogOpen, setIsPredictionDialogOpen] = useState(false);

  const handlePredict = (match: typeof upcomingMatches[0]) => {
    setSelectedMatch(match);
    setHomeScore("");
    setAwayScore("");
    setIsPredictionDialogOpen(true);
  };

  const handleSubmitPrediction = () => {
    // Logic to submit prediction
    console.log("Prediction:", { match: selectedMatch, homeScore, awayScore });
    setIsPredictionDialogOpen(false);
    setSelectedMatch(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-200 dark:border-amber-500/30 mb-6">
            <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Dự đoán & Nhận quà
            </span>
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white mb-4">
            Dự Đoán Tỉ Số
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Thể hiện kiến thức bóng đá của bạn! Dự đoán chính xác để leo top và nhận quà hấp dẫn từ chúng tôi.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Users, label: "Người tham gia", value: "2,847", color: "blue" },
            { icon: Target, label: "Dự đoán hôm nay", value: "1,247", color: "green" },
            { icon: Award, label: "Phần quà đã trao", value: "156", color: "amber" },
            { icon: Flame, label: "Streak cao nhất", value: "15", color: "red" },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${
                stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                stat.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              }`} />
              <p className="font-mono text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="predict" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="predict" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Target className="w-4 h-4 mr-2" />
              Dự đoán
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              <Trophy className="w-4 h-4 mr-2" />
              Bảng xếp hạng
            </TabsTrigger>
          </TabsList>

          {/* Predictions Tab */}
          <TabsContent value="predict" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-6">
                Trận đấu sắp diễn ra
              </h2>
              <div className="grid gap-6">
                {upcomingMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-xs">
                        {match.league}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{match.totalPredictions} dự đoán</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      {/* Home Team */}
                      <div className="flex-1 text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/20 dark:to-blue-500/10 flex items-center justify-center mx-auto mb-3 border border-blue-200 dark:border-blue-500/30">
                          <span className="text-2xl">🏠</span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                          {match.homeTeam}
                        </h3>
                      </div>

                      {/* VS */}
                      <div className="px-8">
                        <div className="text-center">
                          <p className="font-mono text-3xl font-bold text-slate-400 dark:text-slate-500">VS</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
                            <Clock className="w-4 h-4" />
                            <span>{match.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-500/20 dark:to-red-500/10 flex items-center justify-center mx-auto mb-3 border border-red-200 dark:border-red-500/30">
                          <span className="text-2xl">⚽</span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                          {match.awayTeam}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{match.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span>{match.venue}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePredict(match)}
                        className="bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white hover:shadow-lg transition-all duration-200"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Dự đoán ngay
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  Bảng xếp hạng cao thủ
                </h2>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  Tháng 12/2024
                </Badge>
              </div>

              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {leaderboard.slice(0, 3).map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`relative ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}
                  >
                    <div className={`bg-gradient-to-br ${
                      index === 0 
                        ? 'from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 border-amber-300 dark:border-amber-500/30' 
                        : index === 1
                        ? 'from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-slate-300 dark:border-slate-600'
                        : 'from-orange-100 to-amber-100 dark:from-orange-500/20 dark:to-amber-500/20 border-orange-300 dark:border-orange-500/30'
                    } border-2 rounded-2xl p-6 text-center ${index === 0 ? 'pt-8' : 'pt-12'}`}>
                      {/* Rank Badge */}
                      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full ${
                        index === 0 
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500' 
                          : index === 1
                          ? 'bg-gradient-to-br from-slate-300 to-slate-400'
                          : 'bg-gradient-to-br from-orange-400 to-amber-500'
                      } flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {user.rank}
                      </div>

                      <div className="text-5xl mb-3">{user.avatar}</div>
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                        {user.username}
                      </h3>
                      <div className="space-y-2">
                        <p className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                          {user.points} điểm
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {user.correctPredictions}/{user.totalPredictions} đúng ({user.accuracy}%)
                        </p>
                        {user.streak > 0 && (
                          <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400">
                            <Flame className="w-4 h-4" />
                            <span className="text-sm font-semibold">{user.streak} streak</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Rest of Leaderboard */}
              <div className="space-y-3">
                {leaderboard.slice(3).map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                        {user.rank}
                      </div>
                      <div className="text-3xl">{user.avatar}</div>
                      <div className="flex-1">
                        <h4 className="font-display font-bold text-slate-900 dark:text-white">
                          {user.username}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {user.correctPredictions}/{user.totalPredictions} đúng • {user.accuracy}%
                        </p>
                      </div>
                      {user.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                          <Flame className="w-4 h-4" />
                          <span className="text-sm font-semibold">{user.streak}</span>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="font-mono text-xl font-bold text-slate-900 dark:text-white">
                          {user.points}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">điểm</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Rewards Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                    Phần thưởng hấp dẫn
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { rank: "Top 1", reward: "Áo đấu V.League + Vé VIP chung kết", icon: "🏆" },
                    { rank: "Top 2-5", reward: "Vé trận đấu + Voucher 500K", icon: "🎟️" },
                    { rank: "Top 6-10", reward: "Voucher 200K", icon: "🎁" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center border border-purple-200 dark:border-purple-500/30"
                    >
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                        {item.rank}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.reward}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Prediction Dialog */}
        <Dialog open={isPredictionDialogOpen} onOpenChange={setIsPredictionDialogOpen}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Dự đoán tỉ số
              </DialogTitle>
            </DialogHeader>
            {selectedMatch && (
              <div className="space-y-6 mt-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {selectedMatch.date} • {selectedMatch.time}
                  </p>
                  <p className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {selectedMatch.homeTeam}
                    </p>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={homeScore}
                      onChange={(e) => setHomeScore(e.target.value)}
                      className="text-center text-2xl font-bold h-16"
                      placeholder="0"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-400 dark:text-slate-500">-</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {selectedMatch.awayTeam}
                    </p>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={awayScore}
                      onChange={(e) => setAwayScore(e.target.value)}
                      className="text-center text-2xl font-bold h-16"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Lưu ý:</strong> Bạn chỉ có thể dự đoán một lần cho mỗi trận đấu. 
                    Dự đoán chính xác sẽ được cộng điểm vào bảng xếp hạng!
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsPredictionDialogOpen(false)}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSubmitPrediction}
                    disabled={!homeScore || !awayScore}
                    className="flex-1 bg-gradient-to-r from-[#FF4444] to-[#FF6666] text-white"
                  >
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
