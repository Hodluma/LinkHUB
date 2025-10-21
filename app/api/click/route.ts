import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashIp } from "@/lib/utils";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let linkId: string | null = null;

  if (contentType.includes("application/json")) {
    const body = await request.json();
    linkId = body.linkId;
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await request.text();
    const params = new URLSearchParams(body);
    linkId = params.get("linkId");
  } else {
    const form = await request.formData().catch(() => null);
    linkId = form?.get("linkId") as string | null;
  }

  if (!linkId) {
    return NextResponse.json({ error: "Missing linkId" }, { status: 400 });
  }

  const link = await prisma.link.findUnique({ where: { id: linkId } });
  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = await hashIp(ip);

  await prisma.$transaction([
    prisma.link.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } }
    }),
    prisma.clickEvent.create({
      data: {
        linkId: link.id,
        profileId: link.profileId,
        referrer: request.headers.get("referer"),
        ua: request.headers.get("user-agent"),
        ipHash
      }
    })
  ]);

  return new NextResponse(null, { status: 204 });
}
