import Link from "next/link";
import { Logo } from "./Logo";
import { TabLink } from "./TabLink";

const PAY_METHODS = ["QRIS", "BCA", "BRI", "Mandiri", "BNI", "DANA", "OVO", "GoPay", "ShopeePay"];

const SERVICE_LINKS = [
  { tab: "pulsa", href: "/?tab=pulsa#beli", label: "Pulsa & Data" },
  { tab: "pln", href: "/?tab=pln#beli", label: "Token PLN" },
  { tab: "game", href: "/?tab=game#beli", label: "Top Up Game" },
  { tab: "ewallet", href: "/?tab=ewallet#beli", label: "E-Wallet" },
  { tab: "tagihan", href: "/?tab=tagihan#beli", label: "Tagihan" },
];

export function Footer() {
  return (
    <footer className="bg-[#0B0B1A] text-white/60 text-sm">
      <div className="max-w-6xl mx-auto px-5 pt-16">
        <div className="rounded-2xl bg-[#5B3DF5] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">Butuh isi ulang sekarang?</h3>
            <p className="text-white/75 mt-2">Tanpa daftar, langsung masuk dalam hitungan detik.</p>
          </div>
          <Link
            href="/#layanan"
            className="shrink-0 bg-[#C6F432] text-[#0B0B1A] font-bold px-6 py-3.5 rounded-xl hover:brightness-95"
          >
            Isi Ulang Sekarang →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1.4fr] gap-10 py-14">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex">
              <Logo tone="lime" />
            </Link>
            <p className="mt-5 max-w-xs leading-relaxed">
              Isi ulang pulsa, data, token PLN, top up game, e-wallet, dan bayar tagihan. Buka 24/7.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Layanan</h4>
            <ul className="space-y-2.5">
              {SERVICE_LINKS.map((item) => (
                <li key={item.label}>
                  <TabLink tab={item.tab} href={item.href} className="hover:text-white transition">
                    {item.label}
                  </TabLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#layanan" className="hover:text-white">
                  Semua layanan
                </Link>
              </li>
              <li>
                <Link href="/#promo" className="hover:text-white">
                  Promo
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/cek-pesanan/" className="hover:text-white">
                  Cek Pesanan
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold mb-4">Metode pembayaran</h4>
            <div className="flex flex-wrap gap-2">
              {PAY_METHODS.map((m) => (
                <span
                  key={m}
                  className="border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-white/80"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row justify-between gap-3 text-xs">
          <span>© 2026 Poderix Digital. Semua hak dilindungi.</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            Semua sistem berjalan normal
          </span>
        </div>
      </div>
    </footer>
  );
}
