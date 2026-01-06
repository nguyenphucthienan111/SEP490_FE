import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const PlayersPage = lazy(() => import("@/pages/PlayersPage"));
const PlayerDetailPage = lazy(() => import("@/pages/PlayerDetailPage"));
const MatchesPage = lazy(() => import("@/pages/MatchesPage"));
const MatchDetailPage = lazy(() => import("@/pages/MatchDetailPage"));
const LeaguesPage = lazy(() => import("@/pages/LeaguesPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminPlayersPage = lazy(() => import("@/pages/admin/AdminPlayersPage"));
const AdminMatchesPage = lazy(() => import("@/pages/admin/AdminMatchesPage"));
const AdminRatingsPage = lazy(() => import("@/pages/admin/AdminRatingsPage"));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center animate-pulse">
          <span className="font-display font-extrabold text-white text-xl">VN</span>
        </div>
        <p className="text-[#A8A29E] font-body">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/matches/:matchId" element={<MatchDetailPage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
        <Route path="/leagues/:leagueId" element={<LeaguesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/analytics/:articleId" element={<AnalyticsPage />} />
        <Route path="/compare" element={<ComparePage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/players" element={<AdminPlayersPage />} />
        <Route path="/admin/matches" element={<AdminMatchesPage />} />
        <Route path="/admin/leagues" element={<AdminDashboard />} />
        <Route path="/admin/ratings" element={<AdminRatingsPage />} />
        <Route path="/admin/content" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}

export default App;
