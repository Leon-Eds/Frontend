import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export const metadata: Metadata = {
  title: "LeonEd Africa | Academic Architect",
  description: "The complete digital academic management platform for African schools. Manage student records, result processing, and secure portal access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="font-sans h-full antialiased"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Plus+Jakarta+Sans:wght@200..800&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --font-jakarta: "Plus Jakarta Sans", sans-serif;
            --font-geist-mono: "Geist Mono", monospace;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            try {
              var dark = localStorage.getItem('leoned_dark_mode') === 'true';
              if (dark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              // Only apply school themes on dashboard/portal pages, NOT on landing or login
              var path = window.location.pathname;
              var isDashboard = path.startsWith('/dashboard') || path.startsWith('/super-admin') || path.startsWith('/demo') || path.startsWith('/portal');
              if (isDashboard) {
                var userStr = localStorage.getItem('leoned_user');
                if (userStr) {
                  var user = JSON.parse(userStr);
                  var sId = user.schoolId || user.SchoolId || '';
                  if (sId) {
                    var schoolTheme = localStorage.getItem('leoned_theme_' + sId);
                    if (schoolTheme) {
                      document.documentElement.classList.remove('theme-forest', 'theme-ocean', 'theme-sunset', 'theme-royal');
                      document.documentElement.classList.add('theme-' + schoolTheme);
                    }
                    var schoolFont = localStorage.getItem('leoned_font_' + sId);
                    if (schoolFont) {
                      document.documentElement.classList.remove('font-sans', 'font-serif', 'font-mono');
                      document.documentElement.classList.add('font-' + schoolFont);
                    }
                  }
                  if (user.schoolTheme && user.schoolTheme.primaryColor) {
                    document.documentElement.style.setProperty('--theme-primary', user.schoolTheme.primaryColor);
                  }
                  if (user.schoolTheme && user.schoolTheme.secondaryColor) {
                    document.documentElement.style.setProperty('--theme-secondary', user.schoolTheme.secondaryColor);
                  }
                  if (user.schoolTheme && user.schoolTheme.accentColor) {
                    document.documentElement.style.setProperty('--theme-accent', user.schoolTheme.accentColor);
                  }
                }
              }
            } catch (_) {}
          `}
        </Script>
        <LanguageProvider>
          {children}
          <Toaster position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
}
