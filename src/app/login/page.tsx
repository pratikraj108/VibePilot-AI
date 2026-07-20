"use client";

import { useEffect, useState } from "react";
import { Plane, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignIn, SignUp } from "@clerk/nextjs";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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
          <span className="font-medium tracking-wide text-sm">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 overflow-hidden relative selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex bg-indigo-500/20 p-4 rounded-2xl mb-4 shadow-xl">
            <Plane className="w-10 h-10 text-indigo-400" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-white tracking-tight text-center mb-2">
            Welcome to VibePilot AI
          </h2>
          <p className="text-sm text-slate-400 mb-6 text-center">
            Sign in or create an account to orchestrate your AI workflows.
          </p>

          <div className="w-full flex justify-center mb-4">
            {isSignUp ? (
              <SignUp 
                routing="hash" 
                fallbackRedirectUrl="/dashboard"
              />
            ) : (
              <SignIn 
                routing="hash" 
                fallbackRedirectUrl="/dashboard"
              />
            )}
          </div>

          <div className="mt-2 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors mb-4 block mx-auto"
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
            <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
