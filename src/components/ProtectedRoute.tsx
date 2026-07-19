"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Plane } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  console.log(`[ProtectedRoute] Render. loading=${loading}, user=${user ? user.uid : "null"}, pathname=${pathname}`);

  useEffect(() => {
    console.log(`[ProtectedRoute] Effect check. loading=${loading}, user=${user ? user.uid : "null"}`);
    if (!loading && !user) {
      console.log("[ProtectedRoute] Redirecting to /login - session not found.");
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
          <div className="relative bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl">
            <Plane className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="font-medium tracking-wide text-sm">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
