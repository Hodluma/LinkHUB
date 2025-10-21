"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, DENSITY_SPACING } from "@/lib/constants";

type ThemeOption = typeof THEMES[keyof typeof THEMES];

type ProfileEditorProps = {
  profile: {
    id: string;
    handle: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    theme: ThemeOption;
    density: keyof typeof DENSITY_SPACING;
    verified: boolean;
  };
  themes: typeof THEMES;
  plan: string;
};

export function ProfileEditor({ profile, themes, plan }: ProfileEditorProps) {
  const router = useRouter();
  const resolvedThemeKey = (Object.entries(themes).find(([, value]) => value.name === profile.theme.name)?.[0] ?? "aurora") as keyof typeof themes;
  const [state, setState] = useState({
    displayName: profile.displayName,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    themeKey: resolvedThemeKey,
    density: profile.density as keyof typeof DENSITY_SPACING,
    verified: profile.verified
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const theme = themes[state.themeKey];

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: state.displayName,
        bio: state.bio || null,
        avatarUrl: state.avatarUrl || null,
        theme,
        density: state.density,
        verified: plan === "PRO" ? state.verified : undefined
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to save profile");
      setSaving(false);
      return;
    }

    setMessage("Profile updated");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Profile</h2>
          <p className="text-sm text-white/60">Update how your public page looks and feels.</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
          @{profile.handle}
        </span>
      </header>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-white/70">Display name</span>
        <input
          className="rounded-xl bg-white/10 px-4 py-3 text-base text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
          value={state.displayName}
          onChange={(event) => setState((prev) => ({ ...prev, displayName: event.target.value }))}
          required
          maxLength={80}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-white/70">Bio</span>
        <textarea
          className="min-h-[120px] rounded-xl bg-white/10 px-4 py-3 text-base text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
          value={state.bio}
          onChange={(event) => setState((prev) => ({ ...prev, bio: event.target.value }))}
          maxLength={240}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-white/70">Avatar URL</span>
        <input
          className="rounded-xl bg-white/10 px-4 py-3 text-base text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
          value={state.avatarUrl}
          onChange={(event) => setState((prev) => ({ ...prev, avatarUrl: event.target.value }))}
          placeholder="https://..."
        />
      </label>
      <div className="grid gap-4">
        <span className="text-sm uppercase tracking-wide text-white/60">Theme</span>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(themes).map(([key, value]) => (
            <button
              type="button"
              key={key}
              onClick={() => setState((prev) => ({ ...prev, themeKey: key as keyof typeof themes }))}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                state.themeKey === key ? "border-white bg-white/10" : "border-white/10 bg-transparent hover:border-white/30"
              }`}
            >
              <span className="block text-sm font-semibold capitalize">{value.name}</span>
              <span className="mt-1 block h-2 w-full rounded-full bg-gradient-to-r from-white/10 via-white/60 to-white/20" />
            </button>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="text-white/70">Density</span>
        <select
          className="rounded-xl bg-white/10 px-4 py-3 text-base text-white outline-none ring-offset-2 focus:ring-2 focus:ring-white/40"
          value={state.density}
          onChange={(event) => setState((prev) => ({ ...prev, density: event.target.value as keyof typeof DENSITY_SPACING }))}
        >
          {Object.keys(DENSITY_SPACING).map((key) => (
            <option key={key} value={key} className="text-slate-900">
              {key}
            </option>
          ))}
        </select>
      </label>
      {plan === "PRO" && (
        <label className="flex items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={state.verified}
            onChange={(event) => setState((prev) => ({ ...prev, verified: event.target.checked }))}
          />
          Verified badge
        </label>
      )}
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:bg-white/50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
