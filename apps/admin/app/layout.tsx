import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, Boxes, Settings, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRS Admin",
  description: "Recommendation system operations console"
};

const nav: Array<{ label: string; href: string; Icon: LucideIcon }> = [
  { label: "Dashboard", href: "/", Icon: BarChart3 },
  { label: "Users", href: "/users", Icon: UsersRound },
  { label: "Products", href: "/products", Icon: Boxes },
  { label: "Categories", href: "/categories", Icon: Boxes },
  { label: "Brands", href: "/brands", Icon: Boxes },
  { label: "Orders", href: "/orders", Icon: BarChart3 },
  { label: "User Events", href: "/events", Icon: BarChart3 },
  { label: "Recommendations", href: "/recommendations", Icon: BarChart3 },
  { label: "Config", href: "/recommendation-config", Icon: Settings },
  { label: "Analytics", href: "/analytics", Icon: BarChart3 }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
          <aside className="border-r border-zinc-200 bg-white p-4">
            <Link href="/" className="text-lg font-semibold">PRS Admin</Link>
            <nav className="mt-6 grid gap-1">
              {nav.map(({ label, href, Icon }) => (
                <Link key={href} href={href} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950">
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
