"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./Icons";
import type { Service } from "@/lib/services";

export function ServiceAppBar({ service }: { service: Service }) {
  const router = useRouter();

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-[#F6F5FB]/75 backdrop-blur-2xl border-b border-[#E6E4F0]/70">
      <div className="h-14 flex items-center gap-3 px-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Kembali"
          className="w-10 h-10 grid place-items-center rounded-full bg-white/80 shadow-[0_2px_10px_-4px_rgba(11,11,26,.3)] active:scale-90 transition"
        >
          <Icon name="chevronLeft" size={20} stroke="#0B0B1A" />
        </button>

        <span className="w-8 h-8 shrink-0 rounded-xl grid place-items-center bg-[#5B3DF5]">
          <Icon name={service.icon.name} size={15} stroke="#fff" />
        </span>

        <span className="text-[15px] font-bold truncate">{service.title}</span>
      </div>
    </div>
  );
}
