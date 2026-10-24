import Link from "next/link";
import { Logo } from "./Logo";
import { TabLink } from "./TabLink";

type Variant = "home" | "sub";

const NAV: Record<Variant, { href: string; label: string; tab?: string }[]> = {
  home: [
    { href: "#layanan", label: "Layanan" },
    { href: "#beli", label: "Isi Ulang" },
    { href: "/?tab=game#beli", label: "Top Up Game", tab: "game" },
    { href: "#promo", label: "Promo" },
    { href: "#faq", label: "FAQ" },
    { href: "/cek-pesanan/", label: "Cek Pesanan" },
  ],
  sub: [
    { href: "/#layanan", label: "Layanan" },
    { href: "/layanan/pulsa/", label: "Pulsa" },
    { href: "/layanan/top-up-game/", label: "Top Up Game" },
    { href: "/#promo", label: "Promo" },
    { href: "/#faq", label: "FAQ" },
    { href: "/cek-pesanan/", label: "Cek Pesanan" },
  ],
};

export function Header({ variant = "sub" }: { variant?: Variant }) {
  const nav = NAV[variant];

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[#F6F5FB]/80 border-b border-[#E6E4F0]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {variant === "home" ? (
          <a href="#" className="flex items-center gap-2.5">
            <Logo />
          </a>
        ) : (
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
          </Link>
        )}

        <nav className="hidden md:flex gap-8 text-sm font-medium text-[#6B6A80]">
          {nav.map((item) =>
            item.tab ? (
              <TabLink key={item.label} tab={item.tab} href={item.href} className="hover:text-black">
                {item.label}
              </TabLink>
            ) : item.href.startsWith("#") ? (
              <a key={item.label} href={item.href} className="hover:text-black">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className="hover:text-black">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {variant === "home" ? (
          <a href="#beli" className="text-sm font-semibold bg-[#0B0B1A] text-white px-4 py-2 rounded-full">
            Mulai Isi
          </a>
        ) : (
          <Link href="/#layanan" className="text-sm font-semibold bg-[#0B0B1A] text-white px-4 py-2 rounded-full">
            Semua Layanan
          </Link>
        )}
      </div>
    </header>
  );
}
