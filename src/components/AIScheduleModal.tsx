import { useState, useEffect } from "react";
import { X, CalendarClock, Loader2, CircleDot } from "lucide-react";
import { Task } from "@/types/task";

interface ScheduleNode {
  day: number;
  date: string;
  hoursAllocated: number;
  plan: string;
}

interface AIScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export function AIScheduleModal({ isOpen, onClose, task }: AIScheduleModalProps) {
  const [availableHours, setAvailableHours] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleNode[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSchedule([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSchedule([]);

    try {
      const res = await fetch("/api/schedule-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          deadline: task.deadline,
          estimatedHours: task.estimatedHours,
          availableHoursPerDay: availableHours,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate schedule");
      }

      if (data.success && data.schedule) {
        setSchedule(data.schedule);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 shadow-2xl shadow-emerald-500/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 to-emerald-900/20">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">AI Timeline</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="glass-card p-4 border border-white/5 bg-slate-800/50">
            <h3 className="font-semibold text-white">{task.title}</h3>
            <div className="flex gap-4 mt-2 text-sm text-slate-400">
              <span>Deadline: <strong className="text-white">{new Date(task.deadline).toLocaleDateString()}</strong></span>
              <span>Estimated: <strong className="text-white">{task.estimatedHours}h</strong></span>
            </div>
          </div>

          {!schedule.length && !isLoading && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">How many hours can you dedicate per day?</label>
                <input
                  required
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="24"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <CalendarClock className="w-4 h-4" />
                Generate Schedule
              </button>
            </form>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-slate-400 animate-pulse text-sm">Drafting your personalized timeline...</p>
            </div>
          )}

          {schedule.length > 0 && !isLoading && (
            <div className="space-y-6">
              <div className="relative pl-6 border-l-2 border-slate-700 space-y-8 my-4">
                {schedule.map((node, idx) => (
                  <div key={idx} className="relative animate-in slide-in-from-left-4 fade-in fill-mode-both" style={{ animationDelay: (idx * 100) + 'ms' }}>
                    <div className="absolute -left-[35px] bg-slate-900 rounded-full p-1 border-2 border-emerald-500">
                      <CircleDot className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="glass-card p-4 -mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white">Day {node.day} <span className="text-slate-400 font-normal">({node.date})</span></span>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
                          {node.hoursAllocated}h
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{node.plan}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
