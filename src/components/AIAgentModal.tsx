import { useState } from "react";
import { X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Task, Priority } from "@/types/task";

interface Subtask {
  title: string;
  description: string;
  estimatedHours: number;
  priority: Priority;
}

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubtasks: (subtasks: Subtask[]) => void;
}

export function AIAgentModal({ isOpen, onClose, onAddSubtasks }: AIAgentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSubtasks([]);

    try {
      const res = await fetch("/api/breakdown-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate subtasks");
      }

      if (data.success && data.subtasks) {
        setSubtasks(data.subtasks);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = () => {
    onAddSubtasks(subtasks);
    setTitle("");
    setDescription("");
    setSubtasks([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 shadow-2xl shadow-sky-500/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 to-sky-900/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">AI Task Breakdown</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!subtasks.length && !isLoading && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <p className="text-sm text-slate-400">
                Describe a large goal or project, and the AI will break it down into manageable subtasks for you.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">High-level Goal</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-slate-600"
                  placeholder="e.g. Prepare for DSA interview"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Context / Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none placeholder:text-slate-600"
                  placeholder="Focus on specific topics..."
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white rounded-lg font-medium transition-colors shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Breakdown
              </button>
            </form>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
              <p className="text-slate-400 animate-pulse text-sm">Analyzing task and creating structure...</p>
            </div>
          )}

          {subtasks.length > 0 && !isLoading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Generated {subtasks.length} Subtasks
                </h3>
                <button
                  onClick={() => setSubtasks([])}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Start Over
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subtasks.map((task, idx) => (
                  <div key={idx} className="glass-card p-4 border border-white/10 relative">
                    <h4 className="font-semibold text-white mb-1">{task.title}</h4>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-white/10 text-slate-300">
                        {task.estimatedHours}h
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                        task.priority === 'High' ? 'text-rose-400 border-rose-400/20 bg-rose-400/10' :
                        task.priority === 'Medium' ? 'text-sky-400 border-sky-400/20 bg-sky-400/10' :
                        'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveAll}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Add All to Tasks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
