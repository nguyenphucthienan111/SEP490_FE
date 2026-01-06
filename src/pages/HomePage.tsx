import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { LeagueGrid } from '@/components/home/LeagueGrid';
import { FeaturedPlayers } from '@/components/home/FeaturedPlayers';
import { MatchCenter } from '@/components/home/MatchCenter';
import { AnalyticsHub } from '@/components/home/AnalyticsHub';

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <LeagueGrid />
      <FeaturedPlayers />
      <MatchCenter />
      <AnalyticsHub />
    </MainLayout>
  );
}
