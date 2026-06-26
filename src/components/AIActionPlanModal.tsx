"use client";

import { useState } from "react";
import { Task, AIActionPlan } from "@/types/task";
import { X, Sparkles, Loader2, CheckCircle2, AlertTriangle, CalendarDays, ListTodo, Activity, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIActionPlanModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Task>) => void;
}

type StepStatus = "idle" | "loading" | "complete" | "error";

export function AIActionPlanModal({ task, isOpen, onClose, onSave }: AIActionPlanModalProps) {
  const [step1Status, setStep1Status] = useState<StepStatus>("idle");
  const [step2Status, setStep2Status] = useState<StepStatus>("idle");
  const [step3Status, setStep3Status] = useState<StepStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"breakdown" | "schedule" | "risk">("breakdown");

  const generatePlan = async () => {
    setError(null);
    let plan: Partial<AIActionPlan> = {};
    
    try {
      // Step 1: Breakdown
      setStep1Status("loading");
      const breakdownRes = await fetch("/api/breakdown-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: task.title, description: task.description }),
      });
      const breakdownData = await breakdownRes.json();
      if (!breakdownData.success) throw new Error(breakdownData.error || "Failed breakdown");
      plan.subtasks = breakdownData.subtasks;
      setStep1Status("complete");

      // Step 2: Schedule
      setStep2Status("loading");
      const scheduleRes = await fetch("/api/schedule-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          deadline: task.deadline,
          estimatedHours: task.estimatedHours,
          availableHoursPerDay: 2 // default
        }),
      });
      const scheduleData = await scheduleRes.json();
      if (!scheduleData.success) throw new Error(scheduleData.error || "Failed scheduling");
      plan.schedule = scheduleData.schedule;
      setStep2Status("complete");

      // Step 3: Risk
      setStep3Status("loading");
      // Calculate days remaining roughly for risk logic, although API just takes remainingWork and availableHours
      const riskRes = await fetch("/api/risk-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deadline: task.deadline,
          remainingWork: task.estimatedHours,
          availableHours: 2 // default
        }),
      });
      const riskData = await riskRes.json();
      if (!riskData.success) throw new Error(riskData.error || "Failed risk analysis");
      plan.risk = riskData.prediction;
      setStep3Status("complete");

      // Save
      const finalPlan: AIActionPlan = {
        ...plan as AIActionPlan,
        generatedAt: Date.now()
      };
      
      onSave(task.id, { actionPlan: finalPlan });

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      if (step1Status === "loading") setStep1Status("error");
      if (step2Status === "loading") setStep2Status("error");
      if (step3Status === "loading") setStep3Status("error");
    }
  };

  if (!isOpen) return null;

  const isGenerating = step1Status === "loading" || step2Status === "loading" || step3Status === "loading";
  const hasPlan = !!task.actionPlan;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col relative overflow-hidden shadow-2xl shadow-indigo-500/10"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Action Plan</h2>
              <p className="text-sm text-slate-400 truncate max-w-sm">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!hasPlan && !isGenerating && step3Status !== "complete" && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 py-12">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-xl shadow-indigo-500/20">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Generate Your Plan</h3>
                <p className="text-slate-400">Our multi-agent system will break down your task, create a schedule, and evaluate risks automatically.</p>
              </div>
              <button 
                onClick={generatePlan}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Initialize Multi-Agent Workflow
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="max-w-md mx-auto py-12 space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Agents at Work</h3>
                <p className="text-slate-400 text-sm">Please wait while our AI coordinates your plan.</p>
              </div>

              <div className="space-y-4 relative">
                <div className="absolute left-6 top-4 bottom-4 w-px bg-white/10 -z-10" />
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${step1Status === 'loading' ? 'border-sky-500 bg-sky-500/10' : step1Status === 'complete' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-slate-900'}`}>
                    {step1Status === 'loading' ? <Loader2 className="w-5 h-5 text-sky-400 animate-spin" /> : step1Status === 'complete' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <ListTodo className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <h4 className={`font-medium ${step1Status === 'loading' ? 'text-sky-400' : step1Status === 'complete' ? 'text-emerald-400' : 'text-slate-400'}`}>Task Breakdown Agent</h4>
                    <p className="text-xs text-slate-500">Generating actionable subtasks</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${step2Status === 'loading' ? 'border-sky-500 bg-sky-500/10' : step2Status === 'complete' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-slate-900'}`}>
                    {step2Status === 'loading' ? <Loader2 className="w-5 h-5 text-sky-400 animate-spin" /> : step2Status === 'complete' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <CalendarDays className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <h4 className={`font-medium ${step2Status === 'loading' ? 'text-sky-400' : step2Status === 'complete' ? 'text-emerald-400' : 'text-slate-400'}`}>Scheduling Agent</h4>
                    <p className="text-xs text-slate-500">Building timeline</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 ${step3Status === 'loading' ? 'border-sky-500 bg-sky-500/10' : step3Status === 'complete' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-slate-900'}`}>
                    {step3Status === 'loading' ? <Loader2 className="w-5 h-5 text-sky-400 animate-spin" /> : step3Status === 'complete' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Activity className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <h4 className={`font-medium ${step3Status === 'loading' ? 'text-sky-400' : step3Status === 'complete' ? 'text-emerald-400' : 'text-slate-400'}`}>Risk Assessment Agent</h4>
                    <p className="text-xs text-slate-500">Evaluating completion probability</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          )}

          {hasPlan && !isGenerating && task.actionPlan && (
            <div className="space-y-6">
              <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
                <button 
                  onClick={() => setActiveTab("breakdown")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'breakdown' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  <ListTodo className="w-4 h-4" /> Breakdown
                </button>
                <button 
                  onClick={() => setActiveTab("schedule")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'schedule' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  <CalendarDays className="w-4 h-4" /> Schedule
                </button>
                <button 
                  onClick={() => setActiveTab("risk")}
                  className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'risk' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  <Activity className="w-4 h-4" /> Risk & Emergency
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "breakdown" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {task.actionPlan?.subtasks.map((st, i) => (
                        <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-white">{st.title}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${st.priority === 'High' ? 'text-rose-400 border-rose-400/20 bg-rose-400/10' : st.priority === 'Medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' : 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'}`}>
                              {st.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">{st.description}</p>
                          <div className="text-xs font-medium text-slate-500">{st.estimatedHours}h est.</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "schedule" && (
                    <div className="space-y-4">
                      {task.actionPlan.schedule.map((day, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5 items-center">
                          <div className="w-16 h-16 shrink-0 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center text-indigo-400">
                            <span className="text-xs font-medium uppercase">{day.date.split(' ')[0]}</span>
                            <span className="text-xl font-bold">{day.date.split(' ')[1] || day.day}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white mb-1">{day.hoursAllocated}h Focus</div>
                            <p className="text-sm text-slate-400">{day.plan}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "risk" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-xl border border-white/5">
                        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className={task.actionPlan.risk.riskLevel.toLowerCase() === "high" ? "text-rose-500" : task.actionPlan.risk.riskLevel.toLowerCase() === "medium" ? "text-amber-500" : "text-emerald-500"} strokeDasharray={`${task.actionPlan.risk.riskScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-bold text-white leading-none">{task.actionPlan.risk.riskScore}</span>
                            <span className="text-[10px] text-slate-400">SCORE</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-slate-400 text-sm font-medium mb-1">Risk Level: <span className="text-white uppercase">{task.actionPlan.risk.riskLevel}</span></h4>
                          <p className="text-sm text-slate-300 mt-2">{task.actionPlan.risk.reason}</p>
                        </div>
                      </div>

                      {task.actionPlan.risk.isEmergency && task.actionPlan.risk.emergencyPlan && (
                        <div className="p-6 rounded-xl border border-rose-500/50 bg-rose-950/30 relative overflow-hidden">
                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-rose-500/20">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                            <div>
                              <h3 className="text-xl font-bold text-rose-500 uppercase">Emergency Mode Active</h3>
                              <p className="text-sm text-rose-400/80">Deadline is less than 24 hours away.</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-white font-bold text-sm mb-3">Critical Tasks</h4>
                              <ul className="space-y-2">
                                {task.actionPlan.risk.emergencyPlan.criticalTasks.map((t, i) => (
                                  <li key={i} className="text-xs text-white bg-rose-500/10 p-2 rounded border border-rose-500/20 flex gap-2"><AlertTriangle className="w-3 h-3 text-rose-500 mt-0.5 shrink-0"/>{t}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-emerald-400 font-bold text-sm mb-3">Fastest Path</h4>
                              <div className="text-xs text-emerald-50 bg-emerald-950/40 p-3 rounded border border-emerald-500/20 whitespace-pre-wrap">
                                {task.actionPlan.risk.emergencyPlan.fastestCompletionPlan}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
