"use client";

import Link from "next/link";
import { Ms } from "./Ms";
import { useMk } from "./useMk";

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: "mk.footer.solutions",
    links: [
      ["/features#records", "mk.footer.records"],
      ["/features#results", "mk.footer.results"],
      ["/login", "mk.footer.portals"],
      ["/features#multi-school", "mk.footer.multi"],
      ["/features#fees", "mk.footer.fees"],
    ],
  },
  {
    title: "mk.footer.company",
    links: [
      ["/about", "mk.footer.about"],
      ["/features", "mk.nav.features"],
      ["/security", "mk.nav.security"],
      ["/#why-leoned", "mk.nav.why"],
      ["/contact", "mk.footer.sales"],
    ],
  },
  {
    title: "mk.footer.support",
    links: [
      ["/support", "mk.nav.help"],
      ["/faq", "mk.nav.faq"],
      ["/login", "mk.nav.login"],
      ["/register", "mk.nav.register"],
    ],
  },
  {
    title: "mk.footer.legal",
    links: [
      ["/legal", "mk.footer.legalCenter"],
      ["/privacy", "mk.footer.privacy"],
      ["/terms", "mk.footer.terms"],
      ["/cookies", "mk.footer.cookies"],
      ["/student-data", "mk.footer.studentData"],
      ["/dpa", "mk.footer.dpa"],
      ["/acceptable-use", "mk.footer.aup"],
      ["/accessibility", "mk.footer.accessibility"],
    ],
  },
];

export function SiteFooter() {
  const { t } = useMk();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marketing/leoned-logo-light.png" alt="LeonEd" width={134} height={42} />
            <p>{t("mk.footer.desc")}</p>
            <p style={{ marginTop: 14 }}>
              <a href="mailto:admin@leoned.ng" style={{ display: "inline-flex", gap: 8, alignItems: "center", color: "#fff" }}>
                <Ms name="mail" /> admin@leoned.ng
              </a>
            </p>
            <Link href="/register" className="btn btn-primary btn-sm" style={{ marginTop: 20 }}>
              {t("mk.nav.register")}
            </Link>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h5>{t(col.title)}</h5>
              <ul>
                {col.links.map(([href, key]) => (
                  <li key={href + key}>
                    <Link href={href}>{t(key)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>{t("mk.footer.rights").replace("{year}", String(new Date().getFullYear()))}</p>
          <div>
            <Link href="/privacy">{t("mk.footer.privacy")}</Link>
            <Link href="/terms">{t("mk.footer.terms")}</Link>
            <Link href="/cookies">{t("mk.footer.cookiesShort")}</Link>
            <Link href="/legal">{t("mk.footer.legal")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
