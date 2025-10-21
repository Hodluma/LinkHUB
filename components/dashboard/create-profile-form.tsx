"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProfileForm() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to create profile");
      setSubmitting(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-white/70">Choose your handle</span>
        <input
          className="rounded-xl bg-white/10 px-4 py-3 text-base text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/50"
          value={handle}
          onChange={(event) => setHandle(event.target.value.toLowerCase())}
          placeholder="yourname"
          minLength={3}
          maxLength={30}
          pattern="[a-z0-9._-]{3,30}"
          required
        />
      </label>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:bg-white/50"
      >
        {submitting ? "Claiming..." : "Claim handle"}
      </button>
    </form>
  );
}
