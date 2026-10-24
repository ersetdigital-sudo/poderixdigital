export function Logo({
  tone = "violet",
  className,
}: {
  tone?: "violet" | "lime";
  className?: string;
}) {
  const bg = tone === "violet" ? "#5B3DF5" : "#C6F432";
  const mark = tone === "violet" ? "#fff" : "#0B0B1A";
  const dot = tone === "violet" ? "#C6F432" : "#5B3DF5";

  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill={bg} />
        <path
          d="M14 30V10h7.5a6.5 6.5 0 0 1 0 13H14"
          fill="none"
          stroke={mark}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="27.5" cy="29" r="3" fill={dot} />
      </svg>
      <span className="leading-none">
        <span className="disp block text-[19px] font-bold">poderix</span>
        <span
          className={`block text-[10px] font-bold tracking-[.32em] mt-0.5 ${
            tone === "violet" ? "text-[#6B6A80]" : "text-white/60"
          }`}
        >
          DIGITAL
        </span>
      </span>
    </span>
  );
}
