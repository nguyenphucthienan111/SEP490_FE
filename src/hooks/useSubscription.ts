import { useState, useEffect } from 'react';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';
import { authService } from '@/services/authService';

let cached: SubscriptionStatus | null = null;

export function useSubscription() {
  const [sub, setSub] = useState<SubscriptionStatus | null>(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (!authService.isAuthenticated()) { setLoading(false); return; }
    if (cached) { setSub(cached); setLoading(false); return; }
    subscriptionService.getMySubscription()
      .then(s => { cached = s; setSub(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isPremium = sub?.isActive ?? false;
  const aiCredits = sub?.aiVideoCreditsRemaining ?? 0;
  const forumCredits = sub?.forumPostCreditsRemaining ?? 0;
  const aiMatchCredits = sub?.aiMatchAnalysisRemaining ?? 0;

  const refresh = async () => {
    cached = null;
    const s = await subscriptionService.getMySubscription();
    cached = s; setSub(s);
  };

  return { sub, loading, isPremium, aiCredits, forumCredits, aiMatchCredits, refresh };
}

export function invalidateSubscriptionCache() { cached = null; }
