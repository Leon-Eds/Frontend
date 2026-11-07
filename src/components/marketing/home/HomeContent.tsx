"use client";

import Link from "next/link";
import { Ms } from "../Ms";
import { useMk } from "../useMk";
import { CtaBand, FaqList, SectionHead, StatsBand, copperLink, d } from "../sections";
import { Hub } from "./Hub";
import { PortalTabs } from "./PortalTabs";

function Hero() {
  const { t, r } = useMk();
  const bars: [number, string][] = [[72, "JSS1"], [88, "JSS2"], [64, "JSS3"], [96, "SS1"], [80, "SS2"], [70, "SS3"]];

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-copy">
          <span className="hero-badge reveal">
            <b>LeonEd</b> {t("mk.home.badge")}
          </span>
          <h1 className="reveal d1">{r("mk.home.title")}</h1>
          <p className="hero-lead reveal d2">{t("mk.home.lead")}</p>
          <div className="hero-cta reveal d3">
            <Link href="/register" className="btn btn-primary">
              {t("mk.nav.register")} <Ms name="arrow_forward" className="arrow" />
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              <Ms name="chat" /> {t("mk.home.contact")}
            </Link>
          </div>
          <div className="hero-roles reveal d4">
            <div className="role-stack">
              <span style={{ background: "#003f27" }}><Ms name="admin_panel_settings" /></span>
              <span style={{ background: "#b05d1c" }}><Ms name="co_present" /></span>
              <span style={{ background: "#17704a" }}><Ms name="school" /></span>
              <span style={{ background: "#8f4914" }}><Ms name="family_restroom" /></span>
            </div>
            <span className="trust-line">{t("mk.home.trust")}</span>
          </div>
        </div>

        <div className="hero-visual reveal d2">
          <div className="mock" aria-hidden="true">
            <div className="mock-side">
              <div className="logo-dot hex"><Ms name="menu_book" fill /></div>
              {["space_dashboard", "groups", "fact_check", "grading", "payments", "campaign"].map((icon, i) => (
                <i key={icon} className={i === 0 ? "on" : undefined}><Ms name={icon} /></i>
              ))}
            </div>
            <div className="mock-main">
              <div className="mock-top">
                <h4>
                  {t("mk.mock.greeting")} <small>{t("mk.mock.term")}</small>
                </h4>
                <span className="mock-pill">{t("mk.mock.live")}</span>
              </div>
              <div className="mock-stats">
                <div className="mstat"><small><Ms name="groups" /> {t("mk.mock.students")}</small><b>1,248</b><em>{t("mk.mock.studentsDelta")}</em></div>
                <div className="mstat"><small><Ms name="how_to_reg" /> {t("mk.mock.present")}</small><b>96.4%</b><em>{t("mk.mock.today")}</em></div>
                <div className="mstat"><small><Ms name="payments" /> {t("mk.mock.fees")}</small><b>₦18.4M</b><em>{t("mk.mock.feesDelta")}</em></div>
              </div>
              <div className="mock-grid">
                <div className="mcard">
                  <h5>{t("mk.mock.attendance")} <span>{t("mk.mock.thisWeek")}</span></h5>
                  <div className="bars">
                    {bars.map(([h, label], i) => (
                      <div key={label} className={label === "SS1" ? "peak" : undefined}>
                        <i style={{ height: `${h}%`, animationDelay: `${i / 10}s` }} />
                        <small>{label}</small>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mcard">
                  <h5>{t("mk.mock.activity")}</h5>
                  <ul className="feed">
                    {(
                      [
                        ["ic-g", "grading", "feed1"],
                        ["ic-c", "payments", "feed2"],
                        ["ic-g", "campaign", "feed3"],
                      ] as const
                    ).map(([tone, icon, key]) => (
                      <li key={key}>
                        <span className={`ic ${tone}`}><Ms name={icon} /></span>
                        <span><b>{t(`mk.mock.${key}`)}</b><small>{t(`mk.mock.${key}s`)}</small></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="float-card fc-1" aria-hidden="true">
            <span className="ic ic-c"><Ms name="notifications_active" /></span>
            <span><b>{t("mk.mock.float1")}</b><small>{t("mk.mock.float1s")}</small></span>
          </div>
          <div className="float-card fc-2" aria-hidden="true">
            <span className="ic ic-g"><Ms name="verified" /></span>
            <span><b>{t("mk.mock.float2")}</b><small>{t("mk.mock.float2s")}</small></span>
          </div>
          <div className="float-card fc-3" aria-hidden="true">
            <span className="ic" style={{ background: "rgba(255,255,255,.12)" }}><Ms name="sync" /></span>
            <span><b>{t("mk.mock.float3")}</b><small>{t("mk.mock.float3s")}</small></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Levels() {
  const { t } = useMk();
  const keys = ["nursery", "primary", "secondary", "private", "public", "multi", "districts", "colleges"];
  return (
    <div className="levels" aria-hidden="true">
      <div className="marquee">
        {[...keys, ...keys].map((k, i) => (
          <span key={i}>{t(`mk.levels.${k}`)}</span>
        ))}
      </div>
    </div>
  );
}

function Architecture() {
  const { t } = useMk();
  return (
    <section className="section connect" id="architecture">
      <div className="container">
        <div className="connect-copy">
          <SectionHead eyebrow="mk.arch.eyebrow" title="mk.arch.title" desc="mk.arch.desc" />
          <ul className="connect-points">
            {[1, 2, 3].map((n, i) => (
              <li key={n} className={"reveal" + d(i)}>
                <span className="num">0{n}</span>
                <div>
                  <h4>{t(`mk.arch.p${n}`)}</h4>
                  <p>{t(`mk.arch.p${n}d`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Hub />
      </div>

      <div className="container" style={{ display: "block" }}>
        <div className="pillars">
          <div className="pillar reveal">
            <div className="mi hex"><Ms name="folder_shared" /></div>
            <div>
              <h4>{t("mk.pillar.records")}</h4>
              <p>{t("mk.pillar.recordsd")}</p>
              <div className="tags"><span>{t("mk.pillar.tag1")}</span><span>{t("mk.pillar.tag2")}</span></div>
            </div>
          </div>
          <div className="pillar reveal d1">
            <div className="mi hex"><Ms name="domain" /></div>
            <div>
              <h4>{t("mk.pillar.multi")}</h4>
              <p>{t("mk.pillar.multid")}</p>
              <Link className="more" href="/register">{t("mk.pillar.more")} <Ms name="arrow_forward" /></Link>
            </div>
          </div>
          <div className="pillar reveal">
            <div className="mi hex"><Ms name="shield_lock" /></div>
            <div><h4>{t("mk.pillar.portals")}</h4><p>{t("mk.pillar.portalsd")}</p></div>
          </div>
          <div className="pillar reveal d1">
            <div className="mi hex"><Ms name="grading" /></div>
            <div><h4>{t("mk.pillar.results")}</h4><p>{t("mk.pillar.resultsd")}</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Portals() {
  return (
    <section className="section portals" id="portals">
      <div className="container">
        <SectionHead center eyebrow="mk.portals.eyebrow" title="mk.portals.title" desc="mk.portals.desc" />
        <PortalTabs />
      </div>
    </section>
  );
}

export const MODULES: [icon: string, key: string][] = [
  ["payments", "fees"],
  ["fact_check", "attendance"],
  ["event_note", "sow"],
  ["menu_book", "curriculum"],
  ["campaign", "comms"],
  ["badge", "staff"],
  ["insights", "analytics"],
  ["phone_iphone", "mobile"],
];

function Modules() {
  const { t } = useMk();
  return (
    <section className="section modules" id="additional-features">
      <div className="container">
        <SectionHead center eyebrow="mk.modules.eyebrow" title="mk.modules.title" desc="mk.modules.desc" />
        <div className="module-grid">
          {MODULES.map(([icon, key], i) => (
            <div key={key} className={"module reveal" + d(i % 4)}>
              <div className="mi hex"><Ms name={icon} /></div>
              <h4>{t(`mk.module.${key}`)}</h4>
              <p>{t(`mk.module.${key}d`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SchoolDay() {
  const { t } = useMk();
  const steps: [string, string][] = [["7:45", "how_to_reg"], ["9:00", "event_note"], ["12:30", "payments"], ["2:15", "grading"], ["4:00", "insights"]];
  return (
    <section className="section day">
      <div className="container">
        <SectionHead center eyebrow="mk.day.eyebrow" title="mk.day.title" desc="mk.day.desc" />
        <div className="timeline">
          {steps.map(([time, icon], i) => (
            <div key={time} className={"tstep reveal" + d(i)}>
              <div className="time">{time}</div>
              <div className="tcard">
                <Ms name={icon} />
                <h4>{t(`mk.day.s${i + 1}`)}</h4>
                <p>{t(`mk.day.s${i + 1}d`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyLeonEd() {
  const { t } = useMk();
  const rows: [string, number, number, number, string][] = [
    ["math", 34, 50, 84, "A"],
    ["english", 30, 46, 76, "A"],
    ["science", 28, 44, 72, "B"],
    ["social", 31, 48, 79, "A"],
    ["civic", 27, 41, 68, "B"],
  ];
  const list: [string, string][] = [["tune", "l1"], ["encrypted", "l2"], ["signal_cellular_alt", "l3"], ["domain", "l4"]];

  return (
    <section className="section local" id="why-leoned">
      <div className="container">
        <div className="local-card reveal" aria-hidden="true">
          <div className="report-head">
            <div>
              <h4>{t("mk.report.title")}</h4>
              <small>{t("mk.report.student")}</small>
            </div>
            <span className="tag c">{t("mk.report.auto")}</span>
          </div>
          <table className="report-table">
            <thead>
              <tr>
                <th>{t("mk.report.subject")}</th><th>{t("mk.report.ca")}</th><th>{t("mk.report.exam")}</th><th>{t("mk.report.total")}</th><th>{t("mk.report.grade")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([s, ca, exam, total, grade]) => (
                <tr key={s}>
                  <td>{t(`mk.subject.${s}`)}</td><td>{ca}</td><td>{exam}</td><td>{total}</td><td className="g">{grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="report-foot">
            <div><small>{t("mk.portals.student.m.average")}</small><b>78.4</b></div>
            <div><small>{t("mk.report.position")}</small><b>3rd / 38</b></div>
            <div><small>{t("mk.portals.student.m.attendance")}</small><b>58 / 60</b></div>
          </div>
        </div>
        <div>
          <SectionHead eyebrow="mk.why.eyebrow" title="mk.why.title" desc="mk.why.desc" style={{ marginBottom: 0 }} />
          <ul className="local-list">
            {list.map(([icon, key], i) => (
              <li key={key} className={"reveal" + d(i)}>
                <Ms name={icon} />
                <div>
                  <h4>{t(`mk.why.${key}`)}</h4>
                  <p>{t(`mk.why.${key}d`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const { t } = useMk();
  return (
    <section className="section steps">
      <div className="container">
        <SectionHead center eyebrow="mk.steps.eyebrow" title="mk.steps.title" desc="mk.steps.desc" />
        <div className="step-grid">
          {[1, 2, 3, 4].map((n, i) => (
            <div key={n} className={"step reveal" + d(i)}>
              <h4>{t(`mk.steps.s${n}`)}</h4>
              <p>{t(`mk.steps.s${n}d`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeFaq() {
  const { t } = useMk();
  const items = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ q: `mk.homeFaq.q${n}`, a: `mk.homeFaq.a${n}` }));
  return (
    <section className="section faq" id="faq" style={{ background: "var(--paper)" }}>
      <div className="container">
        <div className="faq-side">
          <SectionHead eyebrow="mk.homeFaq.eyebrow" title="mk.homeFaq.title" desc="mk.homeFaq.desc" />
          <div className="faq-help reveal d3" style={{ background: "var(--cream)" }}>
            <Ms name="support_agent" />
            <div>
              <b>{t("mk.homeFaq.help")}</b>
              <Link href="/contact">{t("mk.homeFaq.helpLink")}</Link>
            </div>
          </div>
        </div>
        <div className="faq-list">
          <FaqList
            items={items}
            tags={{
              privacy: copperLink("/privacy"),
              mail: copperLink("mailto:admin@leoned.ng"),
              help: copperLink("/support"),
            }}
          />
        </div>
      </div>
    </section>
  );
}

export function HomeContent() {
  return (
    <>
      <Hero />
      <Levels />
      <Architecture />
      <Portals />
      <Modules />
      <StatsBand />
      <SchoolDay />
      <WhyLeonEd />
      <Steps />
      <HomeFaq />
      <CtaBand />
    </>
  );
}
