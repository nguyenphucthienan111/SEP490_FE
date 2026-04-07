import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { checkInService } from "@/services/checkInService";
import { authService } from "@/services/authService";
import CheckInCalendar from "./CheckInCalendar";

const STORAGE_KEY = "checkin_popup_shown";

export default function CheckInPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const tryShow = () => {
      if (!authService.isAuthenticated()) return;

      const today = new Date().toISOString().slice(0, 10);
      const shown = localStorage.getItem(STORAGE_KEY);
      if (shown === today) return;

      setTimeout(() => {
        checkInService.getStatus()
          .then(status => {
            if (!status.checkedInToday) setOpen(true);
            localStorage.setItem(STORAGE_KEY, today);
          })
          .catch(() => {
            setOpen(true);
            localStorage.setItem(STORAGE_KEY, today);
          });
      }, 500);
    };

    // Run on mount (if already logged in)
    tryShow();

    // Re-run when localStorage changes (e.g. after login on another tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken" && e.newValue) tryShow();
    };
    // Re-run on login event (same tab)
    const onLogin = () => tryShow();
    // Open manually from header
    const onOpen = () => setOpen(true);

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:login", onLogin);
    window.addEventListener("checkin:open", onOpen);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:login", onLogin);
      window.removeEventListener("checkin:open", onOpen);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative w-full max-w-sm shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <CheckInCalendar onCheckedIn={() => setTimeout(() => setOpen(false), 2000)} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
