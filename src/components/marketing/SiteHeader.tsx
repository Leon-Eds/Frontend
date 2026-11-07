"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { languages, type Language } from "@/components/LanguageProvider";
import { Ms } from "./Ms";
import { useMk } from "./useMk";

const SITE_LANGUAGES = languages;

function LangSelect() {
  const { t, language, setLanguage } = useMk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = SITE_LANGUAGES.find((l) => l.code === language) ?? SITE_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div className="lang-select" ref={ref}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={t("mk.topbar.language")} onClick={() => setOpen(!open)}>
        <Ms name="language" /> {active.nativeName} <Ms name="expand_more" />
      </button>
      {open && (
        <ul role="listbox">
          {SITE_LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === language}
                onClick={() => {
                  setLanguage(l.code as Language);
                  setOpen(false);
                }}
              >
                {l.nativeName} <small>{l.name}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { t, r, language, setLanguage } = useMk();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState("");
  const [lastPath, setLastPath] = useState(pathname);

  // On navigation: close the menu and forget the highlighted home section
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSection("");
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the menu is open; close it when growing past the mobile breakpoint
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onResize = () => window.innerWidth >= 1280 && setMenuOpen(false);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Highlight the home-page section in view
  useEffect(() => {
    if (pathname !== "/") return;
    const targets = ["architecture", "why-leoned"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSection(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, [pathname]);

  const navCls = (href: string) => {
    const active = href.startsWith("/#") ? pathname === "/" && section === href.slice(2) : pathname === href;
    return active ? "active" : undefined;
  };

  return (
    <>
      <div className="topbar">
        <div className="container">
          <p>{r("mk.topbar.text", { a: (c) => <Link href="/support">{c}</Link> })}</p>
          <div className="topbar-links">
            <span>
              <Ms name="mail" />{" "}
              <a className="tb-link" href="mailto:support@leoned.africa">
                support@leoned.africa
              </a>
            </span>
            <LangSelect />
          </div>
        </div>
      </div>

      <header className={scrolled ? "nav scrolled" : "nav"}>
        <div className="container">
          <Link href="/" className="brand" aria-label={t("mk.nav.homeLabel")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marketing/leoned-logo.png" alt="LeonEd" width={128} height={40} />
          </Link>
          <nav className="nav-links" aria-label="Main">
            <Link href="/#architecture" className={navCls("/#architecture")}>{t("mk.nav.architecture")}</Link>
            <Link href="/features" className={navCls("/features")}>{t("mk.nav.features")}</Link>
            <Link href="/#why-leoned" className={navCls("/#why-leoned")}>{t("mk.nav.why")}</Link>
            <Link href="/about" className={navCls("/about")}>{t("mk.nav.about")}</Link>
            <Link href="/contact" className={navCls("/contact")}>{t("mk.nav.contact")}</Link>
          </nav>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-ghost btn-sm">
              <Ms name="login" /> {t("mk.nav.login")}
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              {t("mk.nav.register")}
            </Link>
          </div>
          <button
            className="nav-toggle"
            aria-label={t(menuOpen ? "mk.nav.close" : "mk.nav.open")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Ms name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>

      <div className={menuOpen ? "mobile-menu open" : "mobile-menu"} aria-label="Mobile" inert={!menuOpen}>
        {(
          [
            ["/", "mk.nav.home"],
            ["/#architecture", "mk.nav.architecture"],
            ["/features", "mk.nav.features"],
            ["/security", "mk.nav.security"],
            ["/#why-leoned", "mk.nav.why"],
            ["/about", "mk.nav.about"],
            ["/contact", "mk.nav.contact"],
            ["/faq", "mk.nav.faq"],
            ["/support", "mk.nav.help"],
          ] as const
        ).map(([href, key]) => (
          <Link key={href} className="m-link" href={href} onClick={() => setMenuOpen(false)}>
            {t(key)} <Ms name="chevron_right" />
          </Link>
        ))}
        <div className="lang-row" role="group" aria-label={t("mk.topbar.language")}>
          {SITE_LANGUAGES.map((l) => (
            <button key={l.code} type="button" aria-pressed={l.code === language} onClick={() => setLanguage(l.code as Language)}>
              {l.nativeName}
            </button>
          ))}
        </div>
        <Link href="/login" className="btn btn-ghost">
          <Ms name="login" /> {t("mk.nav.login")}
        </Link>
        <Link href="/register" className="btn btn-primary">
          {t("mk.nav.register")} <Ms name="arrow_forward" className="arrow" />
        </Link>
      </div>
    </>
  );
}
