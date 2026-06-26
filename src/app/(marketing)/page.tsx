"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plane, Sparkles, Brain, Clock, ShieldAlert, ArrowRight, CheckCircle2, Workflow, Target, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user, loading } = useAuth();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] rounded-full bg-sky-600/10 blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 h-20 z-50 glass border-b border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold text-white group">
            <div className="bg-indigo-500/20 p-2 rounded-xl">
              <Plane className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              VibePilot
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!loading && !user && (
              <Link href="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors hidden sm:block">
                Log in
              </Link>
            )}
            <Link href={user ? "/dashboard" : "/login"} className="bg-white text-slate-950 hover:bg-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-white/10 hover:scale-105 flex items-center gap-2">
              {user ? "Go to Dashboard" : "Get Started"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>VibePilot AI 2.0 is now live</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Your AI teammate for <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">beating deadlines.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop drowning in unorganized tasks. VibePilot orchestrates a multi-agent AI workflow to break down projects, build smart schedules, and predict deadline risks before they happen.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 flex items-center justify-center gap-2">
              {user ? "Go to Dashboard" : "Start for free"} <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto glass border border-white/10 hover:bg-white/5 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all flex items-center justify-center">
              See how it works
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Screenshots Section */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-2xl md:rounded-[2rem] border border-white/10 glass bg-slate-900/50 p-2 md:p-4 shadow-2xl shadow-indigo-900/50 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-950/50 rounded-t-xl md:rounded-t-[1.5rem]">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="bg-slate-950 aspect-video rounded-b-xl md:rounded-b-[1.5rem] relative overflow-hidden flex items-center justify-center">
             {/* Abstract Mockup UI representing the dashboard */}
             <div className="absolute inset-0 p-8 grid grid-cols-4 gap-6 opacity-80">
                <div className="col-span-1 border-r border-white/5 pr-6 space-y-4">
                  <div className="h-8 w-32 bg-white/10 rounded-lg" />
                  <div className="h-4 w-24 bg-white/5 rounded mt-8" />
                  <div className="h-4 w-20 bg-white/5 rounded" />
                  <div className="h-4 w-28 bg-white/5 rounded" />
                </div>
                <div className="col-span-3 space-y-6">
                  <div className="flex justify-between">
                    <div className="h-8 w-48 bg-white/10 rounded-lg" />
                    <div className="h-8 w-10 bg-indigo-500/40 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-xl" />
                    <div className="h-24 bg-white/5 border border-white/5 rounded-xl" />
                    <div className="h-24 bg-rose-500/10 border border-rose-500/20 rounded-xl" />
                  </div>
                  <div className="h-64 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center">
                    <div className="flex items-center gap-4 text-indigo-400">
                      <Sparkles className="w-8 h-8 animate-pulse" />
                      <span className="text-xl font-bold">AI Action Plan Generated</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 relative bg-slate-950/50 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">You're doing the work of an entire team.</h2>
          <p className="text-lg text-slate-400 mb-12">
            Planning, estimating, and scheduling take up as much time as actually doing the work. When deadlines approach, panic sets in, and quality drops. It doesn't have to be this way.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">A complete AI ecosystem</h2>
          <p className="text-slate-400 text-lg">Four specialized agents working together to ensure you never miss a deadline.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:bg-slate-900/80 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Task Breakdown Agent</h3>
            <p className="text-slate-400 leading-relaxed">
              Throw in a vague, massive project idea. Our agent automatically splits it into actionable subtasks with precise time estimates and priority levels.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:bg-slate-900/80 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Scheduling Agent</h3>
            <p className="text-slate-400 leading-relaxed">
              Tell us your deadline and how many hours you can work a day. We generate a realistic, day-by-day roadmap tailored to your specific constraints.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:bg-slate-900/80 transition-colors group lg:col-span-1 md:col-span-2">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Risk & Emergency Agent</h3>
            <p className="text-slate-400 leading-relaxed">
              Calculates the mathematical probability of failure. If your deadline is under 24 hours, it triggers Emergency Mode—cutting optional tasks and finding the absolute fastest path to completion.
            </p>
          </div>
        </div>
      </section>

      {/* AI Workflow Visual */}
      <section className="py-24 px-6 bg-indigo-950/20 border-y border-indigo-500/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6">
            <Workflow className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">One Click. Full Strategy.</h2>
          <p className="text-lg text-slate-400 mb-16 max-w-2xl mx-auto">
            Our multi-agent orchestration layer chains all AI capabilities into a single button click. Create your task, hit "Generate Action Plan", and watch the magic happen.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 relative z-10">
            <div className="glass bg-slate-900/80 border border-white/10 rounded-xl p-6 w-full md:w-64 text-center shadow-xl">
              <Target className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h4 className="font-bold text-white">1. Define Goal</h4>
            </div>
            <ArrowRight className="hidden md:block w-8 h-8 text-indigo-500" />
            <div className="glass bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6 w-full md:w-64 text-center shadow-xl shadow-indigo-500/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h4 className="font-bold text-white">2. Multi-Agent AI</h4>
            </div>
            <ArrowRight className="hidden md:block w-8 h-8 text-emerald-500" />
            <div className="glass bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 w-full md:w-64 text-center shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-bold text-white">3. Execute Plan</h4>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to crush your goals?</h2>
        <p className="text-xl text-slate-400 mb-10">
          Join thousands of professionals using VibePilot AI to organize chaos into clarity.
        </p>
        <Link href={user ? "/dashboard" : "/login"} className="inline-flex bg-white text-slate-950 hover:bg-slate-200 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-white/10 hover:scale-105 items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          {user ? "Return to Dashboard" : "Launch Your First Project"}
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 pt-16 pb-8 px-6 text-center md:text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-xl font-bold text-white mb-4 justify-center md:justify-start">
              <Plane className="w-6 h-6 text-indigo-500" />
              <span>VibePilot AI</span>
            </div>
            <p className="text-slate-500 max-w-sm mx-auto md:mx-0">
              Your intelligent copilot for task management, smart scheduling, and risk mitigation. Built for the modern workflow.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-slate-600 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 VibePilot AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
