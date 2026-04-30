import Link from "next/link";
import { Search, Shield, GraduationCap, CheckCircle2, ChevronRight, Zap, Database, Globe, User } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-[#053d26]" />
              <span className="text-xl font-bold text-gray-900">LeonEd Africa</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm font-semibold text-gray-900 hover:text-[#053d26] transition-colors">Platform Architecture</a>
              <a href="#" className="text-sm font-semibold text-gray-500 hover:text-[#053d26] transition-colors">Schedule</a>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-6">
              <button className="text-gray-500 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </button>
              <Link href="/login" className="px-6 py-2.5 rounded-full bg-[#053d26] text-white text-sm font-bold hover:bg-[#042c1b] transition-colors">
                Login
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
              THE ACADEMIC ARCHITECT
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-[#053d26] leading-[1.1] tracking-tight">
              Digitizing African Classrooms, One School at a Time.
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              The complete digital management solution for student records, automated result processing, and secure portal access. Built for the future of African education.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-all shadow-lg shadow-orange-900/20">
                Register Your School
              </button>
              <button className="px-8 py-4 rounded-full bg-white text-gray-900 font-bold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm">
                Request Demo
              </button>
            </div>
            
            <div className="pt-8 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-200" />
                <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-300" />
                <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                Trusted by <span className="font-bold text-gray-900">500+ institutions</span> across the continent
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#053d26]/10 to-transparent rounded-[3rem] transform rotate-3" />
            <div className="relative bg-white rounded-[3rem] p-4 shadow-2xl border border-gray-100">
              <div className="aspect-[4/3] rounded-[2.5rem] bg-gray-100 overflow-hidden relative">
                {/* Simulated Image */}
                <div className="absolute inset-0 bg-[#053d26]/5 flex items-center justify-center">
                  <GraduationCap className="h-32 w-32 text-[#053d26]/20" />
                </div>
                {/* Floating element */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-lg border border-white/20">
                  <div className="h-10 w-10 rounded-xl bg-orange-100 text-[#b05e1c] flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Automated Result Processing</p>
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
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-2">Platform Architecture</p>
            <h2 className="text-4xl font-bold text-[#053d26]">Built for Educational Excellence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 - Large */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-orange-100 text-[#b05e1c] flex items-center justify-center mb-6">
                  <Database className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Digital Student Records</h3>
                <p className="text-gray-500 max-w-md leading-relaxed">
                  Centralize comprehensive student data from enrollment to graduation. One source of truth for demographics, attendance, and behavioral history.
                </p>
              </div>
              <div className="flex gap-3 mt-10">
                <span className="px-4 py-2 rounded-full bg-green-100 text-[#053d26] text-xs font-bold">Secure Storage</span>
                <span className="px-4 py-2 rounded-full bg-green-100 text-[#053d26] text-xs font-bold">Instant Retrieval</span>
              </div>
            </div>

            {/* Feature Card 2 - Dark */}
            <div className="bg-[#053d26] rounded-[2rem] p-10 shadow-sm text-white flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Multi-school platform</h3>
                <p className="text-green-100/80 leading-relaxed">
                  Manage multiple campuses or an entire school district from a single, unified dashboard with tiered access controls.
                </p>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold mt-10 hover:text-green-200 transition-colors w-fit">
                Learn More <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 text-[#b05e1c] flex items-center justify-center mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Portals</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Dedicated, encrypted access for parents, teachers, and students to view progress in real-time.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 text-[#b05e1c] flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Results</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Generate report cards and transcripts in seconds with our intelligent computation engine.
              </p>
            </div>

            {/* Feature Card 5 - Orange Focus */}
            <div className="bg-[#b05e1c] rounded-[2rem] p-10 shadow-sm text-white flex flex-col items-center justify-center text-center">
              <h3 className="text-6xl font-bold mb-4">99%</h3>
              <p className="font-medium text-orange-100">Efficiency increase reported by headmasters</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why LeonEd Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-[3rem] bg-[#053d26] aspect-[4/3] overflow-hidden relative shadow-2xl flex items-center justify-center">
            {/* Simulated image of academic architect */}
            <div className="text-white/20 text-center">
              <User className="h-32 w-32 mx-auto mb-4" />
              <p className="font-bold text-2xl tracking-widest">SAFE TO WORK</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#b05e1c] mb-4">Why LeonEd Africa?</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#053d26] leading-tight mb-6">
              The Academic Architect for Your School's Future.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-10 text-lg">
              We don't just provide software; we design digital ecosystems. Our platform is built with a deep understanding of the unique challenges faced by African educational institutions, from connectivity hurdles to administrative complexity.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-[#053d26]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Tailored for Local Curriculums</h4>
                  <p className="text-sm text-gray-500">Flexible result processing that adapts to national standards.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <CheckCircle2 className="h-6 w-6 text-[#053d26]" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Enterprise Grade Security</h4>
                  <p className="text-sm text-gray-500">Advanced encryption ensuring student data privacy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-20">
        <div className="bg-[#053d26] rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Shield className="w-64 h-64 transform rotate-12 translate-x-16 -translate-y-16" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your institution?</h2>
            <p className="text-lg text-green-100/80 mb-10 max-w-2xl mx-auto">
              Join hundreds of schools already paving the way for digital excellence in Africa.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-8 py-4 rounded-full bg-[#b05e1c] text-white font-bold hover:bg-[#965017] transition-all shadow-lg shadow-orange-900/20">
                Register Your School
              </button>
              <button className="px-8 py-4 rounded-full bg-[#042c1b] text-white font-bold hover:bg-black/40 border border-white/10 transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#032416] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-white" />
              <span className="text-xl font-bold">LeonEd Africa</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              The leading Academic Architect for digital transformation in African education. Empowering schools through intelligent automation and secure data management.
            </p>
          </div>
          
          <div>
            <h4 className="text-[#b05e1c] font-bold text-sm uppercase tracking-wider mb-6">Solutions</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Digital Records</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Result Processing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Parent Portals</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Multi-school System</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#b05e1c] font-bold text-sm uppercase tracking-wider mb-6">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2024 LeonEd Africa. All rights reserved.</p>
          <div className="flex gap-4">
            <Globe className="h-4 w-4" />
          </div>
        </div>
      </footer>
    </div>
  );
}
