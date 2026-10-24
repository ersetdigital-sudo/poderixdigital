"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GAMES, gameNames } from "@/lib/games";
import { hash, operator, rp } from "@/lib/format";
import { saveOrder } from "@/lib/store";
import type { OrderLine } from "@/lib/store";
import type { Field, Service } from "@/lib/services";
import { Icon } from "./Icons";

type Bill = { name: string; amt: number; period: string };

const TRUST = [
  { icon: "zap" as const, label: "Masuk 3 detik" },
  { icon: "shieldCheck" as const, label: "Refund otomatis" },
  { icon: "check" as const, label: "Bukti otomatis" },
];

const STEPS = ["Isi data", "Pilih nominal", "Bayar"];

export function ServiceForm({ service, others }: { service: Service; others: Service[] }) {
  const router = useRouter();
  const fieldsRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState(gameNames[0]);
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of service.fields) if (f.sel) init[f.id] = f.sel[0];
    return init;
  });
  const [item, setItem] = useState<number | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [billError, setBillError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const gameFields = useMemo<Field[]>(() => {
    const g = GAMES[game];
    const list: Field[] = [{ id: "target", label: "User ID", ph: "Masukkan User ID", num: true }];
    if (g.zone) {
      list.push({
        id: "zone",
        label: g.label || "Zone ID",
        ph: g.label ? "Contoh: Asia" : "Contoh: 2241",
        num: !g.label,
      });
    }
    return list;
  }, [game]);

  const fields = service.type === "game" ? gameFields : service.fields;
  const items = service.type === "game" ? GAMES[game].items : (service.items ?? []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width:1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = isMobile ? "calc(96px + env(safe-area-inset-bottom))" : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [isMobile]);

  const targetField = fields.find((f) => f.id === "target");
  const opTag = targetField?.op ? operator(vals.target ?? "") : "";

  const digits = (v: string) => v.replace(/\D/g, "");
  const target = digits(vals.target ?? "");
  const okT = target.length >= (service.type === "game" ? 5 : 8);
  const okZ = !(service.type === "game" && GAMES[game].zone) || (vals.zone ?? "").trim().length > 0;

  const order = useMemo(() => {
    const lines: OrderLine[] = [["Layanan", service.type === "game" ? game : service.name]];

    const prov = fields.find((f) => f.sel);
    if (prov && vals.provider) lines.push([prov.label, vals.provider]);
    if (target && targetField) {
      lines.push([targetField.label, `${vals.target}${opTag ? ` · ${opTag}` : ""}`]);
    }
    if (vals.zone) lines.push([GAMES[game].label || "Zone ID", vals.zone]);

    let price = 0;
    let product = "";
    let admin = 0;

    if (service.type === "bill") {
      if (bill) {
        lines.push(["Nama", bill.name], ["Periode", bill.period]);
        price = bill.amt;
        admin = service.admin ?? 0;
        product = `Tagihan ${service.name}`;
      }
    } else if (item !== null && items[item]) {
      const it = items[item];
      product = it[0];
      price = it[2];
      lines.push(["Produk", it[1] ? `${it[0]} (${it[1]})` : it[0]]);
    }

    const ok = okT && okZ && (service.type === "bill" ? !!bill : item !== null);

    return {
      ok,
      slug: service.slug,
      service: service.name,
      product,
      price,
      admin,
      lines,
      type: service.type,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, fields, items, game, vals, item, bill, target, targetField, opTag, okT, okZ]);

  const setField = (id: string, value: string) => {
    setVals((v) => ({ ...v, [id]: value }));
    if (service.type === "bill") {
      setBill(null);
      setBillError("");
    }
  };

  const changeGame = (name: string) => {
    setGame(name);
    setVals({});
    setItem(null);
  };

  const checkBill = () => {
    const id = digits(vals.target ?? "");
    if (id.length < 6) {
      setBill(null);
      setBillError("ID minimal 6 digit.");
      return;
    }
    const h = hash(id + service.slug);
    let amt = 50000 + (h % 300) * 1000;
    if (service.slug === "bpjs-kesehatan") {
      const months = parseInt(vals.provider) || 1;
      amt = 35000 * months * (1 + (h % 4));
    }
    const name = `Pelanggan ${String.fromCharCode(65 + (h % 26))}*** ${String.fromCharCode(65 + ((h >> 3) % 26))}***`;
    const period = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    setBill({ name, amt, period });
    setBillError("");
  };

  const pickItem = (i: number) => {
    setItem(i);
    if (isMobile && !(okT && okZ)) {
      const inputs = Array.from(
        fieldsRef.current?.querySelectorAll<HTMLInputElement>("input[data-f]") ?? [],
      );
      const empty = inputs.find((el) => !el.value.trim());
      if (empty) {
        empty.scrollIntoView({ behavior: "smooth", block: "center" });
        empty.focus({ preventScroll: true });
      }
    }
  };

  const goCheckout = () => {
    if (!order.ok) return;
    saveOrder(order);
    router.push("/checkout/");
  };

  const total = order.price + order.admin;
  const step = !okT ? 0 : !order.ok ? 1 : 2;
  const ctaHint = !okT
    ? "Isi nomor dulu"
    : service.type === "bill"
      ? bill
        ? "Lanjut ke bayar"
        : "Cek tagihan dulu"
      : order.ok
        ? "Bayar sekarang"
        : "Pilih nominal dulu";

  const renderField = (f: Field) => {
    if (f.sel) {
      return (
        <label key={f.id} className="block">
          <span className="text-sm font-semibold">{f.label}</span>
          <select
            data-f={f.id}
            value={vals[f.id] ?? f.sel[0]}
            onChange={(e) => setField(f.id, e.target.value)}
            className="inp mt-2 min-h-12 text-base"
          >
            {f.sel.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      );
    }
    return (
      <label key={f.id} className="block">
        <span className="text-sm font-semibold">{f.label}</span>
        <span className="relative block mt-2">
          <input
            data-f={f.id}
            inputMode={f.num ? "numeric" : undefined}
            placeholder={f.ph ?? ""}
            value={vals[f.id] ?? ""}
            onChange={(e) => setField(f.id, e.target.value)}
            className="inp text-lg min-h-14"
          />
          {f.op && (
            <span
              data-op
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold bg-[#EDE9FF] text-[#5B3DF5] px-2.5 py-1 rounded-full ${
                opTag ? "" : "hidden"
              }`}
            >
              {opTag}
            </span>
          )}
        </span>
      </label>
    );
  };

  const summaryRows = (
    <>
      {order.lines.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <span className="text-[#6B6A80] shrink-0">{k}</span>
          <b className="text-right break-words">{v}</b>
        </div>
      ))}
      {order.admin > 0 && (
        <div className="flex justify-between">
          <span className="text-[#6B6A80]">Biaya admin</span>
          <b>{rp(order.admin)}</b>
        </div>
      )}
    </>
  );

  return (
    <div className="lg:grid lg:grid-cols-[1.5fr_1fr] lg:gap-6 lg:items-start">
      {/* ================= LEFT COLUMN ================= */}
      <div className="space-y-4 lg:space-y-6 pb-4 lg:pb-0">
        {/* progress strip (mobile) */}
        <div className="lg:hidden">
          <ol className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= step
                      ? "bg-[#5B3DF5]"
                      : "bg-[#E4E2EE]"
                  }`}
                />
                <div
                  className={`text-[11px] font-bold mt-1.5 transition-colors ${
                    i <= step ? "text-[#5B3DF5]" : "text-[#A3A2B5]"
                  }`}
                >
                  {label}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* form card */}
        <section className="card p-5 md:p-8">
          <h2 className="text-xl font-bold">Isi data</h2>

          {service.type === "game" ? (
            <>
              <div className="mt-5">
                <span className="text-sm font-semibold">Pilih game</span>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gameNames.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => changeGame(name)}
                      className={`opt text-sm font-bold min-h-14 active:scale-[.98] transition ${
                        name === game ? "on" : ""
                      }`}
                    >
                      {name}
                      <div className="text-[11px] font-medium text-[#6B6A80] mt-1">
                        Mulai {rp(GAMES[name].items[0][2])}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div ref={fieldsRef} className="mt-5 grid sm:grid-cols-2 gap-3">
                {fields.map(renderField)}
              </div>
            </>
          ) : (
            <div ref={fieldsRef} className="mt-5 space-y-4">
              {fields.map(renderField)}
              {service.type === "bill" && (
                <>
                  <button
                    type="button"
                    onClick={checkBill}
                    className="btn w-full sm:w-auto min-h-12 active:scale-[.98] transition"
                  >
                    Cek tagihan
                  </button>
                  <div>
                    {billError && <p className="text-sm text-[#E11D48] mt-3">{billError}</p>}
                    {bill && (
                      <div className="mt-4 rounded-2xl bg-[#F6F5FB] p-4 text-sm space-y-2">
                        <div className="flex justify-between gap-3">
                          <span className="text-[#6B6A80]">Nama</span>
                          <b className="text-right">{bill.name}</b>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#6B6A80]">Periode</span>
                          <b className="text-right">{bill.period}</b>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#6B6A80]">Tagihan</span>
                          <b>{rp(bill.amt)}</b>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-[#6B6A80]">Biaya admin</span>
                          <b>{rp(service.admin ?? 0)}</b>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* items card */}
        {service.type !== "bill" && (
          <section className="card p-5 md:p-8">
            <h2 className="text-xl font-bold">
              {service.type === "game" ? "Pilih item" : "Pilih nominal"}
            </h2>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((it, i) => (
                <button
                  key={it[0]}
                  type="button"
                  onClick={() => pickItem(i)}
                  className={`opt relative min-h-[78px] active:scale-[.97] transition ${
                    item === i ? "on" : ""
                  }`}
                >
                  {item === i && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#5B3DF5] grid place-items-center shadow-[0_4px_10px_-3px_rgba(91,61,245,.9)]">
                      <Icon name="check" size={11} stroke="#fff" strokeWidth={3.2} />
                    </span>
                  )}
                  <div className="disp font-bold pr-6">{it[0]}</div>
                  {it[1] ? <div className="text-xs text-[#6B6A80] mt-0.5">{it[1]}</div> : null}
                  <div className="text-sm font-extrabold text-[#5B3DF5] mt-2">{rp(it[2])}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* trust chips (mobile) */}
        <div className="lg:hidden flex flex-wrap gap-2">
          {TRUST.map((t) => (
            <span
              key={t.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E6E4F0] px-3 py-1.5 text-xs font-bold shadow-[0_2px_8px_-4px_rgba(11,11,26,.25)]"
            >
              <Icon name={t.icon} size={13} stroke="#5B3DF5" strokeWidth={2.2} />
              {t.label}
            </span>
          ))}
        </div>

        {/* cara beli + faq — desktop cards */}
        <section className="hidden lg:grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-bold text-lg">Cara beli</h3>
            <ol className="mt-4 space-y-4 text-sm">
              {service.how.map((stepText, i) => (
                <li key={stepText} className="flex gap-4">
                  <span
                    className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-bold"
                    style={{ background: service.icon.bg, color: service.icon.stroke }}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{stepText}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="card p-6">
            <h3 className="font-bold text-lg">Pertanyaan umum</h3>
            <div className="mt-2">
              {service.faq.map(([q, a]) => (
                <details key={q} className="border-t border-[#E6E4F0] py-4">
                  <summary className="flex justify-between cursor-pointer font-semibold">
                    {q}
                    <span className="pl transition text-xl leading-none">+</span>
                  </summary>
                  <p className="text-[#6B6A80] mt-2 text-sm">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* cara beli + faq — mobile accordions */}
        <div className="lg:hidden space-y-3">
          <details className="card px-5 py-4">
            <summary className="flex items-center justify-between font-bold cursor-pointer">
              Cara beli
              <Icon name="chevronDown" size={18} stroke="#6B6A80" className="chev transition-transform" />
            </summary>
            <ol className="mt-4 space-y-3 text-sm">
              {service.how.map((stepText, i) => (
                <li key={stepText} className="flex gap-3">
                  <span
                    className="w-6 h-6 shrink-0 rounded-full grid place-items-center text-[11px] font-bold"
                    style={{ background: service.icon.bg, color: service.icon.stroke }}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{stepText}</span>
                </li>
              ))}
            </ol>
          </details>

          <details className="card px-5 py-4">
            <summary className="flex items-center justify-between font-bold cursor-pointer">
              Pertanyaan umum
              <Icon name="chevronDown" size={18} stroke="#6B6A80" className="chev transition-transform" />
            </summary>
            <div className="mt-2">
              {service.faq.map(([q, a]) => (
                <details key={q} className="border-t border-[#E6E4F0] py-3.5">
                  <summary className="flex justify-between gap-3 cursor-pointer text-sm font-semibold">
                    {q}
                    <span className="pl transition text-lg leading-none">+</span>
                  </summary>
                  <p className="text-[#6B6A80] mt-2 text-sm">{a}</p>
                </details>
              ))}
            </div>
          </details>
        </div>

        {/* other services — mobile cards */}
        <div className="lg:hidden">
          <div className="text-sm font-extrabold px-1 mb-3">Layanan lainnya</div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 [scrollbar-width:none]">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/layanan/${other.slug}/`}
                className="shrink-0 w-[150px] rounded-[20px] bg-white border border-[#E6E4F0] p-3.5 shadow-[0_1px_2px_rgba(11,11,26,.03),0_12px_28px_-20px_rgba(11,11,26,.3)] active:scale-95 transition"
              >
                <span
                  className="w-10 h-10 rounded-xl grid place-items-center"
                  style={{ background: other.icon.bg }}
                >
                  <Icon name={other.icon.name} size={17} stroke={other.icon.stroke} />
                </span>
                <div className="mt-2.5 text-sm font-extrabold leading-tight">{other.title}</div>
                <div className="text-[11px] text-[#6B6A80] mt-0.5 line-clamp-2 leading-snug">
                  {other.blurb}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ================= DESKTOP ASIDE ================= */}
      <aside className="hidden lg:block lg:sticky lg:top-24 space-y-6">
        <div className="card p-6">
          <h3 className="font-bold text-lg">Ringkasan</h3>
          <div className="mt-4 space-y-3 text-sm">{summaryRows}</div>
          <div className="mt-5 pt-5 border-t border-dashed border-[#E6E4F0] flex justify-between items-baseline">
            <span className="text-[#6B6A80] text-sm">Total</span>
            <span className="disp text-2xl font-bold">{rp(total)}</span>
          </div>
          <button
            type="button"
            onClick={goCheckout}
            disabled={!order.ok}
            className="btn-accent w-full mt-5 min-h-[52px]"
          >
            Lanjut ke Checkout →
          </button>
          <p className="text-xs text-[#6B6A80] mt-3 text-center">
            {order.ok
              ? "Kamu bisa cek ulang sebelum bayar."
              : service.type === "bill"
                ? "Lengkapi data lalu cek tagihan dulu."
                : "Lengkapi data dan pilih nominal dulu."}
          </p>
        </div>

        <div className="card p-4">
          <div className="px-2 pt-1 pb-2 text-sm font-bold">Layanan lainnya</div>
          <div className="grid grid-cols-1">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/layanan/${other.slug}/`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F6F5FB]"
              >
                <span
                  className="w-9 h-9 rounded-lg grid place-items-center"
                  style={{ background: other.icon.bg }}
                >
                  <Icon name={other.icon.name} size={16} stroke={other.icon.stroke} />
                </span>
                <span className="text-sm font-semibold">{other.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* ================= MOBILE STICKY BAR ================= */}
      {isMobile && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] bg-[#F6F5FB] border-t border-[#E6E4F0] pointer-events-none">
          <div className="pointer-events-auto bg-white border border-[#E6E4F0] rounded-[20px] shadow-[0_10px_30px_-18px_rgba(11,11,26,.45)] p-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="text-left min-w-0 shrink-0 pl-2 pr-1"
              aria-label="Lihat rincian pesanan"
            >
              <div className="text-[11px] text-[#6B6A80] leading-none">Total bayar</div>
              <div className="disp text-[17px] font-extrabold leading-tight mt-1 flex items-center gap-1">
                {rp(total)}
                <Icon name="chevronDown" size={13} stroke="#A3A2B5" />
              </div>
            </button>
            <button
              type="button"
              onClick={goCheckout}
              disabled={!order.ok}
              className="btn-accent flex-1 min-h-[52px] text-[15px]"
            >
              {ctaHint}
            </button>
          </div>
        </div>
      )}

      {/* ================= MOBILE SUMMARY SHEET ================= */}
      {isMobile && sheetOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/45"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(11,11,26,.22)]">
            <div className="w-10 h-1 rounded-full bg-[#E6E4F0] mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Ringkasan pesanan</h3>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Tutup"
                className="w-9 h-9 grid place-items-center rounded-full active:bg-black/5 transition"
              >
                <Icon name="chevronDown" size={20} stroke="#6B6A80" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">{summaryRows}</div>

            <div className="mt-5 pt-4 border-t border-dashed border-[#E6E4F0] flex justify-between items-baseline">
              <span className="text-[#6B6A80] text-sm">Total bayar</span>
              <span className="disp text-2xl font-bold">{rp(total)}</span>
            </div>

            <button
              type="button"
              onClick={goCheckout}
              disabled={!order.ok}
              className="btn-accent w-full mt-5 min-h-[52px]"
            >
              Lanjut ke Checkout →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
