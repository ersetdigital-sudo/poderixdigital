import { Icon } from "./Icons";
import type { Service } from "@/lib/services";

export function ServiceHero({ service }: { service: Service }) {
  return (
    <section className="rounded-[26px] md:rounded-[30px] bg-[#0B0B1A] text-white border border-white/10 shadow-[0_20px_45px_-30px_rgba(11,11,26,.75)]">
      <div className="p-5 md:p-8">
        <div className="flex items-start gap-4">
          <span className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-[#C6F432] grid place-items-center">
            <Icon name={service.icon.name} size={24} stroke="#0B0B1A" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] md:text-xs font-extrabold tracking-[.18em] text-[#C6F432] mb-1.5">
              LAYANAN DIGITAL
            </div>
            <h1 className="text-[22px] md:text-4xl font-extrabold leading-[1.15]">
              {service.title}
            </h1>
            <p className="mt-2 md:mt-3 text-[#B8B6C7] text-sm md:text-base leading-relaxed max-w-2xl">
              {service.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
