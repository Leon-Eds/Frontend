"use client";

import { useState } from "react";
import Link from "next/link";
import { Ms } from "../Ms";
import { useMk } from "../useMk";

type Portal = "admin" | "teacher" | "bursar" | "parent" | "student";

const TABS: [Portal, string, string][] = [
  ["admin", "admin_panel_settings", "mk.portals.tabAdmin"],
  ["teacher", "co_present", "mk.portals.tabTeacher"],
  ["bursar", "account_balance", "mk.portals.tabBursar"],
  ["parent", "family_restroom", "mk.portals.tabParent"],
  ["student", "school", "mk.portals.tabStudent"],
];

const CTA: Record<Portal, [string, string]> = {
  admin: ["/register", "mk.nav.register"],
  teacher: ["/login", "mk.portals.teacher.cta"],
  bursar: ["/login", "mk.portals.bursar.cta"],
  parent: ["/login", "mk.portals.parent.cta"],
  student: ["/login", "mk.portals.student.cta"],
};

function Meter({ value, copper }: { value: number; copper?: boolean }) {
  return (
    <div className="meter" style={{ width: 180, maxWidth: "100%" }}>
      <i className={copper ? "c" : undefined} style={{ width: `${value}%` }} />
    </div>
  );
}

function Attendance({ marks }: { marks: string }) {
  const cls: Record<string, string> = { P: "att-p", A: "att-a", L: "att-l" };
  return (
    <div className="att-row" style={{ width: 150 }}>
      {[...marks].map((m, i) => (
        <span key={i} className={cls[m]}>
          {m}
        </span>
      ))}
    </div>
  );
}

function Mock({ portal }: { portal: Portal }) {
  const { t } = useMk();
  const p = (k: string) => t(`mk.portals.${portal}.m.${k}`);

  if (portal === "admin")
    return (
      <div className="pmock">
        <div className="pmock-head">
          <div className="pmock-user">
            <span className="avatar">SO</span>
            <span>
              <b>{p("title")}</b>
              <small>{p("week")}</small>
            </span>
          </div>
          <span className="tag">{p("all")}</span>
        </div>
        <div className="pgrid">
          <div className="pbox"><small>{t("mk.mock.students")}</small><b>1,248</b></div>
          <div className="pbox"><small>{p("staff")}</small><b>86</b></div>
          <div className="pbox"><small>{p("campuses")}</small><b>3</b></div>
        </div>
        <div className="prow"><span><b>{p("sow")}</b><Meter value={72} copper /></span><span className="tag c">72%</span></div>
        <div className="prow"><span><b>{p("results")}</b><small>{p("resultsd")}</small></span><span className="tag">{p("classes")}</span></div>
        <div className="prow"><span><b>{p("att")}</b><Meter value={96} /></span><span className="tag">96%</span></div>
      </div>
    );

  if (portal === "teacher")
    return (
      <div className="pmock">
        <div className="pmock-head">
          <div className="pmock-user">
            <span className="avatar c">NO</span>
            <span>
              <b>Mrs. N. Okafor</b>
              <small>{p("subject")}</small>
            </span>
          </div>
          <span className="tag c">{p("mark")}</span>
        </div>
        {(
          [
            ["Adebayo Tolu", "031", "PPLPP"],
            ["Chukwu Amara", "044", "PPPPP"],
            ["Ibrahim Musa", "052", "PAPPP"],
          ] as const
        ).map(([name, no, marks]) => (
          <div className="prow" key={no}>
            <span><b>{name}</b><small>{p("adm")} LE/2024/{no}</small></span>
            <Attendance marks={marks} />
          </div>
        ))}
        <div className="prow"><span><b>{p("sow")}</b><small>{p("topic")}</small></span><span className="tag">{p("uploaded")}</span></div>
      </div>
    );

  if (portal === "bursar")
    return (
      <div className="pmock">
        <div className="pmock-head">
          <div className="pmock-user">
            <span className="avatar c">BU</span>
            <span>
              <b>{p("title")}</b>
              <small>{p("week")}</small>
            </span>
          </div>
          <span className="tag">{p("tag")}</span>
        </div>
        <div className="pgrid">
          <div className="pbox"><small>{p("collected")}</small><b>₦18.4M</b></div>
          <div className="pbox"><small>{p("outstanding")}</small><b>₦5.2M</b></div>
          <div className="pbox"><small>{p("cleared")}</small><b>78%</b></div>
        </div>
        <div className="prow"><span><b>{p("classFees")}</b><Meter value={82} /></span><span className="tag">82%</span></div>
        <div className="prow"><span><b>{p("reminder")}</b><small>{p("reminderd")}</small></span><span className="tag c">{p("sent")}</span></div>
        <div className="prow"><span><b>Adebayo Tolu · JSS 2B</b><small>{p("instalment")}</small></span><span className="tag r">{p("due")}</span></div>
      </div>
    );

  if (portal === "parent")
    return (
      <div className="pmock">
        <div className="pmock-head">
          <div className="pmock-user">
            <span className="avatar c">MA</span>
            <span>
              <b>Mrs. Adeyemi</b>
              <small>{p("children")}</small>
            </span>
          </div>
          <span className="tag">{p("verified")}</span>
        </div>
        <div className="prow"><span><b>Tolu · JSS 2B</b><small>{p("present")}</small></span><span className="tag">{p("presentTag")}</span></div>
        <div className="prow"><span><b>Ife · Primary 4</b><small>{p("report")}</small></span><span className="tag c">{p("viewReport")}</span></div>
        <div className="prow"><span><b>{p("fee")}</b><small>{p("feed")}</small></span><span className="tag r">{p("due")}</span></div>
        <div className="prow"><span><b>{p("announcement")}</b><small>{p("sports")}</small></span><span className="tag">{p("new")}</span></div>
      </div>
    );

  return (
    <div className="pmock">
      <div className="pmock-head">
        <div className="pmock-user">
          <span className="avatar">CA</span>
          <span>
            <b>Chukwu Amara</b>
            <small>{p("class")}</small>
          </span>
        </div>
        <span className="tag">{p("position")}</span>
      </div>
      <div className="pgrid">
        <div className="pbox"><small>{p("average")}</small><b>78.4</b></div>
        <div className="pbox"><small>{p("attendance")}</small><b>98%</b></div>
        <div className="pbox"><small>{p("subjects")}</small><b>12</b></div>
      </div>
      <div className="prow"><span><b>{t("mk.subject.math")}</b><Meter value={84} /></span><span className="tag">84 · A</span></div>
      <div className="prow"><span><b>{t("mk.subject.english")}</b><Meter value={76} /></span><span className="tag">76 · A</span></div>
      <div className="prow"><span><b>{p("report")}</b><small>{p("published")}</small></span><span className="tag c">{p("download")}</span></div>
    </div>
  );
}

export function PortalTabs() {
  const { t } = useMk();
  const [active, setActive] = useState<Portal>("admin");

  return (
    <>
      <div className="portal-tabs reveal" role="tablist">
        {TABS.map(([id, icon, label]) => (
          <button
            key={id}
            id={`tab-${id}`}
            className={id === active ? "portal-tab active" : "portal-tab"}
            role="tab"
            aria-selected={id === active}
            aria-controls={`p-${id}`}
            onClick={(e) => {
              setActive(id);
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }}
          >
            <Ms name={icon} /> {t(label)}
          </button>
        ))}
      </div>

      {TABS.map(([id]) => (
        <div key={id} id={`p-${id}`} className={id === active ? "portal-panel active" : "portal-panel"} role="tabpanel" aria-labelledby={`tab-${id}`}>
          <div className="portal-copy">
            <span className="who">{t(`mk.portals.${id}.who`)}</span>
            <h3>{t(`mk.portals.${id}.title`)}</h3>
            <p>{t(`mk.portals.${id}.desc`)}</p>
            <ul className="checks">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <li key={n}>
                  <Ms name="check_circle" /> {t(`mk.portals.${id}.c${n}`)}
                </li>
              ))}
            </ul>
            <Link href={CTA[id][0]} className="btn btn-green">
              {t(CTA[id][1])} <Ms name="arrow_forward" className="arrow" />
            </Link>
          </div>
          <Mock portal={id} />
        </div>
      ))}
    </>
  );
}
