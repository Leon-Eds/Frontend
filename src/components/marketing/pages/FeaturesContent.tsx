"use client";

import Link from "next/link";
import { Ms } from "../Ms";
import { useMk } from "../useMk";
import { CtaBand, PageHero } from "../sections";

// [anchor id, big icon, chip icons a / b / (c)]
const FEATURES: [string, string, string[]][] = [
  ["records", "folder_shared", ["lock", "bolt"]],
  ["results", "grading", ["calculate", "description"]],
  ["portals", "shield_lock", ["family_restroom", "school", "co_present"]],
  ["multi-school", "domain", ["account_tree", "hub"]],
  ["fees", "payments", ["notifications", "receipt_long"]],
  ["attendance", "fact_check", ["how_to_reg", "trending_up"]],
  ["scheme", "event_note", ["upload_file", "monitoring"]],
  ["curriculum", "menu_book", ["rule", "public"]],
  ["communication", "campaign", ["mark_email_unread", "alarm"]],
  ["staff", "badge", ["manage_accounts", "key"]],
  ["analytics", "insights", ["bar_chart", "pie_chart"]],
  ["mobile", "phone_iphone", ["signal_cellular_alt", "devices"]],
];

export function FeaturesContent() {
  const { t } = useMk();

  return (
    <>
      <PageHero crumb="mk.features.crumb" eyebrow="mk.features.eyebrow" title="mk.features.title" desc="mk.features.desc" />

      <section className="section" style={{ background: "var(--paper)", paddingTop: 60 }}>
        <div className="container">
          <div className="jump reveal">
            {FEATURES.map(([id]) => (
              <a key={id} href={`#${id}`}>
                {t(`mk.feat.${id}.jump`)}
              </a>
            ))}
          </div>

          {FEATURES.map(([id, icon, chips], i) => {
            const k = (s: string) => t(`mk.feat.${id}.${s}`);
            return (
              <div className="feat-row" id={id} key={id}>
                <div className="reveal">
                  <span className="num">
                    {t(i < 4 ? "mk.features.core" : "mk.features.module")} · {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{k("title")}</h3>
                  <p>{k("desc")}</p>
                  <ul className="checks">
                    {[1, 2, 3, 4].map((n) => (
                      <li key={n}>
                        <Ms name="check_circle" /> {k(`c${n}`)}
                      </li>
                    ))}
                  </ul>
                  {id === "multi-school" && (
                    <Link href="/register" className="btn btn-green">
                      {t("mk.pillar.more")} <Ms name="arrow_forward" className="arrow" />
                    </Link>
                  )}
                </div>
                <div className="feat-visual reveal d1">
                  <div className="big-ic hex">
                    <Ms name={icon} />
                  </div>
                  {chips.map((chip, ci) => {
                    const slot = "abc"[ci];
                    return (
                      <span key={slot} className={`chip ${slot}`}>
                        <Ms name={chip} /> {k(slot)}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
