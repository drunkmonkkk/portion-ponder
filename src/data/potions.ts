// Original fictional brands. The identity is always visible; only the shelf order is secret.
export type Potion = {
  id: string;
  name: string;
  color: string;
  ink: string;
  flavor: string;
  cap: string;
  pattern: "stripes" | "dots" | "zigzag" | "stars" | "rings";
  silhouette: number;
  label: [string, string];
};
export const potions: Potion[] = [
  {
    id: "cherry",
    name: "Cherry Pop",
    color: "Cherry red",
    ink: "#dd737e",
    flavor: "Cherry soda",
    cap: "#d86c79",
    pattern: "dots",
    silhouette: 0,
    label: ["CHERRY", "POP"],
  },
  {
    id: "blue",
    name: "Blue Burst",
    color: "Sky blue",
    ink: "#83b5dd",
    flavor: "Blue raspberry",
    cap: "#678fb9",
    pattern: "stars",
    silhouette: 1,
    label: ["BLUE", "BURST"],
  },
  {
    id: "lime",
    name: "Lime Fizz",
    color: "Lime green",
    ink: "#a6c16f",
    flavor: "Lemon-lime",
    cap: "#89a751",
    pattern: "stripes",
    silhouette: 2,
    label: ["LIME", "FIZZ"],
  },
  {
    id: "sunny",
    name: "Sunny Sip",
    color: "Golden yellow",
    ink: "#e6c464",
    flavor: "Mango soda",
    cap: "#d9ad4e",
    pattern: "rings",
    silhouette: 3,
    label: ["SUNNY", "SIP"],
  },
  {
    id: "berry",
    name: "Berry Blast",
    color: "Berry purple",
    ink: "#b49acf",
    flavor: "Mixed berries",
    cap: "#9677b8",
    pattern: "stars",
    silhouette: 4,
    label: ["BERRY", "BLAST"],
  },
  {
    id: "peach",
    name: "Peach Pop",
    color: "Soft peach",
    ink: "#eab08b",
    flavor: "Peach soda",
    cap: "#c98e70",
    pattern: "dots",
    silhouette: 5,
    label: ["PEACH", "POP"],
  },
  {
    id: "cola",
    name: "Cola Club",
    color: "Caramel brown",
    ink: "#aa7e65",
    flavor: "Vanilla cola",
    cap: "#b9946e",
    pattern: "stripes",
    silhouette: 6,
    label: ["COLA", "CLUB"],
  },
  {
    id: "pink",
    name: "Pink Lemonade",
    color: "Pastel pink",
    ink: "#e6b1c9",
    flavor: "Rose lemonade",
    cap: "#c78ea8",
    pattern: "zigzag",
    silhouette: 7,
    label: ["PINK", "LEMONADE"],
  },
  {
    id: "orange",
    name: "Orange Splash",
    color: "Apricot orange",
    ink: "#e59a63",
    flavor: "Orange soda",
    cap: "#d08549",
    pattern: "rings",
    silhouette: 8,
    label: ["ORANGE", "SPLASH"],
  },
  {
    id: "mint",
    name: "Minty Fizz",
    color: "Mint green",
    ink: "#99c4aa",
    flavor: "Mint & lime",
    cap: "#709d88",
    pattern: "zigzag",
    silhouette: 9,
    label: ["MINTY", "FIZZ"],
  },
];
export const byId = Object.fromEntries(potions.map((p) => [p.id, p])) as Record<
  string,
  Potion
>;
