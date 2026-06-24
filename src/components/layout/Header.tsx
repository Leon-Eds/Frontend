import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search as SearchIcon, Bell as BellIcon, HelpCircle as HelpIcon, Menu as MenuIcon, LogOut, Home } from "lucide-react";
import { useLanguage, LanguageSelector } from "@/components/LanguageProvider";

interface HeaderProps {
  onMenuToggle?: () => void;
  isStudent?: boolean;
}

export default function Header({ onMenuToggle, isStudent }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [userName, setUserName] = useState("Admin");
  const [role, setRole] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const user = JSON.parse(localStorage.getItem("leoned_user") || "{}");
        setUserName(user.fullName || user.name || "Admin");
        setRole(user.role);
        const profilePic = user.imageUrl || user.image || user.profilePictureUrl || user.photo || 
          user.student?.profilePictureUrl || user.student?.imageUrl || user.student?.photo || user.student?.image ||
          user.teacher?.profilePictureUrl || user.teacher?.imageUrl || user.teacher?.photo || user.teacher?.image;
          
        if (profilePic) {
          setUserImage(profilePic);
        }
      } catch {
        setUserName("Admin");
      }
    };

    if (typeof window !== "undefined") {
      loadUserData();
      window.addEventListener("storage", loadUserData);
      return () => window.removeEventListener("storage", loadUserData);
    }
  }, []);

  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("leoned_token");
    localStorage.removeItem("leoned_refresh_token");
    localStorage.removeItem("leoned_user");
    router.push("/login");
  };

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between bg-white px-4 sm:px-8 border-b border-gray-200 shrink-0 gap-2">
      {/* Left: Hamburger (mobile) + Brand + Nav */}
      <div className="flex items-center gap-2 sm:gap-8 h-full min-w-0">
        {/* Hamburger for mobile */}
        {!isStudent ? (
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors p-1.5 -ml-1"
            aria-label="Open menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        ) : (
          <Link
            href="/dashboard/student-portal"
            className="text-gray-600 hover:text-[#053d26] transition-colors p-1.5 -ml-1 flex items-center gap-2 font-bold text-sm"
          >
            <Home className="h-5 w-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        )}

        <div className="hidden xl:block shrink-0">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#053d26]">Welcome,</span>
          <br />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#053d26] truncate max-w-[150px] inline-block align-bottom">{userName}</span>
        </div>
      </div>

      {/* Right: Search, Language Switcher, Icons, Profile */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {!isStudent && (
          <>
            <div className="relative hidden lg:block">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-44 xl:w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#053d26] focus:border-transparent transition-colors"
                placeholder={t("header.search")}
              />
            </div>

            {/* Search icon on mobile */}
            <button className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors p-1">
              <SearchIcon className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Language Selector Dropdown */}
        <LanguageSelector />

        {!isStudent && (
          <Link href={role === "SuperAdmin" ? "/super-admin/settings" : "/dashboard/settings?section=notifications"} className="relative text-gray-500 hover:text-gray-900 transition-colors p-1">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[#b05e1c] border border-white"></span>
          </Link>
        )}

        <Link href="/support" className="text-gray-500 hover:text-gray-900 transition-colors p-1 hidden sm:block">
          <HelpIcon className="h-5 w-5" />
        </Link>

        {isStudent && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors px-2 py-1 text-sm font-semibold"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        )}

        <Link
          href={role === "SuperAdmin" ? "/super-admin/settings" : "/dashboard/settings"}
          className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm hover:border-[#053d26] transition-colors bg-[#053d26] flex items-center justify-center shrink-0 font-bold"
        >
          {userImage ? (
            <img 
              src={userImage} 
              alt={userName} 
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-white text-xs font-bold">{initials}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
