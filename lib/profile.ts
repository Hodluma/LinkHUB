import { prisma } from "@/lib/db";

export async function getUserPrimaryProfile(userId: string) {
  return prisma.profile.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      links: true,
      socials: true
    }
  });
}
