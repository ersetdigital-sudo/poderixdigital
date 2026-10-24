"use client";

import { useState } from "react";

export function CopyButton({ code }: { code: string }) {
  const [label, setLabel] = useState("Salin");

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      /* clipboard unavailable */
    }
    setLabel("Tersalin!");
    setTimeout(() => setLabel("Salin"), 1500);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-6 inline-flex items-center gap-3 bg-black text-white rounded-full pl-5 pr-2 py-2 font-mono font-bold"
    >
      {code}
      <span className="bg-white/15 rounded-full px-3 py-1 text-xs font-sans">{label}</span>
    </button>
  );
}
