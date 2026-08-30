import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, UserRound } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRS Store",
  description: "Explainable product recommendations based on user behavior"
};

const nav = [
  { label: "Products", href: "/products" },
  { label: "Search", href: "/search" },
  { label: "Favorites", href: "/favorites" },
  { label: "History", href: "/history" }
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingBag className="h-5 w-5" />
              PRS Store
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-zinc-600 md:flex">
              {nav.map(({ label, href }) => (
                <Link key={href} href={href} className="hover:text-zinc-950">
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/cart" className="rounded-md p-2 hover:bg-zinc-100" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
              </Link>
              <Link href="/profile" className="rounded-md p-2 hover:bg-zinc-100" aria-label="Profile">
                <UserRound className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
