"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icons";
import { hash, rp } from "@/lib/format";
import { loadOrder } from "@/lib/store";
import type { Order } from "@/lib/store";
import { checkVoucher, createOrder } from "@/lib/db/client";
import { toPublicError } from "@/lib/db/errors";

type Method = { id: string; n: string; d?: string; fee: number; pct?: number; g: string };

const METHODS: { g: string; list: Omit<Method, "g">[] }[] = [
  {
    g: "QRIS",
    list: [{ id: "qris", n: "QRIS", d: "Semua e-wallet & m-banking", fee: 0 }],
  },
  {
    g: "Virtual Account",
    list: [
      { id: "bca", n: "BCA Virtual Account", fee: 4000 },
      { id: "bri", n: "BRI Virtual Account", fee: 3000 },
      { id: "mandiri", n: "Mandiri Virtual Account", fee: 3000 },
      { id: "bni", n: "BNI Virtual Account", fee: 3000 },
    ],
  },
  {
    g: "E-Wallet",
    list: [
      { id: "dana", n: "DANA", fee: 0, pct: 0.015 },
      { id: "ovo", n: "OVO", fee: 0, pct: 0.015 },
      { id: "gopay", n: "GoPay", fee: 0, pct: 0.02 },
      { id: "shopeepay", n: "ShopeePay", fee: 0, pct: 0.015 },
    ],
  },
];

const ALL: Method[] = METHODS.flatMap((g) => g.list.map((m) => ({ ...m, g: g.g })));

const VA_PREFIX: Record<string, string> = {
  bca: "39358",
  bri: "26215",
  mandiri: "89508",
  bni: "98812",
};

const STEPS: [number, string][] = [
  [1, "Data pesanan"],
  [2, "Pembayaran"],
  [3, "Diproses"],
];

const QRIS_IMAGE = "https://res.cloudinary.com/dqjh7utdb/image/upload/v1792161327/camhvfeu1lcm0ps8ieiz.jpg";
const ADMIN_WHATSAPP = "https://wa.me/6285711172317";

export function CheckoutClient({
  brandSlug,
  qrisMethodId,
  qrisImageUrl,
}: {
  brandSlug: string;
  qrisMethodId: string | null;
  qrisImageUrl: string | null;
}) {
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);
  const [inv, setInv] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [creating, setCreating] = useState(false);
  const [payError, setPayError] = useState("");
  const [method, setMethod] = useState<Method | null>(null);
  const [disc, setDisc] = useState(0);
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ text: string; tone: "ok" | "err" | "none" }>({
    text: "",
    tone: "none",
  });
  const [left, setLeft] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrder(loadOrder());
    setReady(true);
  }, []);

  const fee = useMemo(() => {
    if (!order || !method) return 0;
    return Math.round(method.fee);
  }, [order, method]);

  const total = order ? order.price + order.admin + fee - disc : 0;
  const displayTotal = inv && orderTotal ? orderTotal : total;

  useEffect(() => {
    if (!ready || !order) return;
    setMethod(ALL.find((m) => m.id === "qris") ?? null);
    setStep(1);
  }, [ready, order]);

  useEffect(() => {
    if (step !== 2 || !expiresAt) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setLeft(next);
      if (next <= 0) setTimedOut(true);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [step, expiresAt]);

  const summaryRows = useMemo(() => {
    if (!order) return [];
    const rows: [string, string][] = order.lines.map(([k, v]) => [k, v]);
    rows.push(["Harga", rp(order.price)]);
    if (order.admin) rows.push(["Biaya admin", rp(order.admin)]);
    if (method) {
      const feeLabel = `Biaya layanan (${method.n.replace(" Virtual Account", " VA")})`;
      rows.push([feeLabel, fee ? rp(fee) : "Gratis"]);
    }
    if (disc) rows.push(["Promo PODERIX10", `−${rp(disc)}`]);
    return rows;
  }, [order, method, fee, disc]);

  const applyPromo = async () => {
    if (!order) return;
    const code = promo.trim().toUpperCase();
    if (!code) {
      setDisc(0);
      setPromoMsg({ text: "Masukkan kode promo dulu.", tone: "err" });
      return;
    }
    if (!order.dbServiceId) {
      setDisc(0);
      setPromoMsg({ text: "Pembayaran belum tersedia. Coba lagi sebentar.", tone: "err" });
      return;
    }

    try {
      const result = await checkVoucher({
        brandSlug,
        code,
        serviceId: order.dbServiceId,
        subtotal: order.price,
      });
      if (!result.valid) {
        setDisc(0);
        setPromoMsg({ text: result.pesan || "Kode promo tidak valid.", tone: "err" });
        return;
      }
      setDisc(result.potongan);
      setPromoMsg({ text: `Promo dipakai, hemat ${rp(result.potongan)}.`, tone: "ok" });
    } catch (promoFailure) {
      setDisc(0);
      setPromoMsg({ text: toPublicError(promoFailure).message, tone: "err" });
    }
  };

  const createAndPay = async () => {
    if (!order?.dbServiceId || !order.dbProductId || !order.target) {
      setPayError("Data pesanan belum lengkap. Ulangi dari halaman layanan.");
      return;
    }
    if (!qrisMethodId || !brandSlug) {
      setPayError("Pembayaran belum tersedia. Coba lagi sebentar.");
      return;
    }

    setPayError("");
    setCreating(true);
    try {
      const created = await createOrder({
        brandSlug,
        serviceId: order.dbServiceId,
        productId: order.dbProductId,
        nomorTujuan: order.target,
        input: {
          ...(order.input ?? {}),
          nomor_tujuan: order.target,
          ...(contact.trim() ? { kontak: contact.trim() } : {}),
        },
        paymentMethodId: qrisMethodId,
        voucherCode: disc > 0 ? promo.trim().toUpperCase() : null,
      });
      setInv(created.ref);
      setOrderTotal(created.total);
      setExpiresAt(new Date(created.expires_at).getTime());
      setLeft(Math.max(1, Math.ceil((new Date(created.expires_at).getTime() - Date.now()) / 1000)));
      setTimedOut(false);
      setStep(2);
    } catch (orderFailure) {
      setPayError(toPublicError(orderFailure).message);
    } finally {
      setCreating(false);
    }
  };

  const markPaid = () => {
    if (!order) return;
    setStep(3);
  };

  const vaNumber = method && VA_PREFIX[method.id]
    ? VA_PREFIX[method.id] + String(hash(inv)).padStart(10, "0").slice(0, 10)
    : "";

  const copyVa = async () => {
    try {
      await navigator.clipboard?.writeText(vaNumber);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const receiptRows = useMemo(() => {
    if (!order) return [];
    const rows: [string, string][] = [
      ["No. pesanan", inv],
      ["Waktu", new Date().toLocaleString("id-ID")],
      ...order.lines,
      ["Metode", method?.n ?? ""],
      ["Total pembayaran", rp(displayTotal)],
    ];
    if (contact.trim()) rows.push(["Bukti dikirim ke", contact.trim()]);
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, inv, method, displayTotal, contact]);

  if (!ready) {
    return <div className="h-40" />;
  }

  if (!order) {
    return (
      <div className="card p-10 mt-8 text-center">
        <h2 className="text-xl font-bold">Belum ada pesanan</h2>
        <p className="text-[#6B6A80] mt-2">Pilih layanan dulu, lalu kembali ke sini.</p>
        <Link href="/#layanan" className="btn inline-block mt-6">
          Lihat layanan
        </Link>
      </div>
    );
  }

  const howto = (() => {
    if (!method) return [];
    if (method.id === "qris") {
      return [
        "Buka aplikasi m-banking atau e-wallet.",
        "Pilih menu Scan / Bayar QRIS.",
        "Scan kode di atas, pastikan nominal sesuai, lalu bayar.",
      ];
    }
    if (method.g === "Virtual Account") {
      return [
        `Buka m-banking atau ATM ${method.n.split(" ")[0]}.`,
        "Pilih Transfer, lalu Virtual Account.",
        "Masukkan nomor VA di atas dan konfirmasi pembayaran.",
      ];
    }
    return [
      `Buka aplikasi ${method.n}.`,
      "Cek notifikasi pembayaran dari Poderix Digital.",
      "Konfirmasi dengan PIN kamu.",
    ];
  })();

  return (
    <>
      <ol className="mt-6 flex items-center gap-3 text-sm font-semibold">
        {STEPS.map(([n, label], i) => (
          <Fragment key={n}>
            {i > 0 && <li className="flex-1 h-px bg-[#E6E4F0]" />}
            <li
              className={`step flex items-center gap-2 ${step === n ? "on" : step > n ? "done" : ""}`}
              data-s={n}
            >
              <span className="dot w-7 h-7 rounded-full border border-[#E6E4F0] bg-white grid place-items-center text-xs">
                {n}
              </span>
              {label}
            </li>
          </Fragment>
        ))}
      </ol>

      <div
        className={`mt-8 grid gap-6 items-start ${
          step === 3 ? "" : "lg:grid-cols-[1.5fr_1fr]"
        }`}
      >
        <div>
          {/* step 1 */}
          {step === 1 && (
            <section className="card p-6 md:p-8">
              <h2 className="text-xl font-bold">Metode pembayaran</h2>
              <div className="mt-5 space-y-5">
                {METHODS.map((group) => (
                  <div key={group.g}>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#6B6A80] mb-2">
                      {group.g}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {group.list.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          disabled={m.id !== "qris"}
                          onClick={() => setMethod({ ...m, g: group.g })}
                          className={`opt flex justify-between items-center gap-3 ${
                            method?.id === m.id ? "on" : ""
                          } ${m.id !== "qris" ? "cursor-not-allowed opacity-45" : ""}`}
                        >
                          <span>
                            <span className="font-semibold block">{m.n}</span>
                            {m.d && <span className="text-xs text-[#6B6A80]">{m.d}</span>}
                          </span>
                          <span className="text-xs font-semibold text-[#6B6A80] whitespace-nowrap">
                            {m.id !== "qris" ? "Segera" : m.fee ? `+${rp(m.fee)}` : "Gratis"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold mt-8">Kirim bukti ke</h2>
              <p className="text-sm text-[#6B6A80] mt-1">
                Tidak wajib. Isi kalau mau dapat bukti transaksi.
              </p>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="inp mt-3"
                placeholder="Email atau nomor WhatsApp"
              />

              <h2 className="text-xl font-bold mt-8">Kode promo</h2>
              <div className="mt-3 flex gap-2">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  className="inp uppercase"
                  placeholder="Contoh: PODERIX10"
                />
                <button
                  type="button"
                  onClick={() => void applyPromo()}
                  className="shrink-0 border border-[#E6E4F0] bg-white rounded-[14px] px-5 font-semibold hover:border-black"
                >
                  Pakai
                </button>
              </div>
              <p
                className={`text-sm mt-2 ${
                  promoMsg.tone === "ok"
                    ? "text-[#16A34A] font-semibold"
                    : promoMsg.tone === "err"
                      ? "text-[#E11D48]"
                      : ""
                }`}
              >
                {promoMsg.text}
              </p>
            </section>
          )}

          {/* step 2 */}
          {step === 2 && (
            <section className="card p-6 md:p-8">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-sm text-[#6B6A80]">Selesaikan pembayaran dalam</div>
                  <div className="disp text-3xl font-bold mt-1">
                    {timedOut
                      ? "Waktu habis"
                      : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#6B6A80]">No. pesanan</div>
                  <div className="font-mono font-bold mt-1">{inv}</div>
                </div>
              </div>

              <div className="mt-6">
                {method?.id === "qris" && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 mb-3 text-xs font-bold tracking-wider">
                      <span className="bg-[#0B0B1A] text-white px-2 py-1 rounded">QRIS</span>
                      <span className="text-[#6B6A80]">Scan pakai e-wallet / m-banking apa aja</span>
                    </div>
                    <br />
                    <div className="w-full max-w-[320px] mx-auto p-3 bg-white border border-[#E6E4F0] rounded-2xl">
                      <img
                        src={qrisImageUrl || QRIS_IMAGE}
                        alt="Kode QRIS Poderix Digital"
                        width={640}
                        height={640}
                        loading="eager"
                        className="block w-full h-auto rounded-lg"
                      />
                    </div>
                    <div className="disp text-2xl font-bold mt-4">{rp(displayTotal)}</div>
                    <div className="text-sm text-[#6B6A80]">a.n. Poderix Digital</div>
                  </div>
                )}

                {method?.g === "Virtual Account" && (
                  <div className="rounded-2xl border border-[#E6E4F0] p-5">
                    <div className="text-sm text-[#6B6A80]">Nomor {method.n}</div>
                    <div className="flex items-center justify-between gap-3 mt-1">
                      <span className="font-mono text-2xl font-bold tracking-wider">
                        {vaNumber.replace(/(\d{4})/g, "$1 ").trim()}
                      </span>
                      <button
                        type="button"
                        onClick={copyVa}
                        className="text-sm font-semibold text-[#5B3DF5]"
                      >
                        {copied ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                    <div className="mt-4 text-sm text-[#6B6A80]">Jumlah transfer</div>
                    <div className="disp text-2xl font-bold">{rp(displayTotal)}</div>
                  </div>
                )}

                {method && method.g === "E-Wallet" && (
                  <div className="rounded-2xl border border-[#E6E4F0] p-5 text-center">
                    <div className="text-sm text-[#6B6A80]">Tagihan dikirim ke aplikasi {method.n}</div>
                    <div className="disp text-2xl font-bold mt-2">{rp(displayTotal)}</div>
                    <a href="#" onClick={(e) => e.preventDefault()} className="btn inline-block mt-4">
                      Buka {method.n}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-[#F6F5FB] rounded-2xl p-4 text-sm">
                <b>Cara bayar</b>
                <ol className="mt-2 space-y-1.5 text-[#6B6A80] list-decimal pl-5">
                  {howto.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ol>
              </div>

              <button type="button" onClick={markPaid} disabled={timedOut} className="btn w-full mt-6">
                Saya sudah bayar
              </button>
              <p className="mt-4 text-center text-sm text-[#6B6A80]">
                Ada kendala? Hubungi admin WhatsApp{" "}
                <a
                  href={ADMIN_WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#5B3DF5] hover:underline"
                >
                  085711172317
                </a>
              </p>

            </section>
          )}

          {/* step 3 */}
          {step === 3 && (
            <section className="card p-6 md:p-8">
              <div className="text-center">
                <span className="w-16 h-16 rounded-full bg-[#EDE9FF] grid place-items-center mx-auto">
                  <Icon name="spinner" size={30} stroke="#5B3DF5" className="spin" />
                </span>
                <h2 className="text-2xl font-bold mt-5">Terima kasih, pembayaran Anda sedang diproses</h2>
                <p className="text-[#6B6A80] mt-2">
                  Kami akan memverifikasi pembayaran dan memproses pesananmu.
                </p>
                <Link
                  href={`/cek-pesanan/?inv=${inv}`}
                  className="inline-block mt-3 text-sm font-semibold text-[#5B3DF5]"
                >
                  Lacak pesanan {inv} →
                </Link>
              </div>

              <div className="mt-6 space-y-3 text-sm border-t border-dashed border-[#E6E4F0] pt-6">
                {receiptRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-[#6B6A80]">{k}</span>
                    <b className="text-right">{v}</b>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                <Link href="/#layanan" className="btn text-center">
                  Beli lagi
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="border border-[#E6E4F0] bg-white rounded-[14px] py-3.5 font-semibold hover:border-black"
                >
                  Simpan bukti
                </button>
              </div>
            </section>
          )}
        </div>

        {step !== 3 && (
          <aside className="card p-6 lg:sticky lg:top-24">
            <h3 className="font-bold text-lg">Ringkasan pesanan</h3>
            <div className="mt-4 space-y-3 text-sm">
              {summaryRows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-[#6B6A80]">{k}</span>
                  <b className={`text-right ${k.startsWith("Promo") ? "text-[#16A34A]" : ""}`}>{v}</b>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-dashed border-[#E6E4F0] flex justify-between items-baseline">
              <span className="text-[#6B6A80] text-sm">Total bayar</span>
              <span className="disp text-2xl font-bold">{rp(displayTotal)}</span>
            </div>
            {step === 1 && (
              <>
                <button
                  type="button"
                  onClick={() => void createAndPay()}
                  disabled={!method || creating}
                  className="btn w-full mt-5 disabled:cursor-wait disabled:opacity-60"
                >
                  {creating ? "Memproses…" : "Bayar sekarang →"}
                </button>
                {payError ? (
                  <p className="mt-2 text-sm font-semibold text-[#E11D48]">{payError}</p>
                ) : null}
              </>
            )}
            <p className="text-xs text-[#6B6A80] mt-3 text-center">
              Dana kembali otomatis kalau transaksi gagal.
            </p>
          </aside>
        )}
      </div>
    </>
  );
}
