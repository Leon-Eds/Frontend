import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#f8f9fa]">
          <div className="p-8">
            {children}
          </div>
          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white/60 backdrop-blur-sm px-8 py-6 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                © 2024 LeonEd Africa. Academic Architect System.
              </p>
              <div className="flex gap-6 text-xs text-gray-400 font-medium">
                <a href="#" className="hover:text-gray-600 transition-colors uppercase tracking-wider">Privacy Protocol</a>
                <a href="#" className="hover:text-gray-600 transition-colors uppercase tracking-wider">System Support</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
