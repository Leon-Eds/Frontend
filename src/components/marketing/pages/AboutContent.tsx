"use client";

import { Ms } from "../Ms";
import { useMk } from "../useMk";
import { CtaBand, PageHero, SectionHead, StatsBand, d } from "../sections";

export function AboutContent() {
  const { t, r } = useMk();

  return (
    <>
      <PageHero crumb="mk.about.crumb" eyebrow="mk.about.eyebrow" title="mk.about.title" desc="mk.about.desc" />

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container split">
          <div className="reveal">
            <p className="big-quote">{r("mk.about.quote", { copper: (c) => <span>{c}</span> })}</p>
          </div>
          <div className="lead-copy reveal d1">
            <p>{t("mk.about.p1")}</p>
            <p>{t("mk.about.p2")}</p>
            <p>{t("mk.about.p3")}</p>
          </div>
        </div>
      </section>

      <StatsBand />

      <section className="section" style={{ background: "var(--cream)" }}>
        <div className="container">
          <SectionHead center eyebrow="mk.about.values.eyebrow" title="mk.about.values.title" />
          <div className="values">
            {["public", "encrypted", "verified_user"].map((icon, i) => (
              <div key={icon} className={"value reveal" + d(i)}>
                <div className="mi hex"><Ms name={icon} /></div>
                <h4>{t(`mk.about.v${i + 1}`)}</h4>
                <p>{t(`mk.about.v${i + 1}d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper)" }}>
        <div className="container">
          <SectionHead eyebrow="mk.about.aud.eyebrow" title="mk.about.aud.title" desc="mk.about.aud.desc" />
          <div className="audience">
            {(
              [
                ["admin_panel_settings", 1],
                ["co_present", 2],
                ["account_balance", 5],
                ["family_restroom", 3],
                ["school", 4],
              ] as const
            ).map(([icon, n], i) => (
              <div key={icon} className={"aud reveal" + d(i)}>
                <Ms name={icon} />
                <h4>{t(`mk.about.a${n}`)}</h4>
                <p>{t(`mk.about.a${n}d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
