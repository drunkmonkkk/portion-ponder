import { useState } from "react";
import type { AppId } from "../components/DesktopIcon";
export type WindowState = {
  id: AppId;
  minimized: boolean;
  maximized: boolean;
  z: number;
};
export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([
    { id: "game", minimized: false, maximized: false, z: 1 },
  ]);
  // Keep ranks bounded so long sessions never overtake the taskbar or dialogs.
  const raise = (ws: WindowState[], id: AppId): WindowState[] => {
    const target = ws.find((w) => w.id === id);
    if (!target) return ws;
    const ordered = [...ws].sort((a, b) => a.z - b.z);
    if (ordered.at(-1)?.id === id && !target.minimized) return ws;
    const order = [...ordered.filter((w) => w.id !== id).map((w) => w.id), id];
    return ws.map((w) => ({
      ...w,
      z: order.indexOf(w.id) + 1,
      minimized: w.id === id ? false : w.minimized,
    }));
  };
  const front = (id: AppId) => setWindows((ws) => raise(ws, id));
  const open = (id: AppId) =>
    setWindows((ws) => {
      if (ws.some((w) => w.id === id)) return raise(ws, id);
      const ordered = [...ws].sort((a, b) => a.z - b.z).map((w) => w.id);
      return [
        ...ws.map((w) => ({ ...w, z: ordered.indexOf(w.id) + 1 })),
        { id, minimized: false, maximized: false, z: ws.length + 1 },
      ];
    });
  const close = (id: AppId) =>
    setWindows((ws) => ws.filter((w) => w.id !== id));
  const minimize = (id: AppId) =>
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    );
  const maximize = (id: AppId) =>
    setWindows((ws) =>
      ws.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)),
    );
  return { windows, open, close, minimize, maximize, front };
}
