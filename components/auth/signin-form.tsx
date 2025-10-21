"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const result = await signIn("email", {
      email,
      redirect: false
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setMessage("Check your inbox for a magic link.");
    setLoading(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
      <h1 className="text-3xl font-semibold">Welcome back</h1>
      <p className="text-white/70">Sign in with email or Google to access your dashboard.</p>
      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
        <label className="text-sm text-white/70">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl bg-slate-900/40 px-4 py-3 text-base text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:bg-white/50"
        >
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-white/50">
        <span className="h-px flex-1 bg-white/10" />
        <span>or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <button
        onClick={() => signIn("google")}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-white/80"
      >
        Continue with Google
      </button>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </div>
  );
}
