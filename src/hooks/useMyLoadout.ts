import { useState, useEffect } from "react";
import { cosmeticService, FullLoadoutDto } from "@/services/cosmeticService";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";

let cachedLoadout: FullLoadoutDto | null = null;
let cachedUserId: string | null = null;

export function useMyLoadout() {
  const [loadout, setLoadout] = useState<FullLoadoutDto | null>(cachedLoadout);
  const [userId, setUserId] = useState<string | null>(cachedUserId);

  useEffect(() => {
    if (!authService.isAuthenticated()) return;
    if (cachedLoadout && cachedUserId) {
      setLoadout(cachedLoadout);
      setUserId(cachedUserId);
      return;
    }
    userService.getMe().then(u => {
      setUserId(u.userId);
      cachedUserId = u.userId;
      return cosmeticService.getFullLoadout(u.userId);
    }).then(l => {
      setLoadout(l);
      cachedLoadout = l;
    }).catch(() => {});
  }, []);

  const refresh = async () => {
    if (!cachedUserId) return;
    const l = await cosmeticService.getFullLoadout(cachedUserId);
    setLoadout(l);
    cachedLoadout = l;
  };

  return { loadout, userId, refresh };
}

// Call this after equip to invalidate cache
export function invalidateLoadoutCache() {
  cachedLoadout = null;
}
