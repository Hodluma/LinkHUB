import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { linkInputSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = linkInputSchema.partial().safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const link = await prisma.link.findUnique({ where: { id: params.id } });
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: link.profileId } });
  if (!profile || profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.link.update({
    where: { id: link.id },
    data: {
      label: parsed.data.label ?? link.label,
      url: parsed.data.url ?? link.url,
      badge: parsed.data.badge ?? link.badge,
      icon: parsed.data.icon ?? link.icon,
      sort: parsed.data.sort ?? link.sort,
      enabled: parsed.data.enabled ?? link.enabled,
      startAt:
        parsed.data.startAt === undefined
          ? link.startAt
          : parsed.data.startAt
            ? new Date(parsed.data.startAt)
            : null,
      endAt:
        parsed.data.endAt === undefined
          ? link.endAt
          : parsed.data.endAt
            ? new Date(parsed.data.endAt)
            : null
    }
  });

  return NextResponse.json({ link: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await prisma.link.findUnique({ where: { id: params.id } });
  if (!link) {
    return NextResponse.json({ ok: true });
  }

  const profile = await prisma.profile.findUnique({ where: { id: link.profileId } });
  if (!profile || profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.link.delete({ where: { id: link.id } });
  return NextResponse.json({ ok: true });
}
