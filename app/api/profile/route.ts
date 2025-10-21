import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { handleSchema, profileUpdateSchema } from "@/lib/validators";
import { getUserPrimaryProfile } from "@/lib/profile";

const themeFallback = {
  name: "Aurora",
  background: "from-purple-500 via-indigo-500 to-sky-500",
  text: "text-white",
  button: "bg-white/10 text-white hover:bg-white/20",
  radius: "xl"
};

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { displayName, bio, avatarUrl, theme, density, verified } = parsed.data;

  const profile = await getUserPrimaryProfile(session.user.id);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (verified && session.user.plan !== "PRO") {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      displayName,
      bio,
      avatarUrl,
      theme,
      density,
      verified: verified ?? profile.verified
    }
  });

  return NextResponse.json({ profile: updated });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = handleSchema.safeParse(body?.handle);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const existingHandle = await prisma.profile.findUnique({ where: { handle: parsed.data } });
  if (existingHandle) {
    return NextResponse.json({ error: "Handle already in use" }, { status: 409 });
  }

  const profile = await prisma.profile.create({
    data: {
      userId: session.user.id,
      handle: parsed.data,
      displayName: session.user.name ?? parsed.data,
      theme: themeFallback
    }
  });

  return NextResponse.json({ profile });
}
