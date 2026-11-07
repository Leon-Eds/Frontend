"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ms } from "../Ms";
import { useMk } from "../useMk";
import { CtaBand, FaqList, PageHero, SectionHead, copperLink, type FaqEntry } from "../sections";

const answerLinks = {
  features: copperLink("/features"),
  register: copperLink("/register"),
  contact: copperLink("/contact"),
  login: copperLink("/login"),
  security: copperLink("/security"),
  studentData: copperLink("/student-data"),
  mail: copperLink("mailto:admin@leoned.ng"),
  help: copperLink("/support"),
};

const FAQ_GROUPS: [string, number][] = [
  ["general", 4],
  ["schools", 4],
  ["parents", 4],
  ["security", 4],
  ["support", 3],
];

export function FaqContent() {
  const { t, r } = useMk();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");

  const q = query.trim().toLowerCase();
  const matches = (group: string, item: FaqEntry) =>
    (cat === "all" || cat === group) && (!q || `${t(item.q)} ${t(item.a)}`.toLowerCase().includes(q));

  const groups = FAQ_GROUPS.map(([id, count]) => ({
    id,
    items: Array.from({ length: count }, (_, i) => ({ q: `mk.faq.${id}.q${i + 1}`, a: `mk.faq.${id}.a${i + 1}` })),
  }));
  const shown = groups.reduce((n, g) => n + g.items.filter((it) => matches(g.id, it)).length, 0);

  return (
    <>
      <PageHero crumb="mk.faq.crumb" eyebrow="mk.faq.eyebrow" title="mk.faq.title">
        <p>
          {r("mk.faq.desc", {
            a: (c) => (
              <Link href="/contact" style={{ color: "var(--copper-300)", fontWeight: 700 }}>
                {c}
              </Link>
            ),
          })}
        </p>
      </PageHero>

      <section className="section faq-page" style={{ background: "var(--cream)", paddingTop: 60 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="faq-tools">
            <label className="faq-search">
              <Ms name="search" />
              <input type="search" placeholder={t("mk.faq.search")} aria-label={t("mk.faq.searchLabel")} value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="faq-cats">
              {["all", ...FAQ_GROUPS.map(([id]) => id)].map((id) => (
                <button key={id} className={id === cat ? "faq-cat active" : "faq-cat"} aria-pressed={id === cat} onClick={() => setCat(id)}>
                  {t(`mk.faq.cat.${id}`)}
                </button>
              ))}
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.id} className={g.items.some((it) => matches(g.id, it)) ? "faq-group" : "faq-group hide"}>
              <h3>{t(`mk.faq.cat.${g.id}`)}</h3>
              <FaqList items={g.items} firstOpen={false} tags={answerLinks} hidden={(it) => !matches(g.id, it)} />
            </div>
          ))}

          <p className="faq-empty" style={{ display: shown ? "none" : "block" }}>
            {r("mk.faq.empty", { a: copperLink("/contact") })}
          </p>
        </div>
      </section>

      <CtaBand />
    </>
  );
}

type Status = "checking" | "ok" | "down";

async function fetchHealth(): Promise<Status> {
  try {
    const res = await fetch("/backend-api/health", { cache: "no-store", signal: AbortSignal.timeout(10000) });
    const body = await res.json().catch(() => null);
    return res.ok && body?.status === "healthy" ? "ok" : "down";
  } catch {
    return "down";
  }
}

function useSystemStatus() {
  const [status, setStatus] = useState<Status>("checking");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    fetchHealth().then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, [attempt]);
  const check = () => {
    setStatus("checking");
    setAttempt((n) => n + 1);
  };
  return { status, check };
}

declare global {
  interface Window {
    $chatway?: { openChatwayWidget?: () => void };
  }
}

export function SupportContent() {
  const { t } = useMk();
  const { status, check } = useSystemStatus();
  const items = [1, 2, 3, 4, 5].map((n) => ({ q: `mk.support.q${n}`, a: `mk.support.a${n}` }));

  const openChat = () => {
    if (window.$chatway?.openChatwayWidget) window.$chatway.openChatwayWidget();
    else window.location.href = "mailto:admin@leoned.ng";
  };

  const statusLabel = { checking: "mk.support.statusChecking", ok: "mk.support.statusOk", down: "mk.support.statusDown" }[status];
  const statusColor = { checking: "var(--ink-3)", ok: "var(--green-600)", down: "#a93a2a" }[status];

  return (
    <>
      <PageHero crumb="mk.support.crumb" eyebrow="mk.support.eyebrow" title="mk.support.title" desc="mk.support.desc" style={{ paddingBottom: 130 }} />

      <section style={{ background: "var(--cream)", paddingBottom: 100 }}>
        <div className="container">
          <div className="support-grid">
            <div className="scard reveal">
              <div className="mi hex"><Ms name="mail" /></div>
              <h3>{t("mk.support.email")}</h3>
              <p>{t("mk.support.emaild")}</p>
              <a href="mailto:admin@leoned.ng" className="btn btn-green btn-sm">
                <Ms name="send" /> admin@leoned.ng
              </a>
            </div>
            <div className="scard reveal d1">
              <div className="mi hex"><Ms name="forum" /></div>
              <h3>{t("mk.support.chat")}</h3>
              <p>{t("mk.support.chatd")}</p>
              <button type="button" onClick={openChat} className="btn btn-primary btn-sm">
                <Ms name="chat" /> {t("mk.support.chatCta")}
              </button>
            </div>
            <div className="scard reveal d2">
              <div className="mi hex"><Ms name="monitor_heart" /></div>
              <h3>{t("mk.support.status")}</h3>
              <span className="status" role="status" style={{ color: statusColor }}>
                <i style={status === "ok" ? undefined : { background: statusColor, animation: "none" }} /> {t(statusLabel)}
              </span>
              <p>{t("mk.support.statusd")}</p>
              <button type="button" onClick={check} disabled={status === "checking"} className="btn btn-ghost btn-sm">
                <Ms name="refresh" /> {t("mk.support.statusRecheck")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section faq" style={{ background: "var(--paper)" }}>
        <div className="container">
          <div className="faq-side">
            <SectionHead eyebrow="mk.support.quick.eyebrow" title="mk.support.quick.title" desc="mk.support.quick.desc" />
            <div className="faq-help reveal d3" style={{ background: "var(--cream)" }}>
              <Ms name="login" />
              <div>
                <b>{t("mk.support.portal")}</b>
                <Link href="/login">{t("mk.support.portalLink")}</Link>
              </div>
            </div>
          </div>
          <div className="faq-list">
            <FaqList items={items} tags={answerLinks} />
          </div>
        </div>
      </section>
    </>
  );
}

export function NotFoundContent() {
  const { t } = useMk();
  return (
    <section className="nf">
      <div className="container">
        <div className="nf-hex hex">404</div>
        <h1>{t("mk.nf.title")}</h1>
        <p>{t("mk.nf.desc")}</p>
        <div className="links">
          <Link href="/" className="btn btn-primary"><Ms name="home" /> {t("mk.nf.home")}</Link>
          <Link href="/login" className="btn btn-ghost"><Ms name="login" /> {t("mk.nav.login")}</Link>
          <Link href="/support" className="btn btn-ghost"><Ms name="support_agent" /> {t("mk.nav.help")}</Link>
        </div>
      </div>
    </section>
  );
}
