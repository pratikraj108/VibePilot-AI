import { Task } from "@/types/task";
import { Edit2, Trash2, Clock, CalendarDays, CheckCircle2, Circle, CalendarClock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSchedule?: (task: Task) => void;
  onActionPlan?: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete, onSchedule, onActionPlan }: TaskCardProps) {
  const priorityColor = {
    Low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Medium: "text-sky-400 bg-sky-400/10 border-sky-400/20",
    High: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  }[task.priority];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`glass-card p-5 relative group ${task.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2">
          <button 
            onClick={() => onToggleComplete(task.id)}
            className="text-slate-400 hover:text-emerald-400 transition-colors mt-0.5"
          >
            {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5" />}
          </button>
          <div>
            <h3 className={`font-semibold text-lg text-white ${task.completed ? 'line-through text-slate-400' : ''}`}>
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${priorityColor}`}>
                {task.priority} Priority
              </span>
              {task.actionPlan && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" /> AI Plan
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onActionPlan && (
            <button 
              onClick={() => onActionPlan(task)}
              className={`p-1.5 rounded-md transition-colors ${task.actionPlan ? 'text-indigo-400 hover:bg-indigo-400/10' : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10'}`}
              title="AI Action Plan"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
          {onSchedule && (
            <button 
              onClick={() => onSchedule(task)}
              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
              title="Generate Schedule"
            >
              <CalendarClock className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-md transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-slate-300 mb-5 line-clamp-2 ml-7">
        {task.description}
      </p>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-400 border-t border-white/5 pt-4 ml-7">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-slate-500" />
          <span>{new Date(task.deadline).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>{task.estimatedHours}h est.</span>
        </div>
      </div>
    </motion.div>
  );
}
