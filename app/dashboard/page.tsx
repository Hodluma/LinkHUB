import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { THEMES } from "@/lib/constants";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { LinksManager } from "@/components/dashboard/links-manager";
import { SocialsManager } from "@/components/dashboard/socials-manager";
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";
import { CreateProfileForm } from "@/components/dashboard/create-profile-form";

type ThemeRecord = (typeof THEMES)[keyof typeof THEMES];

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
    include: {
      links: { orderBy: { sort: "asc" } },
      socials: { orderBy: { sort: "asc" } }
    }
  });

  if (!profile) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
        <header>
          <h1 className="text-4xl font-semibold">Create your profile</h1>
          <p className="mt-2 text-white/70">
            Claim your handle to start building your LinkHUB page.
          </p>
        </header>
        <CreateProfileForm />
      </main>
    );
  }

  const safeTheme = (profile.theme as ThemeRecord) ?? THEMES.aurora;
  const profilePayload = {
    id: profile.id,
    handle: profile.handle,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    theme: safeTheme,
    density: profile.density,
    verified: profile.verified,
    views: profile.views,
    links: profile.links.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      badge: link.badge,
      icon: link.icon,
      sort: link.sort,
      enabled: link.enabled,
      clicks: link.clicks,
      startAt: link.startAt?.toISOString() ?? null,
      endAt: link.endAt?.toISOString() ?? null
    })),
    socials: profile.socials.map((social) => ({
      id: social.id,
      platform: social.platform,
      url: social.url,
      sort: social.sort
    }))
  };

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30);

  const [viewsLast30, clicksLast30, topLinks] = await Promise.all([
    prisma.viewEvent.count({
      where: { profileId: profile.id, ts: { gte: thirtyDaysAgo } }
    }),
    prisma.clickEvent.count({
      where: { profileId: profile.id, ts: { gte: thirtyDaysAgo } }
    }),
    prisma.link.findMany({
      where: { profileId: profile.id },
      orderBy: { clicks: "desc" },
      take: 5,
      select: { id: true, label: true, clicks: true }
    })
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold">Dashboard</h1>
        <p className="text-white/70">Manage your profile, links, and see what resonates with your audience.</p>
      </header>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <ProfileEditor profile={profilePayload} themes={THEMES} plan={session.user.plan} />
        <AnalyticsPanel
          handle={profile.handle}
          views={profile.views}
          viewsLast30={viewsLast30}
          clicksLast30={clicksLast30}
          topLinks={topLinks}
        />
      </section>
      <section className="grid gap-8 lg:grid-cols-2">
        <LinksManager profileId={profile.id} links={profilePayload.links} plan={session.user.plan} />
        <SocialsManager profileId={profile.id} socials={profilePayload.socials} plan={session.user.plan} />
      </section>
    </main>
  );
}
