import { PrismaClient } from "@prisma/client";
import { THEMES } from "../lib/constants";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@linkhub.dev" },
    update: {},
    create: {
      email: "demo@linkhub.dev",
      plan: "PRO"
    }
  });

  await prisma.profile.upsert({
    where: { handle: "demo" },
    update: {},
    create: {
      userId: user.id,
      handle: "demo",
      displayName: "LinkHUB Demo",
      bio: "Your code-friendly link-in-bio. Track clicks, share everywhere.",
      theme: THEMES.aurora,
      links: {
        create: [
          { label: "Product Hunt", url: "https://producthunt.com" },
          { label: "GitHub", url: "https://github.com" }
        ]
      },
      socials: {
        create: [{ platform: "twitter", url: "https://twitter.com" }]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
