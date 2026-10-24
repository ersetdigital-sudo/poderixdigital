"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-sm text-[#6B6A80] hover:text-black"
    >
      ← Kembali
    </button>
  );
}
