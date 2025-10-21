import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="rounded-full border border-white/20 px-4 py-1 text-sm uppercase tracking-widest text-white/70">
        Link-in-bio for builders
      </span>
      <h1 className="text-4xl font-semibold sm:text-6xl">Create a beautiful profile in minutes</h1>
      <p className="max-w-2xl text-lg text-white/70">
        LinkHUB helps you share every important link in one place. Customize your theme, track clicks, and keep your
        brand consistent.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-white/80"
        >
          Go to dashboard
        </Link>
        <Link
          href="/demo"
          className="rounded-full border border-white/20 px-6 py-3 font-medium text-white transition hover:border-white"
        >
          View demo profile
        </Link>
      </div>
    </main>
  );
}
