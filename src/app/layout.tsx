import type { Metadata } from "next";
import { manrope, sora } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poderix Digital · Isi Ulang & Bayar Tagihan Instan",
  description:
    "Pulsa, paket data, token PLN, top up game, e-wallet sampai bayar tagihan. Harga bersahabat, langsung masuk, tanpa ribet daftar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${manrope.variable} ${sora.variable} scroll-smooth antialiased`}>
      <body>{children}</body>
    </html>
  );
}
