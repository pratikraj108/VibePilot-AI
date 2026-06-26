"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Activity, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface InsightData {
  productivityScore: number;
  weeklyInsights: string;
  completionTrends: { day: string; tasksCompleted: number; tasksAdded: number }[];
  riskTrends: { category: string; score: number }[];
  recommendations: string[];
}

export default function InsightsPage() {
  const { tasks, isLoaded } = useTasks();
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically generate insights when loaded if not yet generated
    if (isLoaded && tasks.length > 0 && !insights && !isLoading && !error) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, tasks.length]); // Only trigger when task length changes or load finishes

  const generateInsights = async () => {
    if (tasks.length === 0) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setInsights(data.insights);
    } catch (err: any) {
      setError(err.message || "Failed to generate insights.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded || (isLoading && !insights)) {
    return (
      <div className="h-full flex flex-col p-6 items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500 blur-xl opacity-20 rounded-full animate-pulse" />
          <div className="w-20 h-20 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center relative z-10 shadow-xl">
            <Sparkles className="w-10 h-10 text-violet-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Data</h2>
          <p className="text-slate-400">Gemini is finding patterns in your productivity...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Activity className="w-16 h-16 text-slate-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Not Enough Data</h2>
        <p className="text-slate-400 max-w-sm">You need to add some tasks before Gemini can generate insights for you!</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col pb-10"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            AI Insights <Sparkles className="w-6 h-6 text-violet-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">Deep analysis of your productivity habits by Gemini.</p>
        </div>
        <button 
          onClick={generateInsights}
          disabled={isLoading}
          className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Refresh Insights
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Productivity Score Card */}
          <div className="glass-card p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 relative z-10">Productivity Score</h3>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={insights.productivityScore > 75 ? "text-emerald-400" : insights.productivityScore > 40 ? "text-amber-400" : "text-rose-400"} strokeDasharray={`${insights.productivityScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{insights.productivityScore}</span>
              </div>
            </div>
          </div>

          {/* Weekly Summary Card */}
          <div className="lg:col-span-2 glass-card p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Weekly Performance</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed relative z-10 italic">
              "{insights.weeklyInsights}"
            </p>
          </div>

          {/* Completion Trends Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Completion Trends</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insights.completionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="day" stroke="#ffffff50" tick={{fill: '#ffffff50', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" tick={{fill: '#ffffff50', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff10', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="tasksCompleted" name="Completed" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: '#8b5cf6', strokeWidth: 0}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="tasksAdded" name="Added" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9', strokeWidth: 0}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card p-6 row-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                <Lightbulb className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recommendations</h3>
            </div>
            <ul className="space-y-4">
              {insights.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                  <p>{rec}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Trends Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Risk Factors</h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.riskTrends} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#ffffff50" tick={{fill: '#ffffff50', fontSize: 12}} />
                  <YAxis type="category" dataKey="category" stroke="#ffffff50" tick={{fill: '#ffffff50', fontSize: 12}} width={120} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{ backgroundColor: '#5975b7ff', borderColor: '#ffffff10', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="score" name="Risk Score" radius={[0, 4, 4, 0]}>
                    {insights.riskTrends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#f43f5e' : entry.score > 40 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
