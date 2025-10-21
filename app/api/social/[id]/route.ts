import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { socialInputSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = socialInputSchema.partial().safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const social = await prisma.social.findUnique({ where: { id: params.id } });
  if (!social) {
    return NextResponse.json({ error: "Social not found" }, { status: 404 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: social.profileId } });
  if (!profile || profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.social.update({
    where: { id: social.id },
    data: {
      platform: parsed.data.platform ?? social.platform,
      url: parsed.data.url ?? social.url,
      sort: parsed.data.sort ?? social.sort
    }
  });

  return NextResponse.json({ social: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const social = await prisma.social.findUnique({ where: { id: params.id } });
  if (!social) {
    return NextResponse.json({ ok: true });
  }

  const profile = await prisma.profile.findUnique({ where: { id: social.profileId } });
  if (!profile || profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.social.delete({ where: { id: social.id } });
  return NextResponse.json({ ok: true });
}
