import type { PageDict } from "./types";
import { register } from "./register";
import { auth } from "./auth";
import { superadmin2 } from "./superadmin2";
import { superadmin } from "./superadmin";
import { scanner } from "./scanner";
import { portal } from "./portal";
import { settings } from "./settings";
import { rollover } from "./rollover";
import { comms } from "./comms";
import { reports } from "./reports";
import { approvals } from "./approvals";
import { finance } from "./finance";
import { staff } from "./staff";
import { results } from "./results";
import { attendance } from "./attendance";
import { teacher } from "./teacher";
import { faculty } from "./faculty";
import { classes } from "./classes";
import { enroll } from "./enroll";
import { students } from "./students";
import { common } from "./common";
import { layout } from "./layout";
import { dashboard } from "./dashboard";

const pages: PageDict[] = [common, layout, dashboard, students, enroll, classes, faculty, teacher, attendance, results, staff, finance, approvals, reports, comms, rollover, settings, portal, scanner, superadmin, superadmin2, auth, register];

/** Dashboard and portal dictionaries, merged into LanguageProvider. Missing keys fall back to English. */
export const appTranslations: Record<string, Record<string, string>> = {};
for (const page of pages) {
  for (const [lang, dict] of Object.entries(page)) {
    appTranslations[lang] = { ...appTranslations[lang], ...dict };
  }
}
