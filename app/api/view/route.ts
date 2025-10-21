import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashIp } from "@/lib/utils";

export async function POST(request: Request) {
  const { profileId } = await request.json();
  if (!profileId) {
    return NextResponse.json({ error: "Missing profileId" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({ where: { id: profileId } });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = await hashIp(ip);

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: profile.id },
      data: { views: { increment: 1 } }
    }),
    prisma.viewEvent.create({
      data: {
        profileId: profile.id,
        referrer: request.headers.get("referer"),
        ua: request.headers.get("user-agent"),
        ipHash
      }
    })
  ]);

  return new NextResponse(null, { status: 204 });
}
