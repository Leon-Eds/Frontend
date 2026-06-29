import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Toaster } from "react-hot-toast";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${jakarta.variable} ${geistMono.variable} font-sans h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const dark = localStorage.getItem('leoned_dark_mode') === 'true';
                if (dark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                const userStr = localStorage.getItem('leoned_user');
                if (userStr) {
                  const user = JSON.parse(userStr);
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
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <LanguageProvider>
          {children}
          <Toaster position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
}
