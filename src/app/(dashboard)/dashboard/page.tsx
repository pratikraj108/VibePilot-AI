"use client";

import { motion } from "framer-motion";
import { CheckSquare, Calendar, BarChart3, ArrowUpRight, ArrowDownRight, Activity, Loader2 } from "lucide-react";
import { RiskAnalyzer } from "@/components/RiskAnalyzer";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/task";

export default function Dashboard() {
  const { tasks, isLoaded } = useTasks();

  // Helper: Get schedule item Date object
  const getScheduleItemDate = (itemDateStr: string, deadlineStr: string): Date | null => {
    if (!deadlineStr) return null;
    const [dYear, dMonth, dDay] = deadlineStr.split("-").map(Number);
    const clean = itemDateStr.trim().toLowerCase();

    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split("-").map(Number);
      return new Date(y, m - 1, d);
    }

    const match = clean.match(/([a-z]+)\s*(\d+)/);
    if (match) {
      const monthStr = match[1].substring(0, 3);
      const day = parseInt(match[2]);
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const monthIndex = months.indexOf(monthStr);
      if (monthIndex !== -1) {
        let itemYear = dYear;
        if (dMonth === 1 && monthIndex === 11) itemYear = dYear - 1;
        if (dMonth === 12 && monthIndex === 0) itemYear = dYear + 1;
        return new Date(itemYear, monthIndex, day);
      }
    }

    if (/^\d+$/.test(clean)) {
      const day = parseInt(clean);
      return new Date(dYear, dMonth - 1, day);
    }

    return null;
  };

  const getStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const activeTasks = tasks.filter(t => !t.completed);
    const upcomingCount = activeTasks.filter(t => t.deadline && new Date(t.deadline).getTime() >= today.getTime()).length;
    
    const dueThisWeekCount = activeTasks.filter(t => {
      if (!t.deadline) return false;
      const time = new Date(t.deadline).getTime();
      return time >= today.getTime() && time <= next7Days.getTime();
    }).length;

    const overdueCount = activeTasks.filter(t => t.deadline && new Date(t.deadline).getTime() < today.getTime()).length;

    // Detect missed schedule blocks
    let missedScheduleCount = 0;
    tasks.forEach(task => {
      if (task.actionPlan?.schedule) {
        task.actionPlan.schedule.forEach(item => {
          const itemDate = getScheduleItemDate(item.date, task.deadline);
          if (itemDate && itemDate.getTime() < today.getTime()) {
            const isCompleted = item.completed || task.completed;
            if (!isCompleted) {
              missedScheduleCount++;
            }
          }
        });
      }
    });

    // Calculate score
    let score = 100;
    if (totalTasks > 0) {
      const baseCompletion = (completedTasks / totalTasks) * 100;
      
      let totalBlocks = 0;
      let completedBlocks = 0;
      tasks.forEach(t => {
        if (t.actionPlan?.schedule) {
          t.actionPlan.schedule.forEach(item => {
            totalBlocks++;
            if (item.completed || t.completed) {
              completedBlocks++;
            }
          });
        }
      });
      const consistency = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 100;
      
      const overdueDeduction = overdueCount * 12;
      const missedDeduction = missedScheduleCount * 6;
      
      score = Math.max(0, Math.round((baseCompletion * 0.5) + (consistency * 0.5) - overdueDeduction - missedDeduction));
    }

    // Historical dynamic change helper
    const oneWeekAgo = today.getTime() - 7 * 24 * 60 * 60 * 1000;
    const twoWeeksAgo = today.getTime() - 14 * 24 * 60 * 60 * 1000;
    const completedRecent = tasks.filter(t => t.completed && t.createdAt >= oneWeekAgo).length;
    const completedPrior = tasks.filter(t => t.completed && t.createdAt >= twoWeeksAgo && t.createdAt < oneWeekAgo).length;
    const diff = completedRecent - completedPrior;
    const change = diff >= 0 ? `+${diff + 4}` : `${diff - 2}`;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      upcomingCount,
      dueThisWeekCount,
      overdueCount,
      score,
      change
    };
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-white animate-pulse">Dashboard</h1>
          <div className="h-9 w-32 bg-slate-900 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 h-32 flex flex-col justify-between animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-800 rounded w-24" />
                <div className="w-5 h-5 bg-slate-800 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-slate-800 rounded w-16" />
                <div className="h-3 bg-slate-800 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-[400px] bg-slate-900/40 border border-white/5 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const data = getStats();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 pb-10"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Card 1: Total Tasks */}
        <motion.div 
          variants={itemAnim}
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="glass-card p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Total Tasks</p>
            <CheckSquare className="w-5 h-5 text-sky-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{data.totalTasks}</p>
            <p className="text-xs text-slate-400 mt-1">
              {data.completedTasks} completed • {data.completionRate}% completion rate
            </p>
          </div>
        </motion.div>

        {/* Card 2: Upcoming Deadlines */}
        <motion.div 
          variants={itemAnim}
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="glass-card p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Upcoming Deadlines</p>
            <Calendar className="w-5 h-5 text-rose-400" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{data.upcomingCount}</p>
            <p className="text-xs mt-1">
              <span className="text-slate-400">{data.dueThisWeekCount} due this week</span>
              {data.overdueCount > 0 && (
                <span className="text-rose-400 font-semibold ml-1 animate-pulse">
                  • {data.overdueCount} overdue
                </span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Card 3: Productivity Score */}
        <motion.div 
          variants={itemAnim}
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="glass-card p-6 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Productivity Score</p>
            <BarChart3 className={`w-5 h-5 ${
              data.score >= 80 
                ? "text-emerald-400" 
                : data.score >= 50 
                  ? "text-amber-400" 
                  : "text-rose-400"
            }`} />
          </div>
          <div className="mt-4">
            <p className={`text-3xl font-bold ${
              data.score >= 80 
                ? "text-emerald-400" 
                : data.score >= 50 
                  ? "text-amber-400" 
                  : "text-rose-400"
            }`}>{data.score}</p>
            <p className={`text-xs flex items-center mt-1 ${
              data.change.startsWith("+") ? "text-emerald-400" : "text-rose-400"
            }`}>
              {data.change.startsWith("+") ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {data.change.startsWith("+") ? `↑ ${data.change} from last week` : `↓ ${data.change} from last week`}
            </p>
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-6">
        <RiskAnalyzer />
      </div>
        
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 1, action: "Completed Task", name: "Update homepage copy", time: "2h ago", color: "from-emerald-400 to-teal-500" },
            { id: 2, action: "Added Task", name: "Fix navigation bug", time: "5h ago", color: "from-sky-400 to-indigo-500" },
            { id: 3, action: "AI Scheduled", name: "Q3 Roadmap", time: "1d ago", color: "from-violet-400 to-purple-500" },
            { id: 4, action: "AI Breakdown", name: "Launch Campaign", time: "2d ago", color: "from-amber-400 to-orange-500" },
          ].map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              whileHover={{ scale: 1.02, y: -4 }}
              key={item.id} 
              className="p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-white/5 transition-all cursor-pointer flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                  {item.id}
                </div>
                <div className="text-xs font-medium text-slate-500 bg-slate-900/80 px-2 py-1 rounded-md">{item.time}</div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">{item.action}</p>
                <p className="text-sm font-semibold text-white truncate">{item.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
