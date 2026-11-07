import "./marketing.css";
import { bricolage, dmSans } from "./fonts";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { CookieNotice, RevealObserver, ToTop } from "./SiteChrome";

/** Shared frame for every public marketing page: header, footer, cookie notice and scroll helpers. */
export function MarketingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={`mkt ${bricolage.variable} ${dmSans.variable}`}>
      {/* Icon font needs display=block, otherwise ligature names ("arrow_forward") flash as text.
          (no-page-custom-font is a Pages Router rule and doesn't apply here.) */}
      {/* eslint-disable-next-line @next/next/google-font-display, @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..600,0..1,0&display=block"
        precedence="default"
      />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <CookieNotice />
      <ToTop />
      <RevealObserver />
    </div>
  );
}
