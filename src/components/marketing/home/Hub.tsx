"use client";

import { useEffect, useState } from "react";
import { Ms } from "../Ms";
import { useMk } from "../useMk";

const NODES: [icon: string, key: string][] = [
  ["corporate_fare", "owners"],
  ["admin_panel_settings", "admins"],
  ["co_present", "teachers"],
  ["school", "students"],
  ["family_restroom", "parents"],
  ["account_balance", "accounts"],
  ["badge", "staff"],
  ["domain", "campuses"],
];

const R = 40; // node orbit radius, in % of the hub box

/** Animated diagram: every role orbits the LeonEd core with data pulses on the spokes. */
export function Hub() {
  const { t, r } = useMk();
  const [lit, setLit] = useState(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setLit((i) => (i + 1) % NODES.length), 1400);
    return () => clearInterval(id);
  }, []);

  const points = NODES.map((_, i) => {
    const angle = ((-90 + (360 / NODES.length) * i) * Math.PI) / 180;
    // rounded so server and client render identical attribute strings
    return { x: +(50 + R * Math.cos(angle)).toFixed(3), y: +(50 + R * Math.sin(angle)).toFixed(3) };
  });

  return (
    <div className="hub reveal d2" role="img" aria-label={t("mk.hub.label")}>
      <svg className="hub-lines" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="hub-ring" cx="50" cy="50" r="40" vectorEffect="non-scaling-stroke" />
        <circle className="hub-ring inner" cx="50" cy="50" r="22" />
        {points.map(({ x, y }, i) => (
          <line key={`l${i}`} className="hub-spoke" x1="50" y1="50" x2={x} y2={y} vectorEffect="non-scaling-stroke" />
        ))}
        {points.map(({ x, y }, i) => (
          <circle key={`p${i}`} className="hub-pulse" r="1.1">
            <animateMotion
              path={i % 2 === 0 ? `M50 50 L${x} ${y}` : `M${x} ${y} L50 50`}
              dur={`${2.6 + (i % 3) * 0.5}s`}
              begin={`${-i * 0.35}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
      <div className="hub-core hex">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marketing/leoned-icon.png" alt="" />
      </div>
      <span className="hub-core-label">{r("mk.hub.core")}</span>
      {NODES.map(([icon, key], i) => (
        <div
          key={key}
          className={i === lit ? "hub-node lit" : "hub-node"}
          style={{ left: `${points[i].x}%`, top: `${points[i].y}%` }}
        >
          <span className="ico">
            <Ms name={icon} />
          </span>
          <b>
            {t(`mk.hub.${key}`)}
            <small>{t(`mk.hub.${key}d`)}</small>
          </b>
        </div>
      ))}
    </div>
  );
}
