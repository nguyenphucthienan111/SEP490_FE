import { useState, useEffect } from 'react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';
import { authService } from '@/services/authService';

let cached: SubscriptionStatus | null = null;
let cachedDailyAi: { limit: number; used: number; remaining: number } | null = null;

export function useSubscription() {
  const [sub, setSub] = useState<SubscriptionStatus | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [dailyAi, setDailyAi] = useState(cachedDailyAi);

  useEffect(() => {
    if (!authService.isAuthenticated()) { setLoading(false); return; }
    const fetches: Promise<void>[] = [];

    if (!cached) {
      fetches.push(
        subscriptionService.getMySubscription()
          .then(s => { cached = s; setSub(s); })
          .catch(() => {})
      );
    } else {
      setSub(cached);
    }

    if (!cachedDailyAi) {
      fetches.push(
        subscriptionService.getDailyAiAnalysisLimit()
          .then(d => { cachedDailyAi = d; setDailyAi(d); })
          .catch(() => {})
      );
    } else {
      setDailyAi(cachedDailyAi);
    }

    if (fetches.length > 0) {
      Promise.all(fetches).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const isPremium = sub?.isActive ?? false;
  const aiCredits = sub?.aiVideoCreditsRemaining ?? 0;
  const forumCredits = sub?.forumPostCreditsRemaining ?? 0;
  // Legacy field kept for video analysis page compatibility
  const aiMatchCredits = dailyAi?.remaining ?? 0;

  const refresh = async () => {
    cached = null;
    cachedDailyAi = null;
    const [s, d] = await Promise.all([
      subscriptionService.getMySubscription(),
      subscriptionService.getDailyAiAnalysisLimit().catch(() => null),
    ]);
    cached = s; setSub(s);
    if (d) { cachedDailyAi = d; setDailyAi(d); }
  };

  return { sub, loading, isPremium, aiCredits, forumCredits, aiMatchCredits, dailyAi, refresh };
}

export function invalidateSubscriptionCache() { cached = null; cachedDailyAi = null; }
