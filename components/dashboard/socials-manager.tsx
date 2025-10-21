"use client";

import { useMemo, useState } from "react";
import { SUPPORTED_SOCIALS } from "@/lib/constants";

interface SocialItem {
  id: string;
  platform: string;
  url: string;
  sort: number;
}

interface SocialsManagerProps {
  profileId: string;
  socials: SocialItem[];
  plan: string;
}

export function SocialsManager({ socials, plan }: SocialsManagerProps) {
  const [items, setItems] = useState(socials);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ platform: SUPPORTED_SOCIALS[0], url: "" });
  const [creating, setCreating] = useState(false);
  const limitReached = useMemo(() => plan !== "PRO" && items.length >= 6, [items.length, plan]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (limitReached) return;
    setCreating(true);
    setError(null);

    const response = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: form.platform,
        url: form.url,
        sort: items.length
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to add social link");
      setCreating(false);
      return;
    }

    const body = await response.json();
    setItems((prev) => [...prev, body.social]);
    setCreating(false);
    setForm({ platform: SUPPORTED_SOCIALS[0], url: "" });
  }

  async function handleUpdate(id: string, patch: Partial<SocialItem>) {
    setError(null);
    const response = await fetch(`/api/social/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to update social link");
      return;
    }

    const body = await response.json();
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...body.social } : item)));
  }

  async function handleDelete(id: string) {
    setError(null);
    const response = await fetch(`/api/social/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete social");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Socials</h2>
          <p className="text-sm text-white/60">Connect your audience to your other platforms.</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
          {items.length} / {plan === "PRO" ? "∞" : 6}
        </span>
      </header>
      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-2xl bg-white/10 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Add social</h3>
        <select
          className="rounded-xl bg-slate-900/40 px-3 py-2 text-sm text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
          value={form.platform}
          onChange={(event) => setForm((prev) => ({ ...prev, platform: event.target.value }))}
          disabled={limitReached}
        >
          {SUPPORTED_SOCIALS.map((platform) => (
            <option key={platform} value={platform} className="text-slate-900">
              {platform}
            </option>
          ))}
        </select>
        <input
          className="rounded-xl bg-slate-900/40 px-3 py-2 text-sm text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
          placeholder="https://..."
          value={form.url}
          onChange={(event) => setForm((prev) => ({ ...prev, url: event.target.value }))}
          required
          disabled={limitReached}
        />
        <button
          type="submit"
          disabled={creating || limitReached}
          className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:bg-white/50"
        >
          {limitReached ? "Upgrade for more" : creating ? "Adding..." : "Add social"}
        </button>
      </form>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between text-sm font-medium text-white">
              <span className="capitalize">{item.platform}</span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleUpdate(item.id, { platform: item.platform, url: item.url })}
                  className="rounded-lg bg-white px-3 py-1 font-medium text-slate-900 hover:bg-white/80"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg bg-rose-500/80 px-3 py-1 font-medium text-white hover:bg-rose-400"
                >
                  Delete
                </button>
              </div>
            </div>
            <input
              className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
              value={item.url}
              onChange={(event) =>
                setItems((prev) => prev.map((social) => (social.id === item.id ? { ...social, url: event.target.value } : social)))
              }
            />
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </section>
  );
}
