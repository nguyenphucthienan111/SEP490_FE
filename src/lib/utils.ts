import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format match minute: 91 → "90+1", 46 → "45+1", 93 → "90+3", etc. */
export function formatMinute(minute: number): string {
  if (minute > 90) return `90+${minute - 90}`;
  if (minute > 45) return `45+${minute - 45}`;
  return `${minute}`;
}
