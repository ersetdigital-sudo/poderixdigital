import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icons";
import { BuyWidget } from "@/components/BuyWidget";
import { CopyButton } from "@/components/CopyButton";
import { services, serviceBySlug } from "@/lib/services";
import type { Service } from "@/lib/services";

const GROUPS: { title: string; style: React.CSSProperties; slugs: string[] }[] = [
  { title: "Isi ulang", style: { background: "#5B3DF5", color: "#fff" }, slugs: ["pulsa", "paket-data", "e-wallet"] },
  { title: "Tagihan rumah", style: { background: "#0B0B1A", color: "#fff" }, slugs: ["pln", "pdam", "tv-internet"] },
  { title: "Lainnya", style: { background: "#C6F432", color: "#0B0B1A" }, slugs: ["top-up-game", "bpjs-kesehatan", "multifinance"] },
];

const PAY_METHODS = [
  "QRIS",
  "BCA VA",
  "BRI VA",
  "Mandiri VA",
  "BNI VA",
  "DANA",
  "OVO",
  "GoPay",
  "ShopeePay",
  "LinkAja",
];

const STEPS = [
  { n: "01", title: "Pilih produk", desc: "Pulsa, token, game, atau tagihan." },
  { n: "02", title: "Isi nomor & nominal", desc: "Operator terdeteksi otomatis." },
  { n: "03", title: "Bayar, beres!", desc: "QRIS, VA bank, atau e-wallet." },
];

const FAQ = [
  ["Perlu daftar akun dulu?", "Tidak perlu. Langsung isi nomor, pilih nominal, lalu bayar."],
  ["Berapa lama prosesnya?", "Umumnya 3 detik sampai 1 menit setelah pembayaran terkonfirmasi."],
  ["Kalau transaksi gagal gimana?", "Dana dikembalikan otomatis ke saldo atau metode pembayaranmu."],
  ["Metode pembayaran apa saja?", "QRIS, transfer virtual account bank, dan e-wallet populer."],
];

const TESTIMONIALS = [
  "Token PLN tengah malam masuk dalam hitungan detik. Penyelamat banget!",
  "Top up diamond ML paling murah yang pernah aku coba, prosesnya juga kilat.",
];

function ServiceRow({ service }: { service: Service }) {
  return (
    <Link
      href={`/layanan/${service.slug}/`}
      className="group flex items-center gap-4 px-5 py-4 hover:bg-[#F6F5FB] transition"
    >
      <span className="w-10 h-10 shrink-0 rounded-xl grid place-items-center" style={{ background: service.icon.bg }}>
        <Icon name={service.icon.name} size={18} stroke={service.icon.stroke} />
      </span>
      <div className="flex-1">
        <div className="font-semibold">{service.title}</div>
        <div className="text-sm text-[#6B6A80]">{service.blurb}</div>
      </div>
      <span className="text-[#A3A2B5] group-hover:text-[#5B3DF5] group-hover:translate-x-1 transition">→</span>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <Header variant="home" />

      <main>
        {/* HERO */}
        <section id="hero" className="max-w-6xl mx-auto px-5 pt-8 md:pt-14 pb-10">
          <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-10 lg:gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E6E4F0] px-3.5 py-2 text-xs font-bold text-[#6B6A80]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#65A30D]" />
                Proses 3 detik · Buka 24/7
              </p>
              <h1 className="mt-5 text-[42px] sm:text-[52px] md:text-[56px] font-extrabold leading-[1.04]">
                Isi ulang apa aja,
                <br />
                <span className="text-[#5B3DF5]">sekali klik.</span>
              </h1>
              <p className="mt-5 text-[#6B6A80] text-base md:text-lg max-w-md leading-relaxed">
                Pulsa, paket data, token PLN, top up game, e-wallet sampai bayar tagihan. Langsung masuk,
                tanpa ribet daftar.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#beli" className="btn-accent px-5 py-3 text-sm">
                  Isi Ulang Sekarang →
                </a>
                <a
                  href="#layanan"
                  className="border border-[#E6E4F0] bg-white px-5 py-3 rounded-2xl text-sm font-bold hover:border-[#0B0B1A] transition"
                >
                  Lihat Layanan
                </a>
              </div>
              <div className="mt-8 flex gap-8 border-t border-[#E6E4F0] pt-5 max-w-md">
                <div>
                  <div className="disp text-xl md:text-2xl font-bold">1,2jt+</div>
                  <div className="text-xs md:text-sm text-[#6B6A80]">transaksi sukses</div>
                </div>
                <div className="border-l border-[#E6E4F0] pl-8">
                  <div className="disp text-xl md:text-2xl font-bold">4.9★</div>
                  <div className="text-xs md:text-sm text-[#6B6A80]">rating pelanggan</div>
                </div>
              </div>
            </div>

            <div id="beli" className="min-w-0 scroll-mt-24">
              <BuyWidget />
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-[#E6E4F0] flex flex-wrap justify-center gap-x-6 gap-y-3 text-[#8B899D] font-semibold disp text-xs md:text-sm">
            {PAY_METHODS.map((method) => (
              <span key={method}>{method}</span>
            ))}
          </div>
        </section>

        {/* LAYANAN */}
        <section id="layanan" className="max-w-6xl mx-auto px-5 py-14 md:py-16 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold text-[#5B3DF5] uppercase tracking-[.16em]">Pilih layanan</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold max-w-xl">Semua kebutuhan digital, satu tempat</h2>
            </div>
            <p className="text-sm text-[#6B6A80] max-w-xs leading-relaxed">9 layanan dalam 3 kelompok. Pilih satu, langsung isi data.</p>
          </div>
          <div className="mt-7 grid md:grid-cols-3 gap-4">
            {GROUPS.map((group) => (
              <div key={group.title} className="bg-white border border-[#E6E4F0] rounded-[24px] overflow-hidden shadow-[0_12px_30px_-24px_rgba(11,11,26,.35)]">
                <div className="px-5 pt-5 pb-4" style={group.style}>
                  <h3 className="font-bold text-lg">{group.title}</h3>
                </div>
                <div className="divide-y divide-[#F0EEF6]">
                  {group.slugs.map((slug) => {
                    const service = serviceBySlug(slug);
                    return service ? <ServiceRow key={slug} service={service} /> : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LANGKAH */}
        <section className="max-w-6xl mx-auto px-5 pb-14 md:pb-16">
          <div className="rounded-[28px] bg-[#0B0B1A] text-white p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
              <h2 className="text-2xl md:text-3xl font-extrabold">Cuma 3 langkah</h2>
              <p className="text-sm text-white/55">Dari pilih produk sampai transaksi beres.</p>
            </div>
            <div className="mt-7 grid md:grid-cols-3 gap-6 md:gap-0">
              {STEPS.map((step) => (
                <div key={step.n} className="md:px-6 md:border-l md:border-white/10 md:first:pl-0 md:first:border-l-0">
                  <div className="disp text-sm font-extrabold text-[#C6F432] tracking-[.14em]">{step.n}</div>
                  <h3 className="text-lg font-bold mt-2">{step.title}</h3>
                  <p className="text-sm text-white/55 mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROMO */}
        <section id="promo" className="max-w-6xl mx-auto px-5 py-14 md:py-16 scroll-mt-20">
          <div className="text-xs font-extrabold text-[#5B3DF5] uppercase tracking-[.16em]">Promo minggu ini</div>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="rounded-[26px] p-6 md:p-8 bg-[#C6F432] border border-[#B7E52D]">
              <h3 className="text-2xl md:text-3xl font-extrabold">Cashback 10% token PLN</h3>
              <p className="mt-2 text-sm md:text-base text-black/65">Pakai kode di kasir, maks. cashback Rp10.000.</p>
              <CopyButton code="PODERIX10" />
            </div>
            <div className="rounded-[26px] p-6 md:p-8 bg-[#5B3DF5] text-white border border-[#4E34DB]">
              <h3 className="text-2xl md:text-3xl font-extrabold">Transaksi ke-5 gratis admin</h3>
              <p className="mt-2 text-sm md:text-base text-white/70">Berlaku untuk semua produk tiap bulan.</p>
              <div className="mt-6 flex gap-2" aria-label="Empat transaksi, transaksi kelima gratis admin">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className="w-9 h-9 rounded-full bg-white/15 border border-white/15 grid place-items-center text-xs font-bold">
                    {n}
                  </span>
                ))}
                <span className="w-9 h-9 rounded-full bg-[#C6F432] text-black grid place-items-center text-[10px] font-extrabold">
                  FREE
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TESTI */}
        <section className="max-w-6xl mx-auto px-5 pb-14 md:pb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold">Kata mereka yang udah langganan</h2>
          <div className="mt-7 grid md:grid-cols-2 gap-4">
            {TESTIMONIALS.map((quote) => (
              <figure key={quote} className="card p-6 md:p-7">
                <div className="text-[#5B3DF5] text-sm tracking-[.12em]" aria-label="Rating 5 dari 5">★★★★★</div>
                <blockquote className="disp text-lg md:text-xl font-medium mt-3 leading-relaxed">“{quote}”</blockquote>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-5 pb-16 md:pb-20 scroll-mt-20">
          <div className="text-center">
            <div className="text-xs font-extrabold text-[#5B3DF5] uppercase tracking-[.16em]">Bantuan</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold">Ada pertanyaan?</h2>
          </div>
          <div className="mt-7 space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="card px-5 py-4">
                <summary className="flex justify-between gap-4 cursor-pointer font-bold">
                  {q}
                  <span className="pl transition text-2xl leading-none">+</span>
                </summary>
                <p className="text-sm text-[#6B6A80] mt-3 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
