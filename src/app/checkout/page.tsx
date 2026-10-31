import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { CheckoutClient } from "@/components/CheckoutClient";
import { getCatalog } from "@/lib/db/server";

export const metadata: Metadata = {
  title: "Checkout · Poderix Digital",
  description: "Selesaikan pembayaran pesanan isi ulang dan tagihan kamu.",
};

export default async function CheckoutPage() {
  const catalog = await getCatalog();
  const brand = catalog.data?.brand ?? null;
  const qrisMethodId =
    catalog.data?.methods.find((method) => method.name === "QRIS")?.id ?? null;
  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-5 py-10">
        <BackButton />
        <h1 className="text-3xl md:text-4xl font-bold mt-4">Checkout</h1>
        <CheckoutClient
          brandSlug={brand?.slug ?? ""}
          qrisMethodId={qrisMethodId}
          qrisImageUrl={brand?.qris_image_url ?? null}
        />
      </main>
      <Footer />
    </>
  );
}
