"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ChevronRight, Zap, Globe } from "lucide-react";
import { useLanguage, LanguageSelector } from "@/components/LanguageProvider";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="LeonEd" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold text-gray-900">LeonEd</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#architecture" className="text-sm font-semibold text-gray-900 hover:text-[#053d26] transition-colors">
                {t("nav.overview")}
              </a>
              <a href="#why-leoned" className="text-sm font-semibold text-gray-500 hover:text-[#053d26] transition-colors">
                {t("nav.schedule")}
              </a>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link href="/login" className="px-6 py-2.5 rounded-full bg-[#053d26] text-white text-sm font-bold hover:bg-[#042c1b] transition-colors">
                {t("nav.login")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-[#053d26] bg-green-100">
              {t("hero.architect")}
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-[#053d26] leading-[1.1] tracking-tight">
              {t("hero.title")}
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="px-8 py-4 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-all shadow-lg shadow-orange-900/20">
                {t("hero.cta.register")}
              </Link>
              <Link href="/demo" className="px-8 py-4 rounded-full bg-white text-gray-900 font-bold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
                {t("hero.cta.demo")}
              </Link>
            </div>
            
            <div className="pt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200" />
                <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-300" />
                <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                {t("hero.trusted")}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#053d26]/10 dark:from-green-500/10 to-transparent rounded-[3rem] transform rotate-3" />
            <div className="relative bg-white dark:bg-[#1a1a1a] rounded-[3rem] p-4 shadow-2xl border border-gray-100 dark:border-white/10 transition-colors duration-300">
              <div className="aspect-[4/3] rounded-[2.5rem] bg-gray-100 dark:bg-[#0a0a0a] overflow-hidden relative">
                {/* Hero Image */}
                <Image
                  src="/hero-classroom.png"
                  alt="African students engaged in digital learning in a modern classroom"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Floating element */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-lg border border-white/20 dark:border-white/10 transition-colors duration-300">
                  <div className="h-10 w-10 rounded-xl bg-orange-100 text-[#b05e1c] flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t("hero.automated_processing")}</p>
                    <div className="h-1.5 w-32 bg-gray-200 rounded-full mt-2">
                      <div className="h-full w-2/3 bg-[#053d26] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-24 bg-gray-50 dark:bg-[#111111] px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-2">
              {t("features.subtitle")}
            </p>
            <h2 className="text-4xl font-bold text-[#053d26]">
              {t("features.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 - Large */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("features.card1.title")}</h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  {t("features.card1.desc")}
                </p>
              </div>
              <div className="flex gap-3 mt-10">
                <span className="px-4 py-2 rounded-full bg-green-100 text-[#053d26] text-xs font-bold">{t("features.card1.tag1")}</span>
                <span className="px-4 py-2 rounded-full bg-green-100 text-[#053d26] text-xs font-bold">{t("features.card1.tag2")}</span>
              </div>
            </div>

            {/* Feature Card 2 - Dark */}
            <div className="bg-[#053d26] rounded-[2rem] p-10 shadow-sm text-white flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4">{t("features.card2.title")}</h3>
                <p className="text-green-100/80 leading-relaxed">
                  {t("features.card2.desc")}
                </p>
              </div>
              <Link href="/register" className="flex items-center gap-2 text-sm font-bold mt-10 hover:text-green-200 transition-colors w-fit">
                {t("features.card2.more")} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("features.card3.title")}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t("features.card3.desc")}
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t("features.card4.title")}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t("features.card4.desc")}
              </p>
            </div>

            {/* Feature Card 5 - Orange Focus */}
            <div className="bg-[#b05e1c] rounded-[2rem] p-10 shadow-sm text-white flex flex-col items-center justify-center text-center">
              <h3 className="text-6xl font-bold mb-4">99%</h3>
              <p className="font-medium text-orange-100">{t("features.card5.stat_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why LeonEd Section */}
      <section id="why-leoned" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-[3rem] bg-[#053d26] aspect-[4/3] overflow-hidden relative shadow-2xl">
            {/* Academic Architect Image */}
            <Image
              src="/academic-architect.png"
              alt="School administrator managing digital education platform"
              fill
              className="object-cover"
              p-index={0}
            />
            {/* Subtle overlay for text contrast if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#053d26]/40 to-transparent" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-4">{t("why.category")}</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#053d26] leading-tight mb-6">
              {t("why.title")}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-10 text-lg">
              {t("why.desc")}
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-[#053d26]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{t("why.item1.title")}</h4>
                  <p className="text-sm text-gray-500">{t("why.item1.desc")}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-[#053d26]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{t("why.item2.title")}</h4>
                  <p className="text-sm text-gray-500">{t("why.item2.desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-20">
        <div className="bg-[#053d26] rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 translate-x-16 -translate-y-16">
            <Image src="/logo.png" alt="" width={256} height={256} className="transform rotate-12" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("cta.title")}</h2>
            <p className="text-lg text-green-100/80 mb-10 max-w-2xl mx-auto">
              {t("cta.desc")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="px-8 py-4 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-all shadow-lg shadow-orange-900/20">
                {t("hero.cta.register")}
              </Link>
              <Link href="/demo" className="px-8 py-4 rounded-full bg-[#042c1b] text-white font-bold hover:bg-black/40 border border-white/10 transition-all">
                {t("cta.contact")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#032416] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="LeonEd" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold">LeonEd</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>
          
          <div>
            <h4 className="text-[#b05e1c] font-bold text-sm uppercase tracking-wider mb-6">{t("footer.solutions")}</h4>
            <ul className="space-y-4">
              <li><Link href="#architecture" className="text-gray-400 hover:text-white transition-colors text-sm">{t("footer.solutions.item1")}</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">{t("footer.solutions.item2")}</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">{t("footer.solutions.item3")}</Link></li>
              <li><Link href="mailto:support@leoned.com" className="text-gray-400 hover:text-white transition-colors text-sm">{t("footer.solutions.item4")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#b05e1c] font-bold text-sm uppercase tracking-wider mb-6">{t("footer.support")}</h4>
            <ul className="space-y-4">
              <li><Link href="#why-leoned" className="text-gray-400 hover:text-white transition-colors text-sm">{t("footer.support.item1")}</Link></li>
              <li><Link href="/demo" className="text-gray-400 hover:text-white transition-colors text-sm">{t("footer.support.item2")}</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors text-sm">{t("footer.support.item3")}</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">{t("footer.support.item4")}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>{t("footer.rights")}</p>
          <div className="flex gap-4">
            <Globe className="h-4 w-4" />
          </div>
        </div>
      </footer>
    </div>
  );
}
