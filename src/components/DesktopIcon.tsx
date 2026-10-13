export type AppId =
  "game" | "pedia" | "archive" | "help" | "settings" | "recycle" | "inspector";
export function DesktopArt({ kind }: { kind: AppId }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="desktop-art">
      <g
        stroke="#302b39"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {kind === "game" ? (
          <>
            <path d="M25 10v15C7 31 10 55 32 55s25-24 7-30V10" fill="#fff5dc" />
            <path d="M15 36q16-5 34 0c8 25-40 25-34 0" fill="#b4a0d4" />
            <path d="M25 10v15C7 31 10 55 32 55s25-24 7-30V10" fill="none" />
            <rect x="23" y="7" width="18" height="9" rx="2" fill="#c9a17b" />
            <path d="M32 34a8 8 0 1 0 9 10 8 8 0 0 1-9-10" fill="#fff3bc" />
            <path d="M50 12v8m-4-4h8M12 21v6m-3-3h6" />
          </>
        ) : kind === "pedia" ? (
          <>
            <path d="M12 14h37v42H12q-5 0-5-5V19q0-5 5-5" fill="#aabc9b" />
            <path d="M15 8h38v43H15q-7 0-7 5V15q0-7 7-7" fill="#dce9b1" />
            <path d="M16 9v41m8-29h20m-20 5h15" />
            <path d="M32 34v5q-10 9 1 10 11-1 1-10v-5Z" fill="#bba7d9" />
          </>
        ) : kind === "archive" ? (
          <>
            <path d="M7 20V13h22l5 7h23v35H7Z" fill="#e8cba0" />
            <path d="M12 23h39v28H12Z" fill="#fff7db" />
            <path d="m6 29 7 27h43l3-27Z" fill="#f5dfa9" />
            <path d="M27 38h15m-15 5h10" />
          </>
        ) : kind === "help" ? (
          <>
            <path d="M16 6h25l12 12v40H16Z" fill="#fff9e8" />
            <path d="M41 6v14h12M23 40h22m-22 6h16" />
            <path d="M29 27c0-7 11-7 11 0 0 4-6 3-6 7m0 3v1" fill="none" />
          </>
        ) : kind === "settings" ? (
          <>
            <path
              d="m26 9 12 0 2 8 8-2 6 10-6 6 6 6-6 10-8-2-2 8H26l-2-8-8 2-6-10 6-6-6-6 6-10 8 2Z"
              fill="#c5d9e8"
            />
            <circle cx="32" cy="31" r="10" fill="#fff9e8" />
            <circle cx="32" cy="31" r="4" fill="#b2a2cd" />
          </>
        ) : (
          <>
            <path d="M17 20h31l-4 36H21Z" fill="#e1dbdb" />
            <path d="M13 17h39v5H13Zm13-7h12v7H26Z" fill="#f9f4e7" />
            <path d="m27 29 1 18m9-18-1 18" />
          </>
        )}
      </g>
    </svg>
  );
}
export function DesktopIcon({
  kind,
  label,
  onClick,
}: {
  kind: AppId;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className="desktop-shortcut" onClick={onClick}>
      <DesktopArt kind={kind} />
      <span>{label}</span>
    </button>
  );
}
