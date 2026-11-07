"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Ms } from "./Ms";
import { useMk } from "./useMk";

/** Delay class for staggered reveal animations: 0 → "", 1 → "d1" … */
export const d = (i: number) => (i % 5 ? ` d${i % 5}` : "");

export function SectionHead({
  eyebrow,
  title,
  desc,
  center,
  style,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  center?: boolean;
  style?: React.CSSProperties;
}) {
  const { r } = useMk();
  return (
    <div className={center ? "section-head center" : "section-head"} style={style}>
      <span className="eyebrow reveal">
        <span>{r(eyebrow)}</span>
      </span>
      <h2 className="reveal d1">{r(title)}</h2>
      {desc && <p className="reveal d2">{r(desc)}</p>}
    </div>
  );
}

export function PageHero({
  crumb,
  parent,
  eyebrow,
  title,
  desc,
  style,
  children,
}: {
  crumb: string;
  parent?: [href: string, key: string];
  eyebrow: string;
  title: string;
  desc?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const { t, r } = useMk();
  return (
    <section className="page-hero" style={style}>
      <div className="container">
        <div className="crumbs">
          <Link href="/">{t("mk.crumbs.home")}</Link>
          <Ms name="chevron_right" />
          {parent && (
            <>
              <Link href={parent[0]}>{t(parent[1])}</Link>
              <Ms name="chevron_right" />
            </>
          )}
          <span>{t(crumb)}</span>
        </div>
        <span className="eyebrow">
          <span>{r(eyebrow)}</span>
        </span>
        <h1>{r(title)}</h1>
        {desc && <p>{r(desc)}</p>}
        {children}
      </div>
    </section>
  );
}

export function CtaBand() {
  const { t, r } = useMk();
  return (
    <section className="demo cta-band" style={{ paddingTop: 110 }}>
      <div className="container">
        <div className="demo-box">
          <div className="demo-copy reveal">
            <span className="eyebrow">
              <span>{r("mk.cta.eyebrow")}</span>
            </span>
            <h2>{t("mk.cta.title")}</h2>
            <p>{t("mk.cta.desc")}</p>
            <ul className="demo-perks">
              {["mk.cta.perk1", "mk.cta.perk2", "mk.cta.perk3"].map((k) => (
                <li key={k}>
                  <Ms name="check_circle" /> {t(k)}
                </li>
              ))}
            </ul>
          </div>
          <div className="cta-actions reveal d1">
            <Link href="/register" className="btn btn-primary">
              {t("mk.nav.register")} <Ms name="arrow_forward" className="arrow" />
            </Link>
            <Link href="/support" className="btn btn-light">
              <Ms name="support_agent" /> {t("mk.cta.support")}
            </Link>
            <small>
              {r("mk.cta.already", {
                a: (c) => (
                  <Link href="/login" style={{ color: "#fff", fontWeight: 700 }}>
                    {c}
                  </Link>
                ),
              })}
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Number that counts up from zero the first time it scrolls into view. */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const { language } = useMk();
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1600, 1);
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <b ref={ref}>
      {value.toLocaleString(language)}
      {suffix}
    </b>
  );
}

export function StatsBand() {
  const { t } = useMk();
  const stats: [number, string, string][] = [
    [500, "+", "mk.stats.institutions"],
    [99, "%", "mk.stats.efficiency"],
    [8, "", "mk.stats.modules"],
    [24, "/7", "mk.stats.support"],
  ];
  return (
    <section className="stats">
      <div className="container">
        {stats.map(([n, suffix, key], i) => (
          <div key={key} className={"stat reveal" + d(i)}>
            <CountUp to={n} suffix={suffix} />
            <p>{t(key)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export type FaqEntry = { q: string; a: string };

/** Accordion where only one item is open at a time. `tags` lets answers contain links. */
export function FaqList({
  items,
  firstOpen = true,
  tags,
  hidden,
}: {
  items: FaqEntry[];
  firstOpen?: boolean;
  tags?: Parameters<ReturnType<typeof useMk>["r"]>[1];
  hidden?: (item: FaqEntry) => boolean;
}) {
  const { t, r } = useMk();
  const [open, setOpen] = useState<string | null>(firstOpen ? items[0]?.q : null);
  return (
    <>
      {items.map((item) => {
        const isOpen = open === item.q;
        return (
          <div key={item.q} className={"faq-item reveal" + (isOpen ? " open" : "") + (hidden?.(item) ? " hide" : "")}>
            <button className="faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : item.q)}>
              {t(item.q)} <Ms name="add" />
            </button>
            <div className="faq-a">
              <div>
                <p>{r(item.a, tags)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Inline link style used inside FAQ answers and form notes. */
export const copperLink = (href: string) =>
  function CopperLink(c: React.ReactNode) {
    const style = { color: "var(--copper-600)", fontWeight: 700 };
    return href.startsWith("/") ? (
      <Link href={href} style={style}>
        {c}
      </Link>
    ) : (
      <a href={href} style={style}>
        {c}
      </a>
    );
  };
