"use client";

import Link from "next/link";
import { Ms } from "../Ms";
import { useMk } from "../useMk";
import { CtaBand, PageHero, SectionHead, d } from "../sections";

const CARDS = ["sync_lock", "enhanced_encryption", "receipt_long", "admin_panel_settings", "verified_user", "monitor_heart"];
const LIFECYCLE = ["input", "lock", "download", "delete_forever"];

export function SecurityContent() {
  const { t } = useMk();

  return (
    <>
      <PageHero crumb="mk.security.crumb" eyebrow="mk.security.eyebrow" title="mk.security.title" desc="mk.security.desc" />

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="sec-grid">
            {CARDS.map((icon, i) => {
              const n = i + 1;
              const spec = t(`mk.security.c${n}s`);
              return (
                <div key={icon} className={"sec-card reveal" + d(i % 3)}>
                  <div className="mi hex"><Ms name={icon} /></div>
                  <h4>{t(`mk.security.c${n}`)}</h4>
                  <p>{t(`mk.security.c${n}d`)}</p>
                  {spec && spec !== `mk.security.c${n}s` && <span className="spec">{spec}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--cream)" }}>
        <div className="container split">
          <div>
            <SectionHead eyebrow="mk.security.life.eyebrow" title="mk.security.life.title" desc="mk.security.life.desc" style={{ marginBottom: 24 }} />
            <Link href="/privacy" className="btn btn-green reveal">
              {t("mk.security.life.cta")} <Ms name="arrow_forward" className="arrow" />
            </Link>
          </div>
          <ul className="local-list" style={{ marginTop: 0 }}>
            {LIFECYCLE.map((icon, i) => (
              <li key={icon} className={"reveal" + d(i)}>
                <Ms name={icon} />
                <div>
                  <h4>{t(`mk.security.l${i + 1}`)}</h4>
                  <p>{t(`mk.security.l${i + 1}d`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="faq-help reveal" style={{ background: "var(--cream)", maxWidth: 820, margin: "0 auto", padding: 30 }}>
            <Ms name="bug_report" />
            <div>
              <b style={{ fontSize: 19 }}>{t("mk.security.report")}</b>
              <p style={{ color: "var(--ink-2)", margin: "4px 0 6px" }}>{t("mk.security.reportd")}</p>
              <a href="mailto:support@leoned.africa?subject=Security%20report">{t("mk.security.reportLink")}</a>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
