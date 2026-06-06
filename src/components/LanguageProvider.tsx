"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ig" | "yo" | "ha";

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", flag: "🇳🇬" },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", flag: "🇳🇬" },
  { code: "ha", name: "Hausa", nativeName: "Harshen Hausa", flag: "🇳🇬" },
];

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.overview": "Term Overview",
    "nav.schedule": "Schedule",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.dashboard": "Dashboard",
    "nav.students": "Students",
    "nav.faculty": "Teachers",
    "nav.classes": "Classes",
    "nav.schools": "Schools",
    "nav.users": "Users",
    "nav.billing": "Billing",
    "nav.settings": "Settings",
    "nav.logout": "Logout",
    // Hero
    "hero.title": "Digitizing African Classrooms, One School at a Time.",
    "hero.subtitle": "The complete digital management solution for student records, automated result processing, and secure portal access. Built for the future of African education.",
    "hero.cta.register": "Register Your School",
    "hero.cta.demo": "Request Demo",
    "hero.trusted": "Trusted by 500+ institutions across the continent",
    "hero.architect": "THE ACADEMIC ARCHITECT",
    "hero.automated_processing": "Automated Result Processing",
    // Features
    "features.title": "Built for Educational Excellence",
    "features.subtitle": "Platform Architecture",
    "features.card1.title": "Digital Student Records",
    "features.card1.desc": "Centralize comprehensive student data from enrollment to graduation. One source of truth for demographics, attendance, and behavioral history.",
    "features.card1.tag1": "Secure Storage",
    "features.card1.tag2": "Instant Retrieval",
    "features.card2.title": "Multi-school platform",
    "features.card2.desc": "Manage multiple campuses or an entire school district from a single, unified dashboard with tiered access controls.",
    "features.card2.more": "Learn More",
    "features.card3.title": "Secure Portals",
    "features.card3.desc": "Dedicated, encrypted access for parents, teachers, and students to view progress in real-time.",
    "features.card4.title": "Automated Results",
    "features.card4.desc": "Generate report cards and transcripts in seconds with our intelligent computation engine.",
    "features.card5.title": "Intelligent Insights",
    "features.card5.desc": "Make data-driven decisions with analytics on student performance and school attendance trends.",
    "features.card5.stat_desc": "Efficiency increase reported by headmasters",
    // Why LeonEd
    "why.category": "Why LeonEd Africa?",
    "why.title": "The Academic Architect for Your School's Future.",
    "why.desc": "We don't just provide software; we design digital ecosystems. Our platform is built with a deep understanding of the unique challenges faced by African educational institutions, from connectivity hurdles to administrative complexity.",
    "why.item1.title": "Tailored for Local Curriculums",
    "why.item1.desc": "Flexible result processing that adapts to national standards.",
    "why.item2.title": "Enterprise Grade Security",
    "why.item2.desc": "Advanced encryption ensuring student data privacy.",
    // CTA
    "cta.title": "Ready to transform your institution?",
    "cta.desc": "Join hundreds of schools already paving the way for digital excellence in Africa.",
    "cta.contact": "Contact Support",
    // Footer
    "footer.desc": "The leading Academic Architect for digital transformation in African education. Empowering schools through intelligent automation and secure data management.",
    "footer.solutions": "Solutions",
    "footer.solutions.item1": "Digital Records",
    "footer.solutions.item2": "Result Processing",
    "footer.solutions.item3": "Parent Portals",
    "footer.solutions.item4": "Multi-school System",
    "footer.support": "Support",
    "footer.support.item1": "Help Center",
    "footer.support.item2": "Documentation",
    "footer.support.item3": "Privacy Policy",
    "footer.support.item4": "Terms of Service",
    "footer.rights": "© 2026 LeonEd Africa. All rights reserved.",
    // Login
    "login.title": "Welcome Back",
    "login.subtitle": "Sign in to manage your school database",
    "login.email": "Email Address",
    "login.forgot": "Forgot password?",
    "forgot.title": "Reset Password",
    "forgot.subtitle": "Enter your email to receive a password reset link",
    "forgot.email": "Email Address",
    "forgot.send": "Send Reset Link",
    "forgot.back_login": "Back to login",
    "forgot.success_title": "Check your email",
    "forgot.success_desc": "We have sent password reset instructions to your email.",
    "login.remember": "Remember me",
    "login.signin": "Sign In",
    "login.no_account": "Don't have an account?",
    "login.register_here": "Register here",
    // Register
    "register.title": "Register Your School",
    "register.subtitle": "Begin your digital transition today",
    "register.school_name": "School Name",
    "register.admin_name": "Administrator Name",
    "register.phone": "Phone Number",
    "register.address": "School Address",
    "register.create": "Create Account",
    "register.have_account": "Already have an account?",
    "register.login_here": "Login here",
    "register.school_type": "School Type",
    "register.city": "City",
    "register.state": "State / Province",
    "register.country": "Country",
    "register.est_students": "Est. Student Count",
    "register.official_role": "Official Role",
    "register.confirm_password": "Confirm Password",
    "register.review": "Confirm Registration",
    "register.review_sub": "Review your details before submitting.",
    "register.back": "Back",
    "register.continue": "Continue",
    "register.registering": "Registering...",
    "register.complete": "Complete Registration",
    // Demo
    "demo.title": "Request a Free Demo",
    "demo.subtitle": "Experience the academic architect in action",
    "demo.submit": "Submit Request",
    "demo.success": "Demo requested successfully!",
    // Layout headers
    "header.academic_architect": "Academic Architect",
    "header.search": "Search records...",
    "header.logout": "Logout",
    // Setup Guide
    "guide.title": "School Setup Guide",
    "guide.subtitle": "Complete these steps to get your school fully operational.",
    "guide.step1": "Add School Info",
    "guide.step1.desc": "Set up your school's profile, address, logo, and contacts.",
    "guide.step2": "Register Classes",
    "guide.step2.desc": "Create standard arms, classes, and subjects.",
    "guide.step3": "Import Students",
    "guide.step3.desc": "Add students individually or import them via Excel.",
    "guide.step4": "Onboard Teachers",
    "guide.step4.desc": "Invite teachers and assign them to classes."
  },
  ig: {
    // Nav
    "nav.overview": "Nchịkọta Oge",
    "nav.schedule": "Usoro Oge",
    "nav.login": "Banye",
    "nav.register": "Debanye aha",
    "nav.dashboard": "Mbadamba Nchịkọta",
    "nav.students": "Ụmụ akwụkwọ",
    "nav.faculty": "Ndị nkuzi",
    "nav.classes": "Klasị",
    "nav.schools": "Ụlọ Akwụkwọ",
    "nav.users": "Ndị ọrụ",
    "nav.billing": "Ịkwụ ụgwọ",
    "nav.settings": "Ntọala",
    "nav.logout": "Pụọ",
    // Hero
    "hero.title": "Ịme ka Klasị ndị dị n'Africa dị na Kọmputa, Otu Ụlọ Akwụkwọ n'otu oge.",
    "hero.subtitle": "Usoro njikwa dijitalụ zuru oke maka ndekọ ụmụ akwụkwọ, nhazi nsonaazụ akpaaka, na ohere nchekwa portal. Ewuru maka ọdịnihu nke agụmakwụkwọ Africa.",
    "hero.cta.register": "Debanye aha Ụlọ Akwụkwọ Gị",
    "hero.cta.demo": "Rịọ ngosi",
    "hero.trusted": "Ihe karịrị ụlọ ọrụ 500+ na kọntinent ahụ tụkwasịrị obi",
    "hero.architect": "Onye Mmepụta Agụmakwụkwọ",
    "hero.automated_processing": "Nhazi Nsonaazụ Akpaaka",
    // Features
    "features.title": "Ewuru maka Ọkachamara Agụmakwụkwọ",
    "features.subtitle": "Nhazi Ikpo okwu",
    "features.card1.title": "Ndekọ Ụmụ Akwụkwọ Dijitalụ",
    "features.card1.desc": "Mee ka data ụmụ akwụkwọ zuru oke site na ntinye aha ruo na ngụsị akwụkwọ. Otu isi iyi nke eziokwu maka ọnụ ọgụgụ mmadụ, ntinye akwụkwọ, na akụkọ omume.",
    "features.card1.tag1": "Nchekwa Chekwara",
    "features.card1.tag2": "Nghachite Ngwa Ngwa",
    "features.card2.title": "Ikpo Okwu Ọtụtụ Ụlọ Akwụkwọ",
    "features.card2.desc": "Njikwa ọtụtụ ogige ma ọ bụ mpaghara ụlọ akwụkwọ niile site na otu mbadamba nchịkọta, nwere ikike nnweta dị iche iche.",
    "features.card2.more": "Mụtakwuo ihe",
    "features.card3.title": "Portal Chekwara",
    "features.card3.desc": "Ohere pụrụ iche, nke e zoro ezo maka ndị nne na nna, ndị nkuzi, na ụmụ akwụkwọ iji hụ ọganihu n'oge kwesịrị ekwesị.",
    "features.card4.title": "Nsonaazụ Akpaaka",
    "features.card4.desc": "Mepụta kaadị akụkọ na transcript n'ime sekọnd ole na ole site na iji injin mgbakọ anyị nwere ọgụgụ isi.",
    "features.card5.title": "Nghọta nwere Ọgụgụ Isi",
    "features.card5.desc": "Mee mkpebi dabere na data sitere na nyocha gbasara arụmọrụ ụmụ akwụkwọ na usoro ntinye akwụkwọ.",
    "features.card5.stat_desc": "Mmụba arụmọrụ nke ndị isi ụlọ akwụkwọ kọrọ",
    // Why LeonEd
    "why.category": "Gịnị kpatara LeonEd Africa?",
    "why.title": "Onye Mmepụta Agụmakwụkwọ maka Ọdịnihu Ụlọ Akwụkwọ Gị.",
    "why.desc": "Anyị anaghị enye naanị ngwanrọ; anyị na-emepụta gburugburu ebe obibi dijitalụ. Ejiri nghọta miri emi banyere ihe ịma aka pụrụ iche nke ụlọ ọrụ agụmakwụkwọ Africa na-eche ihu wuo ikpo okwu anyị, site na nsogbu njikọta ruo na mgbagwoju anya nchịkwa.",
    "why.item1.title": "Ahaziri maka usoro ọmụmụ obodo",
    "why.item1.desc": "Nhazi nsonaazụ na-agbanwe agbanwe nke na-adaba na ụkpụrụ mba.",
    "why.item2.title": "Nchekwa Ọkwa Enterprise",
    "why.item2.desc": "Izo ya ezo dị elu na-eme ka nzuzo data ụmụ akwụkwọ nwee nchekwa.",
    // CTA
    "cta.title": "Ị dịla njikere ịgbanwe ụlọ ọrụ gị?",
    "cta.desc": "Sonyere ọtụtụ narị ụlọ akwụkwọ na-emeghe ụzọ maka ọkachamara dijitalụ na Africa.",
    "cta.contact": "Kpọtụrụ Nkwado",
    // Footer
    "footer.desc": "Onye Mmepụta Agụmakwụkwọ na-ebute ụzọ maka mgbanwe dijitalụ na agụmakwụkwọ Africa. Inye ụlọ akwụkwọ ike site na akpaaka nwere ọgụgụ isi na njikwa data echekwara.",
    "footer.solutions": "Ngwọta",
    "footer.solutions.item1": "Ndekọ Dijitalụ",
    "footer.solutions.item2": "Nhazi Nsonaazụ",
    "footer.solutions.item3": "Portal Ndị Nne na Nna",
    "footer.solutions.item4": "Usoro Ọtụtụ Ụlọ Akwụkwọ",
    "footer.support": "Nkwado",
    "footer.support.item1": "Ebe Enyemaka",
    "footer.support.item2": "Akwụkwọ Nduzi",
    "footer.support.item3": "Usoro Nzuzo",
    "footer.support.item4": "Usoro Ọrụ",
    "footer.rights": "© 2026 LeonEd Africa. Ikike niile echekwara.",
    // Login
    "login.title": "Nnọọ Ọzọ",
    "login.subtitle": "Banye iji jikwaa nchekwa data ụlọ akwụkwọ gị",
    "login.email": "Adreesị Ozi-e",
    "login.forgot": "Echefuru paswọdụ?",
    "forgot.title": "Weghachi Paswọdụ",
    "forgot.subtitle": "Tinye email gị ka ị nweta njikọ weghachi paswọdụ",
    "forgot.email": "Adreesị Ozi-e",
    "forgot.send": "Zipu Njikọ Weghachi",
    "forgot.back_login": "Laghachi na mbata",
    "forgot.success_title": "Lelee email gị",
    "forgot.success_desc": "Anyị ezigarala ntuziaka weghachi paswọdụ na email gị.",
    "login.remember": "Cheta m",
    "login.signin": "Banye",
    "login.no_account": "Ị nweghị akaụntụ?",
    "login.register_here": "Debanye aha ebe a",
    // Register
    "register.title": "Debanye aha Ụlọ Akwụkwọ Gị",
    "register.subtitle": "Malite mgbanwe dijitalụ gị taa",
    "register.school_name": "Aha Ụlọ Akwụkwọ",
    "register.admin_name": "Aha Onye Nchịkwa",
    "register.phone": "Nọmba Ekwentị",
    "register.address": "Adreesị Ụlọ Akwụkwọ",
    "register.create": "Mepụta Akaụntụ",
    "register.have_account": "Ị nwere akaụntụ kale?",
    "register.login_here": "Banye ebe a",
    "register.school_type": "Ụdị Ụlọ Akwụkwọ",
    "register.city": "Obodo",
    "register.state": "Steeti / Mpaghara",
    "register.country": "Obodo Mba",
    "register.est_students": "Atụmatụ Ụmụ Akwụkwọ",
    "register.official_role": "Ọrụ Gị",
    "register.confirm_password": "Kwenye Paswọdụ",
    "register.review": "Kwenye Ndebanye aha",
    "register.review_sub": "Nyochaa nkọwa gị tupu ị nyefee.",
    "register.back": "Laghachi",
    "register.continue": "Gaba n'ihu",
    "register.registering": "Na-ede aha...",
    "register.complete": "Mechaa Ndebanye aha",
    // Demo
    "demo.title": "Rịọ maka Ngosi N'efu",
    "demo.subtitle": "Nwalee onye mmepụta agụmakwụkwọ na-arụ ọrụ",
    "demo.submit": "Nyefee Arịrịọ",
    "demo.success": "Arịrịọla ngosi nke ọma!",
    // Layout headers
    "header.academic_architect": "Onye Mmepụta Agụmakwụkwọ",
    "header.search": "Chọọ ndekọ...",
    "header.logout": "Pụọ",
    // Setup Guide
    "guide.title": "Usoro Nhazi Ụlọ Akwụkwọ",
    "guide.subtitle": "Mechaa usoro ndị a iji mee ka ụlọ akwụkwọ gị na-arụ ọrụ nke ọma.",
    "guide.step1": "Tinye Ozi Ụlọ Akwụkwọ",
    "guide.step1.desc": "Setịpụ profaịlụ ụlọ akwụkwọ gị, adreesị, logo, na kọntaktị.",
    "guide.step2": "Debanye aha Klasị",
    "guide.step2.desc": "Mepụta ngalaba, klasị na isiokwu.",
    "guide.step3": "Bubata Ụmụ Akwụkwọ",
    "guide.step3.desc": "Tinye ụmụ akwụkwọ n'otu n'otu ma ọ bụ site na Excel.",
    "guide.step4": "Banye Ndị Nkuzi",
    "guide.step4.desc": "Kpọọ ndị nkuzi ma kenye ha klasị."
  },
  yo: {
    // Nav
    "nav.overview": "Akopọ Akoko",
    "nav.schedule": "Iṣeto Akoko",
    "nav.login": "Wọle",
    "nav.register": "Forukọsilẹ",
    "nav.dashboard": "Oju-iwe Akoso",
    "nav.students": "Awọn Akẹkọọ",
    "nav.faculty": "Awọn Olukọni",
    "nav.classes": "Awọn Kilasi",
    "nav.schools": "Awọn Ile-iwe",
    "nav.users": "Awọn Olumulo",
    "nav.billing": "Isanwo",
    "nav.settings": "Awọn Eto",
    "nav.logout": "Jade",
    // Hero
    "hero.title": "Ṣiṣe Awọn Kilasi Ilẹ Afirika di ti Diji-tẹẹ, Ile-iwe kan ni Igbesẹ kan.",
    "hero.subtitle": "Eto iṣakoso oni-nọmba pipe fun awọn igbasilẹ akẹkọọ, iṣiro abajade adaṣe, ati iraye si oju-ọna aabo. Ti a kọ fun ọjọ iwaju ti eto-ẹkọ Afirika.",
    "hero.cta.register": "Forukọsilẹ Ile-iwe Rẹ",
    "hero.cta.demo": "Beere fun Ifihan",
    "hero.trusted": "Gbẹkẹle nipasẹ awọn ile-iṣẹ 500+ kọja kọnputa naa",
    "hero.architect": "Kọ Agbaye Ẹkọ",
    "hero.automated_processing": "Iṣiro Abajade Adaṣe",
    // Features
    "features.title": "Ti a kọ fun Didara Ẹkọ",
    "features.subtitle": "Eto Ilana Platform",
    "features.card1.title": "Awọn Igbasilẹ Akẹkọọ Oni-nọmba",
    "features.card1.desc": "Ṣe akopọ data akẹkọọ lati iforukọsilẹ si ayẹyẹ ipari ẹkọ. Orisun otitọ kan fun alaye eniyan, wiwa si kilasi, ati itan ihuwasi.",
    "features.card1.tag1": "Ibi ipamọ to ni Aabo",
    "features.card1.tag2": "Imupadabọ Lẹsẹkẹsẹ",
    "features.card2.title": "Platform Ile-iwe Pupọ",
    "features.card2.desc": "Ṣakoso awọn ile-iwe pupọ tabi gbogbo agbegbe ile-iwe lati oju-iwe akoso kan ti o ni iṣakoso iraye si ti o yatọ.",
    "features.card2.more": "Kọ ẹkọ diẹ si",
    "features.card3.title": "Awọn Oju-ọna Aabo",
    "features.card3.desc": "Irọrun ati aabo fun awọn obi, olukọ, ati akẹkọọ lati wo ilọsiwaju nigbakugba.",
    "features.card4.title": "Awọn Abajade Adaṣe",
    "features.card4.desc": "Ṣẹda awọn kaadi abajade ati iwe-ẹri laarin iṣẹju-aaya pẹlu ẹrọ iṣiro ti o ni oye.",
    "features.card5.title": "Awọn Imọye ti o ni Oye",
    "features.card5.desc": "Ṣe awọn ipinnu to dara pẹlu itupalẹ lori iṣẹ akẹkọọ ati awọn aṣa wiwa si ile-iwe.",
    "features.card5.stat_desc": "Ipo ilọsiwaju ti oṣiṣẹ ti oṣiṣẹ sọ",
    // Why LeonEd
    "why.category": "Kí nìdí LeonEd Africa?",
    "why.title": "Kọ Agbaye Ẹkọ fun Ọjọ Iwaju Ile-iwe Rẹ.",
    "why.desc": "A ko kan pese sọfitiwia; a ṣe apẹrẹ awọn ilana oni-nọmba. A kọ pẹpẹ wa pẹlu oye ti o jinlẹ nipa awọn italaya alailẹgbẹ ti awọn ile-iṣẹ eto-ẹkọ Afirika n dojukọ, lati awọn idiwọ asopọ si idiju iṣakoso.",
    "why.item1.title": "Ti a ṣe fun awọn eto ẹkọ agbegbe",
    "why.item1.desc": "Iṣiro abajade to rọrun ti o ṣe deede si awọn iṣedede orilẹ-ede.",
    "why.item2.title": "Aabo Ipele ti o ga",
    "why.item2.desc": "Ìsekóòdù to ti ni ilọsiwaju ti o n rii daju aṣiri data akẹkọọ.",
    // CTA
    "cta.title": "Ṣetan lati yi ile-iṣẹ rẹ pada?",
    "cta.desc": "Darapọ mọ awọn ọgọọgọrun awọn ile-iwe ti o ti n pa ọna fun didara oni-nọmba ni Afirika.",
    "cta.contact": "Kan si Awọn oluranlọwọ",
    // Footer
    "footer.desc": "Kọ Agbaye Ẹkọ ti o n ṣaju fun iyipada oni-nọmba ni eto-ẹkọ Afirika. Fi agbara fun awọn ile-iwe nipasẹ adaṣe ti o ni oye ati iṣakoso data to ni aabo.",
    "footer.solutions": "Awọn Solusan",
    "footer.solutions.item1": "Awọn Igbasilẹ Oni-nọmba",
    "footer.solutions.item2": "Iṣiro Abajade",
    "footer.solutions.item3": "Awọn Oju-ọna Obi",
    "footer.solutions.item4": "Eto Ile-iwe Pupọ",
    "footer.support": "Atilẹyin",
    "footer.support.item1": "Ibudo Iranlọwọ",
    "footer.support.item2": "Awọn Iwe Eto",
    "footer.support.item3": "Ilana Aṣiri",
    "footer.support.item4": "Awọn Ofin Iṣẹ",
    "footer.rights": "© 2026 LeonEd Africa. Gbogbo awọn ẹtọ wa ni ipamọ.",
    // Login
    "login.title": "Kaabo Pada",
    "login.subtitle": "Wọle lati ṣakoso data ile-iwe rẹ",
    "login.email": "Adirẹsi Imeeli",
    "login.forgot": "Gbagbe ọrọigbaniwọle?",
    "forgot.title": "Tun Ọrọigbaniwọle Tọ",
    "forgot.subtitle": "Tẹ email rẹ lati gba ọna asopọ lati tun ọrọigbaniwọle rọ",
    "forgot.email": "Adirẹsi Imeeli",
    "forgot.send": "Fi Ọna Asopọ Tuntun Ransẹ",
    "forgot.back_login": "Pada si oju-iwe iwọle",
    "forgot.success_title": "Yẹ email rẹ wo",
    "forgot.success_desc": "A ti fi ilana fun atunto ọrọigbaniwọle ranṣẹ si email rẹ.",
    "login.remember": "Ranti mi",
    "login.signin": "Wọle",
    "login.no_account": "Ko ni akọọlẹ kan?",
    "login.register_here": "Forukọsilẹ nibi",
    // Register
    "register.title": "Forukọsilẹ Ile-iwe Rẹ",
    "register.subtitle": "Bẹrẹ iyipada oni-nọmba rẹ loni",
    "register.school_name": "Orukọ Ile-iwe",
    "register.admin_name": "Orukọ Alakoso",
    "register.phone": "Nomba Tẹlifoonu",
    "register.address": "Adirẹsi Ile-iwe",
    "register.create": "Ṣẹda Akọọlẹ",
    "register.have_account": "Ti ni akọọlẹ kan tẹlẹ?",
    "register.login_here": "Wọle nibi",
    "register.school_type": "Iru Ile-iwe",
    "register.city": "Ilu",
    "register.state": "Ipinle",
    "register.country": "Orilẹ-ede",
    "register.est_students": "Iye Akẹkọọ",
    "register.official_role": "Ipa Rẹ",
    "register.confirm_password": "Jẹrisi Ọrọigbaniwọle",
    "register.review": "Jẹrisi Iforukọsilẹ",
    "register.review_sub": "Ṣe atunyẹwo awọn alaye rẹ ṣaaju fifiranṣẹ.",
    "register.back": "Pada",
    "register.continue": "Tẹsiwaju",
    "register.registering": "N forukọsilẹ...",
    "register.complete": "Pari Iforukọsilẹ",
    // Demo
    "demo.title": "Beere fun Ifihan Ọfẹ",
    "demo.subtitle": "Ni iriri ohun elo aṣoju ẹkọ ni iṣe",
    "demo.submit": "Firanṣẹ Ibere",
    "demo.success": "Beere for afihan ni aṣeyọri!",
    // Layout headers
    "header.academic_architect": "Kọ Agbaye Ẹkọ",
    "header.search": "Wa awọn igbasilẹ...",
    "header.logout": "Jade",
    // Setup Guide
    "guide.title": "Itọsọna Eto Ile-iwe",
    "guide.subtitle": "Pari awọn igbesẹ wọnyi lati jẹ ki ile-iwe rẹ ṣiṣẹ ni kikun.",
    "guide.step1": "Fi Alaye Ile-iwe sii",
    "guide.step1.desc": "Ṣeto profaili ile-iwe rẹ, adirẹsi, aami, ati awọn alaye ibasọrọ.",
    "guide.step2": "Forukọsilẹ Kilasi",
    "guide.step2.desc": "Ṣẹda awọn kilasi ati awọn ẹkọ.",
    "guide.step3": "Fi Awọn Akẹkọọ sii",
    "guide.step3.desc": "Fi awọn akẹkọọ kun lọkọọkan tabi gbe wọn wọle lati Excel.",
    "guide.step4": "Fi Awọn Olukọni sii",
    "guide.step4.desc": "Pe awọn olukọ ki o si fi wọn si awọn kilasi."
  },
  ha: {
    // Nav
    "nav.overview": "Bayanin Lokaci",
    "nav.schedule": "Tsararren Lokaci",
    "nav.login": "Shiga",
    "nav.register": "Rajišta",
    "nav.dashboard": "Dashboard",
    "nav.students": "Dalibai",
    "nav.faculty": "Malamai",
    "nav.classes": "Azuzuwa",
    "nav.schools": "Makarantu",
    "nav.users": "Masu Amfani",
    "nav.billing": "Biyan Kudi",
    "nav.settings": "Saituna",
    "nav.logout": "Fita",
    // Hero
    "hero.title": "Mayar da Azuzuwan Afirika na Dijital, Makaranta Guda a Lokaci Guda.",
    "hero.subtitle": "Cikakken tsarin sarrafa dijital don bayanan dalibai, sarrafa sakamako ta atomatik, da amintaccen damar shiga portal. An gina shi don makomar ilimin Afirika.",
    "hero.cta.register": "Yi wa Makarantarku Rajišta",
    "hero.cta.demo": "Nemi Nunin Gwaji",
    "hero.trusted": "Fiye da cibiyoyi 500+ a duk faɗin nahiyar sun amince da mu",
    "hero.architect": "Masanin Ilimi",
    "hero.automated_processing": "Sarrafa Sakamako ta Automatik",
    // Features
    "features.title": "An Gina don Kwarewar Ilimi",
    "features.subtitle": "Tsarin Platform",
    "features.card1.title": "Bayanan Dalibai na Dijital",
    "features.card1.desc": "Tattara cikakken bayanan dalibai tun daga shiga har zuwa kammalawa. Guda daya na gaskiya don alkaluman jama'a, halarta, da tarihin hali.",
    "features.card1.tag1": "Amintaccen Ajiya",
    "features.card1.tag2": "Saurin Dawo da Bayani",
    "features.card2.title": "Tsarin Makarantu da Yawa",
    "features.card2.desc": "Sarrafa makarantu da yawa ko gundumar makaranta gaba daya daga dashboard guda daya mai dauke da matakan shiga daban-daban.",
    "features.card2.more": "Koyi ƙarin",
    "features.card3.title": "Amintattun Portals",
    "features.card3.desc": "Damar shiga ta musamman, rufaffiyar sirri don iyaye, malamai, da ɗalibai don duba ci gaba a ainihin lokacin.",
    "features.card4.title": "Sakamako ta Automatik",
    "features.card4.desc": "Samar da katunan rahoto da transcripts a cikin seconds ta amfani da injin sarrafa mu mai hankali.",
    "features.card5.title": "Hanyoyin Wayo",
    "features.card5.desc": "Yanke shawara ta amfani da bayanai tare da nazarin kan ayyukan dalibai da yanayin halartar makaranta.",
    "features.card5.stat_desc": "Haɓakar inganci da shugabannin makarantu suka ruwaito",
    // Why LeonEd
    "why.category": "Me yasa LeonEd Africa?",
    "why.title": "Masanin Ilimi don Makomar Makarantarku.",
    "why.desc": "Ba mu samar da software kawai ba; muna tsara tsarin dijital ne. An gina dandalinmu tare da zurfin fahimtar kalubale na musamman da cibiyoyin ilimi na Afirika ke fuskanta, tun daga matsalar sadarwa zuwa sarkakiyar gudanarwa.",
    "why.item1.title": "An gina shi don tsarin karatun gida",
    "why.item1.desc": "Sarrafa sakamako mai sauƙi wanda ya dace da ka'idodin ƙasa.",
    "why.item2.title": "Amintaccen tsaro mai karfi",
    "why.item2.desc": "Ingantaccen tsarin boye sirri wanda ke tabbatar da sirrin bayanan dalibai.",
    // CTA
    "cta.title": "Kun shirya don canza cibiyarku?",
    "cta.desc": "Kasance cikin daruruwan makarantu da ke share fagen samun nasarar dijital a Afirika.",
    "cta.contact": "Tuntubi Masu Taimako",
    // Footer
    "footer.desc": "Masanin Ilimi mai jagoranci don canjin dijital a cikin ilimin Afirika. Karfafa makarantu ta hanyar fasaha mai hankali da amintaccen sarrafa bayanai.",
    "footer.solutions": "Hanyoyi",
    "footer.solutions.item1": "Bayanan Dijital",
    "footer.solutions.item2": "Sarrafa Sakamako",
    "footer.solutions.item3": "Portals na Iyaye",
    "footer.solutions.item4": "Tsarin Makarantu da Yawa",
    "footer.support": "Taimako",
    "footer.support.item1": "Cibiyar Taimako",
    "footer.support.item2": "Takardun Bayani",
    "footer.support.item3": "Tsarin Sirri",
    "footer.support.item4": "Sharuɗɗan Sabis",
    "footer.rights": "© 2026 LeonEd Africa. Duk haƙƙoƙi sun adana.",
    // Login
    "login.title": "Barka da Dawowa",
    "login.subtitle": "Shiga don sarrafa bayanan makarantarku",
    "login.email": "Adireshin Imel",
    "login.forgot": "Kun manta kalmar sirri?",
    "forgot.title": "Sake saita Kalmar sirri",
    "forgot.subtitle": "Shigar da imel ɗin ku don karɓar hanyar haɗin sake saita kalmar sirri",
    "forgot.email": "Adireshin Imel",
    "forgot.send": "Aika Hanyar Sake Saita",
    "forgot.back_login": "Koma zuwa shiga",
    "forgot.success_title": "Duba imel ɗin ku",
    "forgot.success_desc": "Mun aika da umarnin sake saita kalmar sirri zuwa imel ɗin ku.",
    "login.remember": "Tuna da ni",
    "login.signin": "Shiga ciki",
    "login.no_account": "Ba ku da asusu?",
    "login.register_here": "Yi rajista a nan",
    // Register
    "register.title": "Yi wa Makarantarku Rajišta",
    "register.subtitle": "Fara canjin ku na dijital a yau",
    "register.school_name": "Sunan Makaranta",
    "register.admin_name": "Sunan Mai Gudanarwa",
    "register.phone": "Lambar Waya",
    "register.address": "Adireshin Makaranta",
    "register.create": "Ƙirƙiri Asusun",
    "register.have_account": "Kuna da asusu riga?",
    "register.login_here": "Shiga a nan",
    "register.school_type": "Nau'in Makaranta",
    "register.city": "Gari",
    "register.state": "Jiha",
    "register.country": "Kasa",
    "register.est_students": "Adadin Dalibai",
    "register.official_role": "Matsayinku",
    "register.confirm_password": "Tabbatar da Kalmar Sirri",
    "register.review": "Tabbatar da Rajista",
    "register.review_sub": "Duba bayanan ku kafin tura shi.",
    "register.back": "Koma baya",
    "register.continue": "Ci gaba",
    "register.registering": "Ana yin rajista...",
    "register.complete": "Kammala Rajista",
    // Demo
    "demo.title": "Nemi Nunin Gwaji na Kyauta",
    "demo.subtitle": "Gano yadda tsarin masanin ilimi yake aiki",
    "demo.submit": "Tura Neman",
    "demo.success": "An nemi nunin gwaji cikin nasara!",
    // Layout headers
    "header.academic_architect": "Masanin Ilimi",
    "header.search": "Nemo bayanai...",
    "header.logout": "Fita",
    // Setup Guide
    "guide.title": "Jagorar Tsarin Makaranta",
    "guide.subtitle": "Kammala waɗannan matakan don makarantarku ta fara aiki sosai.",
    "guide.step1": "Ƙara Bayanin Makaranta",
    "guide.step1.desc": "Saita bayanan makarantar ku, adireshin ku, logo, da lambobin sadarwa.",
    "guide.step2": "Yi Rajistar Azuzuwa",
    "guide.step2.desc": "Ƙirƙiri azuzuwa, sassa, da darussa.",
    "guide.step3": "Shigo da ɗalibai",
    "guide.step3.desc": "Ƙara ɗalibai ɗaya bayan ɗaya ko shigo da su ta fayil ɗin Excel.",
    "guide.step4": "Saka Malamai",
    "guide.step4.desc": "Gayyaci malamai kuma sanya su zuwa azuzuwa."
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage if present
    const saved = localStorage.getItem("leoned_lang") as Language;
    if (saved && ["en", "ig", "yo", "ha"].includes(saved)) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("leoned_lang", lang);
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations["en"];
    return dict[key] || translations["en"][key] || key;
  };

  // Avoid hydrations mismatch by returning a placeholder or English content until mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: "en", setLanguage: () => {}, t: (key) => translations["en"][key] || key }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Reusable premium drop-down UI Language Selector Component
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const activeLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    if (isOpen) {
      window.addEventListener("click", handleClose);
    }
    return () => window.removeEventListener("click", handleClose);
  }, [isOpen]);

  const renderFlag = (code: Language) => {
    if (code === "en") {
      return (
        <svg viewBox="0 0 60 30" className="w-5 h-5 rounded-full object-cover shadow-sm border border-gray-100 shrink-0">
          <rect width="60" height="30" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4"/>
          <path d="M30,0 L30,30 M0,15 L60,15" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 L30,30 M0,15 L60,15" stroke="#c8102e" strokeWidth="6"/>
        </svg>
      );
    }
    // Nigerian languages (ig, yo, ha)
    return (
      <svg viewBox="0 0 9 6" className="w-5 h-5 rounded-full object-cover shadow-sm border border-gray-100 shrink-0">
        <rect width="3" height="6" fill="#008751"/>
        <rect x="3" width="3" height="6" fill="#fff"/>
        <rect x="6" width="3" height="6" fill="#008751"/>
      </svg>
    );
  };

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-between w-full rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#053d26] transition-all gap-2"
          id="menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {renderFlag(activeLang.code)}
          <span className="hidden sm:inline font-bold text-gray-700">{activeLang.nativeName}</span>
          <span className="sm:hidden uppercase font-bold text-gray-700">{activeLang.code}</span>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none border border-gray-100 overflow-hidden transition-all"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-left text-sm font-semibold transition-colors gap-3 ${
                  language === lang.code
                    ? "bg-green-50 text-[#053d26]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                role="menuitem"
              >
                {renderFlag(lang.code)}
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-xs sm:text-sm">{lang.nativeName}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
