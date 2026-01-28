"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, Github, User } from "lucide-react";
import { useState } from "react";

export default function AuthButton() {
  const { data: session } = useSession();
  const [imageError, setImageError] = useState(false);

  // --- LOGGED IN STATE ---
  if (session) {
    const { name, image, email } = session.user || {};
    const initial = name ? name[0].toUpperCase() : email ? email[0].toUpperCase() : "U";

    return (
      <div className="flex items-center gap-3 pl-3 pr-1 py-1 bg-[#151921] border border-gray-800 rounded-full shadow-inner group transition-colors hover:border-gray-700">

        {/* ... (Keep User Info & Avatar code same as before) ... */}
        <div className="hidden sm:flex flex-col text-right mr-1">
          <span className="text-[10px] font-bold text-gray-300 leading-none">{name?.split(' ')[0]}</span>
          <div className="flex items-center justify-end gap-1 mt-0.5">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse"></span>
             <span className="text-[9px] text-emerald-500 font-medium tracking-wide leading-none">Online</span>
          </div>
        </div>

        <div className="relative h-7 w-7 rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors shadow-sm">
            {!imageError && image ? (
                <img src={image} alt="Profile" className="h-full w-full object-cover" onError={() => setImageError(true)} />
            ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white leading-none">{initial}</span>
                </div>
            )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })} // Redirect to Home on Logout
          className="h-7 w-7 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
          title="Logout"
        >
          <LogOut size={12} />
        </button>
      </div>
    );
  }

  // --- LOGGED OUT STATE (Updated Redirects) ---
  return (
    <div className="flex gap-2">
      <button
        // 🚀 REDIRECT TO INTRO AFTER LOGIN
        onClick={() => signIn("github", { callbackUrl: "/intro" })}
        className="flex items-center gap-2 bg-[#24292e] hover:bg-[#2f363d] text-white px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-700 transition-all active:scale-[0.98] shadow-sm"
      >
        <Github size={14} />
        <span className="hidden sm:inline">GitHub</span>
      </button>

      <button
        // 🚀 REDIRECT TO INTRO AFTER LOGIN
        onClick={() => signIn("google", { callbackUrl: "/intro" })}
        className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-[0.98] shadow-sm border border-gray-200"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span className="hidden sm:inline">Google</span>
      </button>
    </div>
  );
}