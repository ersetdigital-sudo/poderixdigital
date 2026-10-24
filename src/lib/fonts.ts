import localFont from "next/font/local";

export const manrope = localFont({
  src: [
    { path: "../fonts/manrope-wght--extralight.ttf", weight: "200", style: "normal" },
    { path: "../fonts/manrope-wght--light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/manrope-wght--regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/manrope-wght--medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/manrope-wght--semibold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/manrope-wght--bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/manrope-wght--extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["sans-serif"],
});

export const sora = localFont({
  src: [
    { path: "../fonts/sora-wght--thin.ttf", weight: "100", style: "normal" },
    { path: "../fonts/sora-wght--extralight.ttf", weight: "200", style: "normal" },
    { path: "../fonts/sora-wght--light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/sora-wght--regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/sora-wght--medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/sora-wght--semibold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/sora-wght--bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/sora-wght--extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-sora",
  display: "swap",
  fallback: ["sans-serif"],
});
