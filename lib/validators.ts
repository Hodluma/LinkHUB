import { z } from "zod";
import { HANDLE_REGEX, PUBLIC_URL_PROTOCOLS, SUPPORTED_SOCIALS } from "@/lib/constants";

const urlProtocolCheck = (value: string) => {
  try {
    const url = new URL(value);
    return PUBLIC_URL_PROTOCOLS.includes(url.protocol);
  } catch (error) {
    return false;
  }
};

export const handleSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(HANDLE_REGEX, "Handle must contain only lowercase letters, numbers, dot, underscore or dash");

export const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(80),
  bio: z.string().max(240).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  theme: z.record(z.any()),
  density: z.enum(["compact", "comfortable", "relaxed"]),
  verified: z.boolean().optional()
});

export const socialInputSchema = z.object({
  id: z.string().cuid().optional(),
  platform: z.enum(SUPPORTED_SOCIALS),
  url: z.string().url().refine(urlProtocolCheck, "Unsupported protocol"),
  sort: z.number().int().min(0).optional()
});

export const linkInputSchema = z.object({
  id: z.string().cuid().optional(),
  label: z.string().min(1).max(60),
  url: z.string().url().refine(urlProtocolCheck, "Unsupported protocol"),
  badge: z.string().max(24).optional().nullable(),
  icon: z.string().max(40).optional().nullable(),
  sort: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
  startAt: z.string().datetime().optional().nullable(),
  endAt: z.string().datetime().optional().nullable()
});

export const analyticsWindowSchema = z.object({
  days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(365)]).default(30)
});
