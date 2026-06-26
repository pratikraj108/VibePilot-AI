"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Info, Lightbulb, Activity, CheckCircle2 } from "lucide-react";

interface RiskPrediction {
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  reason: string;
  suggestions: string[];
  isEmergency?: boolean;
  emergencyPlan?: {
    criticalTasks: string[];
    optionalTasks: string[];
    fastestCompletionPlan: string;
  };
}

export function RiskAnalyzer() {
  const [deadline, setDeadline] = useState("");
  const [remainingWork, setRemainingWork] = useState(10);
  const [availableHours, setAvailableHours] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/risk-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline, remainingWork, availableHours }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to predict risk");
      }

      if (data.success && data.prediction) {
        setPrediction(data.prediction);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "text-rose-500 border-rose-500/20 bg-rose-500/10";
      case "medium":
        return "text-amber-500 border-amber-500/20 bg-amber-500/10";
      case "low":
        return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
      default:
        return "text-slate-400 border-slate-700 bg-slate-800";
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col xl:col-span-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-rose-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-rose-400" />
        <h3 className="text-xl font-bold text-white">Deadline Risk Analyzer</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handlePredict} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Target Deadline</label>
            <input
              required
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all [color-scheme:dark]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Remaining Work (hrs)</label>
              <input
                required
                type="number"
                min="0.5"
                step="0.5"
                value={remainingWork}
                onChange={(e) => setRemainingWork(Number(e.target.value))}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Avail. Time/Day (hrs)</label>
              <input
                required
                type="number"
                min="0.5"
                step="0.5"
                max="24"
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white rounded-lg font-medium transition-colors shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Analyze Risk
              </>
            )}
          </button>
        </form>

        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-6 flex flex-col justify-center min-h-[300px]">
          {!prediction && !isLoading && (
            <div className="text-center text-slate-500">
              <Info className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Enter your deadline parameters and let AI calculate the feasibility.</p>
            </div>
          )}

          {isLoading && (
            <div className="animate-in fade-in duration-500 w-full space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full skeleton shrink-0" />
                <div className="space-y-3 w-full max-w-[200px]">
                  <div className="h-4 w-1/2 skeleton" />
                  <div className="h-8 w-full skeleton" />
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="h-5 w-1/3 skeleton" />
                <div className="h-20 w-full skeleton" />
              </div>
            </div>
          )}

          {prediction && !isLoading && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              
              {/* We moved the emergency plan to the bottom of the component */}

              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        prediction.riskLevel.toLowerCase() === "high" ? "text-rose-500" :
                        prediction.riskLevel.toLowerCase() === "medium" ? "text-amber-500" : "text-emerald-500"
                      }
                      strokeDasharray={prediction.riskScore + ", 100"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      style={{ strokeDasharray: prediction.riskScore + ", 100" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-white leading-none">{prediction.riskScore}</span>
                    <span className="text-[10px] text-slate-400">SCORE</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-400 text-sm font-medium mb-1">Risk Level</h4>
                  <div className={`inline-flex px-3 py-1 rounded-md border font-bold uppercase tracking-wider text-sm ${getRiskColor(prediction.riskLevel)}`}>
                    {prediction.riskLevel}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  Reasoning
                </h4>
                <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                  {prediction.reason}
                </p>
              </div>

              {prediction.suggestions.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Actionable Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {prediction.suggestions.map((sug, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2 bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Emergency Mode Dashboard spans full width below */}
      {prediction?.isEmergency && prediction?.emergencyPlan && !isLoading && (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500 p-6 md:p-8 rounded-xl border border-rose-500/50 bg-rose-950/30 shadow-[0_0_40px_-10px_rgba(244,63,94,0.2)] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-rose-500/10 blur-[100px] -z-10 pointer-events-none animate-pulse" />
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-rose-500/20">
            <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl animate-pulse">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 uppercase tracking-widest">
                Emergency Mode Active
              </h3>
              <p className="text-rose-400/80 font-medium">Critical intervention required. Deadline is less than 24 hours away.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-lg flex items-center gap-2 pb-2 border-b border-white/10">
                <Activity className="w-5 h-5 text-rose-400" />
                Critical Tasks
              </h4>
              <ul className="space-y-3">
                {prediction.emergencyPlan.criticalTasks.map((task, i) => (
                  <li key={i} className="text-sm text-white font-medium flex items-start gap-3 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-slate-300 font-bold text-lg flex items-center gap-2 pb-2 border-b border-white/10">
                <Info className="w-5 h-5 text-slate-400" />
                Optional (Skip)
              </h4>
              <ul className="space-y-3">
                {prediction.emergencyPlan.optionalTasks.map((task, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-3 bg-slate-900/40 p-3 rounded-lg border border-white/5 line-through decoration-rose-500/50">
                    <span className="w-4 h-4 rounded-full border border-slate-600 shrink-0 mt-0.5 flex items-center justify-center text-[10px]">✕</span>
                    <span className="leading-relaxed">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-emerald-400 font-bold text-lg flex items-center gap-2 pb-2 border-b border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Fastest Path
              </h4>
              <div className="text-sm text-emerald-50 bg-emerald-950/40 p-5 rounded-lg border border-emerald-500/20 whitespace-pre-wrap leading-relaxed shadow-inner">
                {prediction.emergencyPlan.fastestCompletionPlan}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
