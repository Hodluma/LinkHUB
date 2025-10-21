"use client";

import { useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LinkButton {
  id: string;
  label: string;
  url: string;
  badge?: string | null;
}

interface LinkButtonsProps {
  links: LinkButton[];
  buttonClassName: string;
}

export function LinkButtons({ links, buttonClassName }: LinkButtonsProps) {
  const handleClick = useCallback((id: string) => {
    const payload = new URLSearchParams({ linkId: id }).toString();
    const blob = new Blob([payload], { type: "application/x-www-form-urlencoded" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/click", blob);
      return;
    }

    fetch(`/api/click`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: payload,
      keepalive: true
    }).catch(() => undefined);
  }, []);

  return (
    <div className="flex w-full flex-col gap-4">
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.url}
          prefetch={false}
          onClick={() => handleClick(link.id)}
          className={cn(
            "group block w-full rounded-full px-6 py-4 text-lg font-medium transition-all",
            buttonClassName
          )}
        >
          <span className="flex items-center justify-center gap-2">
            {link.label}
            {link.badge && (
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs uppercase tracking-wide">
                {link.badge}
              </span>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}
