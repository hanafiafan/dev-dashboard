"use client";

import * as React from "react";

/**
 * Interactive animated background — soft gradient orbs.
 * One orb follows the cursor (with smoothing), the others drift on their own.
 * Sits above the static wallpaper (z -2) and below content.
 */
export function InteractiveBg() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let raf = 0;
    let tx = 50;
    let ty = 35;
    let cx = 50;
    let cy = 35;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const el = ref.current;
      if (el) {
        el.style.setProperty("--mx", `${cx}%`);
        el.style.setProperty("--my", `${cy}%`);
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: -1, "--mx": "50%", "--my": "35%" } as React.CSSProperties}
    >
      {/* cursor-following glow */}
      <div
        className="absolute h-[46vmax] w-[46vmax] rounded-full blur-[90px] transition-transform"
        style={{
          left: "var(--mx)",
          top: "var(--my)",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, hsl(var(--primary) / 0.22), transparent 68%)",
        }}
      />
      {/* drifting orbs */}
      <div
        className="absolute left-[12%] top-[68%] h-[34vmax] w-[34vmax] rounded-full blur-[90px]"
        style={{
          background: "radial-gradient(circle, hsl(280 80% 60% / 0.18), transparent 68%)",
          animation: "wp-drift 22s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute right-[8%] top-[10%] h-[30vmax] w-[30vmax] rounded-full blur-[90px]"
        style={{
          background: "radial-gradient(circle, hsl(190 90% 55% / 0.16), transparent 68%)",
          animation: "wp-drift 26s ease-in-out infinite alternate-reverse",
        }}
      />
    </div>
  );
}
