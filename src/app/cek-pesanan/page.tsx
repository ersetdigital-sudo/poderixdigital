import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TrackClient } from "@/components/TrackClient";

export const metadata: Metadata = {
  title: "Cek Pesanan · Poderix Digital",
  description: "Lacak status transaksi isi ulang dan tagihan kamu.",
};

export default function TrackPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-5 py-10 min-h-[70vh]">
        <h1 className="text-3xl md:text-4xl font-bold">Cek status pesanan</h1>
        <p className="text-[#6B6A80] mt-2">Masukkan nomor invoice buat lihat status transaksi kamu.</p>
        <Suspense fallback={<div className="h-24" />}>
          <TrackClient />
        </Suspense>
      </main>
      <footer className="border-t border-[#E6E4F0] py-8 text-center text-sm text-[#6B6A80]">
        © 2026 Poderix Digital ·{" "}
        <Link href="/" className="font-semibold text-[#0B0B1A]">
          Kembali ke beranda
        </Link>
      </footer>
    </>
  );
}
