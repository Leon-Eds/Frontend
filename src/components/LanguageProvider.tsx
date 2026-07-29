"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ig" | "yo" | "ha" | "fr" | "es" | "de" | "pt" | "zh";

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
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
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
    "hero.cta.demo": "Contact Us",
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
    "why.category": "Why LeonEd?",
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
    "footer.rights": "© 2026 LeonEd. All rights reserved.",
    // Login
    "login.title": "Welcome Back",
    "login.subtitle": "Sign in to access your portal",
    "login.email": "Email Address",
    "login.password": "Password",
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
    "login.signing_in": "Signing In...",
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
    "demo.title": "Contact Sales",
    "demo.subtitle": "Experience the academic architect in action",
    "demo.submit": "Submit Request",
    "demo.success": "Request submitted successfully!",
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
    "guide.step4.desc": "Invite teachers and assign them to classes.",
    "sidebar.super_admin": "Super Admin",
    "sidebar.academic_architect": "Academic Architect",
    "sidebar.overview": "Overview",
    "sidebar.student_registry": "Student Registry",
    "sidebar.academic_flow": "Academic Flow",
    "sidebar.financials": "Financials",
    "sidebar.staff_directory": "Staff Directory",
    "sidebar.session_rollover": "Session Rollover",
    "sidebar.academic_overview": "Academic overview",
    "sidebar.students": "Students",
    "sidebar.teachers_overview": "Teachers' overview",
    "sidebar.students_report": "Students' report",
    "sidebar.fee_clearance": "Fee clearance",
    "sidebar.fee_approvals": "Fee Approvals",
    "sidebar.admin_approval": "Admin approval",
    "sidebar.broadcast_hub": "Broadcast hub",
    "sidebar.my_classes": "My Classes",
    "sidebar.result_entry": "Result Entry",
    "sidebar.attendance": "Attendance",
    "sidebar.attendance_history": "Attendance History",
    "sidebar.schedule": "Schedule",
    "sidebar.my_profile": "My Profile",
    "sidebar.teachers": "Teachers",
    "sidebar.staff": "Staff",
    "sidebar.support_staff": "Support Staff",
    "sidebar.classes": "Classes",
    "sidebar.finance": "Finance",
    "sidebar.reports": "Reports",
    "sidebar.reports_hub": "Reports Hub",
    "sidebar.revenue_reports": "Revenue Reports",
    "sidebar.payment_logs": "Payment Logs",
    "sidebar.form_class": "Form Class",
    "sidebar.my_results": "My Results",
    "sidebar.dashboard": "Dashboard",
    "sidebar.pending_clearances": "Pending Clearances",
    "sidebar.platform_overview": "Platform Overview",
    "sidebar.manage_schools": "Manage Schools",
    "sidebar.global_users": "Global Users",
    "sidebar.billing_plans": "Billing & Plans",
    "sidebar.enroll_new_student": "Enroll New Student",
    "sidebar.register_new_school": "Register New School",
    "sidebar.free_plan_msg": "You are on the Free Plan",
    "sidebar.upgrade_plan": "Upgrade Plan"
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
    "why.category": "Gịnị kpatara LeonEd?",
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
    "footer.rights": "© 2026 LeonEd. Ikike niile echekwara.",
    // Login
    "login.title": "Nnọọ Ọzọ",
    "login.subtitle": "Banye iji nweta portal gị",
    "login.email": "Adreesị Ozi-e",
    "login.password": "Paswọd",
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
    "login.signing_in": "Na-banye...",
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
    "why.category": "Kí nìdí LeonEd?",
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
    "footer.rights": "© 2026 LeonEd. Gbogbo awọn ẹtọ wa ni ipamọ.",
    // Login
    "login.title": "Kaabo Pada",
    "login.subtitle": "Wọle lati wọle si oju-ọna rẹ",
    "login.email": "Adirẹsi Imeeli",
    "login.password": "Ọrọigbaniwọle",
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
    "login.signing_in": "N wọle...",
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
    "why.category": "Me yasa LeonEd?",
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
    "footer.rights": "© 2026 LeonEd. Duk haƙƙoƙi sun adana.",
    // Login
    "login.title": "Barka da Dawowa",
    "login.subtitle": "Shiga don samun damar shiga portal ɗin ku",
    "login.email": "Adireshin Imel",
    "login.password": "Kalmar sirri",
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
    "login.signing_in": "Ana shiga...",
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
  },
  fr: {
    "nav.overview": "Aperçu du trimestre",
    "nav.schedule": "Calendrier",
    "nav.login": "Connexion",
    "nav.register": "S'enregistrer",
    "nav.dashboard": "Tableau de bord",
    "nav.students": "Élèves",
    "nav.faculty": "Enseignants",
    "nav.classes": "Classes",
    "nav.schools": "Écoles",
    "nav.users": "Utilisateurs",
    "nav.billing": "Facturation",
    "nav.settings": "Paramètres",
    "nav.logout": "Déconnexion",
    "hero.title": "Numériser les salles de classe africaines, une école à la fois.",
    "hero.subtitle": "La solution complète de gestion numérique pour les dossiers des élèves, le traitement automatisé des résultats et l'accès sécurisé aux portails. Conçue pour l'avenir de l'éducation en Afrique.",
    "hero.cta.register": "Enregistrer votre école",
    "hero.cta.demo": "Demander une démo",
    "hero.trusted": "Approuvé par plus de 500 institutions à travers le continent",
    "hero.architect": "L'ARCHITECTE ACADÉMIQUE",
    "hero.automated_processing": "Traitement automatisé des résultats",
    "features.title": "Conçu pour l'excellence éducative",
    "features.subtitle": "Architecture de la plateforme",
    "features.card1.title": "Dossiers numériques des élèves",
    "features.card1.desc": "Centralisez les données complètes des élèves, de l'inscription à la remise des diplômes. Une source unique de vérité pour la démographie, l'assiduité et l'historique comportemental.",
    "features.card1.tag1": "Stockage sécurisé",
    "features.card1.tag2": "Récupération instantanée",
    "features.card2.title": "Plateforme multi-écoles",
    "features.card2.desc": "Gérez plusieurs campus ou tout un district scolaire à partir d'un tableau de bord unique et unifié avec des contrôles d'accès hiérarchisés.",
    "features.card2.more": "En savoir plus",
    "features.card3.title": "Portails sécurisés",
    "features.card3.desc": "Accès dédié et crypté pour les parents, les enseignants et les élèves afin de suivre les progrès en temps réel.",
    "features.card4.title": "Résultats automatisés",
    "features.card4.desc": "Générez des bulletins scolaires et des relevés de notes en quelques secondes grâce à notre moteur de calcul intelligent.",
    "features.card5.title": "Analyses intelligentes",
    "features.card5.desc": "Prenez des décisions basées sur les données grâce à des analyses sur les performances des élèves et les tendances d'assiduité scolaire.",
    "features.card5.stat_desc": "Augmentation de l'efficacité signalée par les directeurs",
    "why.category": "Pourquoi LeonEd ?",
    "why.title": "L'architecte académique pour l'avenir de votre école.",
    "why.desc": "Nous ne fournissons pas seulement des logiciels ; nous concevons des écosystèmes numériques. Notre plateforme est construite avec une compréhension profonde des défis uniques auxquels sont confrontées les institutions éducatives africaines, des obstacles de connectivité à la complexité administrative.",
    "why.item1.title": "Adapté aux programmes locaux",
    "why.item1.desc": "Traitement flexible des résultats qui s'adapte aux normes nationales.",
    "why.item2.title": "Sécurité de niveau entreprise",
    "why.item2.desc": "Cryptage avancé garantissant la confidentialité des données des élèves.",
    "cta.title": "Prêt à transformer votre institution ?",
    "cta.desc": "Rejoignez des centaines d'écoles qui ouvrent déjà la voie à l'excellence numérique en Afrique.",
    "cta.contact": "Contacter le support",
    "footer.desc": "Le principal architecte académique pour la transformation numérique de l'éducation en Afrique. Autonomiser les écoles grâce à une automatisation intelligente et une gestion sécurisée des données.",
    "footer.solutions": "Solutions",
    "footer.solutions.item1": "Dossiers numériques",
    "footer.solutions.item2": "Traitement des résultats",
    "footer.solutions.item3": "Portails parents",
    "footer.solutions.item4": "Système multi-écoles",
    "footer.support": "Support",
    "footer.support.item1": "Centre d'aide",
    "footer.support.item2": "Documentation",
    "footer.support.item3": "Politique de confidentialité",
    "footer.support.item4": "Conditions d'utilisation",
    "footer.rights": "© 2026 LeonEd. Tous droits réservés.",
    "login.title": "Bon retour",
    "login.subtitle": "Connectez-vous pour accéder à votre portail",
    "login.email": "Adresse e-mail",
    "login.password": "Mot de passe",
    "login.forgot": "Mot de passe oublié ?",
    "forgot.title": "Réinitialiser le mot de passe",
    "forgot.subtitle": "Entrez votre e-mail pour recevoir un lien de réinitialisation",
    "forgot.email": "Adresse e-mail",
    "forgot.send": "Envoyer le lien de réinitialisation",
    "forgot.back_login": "Retour à la connexion",
    "forgot.success_title": "Vérifiez vos e-mails",
    "forgot.success_desc": "Nous avons envoyé des instructions de réinitialisation de mot de passe à votre e-mail.",
    "login.remember": "Se souvenir de moi",
    "login.signin": "Se connecter",
    "login.signing_in": "Connexion en cours...",
    "login.no_account": "Vous n'avez pas de compte ?",
    "login.register_here": "S'inscrire ici",
    "register.title": "Enregistrer votre école",
    "register.subtitle": "Commencez votre transition numérique aujourd'hui",
    "register.school_name": "Nom de l'école",
    "register.admin_name": "Nom de l'administrateur",
    "register.phone": "Numéro de téléphone",
    "register.address": "Adresse de l'école",
    "register.create": "Créer un compte",
    "register.have_account": "Vous avez déjà un compte ?",
    "register.login_here": "Connectez-vous ici",
    "register.school_type": "Type d'école",
    "register.city": "Ville",
    "register.state": "État / Province",
    "register.country": "Pays",
    "register.est_students": "Nombre d'élèves estimé",
    "register.official_role": "Rôle officiel",
    "register.confirm_password": "Confirmer le mot de passe",
    "register.review": "Confirmer l'inscription",
    "register.review_sub": "Vérifiez vos informations avant de soumettre.",
    "register.back": "Retour",
    "register.continue": "Continuer",
    "register.registering": "Inscription en cours...",
    "register.complete": "Terminer l'inscription",
    "demo.title": "Demander une démo gratuite",
    "demo.subtitle": "Découvrez l'architecte académique en action",
    "demo.submit": "Soumettre la demande",
    "demo.success": "Démo demandée avec succès !",
    "header.academic_architect": "Architecte Académique",
    "header.search": "Rechercher des dossiers...",
    "header.logout": "Déconnexion",
    "guide.title": "Guide de configuration de l'école",
    "guide.subtitle": "Suivez ces étapes pour rendre votre école opérationnelle.",
    "guide.step1": "Infos de l'école",
    "guide.step1.desc": "Configurez le profil, l'adresse, le logo et les contacts de votre école.",
    "guide.step2": "Enregistrer des classes",
    "guide.step2.desc": "Créez des sections, des classes et des matières.",
    "guide.step3": "Importer des élèves",
    "guide.step3.desc": "Ajoutez des élèves individuellement ou importez-les via Excel.",
    "guide.step4": "Intégrer les enseignants",
    "guide.step4.desc": "Invitez des enseignants et affectez-les aux classes.",
    "sidebar.super_admin": "Super Admin",
    "sidebar.academic_architect": "Architecte Académique",
    "sidebar.overview": "Aperçu",
    "sidebar.student_registry": "Registre des Élèves",
    "sidebar.academic_flow": "Flux Académique",
    "sidebar.financials": "Finances",
    "sidebar.staff_directory": "Répertoire du Personnel",
    "sidebar.session_rollover": "Transfert de Session",
    "sidebar.academic_overview": "Aperçu académique",
    "sidebar.students": "Élèves",
    "sidebar.teachers_overview": "Aperçu des enseignants",
    "sidebar.students_report": "Rapport des élèves",
    "sidebar.fee_clearance": "Paiement des frais",
    "sidebar.fee_approvals": "Approbations des frais",
    "sidebar.admin_approval": "Approbation de l'admin",
    "sidebar.broadcast_hub": "Centre de diffusion",
    "sidebar.my_classes": "Mes Classes",
    "sidebar.result_entry": "Saisie des Résultats",
    "sidebar.attendance": "Présence",
    "sidebar.attendance_history": "Historique de Présence",
    "sidebar.schedule": "Calendrier",
    "sidebar.my_profile": "Mon Profil",
    "sidebar.teachers": "Enseignants",
    "sidebar.classes": "Classes",
    "sidebar.finance": "Finances",
    "sidebar.reports": "Rapports",
    "sidebar.platform_overview": "Aperçu de la Plateforme",
    "sidebar.manage_schools": "Gérer les Écoles",
    "sidebar.global_users": "Utilisateurs Globaux",
    "sidebar.billing_plans": "Facturation & Tarifs",
    "sidebar.enroll_new_student": "Inscrire un Nouvel Élève",
    "sidebar.register_new_school": "Enregistrer une Nouvelle École",
    "sidebar.free_plan_msg": "Vous utilisez le forfait gratuit",
    "sidebar.upgrade_plan": "Mettre à Niveau"
  },
  es: {
    "nav.overview": "Resumen del trimestre",
    "nav.schedule": "Calendario",
    "nav.login": "Iniciar sesión",
    "nav.register": "Registrarse",
    "nav.dashboard": "Tablero de control",
    "nav.students": "Estudiantes",
    "nav.faculty": "Profesores",
    "nav.classes": "Clases",
    "nav.schools": "Escuelas",
    "nav.users": "Usuarios",
    "nav.billing": "Facturación",
    "nav.settings": "Configuración",
    "nav.logout": "Cerrar sesión",
    "hero.title": "Digitalizando las aulas africanas, una escuela a la vez.",
    "hero.subtitle": "La solución completa de gestión digital para expedientes de estudiantes, procesamiento automatizado de resultados y acceso seguro a portales. Diseñado para el futuro de la educación en África.",
    "hero.cta.register": "Registrar su escuela",
    "hero.cta.demo": "Solicitar demostración",
    "hero.trusted": "Con la confianza de más de 500 instituciones en todo el continente",
    "hero.architect": "EL ARQUITECTO ACADÉMICO",
    "hero.automated_processing": "Procesamiento automatizado de resultados",
    "features.title": "Construido para la excelencia educativa",
    "features.subtitle": "Arquitectura de la plataforma",
    "features.card1.title": "Expedientes digitales de estudiantes",
    "features.card1.desc": "Centralice los datos completos de los estudiantes desde la inscripción hasta la graduación. Una única fuente de verdad para datos demográficos, asistencia e historial de comportamiento.",
    "features.card1.tag1": "Almacenamiento seguro",
    "features.card1.tag2": "Recuperación al instante",
    "features.card2.title": "Plataforma multi-escuela",
    "features.card2.desc": "Administre múltiples campus o todo un distrito escolar desde un tablero de control único y unificado con controles de acceso escalonados.",
    "features.card2.more": "Saber más",
    "features.card3.title": "Portales seguros",
    "features.card3.desc": "Acceso dedicado y encriptado para padres, profesores y estudiantes para ver el progreso en tiempo real.",
    "features.card4.title": "Resultados automatizados",
    "features.card4.desc": "Genere boletas de calificaciones y certificados en segundos con nuestro motor de cálculo inteligente.",
    "features.card5.title": "Análisis inteligentes",
    "features.card5.desc": "Tome decisiones basadas en datos con análisis sobre el rendimiento de los estudiantes y las tendencias de asistencia escolar.",
    "features.card5.stat_desc": "Aumento de la eficiencia informado por los directores",
    "why.category": "¿Por qué LeonEd?",
    "why.title": "El arquitecto académico para el futuro de su escuela.",
    "why.desc": "No solo proporcionamos software; diseñamos ecosistemas digitales. Nuestra plataforma está construida con un profundo entendimiento de los desafíos únicos que enfrentan las instituciones educativas africanas, desde problemas de conectividad hasta complejidad administrativa.",
    "why.item1.title": "Adaptado a los currículos locales",
    "why.item1.desc": "Procesamiento de resultados flexible que se adapta a las normas nacionales.",
    "why.item2.title": "Seguridad de nivel empresarial",
    "why.item2.desc": "Cifrado avanzado que garantiza la privacidad de los datos de los estudiantes.",
    "cta.title": "¿Listo para transformar su institución?",
    "cta.desc": "Únase a cientos de escuelas que ya están abriendo el camino hacia la excelencia digital en África.",
    "cta.contact": "Contactar con soporte",
    "footer.desc": "El arquitecto académico líder para la transformación digital en la educación africana. Empoderando a las escuelas mediante la automatización inteligente y la gestión segura de datos.",
    "footer.solutions": "Soluciones",
    "footer.solutions.item1": "Expedientes digitales",
    "footer.solutions.item2": "Procesamiento de resultados",
    "footer.solutions.item3": "Portales para padres",
    "footer.solutions.item4": "Sistema multi-escuela",
    "footer.support": "Soporte",
    "footer.support.item1": "Centro de ayuda",
    "footer.support.item2": "Documentación",
    "footer.support.item3": "Política de privacidad",
    "footer.support.item4": "Condiciones de servicio",
    "footer.rights": "© 2026 LeonEd. Todos los derechos reservados.",
    "login.title": "Bienvenido de nuevo",
    "login.subtitle": "Inicie sesión para acceder a su portal",
    "login.email": "Dirección de correo electrónico",
    "login.password": "Contraseña",
    "login.forgot": "¿Olvidó su contraseña?",
    "forgot.title": "Restablecer contraseña",
    "forgot.subtitle": "Ingrese su correo electrónico para recibir un enlace de restablecimiento",
    "forgot.email": "Dirección de correo electrónico",
    "forgot.send": "Enviar enlace de restablecimiento",
    "forgot.back_login": "Volver a iniciar sesión",
    "forgot.success_title": "Revise su correo electrónico",
    "forgot.success_desc": "Hemos enviado instrucciones de restablecimiento de contraseña a su correo electrónico.",
    "login.remember": "Recordarme",
    "login.signin": "Iniciar sesión",
    "login.signing_in": "Iniciando sesión...",
    "login.no_account": "¿No tiene una cuenta?",
    "login.register_here": "Regístrese aquí",
    "register.title": "Registrar su escuela",
    "register.subtitle": "Comience su transición digital hoy",
    "register.school_name": "Nombre de la escuela",
    "register.admin_name": "Nombre del administrador",
    "register.phone": "Número de teléfono",
    "register.address": "Dirección de la escuela",
    "register.create": "Crear cuenta",
    "register.have_account": "¿Ya tiene una cuenta?",
    "register.login_here": "Inicie sesión aquí",
    "register.school_type": "Tipo de escuela",
    "register.city": "Ciudad",
    "register.state": "Estado / Provincia",
    "register.country": "País",
    "register.est_students": "Número estimado de estudiantes",
    "register.official_role": "Rol oficial",
    "register.confirm_password": "Confirmar contraseña",
    "register.review": "Confirmar registro",
    "register.review_sub": "Revise sus detalles antes de enviar.",
    "register.back": "Atrás",
    "register.continue": "Continuar",
    "register.registering": "Registrando...",
    "register.complete": "Completar registro",
    "demo.title": "Solicitar una demo gratuita",
    "demo.subtitle": "Vea al arquitecto académico en acción",
    "demo.submit": "Enviar solicitud",
    "demo.success": "¡Demo solicitada con éxito!",
    "header.academic_architect": "Arquitecto Académico",
    "header.search": "Buscar registros...",
    "header.logout": "Cerrar sesión",
    "guide.title": "Guía de configuración escolar",
    "guide.subtitle": "Complete estos pasos para que su escuela esté operativa.",
    "guide.step1": "Información escolar",
    "guide.step1.desc": "Configure el perfil, dirección, logo y contactos de su escuela.",
    "guide.step2": "Registrar clases",
    "guide.step2.desc": "Cree secciones, clases y asignaturas.",
    "guide.step3": "Importar estudiantes",
    "guide.step3.desc": "Añada estudiantes individualmente o impórtelos mediante Excel.",
    "guide.step4": "Integrar profesores",
    "guide.step4.desc": "Invite a profesores y asígnelos a las clases."
  },
  de: {
    "nav.overview": "Terminübersicht",
    "nav.schedule": "Stundenplan",
    "nav.login": "Anmelden",
    "nav.register": "Registrieren",
    "nav.dashboard": "Dashboard",
    "nav.students": "Schüler",
    "nav.faculty": "Lehrer",
    "nav.classes": "Klassen",
    "nav.schools": "Schulen",
    "nav.users": "Benutzer",
    "nav.billing": "Abrechnung",
    "nav.settings": "Einstellungen",
    "nav.logout": "Abmelden",
    "hero.title": "Afrikanische Klassenzimmer digitalisieren, eine Schule nach der anderen.",
    "hero.subtitle": "Die komplette digitale Verwaltungslösung für Schülerakten, automatisierte Ergebnisberechnung und sicheren Portalzugang. Entwickelt für die Zukunft der afrikanischen Bildung.",
    "hero.cta.register": "Schule registrieren",
    "hero.cta.demo": "Demo anfordern",
    "hero.trusted": "Vertraut von über 500 Institutionen auf dem gesamten Kontinent",
    "hero.architect": "DER AKADEMISCHE ARCHITEKT",
    "hero.automated_processing": "Automatisierte Ergebnisverarbeitung",
    "features.title": "Entwickelt für pädagogische Exzellenz",
    "features.subtitle": "Plattform-Architektur",
    "features.card1.title": "Digitale Schülerakten",
    "features.card1.desc": "Zentralisieren Sie umfassende Schülerdaten von der Anmeldung bis zum Abschluss. Eine einzige Quelle der Wahrheit für Demografie, Anwesenheit und Verhaltenshistorie.",
    "features.card1.tag1": "Sichere Verwahrung",
    "features.card1.tag2": "Sofortiger Abruf",
    "features.card2.title": "Multi-Schul-Plattform",
    "features.card2.desc": "Verwalten Sie mehrere Campus oder einen gesamten Schulbezirk über ein einziges, einheitliches Dashboard mit gestaffelten Zugriffskontrollen.",
    "features.card2.more": "Mehr erfahren",
    "features.card3.title": "Sichere Portale",
    "features.card3.desc": "Dedizierter, verschlüsselter Zugang für Eltern, Lehrer und Schüler, um den Fortschritt in Echtzeit zu verfolgen.",
    "features.card4.title": "Automatisierte Ergebnisse",
    "features.card4.desc": "Erstellen Sie Zeugnisse und Leistungsnachweise in Sekundenschnelle mit unserer intelligenten Berechnungs-Engine.",
    "features.card5.title": "Intelligente Erkenntnisse",
    "features.card5.desc": "Treffen Sie datenbasierte Entscheidungen mit Analysen zu Schülerleistungen und Trends bei der Schulpräsenz.",
    "features.card5.stat_desc": "Von Schulleitern berichtete Effizienzsteigerung",
    "why.category": "Warum LeonEd?",
    "why.title": "Der akademische Architekt für die Zukunft Ihrer Schule.",
    "why.desc": "Wir bieten nicht nur Software an; wir entwerfen digitale Ökosysteme. Unsere Plattform wurde mit einem tiefen Verständnis für die einzigartigen Herausforderungen afrikanischer Bildungseinrichtungen entwickelt, von Konnektivitätsproblemen bis hin zu administrativen Hürden.",
    "why.item1.title": "An lokale Lehrpläne angepasst",
    "why.item1.desc": "Flexible Ergebnisverarbeitung, die sich an nationale Standards anpasst.",
    "why.item2.title": "Sicherheit auf Enterprise-Niveau",
    "why.item2.desc": "Fortschrittliche Verschlüsselung, die den Schutz von Schülerdaten garantiert.",
    "cta.title": "Bereit, Ihre Einrichtung zu transformieren?",
    "cta.desc": "Schließen Sie sich Hunderten von Schulen an, die bereits den Weg für digitale Exzellenz in Afrika ebnen.",
    "cta.contact": "Support kontaktieren",
    "footer.desc": "Der führende akademische Architekt für die digitale Transformation im afrikanischen Bildungswesen. Stärkung von Schulen durch intelligente Automatisierung und sichere Datenverwaltung.",
    "footer.solutions": "Lösungen",
    "footer.solutions.item1": "Digitale Akten",
    "footer.solutions.item2": "Ergebnisverarbeitung",
    "footer.solutions.item3": "Elternportale",
    "footer.solutions.item4": "Multi-Schul-System",
    "footer.support": "Support",
    "footer.support.item1": "Hilfezentrum",
    "footer.support.item2": "Dokumentation",
    "footer.support.item3": "Datenschutzerklärung",
    "footer.support.item4": "Nutzungsbedingungen",
    "footer.rights": "© 2026 LeonEd. Alle Rechte vorbehalten.",
    "login.title": "Willkommen zurück",
    "login.subtitle": "Melden Sie sich an, um auf Ihr Portal zuzugreifen",
    "login.email": "E-Mail-Adresse",
    "login.password": "Passwort",
    "login.forgot": "Passwort vergessen?",
    "forgot.title": "Passwort zurücksetzen",
    "forgot.subtitle": "Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten",
    "forgot.email": "E-Mail-Adresse",
    "forgot.send": "Link zum Zurücksetzen senden",
    "forgot.back_login": "Zurück zur Anmeldung",
    "forgot.success_title": "Überprüfen Sie Ihre E-Mails",
    "forgot.success_desc": "Wir haben Anweisungen zum Zurücksetzen des Passworts an Ihre E-Mail-Adresse gesendet.",
    "login.remember": "Angemeldet bleiben",
    "login.signin": "Anmelden",
    "login.signing_in": "Anmeldung...",
    "login.no_account": "Haben Sie noch kein Konto?",
    "login.register_here": "Hier registrieren",
    "register.title": "Schule registrieren",
    "register.subtitle": "Beginnen Sie Ihren digitalen Wandel heute",
    "register.school_name": "Name der Schule",
    "register.admin_name": "Name des Administrators",
    "register.phone": "Telefonnummer",
    "register.address": "Adresse der Schule",
    "register.create": "Konto erstellen",
    "register.have_account": "Haben Sie bereits ein Konto?",
    "register.login_here": "Hier anmelden",
    "register.school_type": "Schultyp",
    "register.city": "Stadt",
    "register.state": "Bundesland / Provinz",
    "register.country": "Land",
    "register.est_students": "Geschätzte Schülerzahl",
    "register.official_role": "Offizielle Funktion",
    "register.confirm_password": "Passwort bestätigen",
    "register.review": "Registrierung bestätigen",
    "register.review_sub": "Überprüfen Sie Ihre Daten vor dem Absenden.",
    "register.back": "Zurück",
    "register.continue": "Weiter",
    "register.registering": "Registrierung läuft...",
    "register.complete": "Registrierung abschließen",
    "demo.title": "Kostenlose Demo anfordern",
    "demo.subtitle": "Erleben Sie den akademischen Architekten in Aktion",
    "demo.submit": "Anfrage absenden",
    "demo.success": "Demo erfolgreich angefordert !",
    "header.academic_architect": "Akademischer Architekt",
    "header.search": "Datensätze durchsuchen...",
    "header.logout": "Abmelden",
    "guide.title": "Leitfaden zur Schuleinrichtung",
    "guide.subtitle": "Führen Sie diese Schritte aus, um Ihre Schule betriebsbereit zu machen.",
    "guide.step1": "Schulinformationen",
    "guide.step1.desc": "Richten Sie das Profil, die Adresse, das Logo und die Kontakte Ihrer Schule ein.",
    "guide.step2": "Klassen registrieren",
    "guide.step2.desc": "Erstellen Sie Abteilungen, Klassen und Fächer.",
    "guide.step3": "Schüler importieren",
    "guide.step3.desc": "Fügen Sie Schüler einzeln hinzu oder importieren Sie sie über Excel.",
    "guide.step4": "Lehrer onboarden",
    "guide.step4.desc": "Laden Sie Lehrer ein und weisen Sie sie Klassen zu."
  },
  pt: {
    "nav.overview": "Visão geral do período",
    "nav.schedule": "Cronograma",
    "nav.login": "Entrar",
    "nav.register": "Registrar",
    "nav.dashboard": "Painel",
    "nav.students": "Alunos",
    "nav.faculty": "Professores",
    "nav.classes": "Classes",
    "nav.schools": "Escolas",
    "nav.users": "Usuários",
    "nav.billing": "Faturamento",
    "nav.settings": "Configurações",
    "nav.logout": "Sair",
    "hero.title": "Digitalizando salas de aula africanas, uma escola de cada vez.",
    "hero.subtitle": "A solução completa de gestão digital para registo de alunos, processamento automatizado de resultados e acesso seguro ao portal. Construído para o futuro da educação na África.",
    "hero.cta.register": "Registe a sua escola",
    "hero.cta.demo": "Solicitar demonstração",
    "hero.trusted": "Confiado por mais de 500 instituições em todo o continente",
    "hero.architect": "O ARQUITETO ACADÉMICO",
    "hero.automated_processing": "Processamento automatizado de resultados",
    "features.title": "Construído para a Excelência Educativa",
    "features.subtitle": "Arquitetura da Plataforma",
    "features.card1.title": "Registos Digitais de Alunos",
    "features.card1.desc": "Centralize dados detalhados dos alunos, desde a matrícula até a formatura. Uma única fonte de verdade para dados demográficos, frequência e histórico comportamental.",
    "features.card1.tag1": "Armazenamento Seguro",
    "features.card1.tag2": "Recuperação Instantânea",
    "features.card2.title": "Plataforma Multi-escolas",
    "features.card2.desc": "Gerencie múltiplos campi ou todo um distrito escolar a partir de um painel de controle único e unificado com níveis de acesso estruturados.",
    "features.card2.more": "Saiba mais",
    "features.card3.title": "Portais Seguros",
    "features.card3.desc": "Acesso dedicado e criptografado para encarregados de educação, professores e alunos para acompanhar o progresso em tempo real.",
    "features.card4.title": "Resultados Automatizados",
    "features.card4.desc": "Gere boletins de notas e históricos escolares em segundos com o nosso motor de cálculo inteligente.",
    "features.card5.title": "Insights Inteligentes",
    "features.card5.desc": "Tome decisões informadas com análises sobre o desempenho dos alunos e tendências de frequência escolar.",
    "features.card5.stat_desc": "Aumento de eficiência relatado pelos diretores",
    "why.category": "Porquê a LeonEd?",
    "why.title": "O arquiteto académico para o futuro da sua escola.",
    "why.desc": "Não fornecemos apenas software; projetamos ecossistemas digitais. Nossa plataforma foi desenvolvida com um entendimento profissional dos desafios únicos enfrentados pelas instituições de ensino africanas, desde dificuldades de conectividade até complexidade administrativa.",
    "why.item1.title": "Adaptado aos Currículos Locais",
    "why.item1.desc": "Processamento flexível de resultados que se adapta aos padrões nacionais.",
    "why.item2.title": "Segurança de Nível Corporativo",
    "why.item2.desc": "Criptografia avançada garantindo a privacidade dos dados dos alunos.",
    "cta.title": "Pronto para transformar a sua instituição?",
    "cta.desc": "Junte-se a centenas de escolas que já estão a abrir caminho para a excelência digital na África.",
    "cta.contact": "Contactar o Suporte",
    "footer.desc": "O principal arquiteto académico para a transformação digital no ensino africano. Capacitando escolas através de automação inteligente e gestão de dados segura.",
    "footer.solutions": "Soluções",
    "footer.solutions.item1": "Registos Digitais",
    "footer.solutions.item2": "Processamento de Notas",
    "footer.solutions.item3": "Portais de Encarregados",
    "footer.solutions.item4": "Sistema Multi-escola",
    "footer.support": "Suporte",
    "footer.support.item1": "Centro de Ajuda",
    "footer.support.item2": "Documentação",
    "footer.support.item3": "Política de Privacidade",
    "footer.support.item4": "Termos de Serviço",
    "footer.rights": "© 2026 LeonEd. Todos os direitos reservados.",
    "login.title": "Bem-vindo de volta",
    "login.subtitle": "Faça login para aceder ao seu portal",
    "login.email": "Endereço de e-mail",
    "login.password": "Palavra-passe",
    "login.forgot": "Esqueceu-se da palavra-passe?",
    "forgot.title": "Redefinir senha",
    "forgot.subtitle": "Insira o seu e-mail para receber um link de redefinição",
    "forgot.email": "Endereço de e-mail",
    "forgot.send": "Enviar link de redefinição",
    "forgot.back_login": "Voltar para o login",
    "forgot.success_title": "Verifique o seu e-mail",
    "forgot.success_desc": "Enviámos instruções de redefinição de senha para o seu e-mail.",
    "login.remember": "Lembrar-me",
    "login.signin": "Entrar",
    "login.signing_in": "A entrar...",
    "login.no_account": "Não tem uma conta?",
    "login.register_here": "Registe-se aqui",
    "register.title": "Registe a sua escola",
    "register.subtitle": "Comece a sua transição digital hoje",
    "register.school_name": "Nome da Escola",
    "register.admin_name": "Nome do Administrador",
    "register.phone": "Número de Telefone",
    "register.address": "Endereço da Escola",
    "register.create": "Criar Conta",
    "register.have_account": "Já tem uma conta?",
    "register.login_here": "Inicie sessão aqui",
    "register.school_type": "Tipo de Escola",
    "register.city": "Cidade",
    "register.state": "Estado / Província",
    "register.country": "País",
    "register.est_students": "Número Estimado de Alunos",
    "register.official_role": "Função Oficial",
    "register.confirm_password": "Confirmar Palavra-passe",
    "register.review": "Confirmar Registo",
    "register.review_sub": "Reveja os seus dados antes de submeter.",
    "register.back": "Voltar",
    "register.continue": "Continuer",
    "register.registering": "A registar...",
    "register.complete": "Concluir Registo",
    "demo.title": "Solicitar uma Demonstração Gratuita",
    "demo.subtitle": "Veja o arquiteto académico em ação",
    "demo.submit": "Submeter Pedido",
    "demo.success": "Demonstração solicitada com sucesso !",
    "header.academic_architect": "Arquiteto Académico",
    "header.search": "Pesquisar registos...",
    "header.logout": "Sair",
    "guide.title": "Guia de Configuração da Escola",
    "guide.subtitle": "Siga estes passos para colocar a sua escola em funcionamento.",
    "guide.step1": "Informações da Escola",
    "guide.step1.desc": "Defina o perfil, endereço, logótipo e contactos da sua escola.",
    "guide.step2": "Registar Classes",
    "guide.step2.desc": "Crie seções, classes e disciplinas.",
    "guide.step3": "Importar Alunos",
    "guide.step3.desc": "Adicione alunos individualmente ou importe-os via Excel.",
    "guide.step4": "Integrar Professores",
    "guide.step4.desc": "Convide professores e associe-os a classes."
  },
  zh: {
    "nav.overview": "学期概览",
    "nav.schedule": "日程表",
    "nav.login": "登录",
    "nav.register": "注册",
    "nav.dashboard": "仪表板",
    "nav.students": "学生",
    "nav.faculty": "教师",
    "nav.classes": "班级",
    "nav.schools": "学校",
    "nav.users": "用户",
    "nav.billing": "计费",
    "nav.settings": "设置",
    "nav.logout": "退出",
    "hero.title": "数字化非洲教室，每次一所学校。",
    "hero.subtitle": "适用于学生记录、自动成绩处理和安全门户访问的一体化数字管理解决方案。为非洲教育的未来而生。",
    "hero.cta.register": "注册您的学校",
    "hero.cta.demo": "请求演示",
    "hero.trusted": "深受非洲大陆 500 多所机构信赖",
    "hero.architect": "学术构建师",
    "hero.automated_processing": "自动成绩处理",
    "features.title": "专为卓越教育而设计",
    "features.subtitle": "平台架构",
    "features.card1.title": "数字化学生记录",
    "features.card1.desc": "集中管理从入学到毕业的完整学生数据。为人口统计、出勤率和行为历史提供单一事实来源。",
    "features.card1.tag1": "安全存储",
    "features.card1.tag2": "即时检索",
    "features.card2.title": "多校管理平台",
    "features.card2.desc": "通过具有分级访问权限的统一控制台，轻松管理多个分校或整个校区。",
    "features.card2.more": "了解更多",
    "features.card3.title": "安全门户",
    "features.card3.desc": "为家长、教师和学生提供专属的加密通道，实时查看教学进展。",
    "features.card4.title": "自动成绩计算",
    "features.card4.desc": "使用我们的智能成绩计算引擎，在几秒钟内自动生成报告单和成绩单。",
    "features.card5.title": "智能数据洞察",
    "features.card5.desc": "通过学生学习表现和出勤趋势的数据分析，做出有据可依的教学决策。",
    "features.card5.stat_desc": "校长反馈的学校管理 efficiency 效率提升",
    "why.category": "为什么选择 LeonEd？",
    "why.title": "为您学校的未来量身定制的学术构建师。",
    "why.desc": "我们不仅仅提供软件，我们设计数字化教学生态系统。我们在充分理解非洲教育机构面临的连接限制和管理复杂性等独特挑战的基础上构建了这个平台。",
    "why.item1.title": "适配本地课程体系",
    "why.item1.desc": "灵活的成绩和结果处理机制，无缝适应国家和地区标准。",
    "why.item2.title": "企业级安全防护",
    "why.item2.desc": "采用先进的加密技术，全方位保障学生隐私和数据安全。",
    "cta.title": "准备好变革您的教育机构了吗？",
    "cta.desc": "加入非洲数以百计已经铺平数字化教育之路的杰出学校。",
    "cta.contact": "联系支持团队",
    "footer.desc": "非洲教育数字化转型的领先学术构建师。通过智能自动化和安全数据管理为学校赋能。",
    "footer.solutions": "解决方案",
    "footer.solutions.item1": "数字档案",
    "footer.solutions.item2": "成绩计算",
    "footer.solutions.item3": "家长门户",
    "footer.solutions.item4": "多校系统",
    "footer.support": "服务支持",
    "footer.support.item1": "帮助中心",
    "footer.support.item2": "开发文档",
    "footer.support.item3": "隐私政策",
    "footer.support.item4": "服务条款",
    "footer.rights": "© 2026 LeonEd. 版权所有。",
    "login.title": "欢迎回来",
    "login.subtitle": "登录以访问您的门户",
    "login.email": "电子邮件地址",
    "login.password": "密码",
    "login.forgot": "忘记密码？",
    "forgot.title": "重置密码",
    "forgot.subtitle": "输入您的电子邮件以获取重置链接",
    "forgot.email": "电子邮件地址",
    "forgot.send": "发送重置链接",
    "forgot.back_login": "返回登录",
    "forgot.success_title": "检查您的电子邮件",
    "forgot.success_desc": "我们已将密码重置说明发送至您的电子邮件。",
    "login.remember": "记住我",
    "login.signin": "登录",
    "login.signing_in": "正在登录...",
    "login.no_account": "还没有账号？",
    "login.register_here": "点击此处注册",
    "register.title": "注册您的学校",
    "register.subtitle": "今天开启您的数字化转型之旅",
    "register.school_name": "学校名称",
    "register.admin_name": "管理员姓名",
    "register.phone": "联系电话",
    "register.address": "学校地址",
    "register.create": "创建账户",
    "register.have_account": "已经有账号？",
    "register.login_here": "由此登录",
    "register.school_type": "学校类型",
    "register.city": "城市",
    "register.state": "省份 / 州",
    "register.country": "国家",
    "register.est_students": "预估学生人数",
    "register.official_role": "官方职位",
    "register.confirm_password": "确认密码",
    "register.review": "确认注册信息",
    "register.review_sub": "提交前请仔细检查您的注册细节。",
    "register.back": "返回",
    "register.continue": "继续",
    "register.registering": "正在注册...",
    "register.complete": "完成注册",
    "demo.title": "请求免费演示",
    "demo.subtitle": "亲身体验学术构建师的强大功能",
    "demo.submit": "提交请求",
    "demo.success": "成功提交演示请求！",
    "header.academic_architect": "学术构建师",
    "header.search": "搜索记录...",
    "header.logout": "退出登录",
    "guide.title": "学校配置指南",
    "guide.subtitle": "完成以下步骤使您的学校管理系统开始运转。",
    "guide.step1": "配置学校信息",
    "guide.step1.desc": "设置学校的概况、地址、标识及联系方式。",
    "guide.step2": "注册班级",
    "guide.step2.desc": "创建班级、分部及教学课程科目。",
    "guide.step3": "导入学生信息",
    "guide.step3.desc": "单独添加学生，或通过 Excel 文件进行批量导入。",
    "guide.step4": "教师入驻",
    "guide.step4.desc": "邀请教职工加入并为其分配教学班级。"
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
    if (saved && ["en", "ig", "yo", "ha", "fr", "es", "de", "pt", "zh"].includes(saved)) {
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
        <svg viewBox="0 0 60 30" className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-gray-100 shrink-0" preserveAspectRatio="xMidYMid slice">
          <rect width="60" height="30" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4"/>
          <path d="M30,0 L30,30 M0,15 L60,15" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 L30,30 M0,15 L60,15" stroke="#c8102e" strokeWidth="6"/>
        </svg>
      );
    }
    if (code === "fr") {
      return (
        <svg viewBox="0 0 9 6" className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-gray-100 shrink-0" preserveAspectRatio="xMidYMid slice">
          <rect width="3" height="6" fill="#00209F"/>
          <rect x="3" width="3" height="6" fill="#fff"/>
          <rect x="6" width="3" height="6" fill="#F31830"/>
        </svg>
      );
    }
    if (code === "es") {
      return (
        <svg viewBox="0 0 9 6" className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-gray-100 shrink-0" preserveAspectRatio="xMidYMid slice">
          <rect width="9" height="1.5" fill="#C60B1E"/>
          <rect y="1.5" width="9" height="3" fill="#F1BF00"/>
          <rect y="4.5" width="9" height="1.5" fill="#C60B1E"/>
        </svg>
      );
    }
    if (code === "de") {
      return (
        <svg viewBox="0 0 9 6" className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-gray-100 shrink-0" preserveAspectRatio="xMidYMid slice">
          <rect width="9" height="2" fill="#000"/>
          <rect y="2" width="9" height="2" fill="#D00"/>
          <rect y="4" width="9" height="2" fill="#FFCE00"/>
        </svg>
      );
    }
    if (code === "pt") {
      return (
        <svg viewBox="0 0 9 6" className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-gray-100 shrink-0" preserveAspectRatio="xMidYMid slice">
          <rect width="3.6" height="6" fill="#060"/>
          <rect x="3.6" width="5.4" height="6" fill="#f00"/>
        </svg>
      );
    }
    if (code === "zh") {
      return (
        <svg viewBox="0 0 9 6" className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-gray-100 shrink-0" preserveAspectRatio="xMidYMid slice">
          <rect width="9" height="6" fill="#DE2910"/>
          <polygon points="1.5,1.2 1.9,2.4 0.9,1.7 2.1,1.7 1.1,2.4" fill="#ffde00"/>
        </svg>
      );
    }
    // Nigerian languages (ig, yo, ha)
    return (
      <svg viewBox="0 0 9 6" className="w-5 h-5 rounded-full overflow-hidden shadow-sm border border-gray-100 shrink-0" preserveAspectRatio="xMidYMid slice">
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
