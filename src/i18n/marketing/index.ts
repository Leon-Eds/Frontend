import { en } from "./en";
import { ig } from "./ig";
import { yo } from "./yo";
import { ha } from "./ha";
import { fr } from "./fr";
import { es } from "./es";
import { de } from "./de";
import { pt } from "./pt";
import { zh } from "./zh";

/** Marketing site dictionaries, merged into LanguageProvider. Missing keys fall back to English. */
export const marketingTranslations: Record<string, Record<string, string>> = { en, ig, yo, ha, fr, es, de, pt, zh };
