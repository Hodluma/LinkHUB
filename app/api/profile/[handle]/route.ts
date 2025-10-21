import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { handle: string } }) {
  const profile = await prisma.profile.findUnique({
    where: { handle: params.handle },
    include: {
      links: { orderBy: { sort: "asc" } },
      socials: { orderBy: { sort: "asc" } }
    }
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
