import { useState, useEffect } from "react";
import { Task, Priority } from "@/types/task";
import { X } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt" | "completed">) => void;
  initialData?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSave, initialData }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [estimatedHours, setEstimatedHours] = useState(1);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setDeadline(initialData.deadline || "");
      setPriority(initialData.priority || "Medium");
      setEstimatedHours(initialData.estimatedHours || 1);
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
      setPriority("Medium");
      setEstimatedHours(1);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, deadline, priority, estimatedHours });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 shadow-2xl shadow-violet-500/10 rounded-2xl w-full max-w-md overflow-hidden relative">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-xl font-bold text-white">
            {initialData ? "Edit Task" : "New Task"}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all placeholder:text-slate-500"
              placeholder="Design new landing page"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none placeholder:text-slate-500"
              placeholder="Include specific requirements..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Deadline</label>
              <input
                required
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all [color-scheme:dark]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Est. Hours</label>
              <input
                required
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Priority</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p as Priority)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-all ${
                    priority === p 
                      ? p === 'Low' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : p === 'Medium' ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                      : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      : 'bg-slate-950 border-white/10 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-violet-500/20"
            >
              {initialData ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
