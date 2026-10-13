import { useId } from "react";
import type { Potion } from "../data/potions";
const outlines = [
  "M40 23v24Q25 52 25 65v57q0 9 10 9h30q10 0 10-9V65q0-13-15-18V23Z",
  "M41 23v29L30 62v63q0 6 7 6h26q7 0 7-6V62L59 52V23Z",
  "M39 23v21L23 61v62q0 8 9 8h36q9 0 9-8V61L61 44V23Z",
  "M40 23v24q-20 9-19 31l4 45q1 8 10 8h30q9 0 10-8l4-45q1-22-19-31V23Z",
  "M40 23v23q-16 6-16 23v55q0 7 9 7h34q9 0 9-7V69q0-17-16-23V23Z",
  "M39 23v24Q19 55 21 75l4 49q0 7 10 7h30q10 0 10-7l4-49q2-20-18-28V23Z",
  "M41 23v25q-17 9-15 28l4 15-3 30q-1 10 10 10h26q11 0 10-10l-3-30 4-15q2-19-15-28V23Z",
  "M41 23v28Q29 58 29 72v51q0 8 9 8h24q9 0 9-8V72q0-14-12-21V23Z",
  "M39 23v24Q18 55 22 77l2 46q1 8 10 8h32q9 0 10-8l2-46q4-22-17-30V23Z",
  "M40 23v24L26 59v63q0 9 9 9h30q9 0 9-9V59L60 47V23Z",
];
export function PotionBottle({
  potion: p,
  large = false,
}: {
  potion: Potion;
  large?: boolean;
}) {
  const clip = useId().replace(/:/g, "");
  const outline = outlines[p.silhouette];
  return (
    <svg
      className={`potion-art soda-art ${large ? "large" : ""}`}
      viewBox="0 0 100 145"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clip}>
          <path d={outline} />
        </clipPath>
      </defs>
      <ellipse cx="50" cy="136" rx="27" ry="4" fill="#342c38" opacity=".1" />
      <path
        d={outline}
        fill="#fffcee"
        stroke="#302b39"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <g clipPath={`url(#${clip})`}>
        <path d="M16 61q17-5 34 0t34 0v73H16Z" fill={p.ink} />
        <path
          d="M16 61q17-5 34 0t34 0"
          stroke="#302b39"
          opacity=".2"
          fill="none"
        />
        <path
          d="M31 65v12m0 29v12"
          stroke="#fffef3"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".6"
        />
        <circle cx="62" cy="71" r="2" fill="#fff9e8" opacity=".7" />
        <circle cx="39" cy="121" r="2.2" fill="#fff9e8" opacity=".5" />
        <circle cx="58" cy="117" r="1.2" fill="#fff9e8" opacity=".6" />
        {p.pattern === "stripes" ? (
          <path
            d="m20 71 65 40m-65 0 65 40"
            stroke="#fff9e8"
            strokeWidth="4"
            opacity=".25"
          />
        ) : p.pattern === "zigzag" ? (
          <path
            d="m20 117 10-6 10 6 10-6 10 6 10-6 10 6"
            stroke="#fff9e8"
            fill="none"
            strokeWidth="2"
          />
        ) : p.pattern === "dots" ? (
          <g fill="#fff9e8" opacity=".7">
            <circle cx="65" cy="113" r="2" />
            <circle cx="33" cy="72" r="2" />
            <circle cx="48" cy="124" r="1.5" />
          </g>
        ) : p.pattern === "rings" ? (
          <g fill="none" stroke="#fff9e8" opacity=".7">
            <circle cx="65" cy="115" r="4" />
            <circle cx="35" cy="73" r="3" />
          </g>
        ) : (
          <path d="m64 112 2 4 4 1-4 2-2 4-1-4-4-2 4-1Z" fill="#fff6bd" />
        )}
      </g>
      <path d={outline} fill="none" stroke="#302b39" strokeWidth="2.3" />
      <rect
        x="36"
        y="15"
        width="28"
        height="12"
        rx="3"
        fill={p.cap}
        stroke="#302b39"
        strokeWidth="2"
      />
      <path
        d="M40 18v6m5-6v6m5-6v6m5-6v6m5-6v6"
        stroke="#302b39"
        strokeWidth="1"
        opacity=".45"
      />
      <rect
        x="39"
        y="28"
        width="22"
        height="6"
        rx="1.5"
        fill="#fff1ca"
        stroke="#302b39"
        strokeWidth="1.2"
      />
      <path d="m39 39 20 2" stroke={p.cap} strokeWidth="4" />
      <path
        d="M27 81q23-4 46 0v29q-23 4-46 0Z"
        fill="#fff8df"
        stroke="#302b39"
        strokeWidth="1.4"
      />
      <text
        x="50"
        y="91"
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize="7.6"
        fill="#302b39"
      >
        {p.label[0]}
      </text>
      <text
        x="50"
        y="101"
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="bold"
        fontSize={p.label[1].length > 5 ? "6" : "8.5"}
        fill="#302b39"
      >
        {p.label[1]}
      </text>
      <path d="M39 106h22" stroke={p.cap} strokeWidth="2" />
    </svg>
  );
}
