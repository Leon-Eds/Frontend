import { shell } from "./shell";
import { home } from "./home";
import { features } from "./features";
import { about } from "./about";
import { securityContact } from "./security-contact";
import { help } from "./help";
import { legal } from "./legal-hero";
import { legalHub } from "./legal-hub";

export const en: Record<string, string> = {
  ...shell,
  ...home,
  ...features,
  ...about,
  ...securityContact,
  ...help,
  ...legal,
  ...legalHub,
};
