import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LinkHUB",
    template: "%s | LinkHUB"
  },
  description: "Build and share a beautiful profile with trackable links."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
