"use client";

import { useMemo, useState } from "react";

interface LinkItem {
  id: string;
  label: string;
  url: string;
  badge: string | null;
  icon: string | null;
  sort: number;
  enabled: boolean;
  clicks: number;
  startAt: string | null;
  endAt: string | null;
}

interface LinksManagerProps {
  profileId: string;
  links: LinkItem[];
  plan: string;
}

export function LinksManager({ profileId: _profileId, links, plan }: LinksManagerProps) {
  const [items, setItems] = useState(links.sort((a, b) => a.sort - b.sort));
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ label: "", url: "" });
  const limitReached = useMemo(() => plan !== "PRO" && items.length >= 10, [items.length, plan]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (limitReached) return;
    setCreating(true);
    setError(null);

    const response = await fetch("/api/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.label,
        url: form.url,
        badge: null,
        sort: items.length
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to create link");
      setCreating(false);
      return;
    }

    const body = await response.json();
    setItems((prev) => [...prev, body.link].sort((a, b) => a.sort - b.sort));
    setForm({ label: "", url: "" });
    setCreating(false);
  }

  async function handleUpdate(id: string, patch: Partial<LinkItem>) {
    setError(null);
    const response = await fetch(`/api/link/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to update link");
      return;
    }

    const body = await response.json();
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...body.link } : item)).sort((a, b) => a.sort - b.sort));
  }

  async function handleDelete(id: string) {
    setError(null);
    const response = await fetch(`/api/link/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete link");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function move(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const updated = [...items];
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    const sorted = updated.map((item, idx) => ({ ...item, sort: idx }));
    setItems(sorted);

    const source = sorted[index];
    const target = sorted[targetIndex];

    await Promise.all([
      fetch(`/api/link/${source.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort: source.sort })
      }),
      fetch(`/api/link/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort: target.sort })
      })
    ]);
  }

  return (
    <section className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Links</h2>
          <p className="text-sm text-white/60">Add and organize the destinations you want to promote.</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
          {items.length} / {plan === "PRO" ? "∞" : 10}
        </span>
      </header>
      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-2xl bg-white/10 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Add link</h3>
        <input
          className="rounded-xl bg-slate-900/40 px-3 py-2 text-sm text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
          placeholder="Label"
          value={form.label}
          onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
          required
          disabled={limitReached}
        />
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
          {limitReached ? "Upgrade for more" : creating ? "Adding..." : "Add link"}
        </button>
      </form>
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-white/60">Label</label>
                <input
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
                  value={item.label}
                  onChange={(event) =>
                    setItems((prev) => prev.map((link) => (link.id === item.id ? { ...link, label: event.target.value } : link)))
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide text-white/60">URL</label>
                <input
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
                  value={item.url}
                  onChange={(event) =>
                    setItems((prev) => prev.map((link) => (link.id === item.id ? { ...link, url: event.target.value } : link)))
                  }
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
                <span>{item.clicks} clicks</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(item.id, -1)}
                    className="rounded-lg bg-white/10 px-3 py-1 font-medium text-white disabled:opacity-40"
                    disabled={index === 0}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => move(item.id, 1)}
                    className="rounded-lg bg-white/10 px-3 py-1 font-medium text-white disabled:opacity-40"
                    disabled={index === items.length - 1}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id, { label: item.label, url: item.url, enabled: !item.enabled })}
                    className={`rounded-lg px-3 py-1 font-medium ${
                      item.enabled ? "bg-emerald-500/80 text-slate-900" : "bg-white/10 text-white"
                    }`}
                  >
                    {item.enabled ? "Enabled" : "Disabled"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id, { label: item.label, url: item.url })}
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
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </section>
  );
}
