import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashIp(ip: string | undefined) {
  if (!ip) return undefined;
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.IP_HASH_SECRET ?? ""));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest).slice(-2));
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function parseBoolean(value: string | null | undefined, fallback = false) {
  if (value == null) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}
