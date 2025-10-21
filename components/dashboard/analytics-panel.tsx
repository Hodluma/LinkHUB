"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const QRCode = dynamic(() => import("qrcode.react").then((mod) => mod.QRCodeCanvas), { ssr: false });

interface AnalyticsPanelProps {
  handle: string;
  views: number;
  viewsLast30: number;
  clicksLast30: number;
  topLinks: { id: string; label: string; clicks: number }[];
}

export function AnalyticsPanel({ handle, views, viewsLast30, clicksLast30, topLinks }: AnalyticsPanelProps) {
  const profileUrl = useMemo(() => `${process.env.NEXT_PUBLIC_APP_URL ?? "https://linkhub.local"}/${handle}`, [handle]);

  return (
    <aside className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics</h2>
          <p className="text-sm text-white/60">Track how your page performs.</p>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-4 text-center text-white">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Total views</p>
          <p className="mt-2 text-3xl font-semibold">{views}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Views (30d)</p>
          <p className="mt-2 text-3xl font-semibold">{viewsLast30}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Clicks (30d)</p>
          <p className="mt-2 text-3xl font-semibold">{clicksLast30}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Top link</p>
          <p className="mt-2 text-lg font-semibold">
            {topLinks[0] ? `${topLinks[0].label} (${topLinks[0].clicks})` : "—"}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
        <p className="text-xs uppercase tracking-wide text-white/60">Top performers</p>
        <ul className="mt-3 space-y-2 text-sm">
          {topLinks.map((link) => (
            <li key={link.id} className="flex items-center justify-between text-white/80">
              <span className="truncate">{link.label}</span>
              <span>{link.clicks}</span>
            </li>
          ))}
          {topLinks.length === 0 && <li className="text-white/60">No clicks yet</li>}
        </ul>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
        <p className="text-xs uppercase tracking-wide text-white/70">Share QR</p>
        <QRCode value={profileUrl} size={120} bgColor="transparent" fgColor="#ffffff" includeMargin />
        <span className="text-xs text-white/70">Scan to open @{handle}</span>
      </div>
    </aside>
  );
}
