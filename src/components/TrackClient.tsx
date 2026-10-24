"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { rp } from "@/lib/format";
import { loadOrders } from "@/lib/store";
import type { SavedOrder } from "@/lib/store";

type Status = "success" | "processing" | "pending" | "expired";

const STEPS: [string, keyof SavedOrder | "paidAt"][] = [
  ["Pesanan dibuat", "created"],
  ["Menunggu pembayaran", "created"],
  ["Pembayaran diterima", "paidAt"],
  ["Diproses ke provider", "paidAt"],
  ["Selesai", "paidAt"],
];

const BADGES: Record<Status, [string, string]> = {
  success: ["Berhasil", "bg-[#DCFCE7] text-[#16A34A]"],
  processing: ["Sedang diproses", "bg-[#EDE9FF] text-[#5B3DF5]"],
  pending: ["Menunggu pembayaran", "bg-[#FEF3C7] text-[#B45309]"],
  expired: ["Kedaluwarsa", "bg-[#FFE4E6] text-[#E11D48]"],
};

const dt = (t: number) =>
  new Date(t).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function TrackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inv, setInv] = useState("");
  const [found, setFound] = useState<SavedOrder | null>(null);
  const [missing, setMissing] = useState(false);
  const [recent, setRecent] = useState<SavedOrder[]>([]);

  useEffect(() => {
    const orders = loadOrders();
    setRecent(orders.slice(0, 5));
    const q = searchParams.get("inv");
    if (q) {
      setInv(q);
      show(q, orders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function show(value: string, source?: SavedOrder[]) {
    const code = (value || "").trim().toUpperCase();
    if (!code) {
      setFound(null);
      setMissing(false);
      return;
    }
    const orders = source ?? loadOrders();
    const record = orders.find((x) => x.inv === code);
    if (!record) {
      setFound(null);
      setMissing(true);
      return;
    }
    setFound(record);
    setMissing(false);
    if (searchParams.get("inv") !== code) {
      router.replace(`/cek-pesanan/?inv=${code}`, { scroll: false });
    }
  }

  const status: Status | null = found
    ? found.status === "success"
      ? "success"
      : found.status === "processing"
        ? "processing"
        : Date.now() - found.created > 900000
          ? "expired"
          : "pending"
    : null;

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          show(inv);
        }}
        className="card p-4 mt-6 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={inv}
          onChange={(e) => setInv(e.target.value)}
          className="inp text-lg font-mono uppercase flex-1"
          placeholder="PDX123456789"
          autoComplete="off"
          required
        />
        <button type="submit" className="btn">
          Lacak
        </button>
      </form>

      {recent.length > 0 && (
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#6B6A80] mb-2">
            Pesanan terakhir di perangkat ini
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r.inv}
                type="button"
                onClick={() => {
                  setInv(r.inv);
                  show(r.inv);
                }}
                className="opt text-sm"
              >
                <b className="font-mono">{r.inv}</b> · {r.service}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {missing && (
          <div className="card p-8 text-center">
            <h2 className="text-xl font-bold">Pesanan tidak ditemukan</h2>
            <p className="text-[#6B6A80] mt-2">
              Cek lagi nomor invoice kamu (contoh: PDX123456789). Nomor ada di halaman pembayaran & bukti
              transaksi.
            </p>
          </div>
        )}

        {found && status && (
          <div className="card p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-[#6B6A80]">No. invoice</div>
                <div className="font-mono text-xl font-bold">{found.inv}</div>
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${BADGES[status][1]}`}>
                {BADGES[status][0]}
              </span>
            </div>

            <ol className="mt-8 space-y-0">
              {STEPS.map(([title, key], i) => {
                const ok =
                  status === "success" || (status === "processing" ? i < 4 : key !== "paidAt");
                const time = found[key] as number | undefined;
                const nextOk =
                  i < STEPS.length - 1
                    ? status === "success" ||
                      (status === "processing" ? i + 1 < 4 : STEPS[i + 1][1] !== "paidAt")
                    : false;
                return (
                  <li key={title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${
                          ok ? "bg-[#5B3DF5] text-white" : "bg-white border border-[#E6E4F0] text-[#6B6A80]"
                        }`}
                      >
                        {ok ? "✓" : i + 1}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span
                          className={`w-px flex-1 min-h-[28px] ${
                            ok && nextOk ? "bg-[#5B3DF5]" : "bg-[#E6E4F0]"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-5">
                      <div className={`font-semibold ${ok ? "" : "text-[#6B6A80]"}`}>{title}</div>
                      {ok && time ? <div className="text-xs text-[#6B6A80]">{dt(time)}</div> : null}
                    </div>
                  </li>
                );
              })}
            </ol>

            {found.sn && (
              <div className="rounded-2xl bg-[#F6F5FB] p-5 text-center">
                <div className="text-sm text-[#6B6A80]">{found.label}</div>
                <div className="font-mono text-xl font-bold mt-1 tracking-wider">{found.sn}</div>
              </div>
            )}

            <div className="mt-6 space-y-2 text-sm">
              {found.lines.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-[#6B6A80]">{k}</span>
                  <b className="text-right">{v}</b>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span className="text-[#6B6A80]">Metode</span>
                <b className="text-right">{found.method}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6B6A80]">Total</span>
                <b className="text-right">{rp(found.total)}</b>
              </div>
            </div>

            {status === "processing" && (
              <p className="mt-6 rounded-2xl bg-[#F6F5FB] p-4 text-sm text-[#6B6A80]">
                Pembayaran sedang diverifikasi dan pesanan sedang diproses.
              </p>
            )}
            {status === "pending" && (
              <p className="mt-6 text-sm text-[#6B6A80]">
                Belum bayar? Selesaikan sebelum {dt(found.created + 900000)}.
              </p>
            )}
            {status === "expired" && (
              <Link href="/#layanan" className="btn inline-block mt-6">
                Pesan ulang
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
