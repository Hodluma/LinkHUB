import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profiles: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          handle: true,
          displayName: true,
          updatedAt: true,
          views: true
        }
      }
    }
  });

  return NextResponse.json({ user });
}
