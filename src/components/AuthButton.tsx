"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-3 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700">
<<<<<<< HEAD

        {/* User Info (Text) */}
=======
        
      
>>>>>>> 0a273c087297b56f0dc0d86b23bc0b30f00a9606
        <div className="flex flex-col text-right hidden sm:block">
             <span className="text-xs font-bold text-gray-200 leading-tight">
                 {session.user?.name}
             </span>
        </div>

        
        {session.user?.image ? (
<<<<<<< HEAD
            <img
                src={session.user.image}
                alt="Profile"
                // Ye style tag force karega size ko
=======
            <img 
                src={session.user.image} 
                alt="Profile" 
>>>>>>> 0a273c087297b56f0dc0d86b23bc0b30f00a9606
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                className="border border-gray-500"
            />
        ) : (
<<<<<<< HEAD

=======
            
>>>>>>> 0a273c087297b56f0dc0d86b23bc0b30f00a9606
            <div style={{ width: '32px', height: '32px', borderRadius: '50%' }} className="bg-gray-600 flex items-center justify-center border border-gray-500">
                👤
            </div>
        )}
<<<<<<< HEAD

        {/* Logout Button */}
=======
        
        
>>>>>>> 0a273c087297b56f0dc0d86b23bc0b30f00a9606
        <button
          onClick={() => signOut()}
          className="text-red-400 hover:text-red-300 text-[10px] font-bold uppercase tracking-wider ml-2"
        >
          Logout
        </button>
      </div>
    );
  }

<<<<<<< HEAD
  // LOGIN BUTTONS 
=======
  
>>>>>>> 0a273c087297b56f0dc0d86b23bc0b30f00a9606
  return (
    <div className="flex gap-2">
        <button
            onClick={() => signIn("github")}
            className="flex items-center gap-2 bg-[#24292e] hover:bg-[#2f363d] text-white px-3 py-2 rounded-md text-xs font-bold transition-all border border-gray-700"
        >
            GitHub
        </button>

        <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 px-3 py-2 rounded-md text-xs font-bold transition-all"
        >
            Google
        </button>
    </div>
  );
}