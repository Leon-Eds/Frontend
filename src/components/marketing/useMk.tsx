"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Renderer = (children: React.ReactNode) => React.ReactNode;

const defaultTags: Record<string, Renderer> = {
  hl: (c) => <span className="hl">{c}</span>,
  copper: (c) => <span className="copper">{c}</span>,
  b: (c) => <strong>{c}</strong>,
};

const TAG = /<(\w+)>(.*?)<\/\1>/g;

/** Wraps each "LeonEd" so all-caps labels (eyebrows etc.) keep the brand's casing. */
function brandCase(text: string, key: string | number): React.ReactNode {
  if (!text.includes("LeonEd")) return text;
  return text.split("LeonEd").flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <span key={`${key}-${i}`} className="brand-case">
            LeonEd
          </span>,
          part,
        ]
  );
}

/**
 * Turns a translated string with simple inline tags into React nodes,
 * e.g. "Every part of your school, <hl>working together</hl>".
 * Tags can't nest; unknown tags render their text only.
 */
export function rich(text: string, tags: Record<string, Renderer> = {}): React.ReactNode {
  const all = { ...defaultTags, ...tags };
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TAG)) {
    if (m.index > last) out.push(brandCase(text.slice(last, m.index), `t${last}`));
    const render = all[m[1]];
    out.push(<React.Fragment key={m.index}>{render ? render(brandCase(m[2], `i${m.index}`)) : m[2]}</React.Fragment>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(brandCase(text.slice(last), `t${last}`));
  return out;
}

/** Marketing translation helpers: t("mk.x") for plain text, r("mk.x") for text with inline tags. */
export function useMk() {
  const { t, language, setLanguage } = useLanguage();
  const r = (key: string, tags?: Record<string, Renderer>) => rich(t(key), tags);
  return { t, r, language, setLanguage };
}
