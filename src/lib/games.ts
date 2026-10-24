import type { Item } from "./services";

export type Game = {
  zone: boolean;
  label?: string;
  gradient: string;
  items: Item[];
  chips: Item[];
};

export const GAMES: Record<string, Game> = {
  "Mobile Legends": {
    zone: true,
    gradient: "from-[#2A5BFF] to-[#0E1B5C]",
    items: [
      ["5 Diamond", "", 2900],
      ["86 Diamond", "", 22000],
      ["172 Diamond", "", 43500],
      ["257 Diamond", "", 64500],
      ["344 Diamond", "", 86500],
      ["706 Diamond", "", 172000],
    ],
    chips: [
      ["5 💎", "", 2900],
      ["86 💎", "", 22000],
      ["172 💎", "", 43500],
      ["257 💎", "", 64500],
      ["344 💎", "", 86500],
      ["706 💎", "", 172000],
    ],
  },
  "Free Fire": {
    zone: false,
    gradient: "from-[#FF7A1A] to-[#7A1F00]",
    items: [
      ["5 Diamond", "", 1500],
      ["70 Diamond", "", 9500],
      ["140 Diamond", "", 19000],
      ["355 Diamond", "", 47500],
      ["720 Diamond", "", 95000],
      ["1450 Diamond", "", 190000],
    ],
    chips: [
      ["5 💎", "", 1500],
      ["70 💎", "", 9500],
      ["140 💎", "", 19000],
      ["355 💎", "", 47500],
      ["720 💎", "", 95000],
      ["1450 💎", "", 190000],
    ],
  },
  "PUBG Mobile": {
    zone: false,
    gradient: "from-[#E8B23A] to-[#4A3300]",
    items: [
      ["60 UC", "", 15000],
      ["325 UC", "", 75000],
      ["660 UC", "", 149000],
      ["1800 UC", "", 375000],
    ],
    chips: [
      ["60 UC", "", 15000],
      ["325 UC", "", 75000],
      ["660 UC", "", 149000],
      ["1800 UC", "", 375000],
    ],
  },
  "Genshin Impact": {
    zone: true,
    label: "Server",
    gradient: "from-[#5B3DF5] to-[#1C0F66]",
    items: [
      ["60 Genesis Crystal", "", 16000],
      ["330 Genesis Crystal", "", 79000],
      ["1090 Genesis Crystal", "", 249000],
      ["Blessing of the Welkin Moon", "", 79000],
    ],
    chips: [
      ["60 Crystal", "", 16000],
      ["330 Crystal", "", 79000],
      ["1090 Crystal", "", 249000],
      ["Welkin", "", 79000],
    ],
  },
};

export const gameNames = Object.keys(GAMES);
