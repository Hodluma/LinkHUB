import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { getUserPrimaryProfile } from "@/lib/profile";
import { prisma } from "@/lib/db";
import { MAX_FREE_SOCIALS } from "@/lib/constants";
import { socialInputSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = socialInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const profile = await getUserPrimaryProfile(session.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (session.user.plan !== "PRO" && profile.socials.length >= MAX_FREE_SOCIALS) {
    return NextResponse.json({ error: "Social limit reached" }, { status: 403 });
  }

  const social = await prisma.social.create({
    data: {
      profileId: profile.id,
      platform: parsed.data.platform,
      url: parsed.data.url,
      sort: parsed.data.sort ?? profile.socials.length
    }
  });

  return NextResponse.json({ social });
}
