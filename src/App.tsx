import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy load pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const PlayersPage = lazy(() => import("@/pages/PlayersPage"));
const PlayerDetailPage = lazy(() => import("@/pages/PlayerDetailPage"));
const MatchesPage = lazy(() => import("@/pages/MatchesPage"));
const MatchDetailPage = lazy(() => import("@/pages/MatchDetailPage"));
const StadiumDetailPage = lazy(() => import("@/pages/StadiumDetailPage"));
const StadiumsPage = lazy(() => import("@/pages/StadiumsPage"));
const TeamDetailPage = lazy(() => import("@/pages/TeamDetailPage"));
const LeaguesPage = lazy(() => import("@/pages/LeaguesPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const PredictionsPage = lazy(() => import("@/pages/PredictionsPage"));

// Auth pages
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));

// User pages
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminPlayersPage = lazy(() => import("@/pages/admin/AdminPlayersPage"));
const AdminMatchesPage = lazy(() => import("@/pages/admin/AdminMatchesPage"));
const AdminRatingsPage = lazy(() => import("@/pages/admin/AdminRatingsPage"));
const AdminLeaguesPage = lazy(() => import("@/pages/admin/AdminLeaguesPage"));
const AdminContentPage = lazy(() => import("@/pages/admin/AdminContentPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4444] to-[#FF6666] flex items-center justify-center animate-pulse">
          <span className="font-display font-extrabold text-foreground text-xl">
            VN
          </span>
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
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/matches/:matchId" element={<MatchDetailPage />} />
        <Route path="/stadiums" element={<StadiumsPage />} />
        <Route path="/stadiums/:stadiumId" element={<StadiumDetailPage />} />
        <Route path="/teams/:teamId" element={<TeamDetailPage />} />
        <Route path="/leagues" element={<LeaguesPage />} />
        <Route path="/leagues/:leagueId" element={<LeaguesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/analytics/:articleId" element={<AnalyticsPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/predictions" element={<PredictionsPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* User Routes */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/players" element={<AdminPlayersPage />} />
        <Route path="/admin/matches" element={<AdminMatchesPage />} />
        <Route path="/admin/leagues" element={<AdminLeaguesPage />} />
        <Route path="/admin/leagues/:leagueId" element={<AdminLeaguesPage />} />
        <Route path="/admin/ratings" element={<AdminRatingsPage />} />
        <Route path="/admin/content" element={<AdminContentPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
