import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getUserPrimaryProfile } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { MAX_FREE_LINKS } from "@/lib/constants";
import { linkInputSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = linkInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const profile = await getUserPrimaryProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (session.user.plan !== "PRO" && profile.links.length >= MAX_FREE_LINKS) {
    return NextResponse.json({ error: "Link limit reached" }, { status: 403 });
  }

  const link = await prisma.link.create({
    data: {
      profileId: profile.id,
      label: parsed.data.label,
      url: parsed.data.url,
      badge: parsed.data.badge ?? null,
      icon: parsed.data.icon ?? null,
      sort: parsed.data.sort ?? profile.links.length,
      enabled: parsed.data.enabled ?? true,
      startAt: parsed.data.startAt ? new Date(parsed.data.startAt) : null,
      endAt: parsed.data.endAt ? new Date(parsed.data.endAt) : null
    }
  });

  return NextResponse.json({ link });
}
