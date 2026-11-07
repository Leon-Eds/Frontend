"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ms } from "../Ms";
import { useMk } from "../useMk";
import { PageHero } from "../sections";
import { LEGAL_DOCS, LEGAL_SLUGS, type LegalSlug } from "./documents";

const HUB_ICONS: Record<LegalSlug, string> = {
  privacy: "shield_lock",
  terms: "gavel",
  "student-data": "child_care",
  dpa: "handshake",
  cookies: "cookie",
  "acceptable-use": "rule",
  accessibility: "accessibility_new",
};

// Hub order differs from the generated document order
const HUB_ORDER: LegalSlug[] = ["privacy", "terms", "student-data", "dpa", "cookies", "acceptable-use", "accessibility"];

export function LegalPage({ slug }: { slug: LegalSlug }) {
  const { t, language } = useMk();
  const router = useRouter();
  const doc = LEGAL_DOCS[slug];
  const k = `mk.legal.${slug}`;

  // The document body is static HTML; route its internal links through the client router
  const onArticleClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (href?.startsWith("/") && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <>
      <PageHero crumb={`${k}.crumb`} parent={["/legal", "mk.crumbs.legal"]} eyebrow={`${k}.eyebrow`} title={`${k}.title`} desc={`${k}.desc`}>
        <span className="meta">
          <Ms name="update" /> {t("mk.legal.updated").replace("{date}", doc.updated)}
        </span>
        {language !== "en" && (
          <p className="legal-lang-note">
            <Ms name="translate" /> {t("mk.legal.englishOnly")}
          </p>
        )}
      </PageHero>

      <section className="section" style={{ background: "var(--cream)" }}>
        <div className="container legal">
          <aside className="toc">
            <b>{t("mk.legal.onThisPage")}</b>
            {doc.toc.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
            <div className="legal-nav">
              <small>{t("mk.legal.other")}</small>
              {LEGAL_SLUGS.filter((s) => s !== slug).map((s) => (
                <Link key={s} href={`/${s}`}>
                  {t(`mk.legal.${s}.crumb`)}
                </Link>
              ))}
              <Link href="/legal">{t("mk.footer.legalCenter")}</Link>
            </div>
          </aside>
          <article className="prose" lang="en" onClick={onArticleClick} dangerouslySetInnerHTML={{ __html: doc.html }} />
        </div>
      </section>
    </>
  );
}

export function LegalHub() {
  const { t } = useMk();
  return (
    <>
      <PageHero crumb="mk.legalhub.crumb" eyebrow="mk.legalhub.eyebrow" title="mk.legalhub.title" desc="mk.legalhub.desc" />
      <section className="section" style={{ background: "var(--cream)" }}>
        <div className="container">
          <div className="legal-grid">
            {HUB_ORDER.map((slug) => (
              <Link key={slug} className="lcard reveal" href={`/${slug}`}>
                <div className="mi hex"><Ms name={HUB_ICONS[slug]} /></div>
                <h4>{t(`mk.legal.${slug}.crumb`)}</h4>
                <p>{t(`mk.legalhub.${slug}`)}</p>
                <span className="go">
                  {t("mk.legalhub.read")} <Ms name="arrow_forward" />
                </span>
              </Link>
            ))}
          </div>
          <div className="faq-help reveal" style={{ marginTop: 40, maxWidth: 720 }}>
            <Ms name="mail" />
            <div>
              <b>{t("mk.legalhub.questions")}</b>
              <a href="mailto:support@leoned.africa">{t("mk.legalhub.email")}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
