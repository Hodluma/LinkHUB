import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { DENSITY_SPACING } from "@/lib/constants";
import { cn, hashIp } from "@/lib/utils";
import { LinkButtons } from "@/components/profile/link-buttons";

interface ProfilePageProps {
  params: { handle: string };
}

type ThemeConfig = {
  name: string;
  background: string;
  text: string;
  button: string;
  radius: string;
};

const themeFallback: ThemeConfig = {
  name: "Aurora",
  background: "from-purple-500 via-indigo-500 to-sky-500",
  text: "text-white",
  button: "bg-white/10 text-white hover:bg-white/20",
  radius: "xl"
};

export async function generateMetadata({ params }: ProfilePageProps) {
  const profile = await prisma.profile.findUnique({
    where: { handle: params.handle }
  });

  if (!profile) return {};

  const title = `${profile.displayName} | LinkHUB`;
  const description = profile.bio ?? "Discover curated links.";
  const images = profile.avatarUrl ? [profile.avatarUrl] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images
    }
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const profile = await prisma.profile.findUnique({
    where: { handle: params.handle },
    include: {
      links: {
        where: { enabled: true },
        orderBy: { sort: "asc" }
      },
      socials: {
        orderBy: { sort: "asc" }
      }
    }
  });

  if (!profile) {
    notFound();
  }

  const now = new Date();
  const activeLinks = profile.links.filter((link) => {
    if (link.startAt && link.startAt > now) return false;
    if (link.endAt && link.endAt < now) return false;
    return true;
  });

  const theme = {
    ...themeFallback,
    ...(typeof profile.theme === "object" && !Array.isArray(profile.theme) ? profile.theme : {})
  } as ThemeConfig;

  const densityClass = DENSITY_SPACING[profile.density as keyof typeof DENSITY_SPACING] ?? DENSITY_SPACING.comfortable;

  const headersList = headers();
  const referrer = headersList.get("referer");
  const userAgent = headersList.get("user-agent");
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = await hashIp(ip);

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: profile.id },
      data: { views: { increment: 1 } }
    }),
    prisma.viewEvent.create({
      data: {
        profileId: profile.id,
        referrer,
        ua: userAgent,
        ipHash
      }
    })
  ]);

  return (
    <main
      className={cn(
        "min-h-screen w-full bg-gradient-to-br",
        theme.background,
        theme.text,
        "flex flex-col items-center px-6 py-16"
      )}
    >
      <article className="flex w-full max-w-lg flex-col items-center text-center">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={`${profile.displayName} avatar`}
            width={112}
            height={112}
            className="mb-6 h-28 w-28 rounded-full border-4 border-white/40 object-cover"
          />
        ) : (
          <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/40 bg-white/20 text-4xl font-semibold">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <h1 className="text-3xl font-semibold sm:text-4xl">{profile.displayName}</h1>
        {profile.bio && <p className="mt-3 max-w-md text-base/relaxed text-white/80">{profile.bio}</p>}
        <div className={cn("mt-8 w-full", densityClass)}>
          <LinkButtons
            links={activeLinks.map((link) => ({
              id: link.id,
              label: link.label,
              url: link.url,
              badge: link.badge
            }))}
            buttonClassName={cn(theme.button, `rounded-${theme.radius ?? "xl"}`)}
          />
        </div>
        {profile.socials.length > 0 && (
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
            {profile.socials.map((social) => (
              <li key={social.id}>
                <a href={social.url} className="hover:text-white" rel="noreferrer" target="_blank">
                  {social.platform}
                </a>
              </li>
            ))}
          </ul>
        )}
      </article>
    </main>
  );
}
