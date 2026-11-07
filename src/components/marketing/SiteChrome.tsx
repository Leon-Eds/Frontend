"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ms } from "./Ms";
import { useMk } from "./useMk";

const COOKIE_KEY = "leoned_cookie_choice";

export function CookieNotice() {
  const { t, r } = useMk();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(COOKIE_KEY);
    } catch {}
    if (saved) return;
    const timer = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const choose = (choice: "essential" | "all") => {
    try {
      localStorage.setItem(COOKIE_KEY, choice);
    } catch {}
    setShow(false);
  };

  return (
    <div className={show ? "cookie show" : "cookie"} role="dialog" aria-label={t("mk.cookie.label")} aria-hidden={!show} inert={!show}>
      <h5>
        <Ms name="cookie" /> {t("mk.cookie.title")}
      </h5>
      <p>{r("mk.cookie.text", { a: (c) => <Link href="/cookies">{c}</Link> })}</p>
      <div className="row">
        <button className="btn btn-ghost" onClick={() => choose("essential")}>
          {t("mk.cookie.essential")}
        </button>
        <button className="btn btn-primary" onClick={() => choose("all")}>
          {t("mk.cookie.all")}
        </button>
      </div>
    </div>
  );
}

export function ToTop() {
  const { t } = useMk();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={show ? "to-top hex show" : "to-top hex"}
      aria-label={t("mk.toTop")}
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <Ms name="arrow_upward" />
    </button>
  );
}

/** Fades in every `.reveal` element as it scrolls into view, including ones added after navigation. */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector(".mkt");
    if (!root) return;
    if (!("IntersectionObserver" in window)) {
      root.querySelectorAll(".reveal").forEach((el) => el.setAttribute("data-in", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    const observeAll = () => root.querySelectorAll(".reveal:not([data-in])").forEach((el) => io.observe(el));
    observeAll();
    const mo = new MutationObserver(observeAll);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
