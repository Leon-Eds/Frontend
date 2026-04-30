import { Shield, User, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="relative mb-4">
            {/* Using a placeholder for the complex logo - shield with tree/africa map */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#053d26] to-[#0a7a4c] text-white shadow-lg">
              <Shield className="h-10 w-10" />
            </div>
            <div className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-[#b05e1c] flex items-center justify-center text-white border-2 border-white">
              <span className="text-xs font-bold font-serif text-white">L</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-[#053d26]">LeonEd</span>
            <span className="text-[#b05e1c]">Africa</span>
          </h1>
        </div>

        {/* Login Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
          
          <form className="space-y-5">
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder="Email or username"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-[#053d26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#053d26] transition-colors"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#053d26] focus:ring-[#053d26]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember Me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-gray-600 hover:text-[#053d26]">
                  Forgot Password?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/dashboard" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#053d26] hover:bg-[#042c1b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#053d26] transition-colors">
                Login
              </Link>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <a href="#" className="font-semibold text-[#b05e1c] hover:underline">
              Register School
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
