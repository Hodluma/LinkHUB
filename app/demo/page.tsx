import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <h1 className="text-4xl font-semibold">Demo</h1>
      <p className="max-w-xl text-white/70">
        After you create your first profile you will be able to preview it at <code className="rounded bg-white/10 px-2 py-1">/your-handle</code>.
      </p>
      <Link
        href="/dashboard"
        className="rounded-full bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-white/80"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
