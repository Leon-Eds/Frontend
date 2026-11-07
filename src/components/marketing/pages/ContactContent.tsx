"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { Ms } from "../Ms";
import { useMk } from "../useMk";
import { PageHero, copperLink, d } from "../sections";

function ContactForm() {
  const { t, r } = useMk();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    setState("sending");
    try {
      await publicApi.submitContact({
        name: get("name"),
        email: get("email"),
        schoolName: get("schoolName"),
        phone: get("phone") || undefined,
        message: get("message") || undefined,
        website: get("website"), // honeypot: the API discards submissions that fill it
      });
      setState("sent");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      setState("error");
    }
  };

  return (
    <form ref={formRef} className={"demo-form contact-form reveal d1" + (state === "sent" ? " sent" : "")} onSubmit={onSubmit}>
      <h4>{t("mk.form.title")}</h4>
      <p className="sub">{t("mk.form.required")}</p>
      <div className="field">
        <label htmlFor="c-name">{t("mk.form.name")}</label>
        <input id="c-name" name="name" type="text" placeholder={t("mk.form.namePh")} maxLength={150} autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="c-email">{t("mk.form.email")}</label>
        <input id="c-email" name="email" type="email" placeholder={t("mk.form.emailPh")} autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="c-phone">{t("mk.form.phone")}</label>
        <input id="c-phone" name="phone" type="tel" placeholder={t("mk.form.phonePh")} maxLength={30} autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="c-school">{t("mk.form.school")}</label>
        <input id="c-school" name="schoolName" type="text" placeholder={t("mk.form.schoolPh")} maxLength={200} autoComplete="organization" required />
      </div>
      <div className="field full">
        <label htmlFor="c-msg">{t("mk.form.message")}</label>
        <textarea id="c-msg" name="message" placeholder={t("mk.form.messagePh")} maxLength={5000} />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="c-web">Website</label>
        <input id="c-web" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {state === "error" && (
        <p className="form-error" role="alert">
          <Ms name="error" /> {t("mk.form.error")}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
        {t(state === "sending" ? "mk.form.sending" : "mk.form.submit")} <Ms name="arrow_forward" className="arrow" />
      </button>
      <p className="form-note">{r("mk.form.note", { a: copperLink("/privacy") })}</p>
      <div className="form-success" role="status">
        <Ms name="task_alt" fill />
        <h4>{t("mk.form.success")}</h4>
        <p>{t("mk.form.successd")}</p>
      </div>
    </form>
  );
}

export function ContactContent() {
  const { t } = useMk();
  const cards: [string, string, string, string][] = [
    ["mail", "email", "mailto:support@leoned.africa", ""],
    ["support_agent", "existing", "/support", "existingLink"],
    ["app_registration", "start", "/register", "startLink"],
    ["login", "user", "/login", "userLink"],
  ];

  return (
    <>
      <PageHero crumb="mk.contact.crumb" eyebrow="mk.contact.eyebrow" title="mk.contact.title" desc="mk.contact.desc" />

      <section className="section" style={{ background: "var(--cream)" }}>
        <div className="container contact-wrap">
          <div className="contact-cards">
            {cards.map(([icon, key, href, link], i) => (
              <div key={key} className={"ccard reveal" + d(i)}>
                <Ms name={icon} />
                <div>
                  <h4>{t(`mk.contact.${key}`)}</h4>
                  <p>{t(`mk.contact.${key}d`)}</p>
                  {href.startsWith("mailto:") ? (
                    <a className="link" href={href}>support@leoned.africa</a>
                  ) : (
                    <Link className="link" href={href}>{t(`mk.contact.${link}`)}</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
