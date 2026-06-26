"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/task";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Hourglass,
  Flame,
  ListTodo,
  Lightbulb,
  TrendingUp,
  Download,
  RefreshCw,
  HelpCircle,
  Activity,
  CheckSquare
} from "lucide-react";

interface ScheduledItem {
  taskId: string;
  taskTitle: string;
  subtaskIndex: number;
  hoursAllocated: number;
  plan: string;
  priority: string;
  completed: boolean;
}

export default function CalendarPage() {
  const { tasks, isLoaded, updateTask } = useTasks();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  
  // AI insights caching & state
  const [aiCache, setAiCache] = useState<Record<string, any>>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper: Get schedule item Date object
  const getScheduleItemDate = (itemDateStr: string, deadlineStr: string): Date | null => {
    if (!deadlineStr) return null;
    const [dYear, dMonth, dDay] = deadlineStr.split("-").map(Number);
    const clean = itemDateStr.trim().toLowerCase();

    // 1. YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const [y, m, d] = clean.split("-").map(Number);
      return new Date(y, m - 1, d);
    }

    // 2. "Month Day" (e.g., "jun 28" or "oct 24")
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

    // 3. Just day number (e.g. "28")
    if (/^\d+$/.test(clean)) {
      const day = parseInt(clean);
      return new Date(dYear, dMonth - 1, day);
    }

    return null;
  };

  // Helper: format Date to compare (YYYY-MM-DD)
  const formatDateString = (d: Date) => {
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, "0");
    const dStr = String(d.getDate()).padStart(2, "0");
    return `${yStr}-${mStr}-${dStr}`;
  };

  const selectedDateStr = formatDateString(selectedDate);
  const todayStr = formatDateString(new Date());

  // Fetch AI daily analysis
  const fetchDayAiAnalysis = async (date: Date, force = false) => {
    const dateStr = formatDateString(date);
    if (aiCache[dateStr] && !force) return;

    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/calendar-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDate: dateStr,
          tasks,
          availableHoursPerDay: 4 // Daily capacity limit
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed analysis");
      
      setAiCache(prev => ({
        ...prev,
        [dateStr]: data.analysis
      }));
    } catch (err: any) {
      console.error("Calendar AI fetch error:", err);
      setAiError(err.message || "Failed to load AI Insights.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger analysis when selectedDate or tasks change
  useEffect(() => {
    if (isLoaded && tasks.length > 0) {
      fetchDayAiAnalysis(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr, isLoaded]);

  const getCalendarDays = () => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Fills from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Fills from next month to complete 6-row grid (42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const daysGrid = getCalendarDays();

  // Find deadlines for a date
  const getDeadlinesForDate = (date: Date) => {
    const dateStr = formatDateString(date);
    return tasks.filter(t => t.deadline === dateStr);
  };

  // Find scheduled items for a date
  const getScheduledItemsForDate = (date: Date) => {
    const items: ScheduledItem[] = [];
    const targetDateStr = formatDateString(date);

    tasks.forEach(task => {
      if (task.actionPlan?.schedule) {
        task.actionPlan.schedule.forEach((item, index) => {
          const itemDate = getScheduleItemDate(item.date, task.deadline);
          if (itemDate && formatDateString(itemDate) === targetDateStr) {
            items.push({
              taskId: task.id,
              taskTitle: task.title,
              subtaskIndex: index,
              hoursAllocated: item.hoursAllocated,
              plan: item.plan,
              priority: task.priority,
              completed: !!item.completed || task.completed
            });
          }
        });
      }
    });

    return items;
  };

  // Check if cell is missed (date < today, and has uncompleted schedule items)
  const isCellMissed = (date: Date) => {
    const cellDateStr = formatDateString(date);
    const todayDateStr = formatDateString(new Date());
    if (cellDateStr >= todayDateStr) return false;

    let hasMissed = false;
    tasks.forEach(task => {
      if (task.actionPlan?.schedule) {
        task.actionPlan.schedule.forEach(item => {
          const itemDate = getScheduleItemDate(item.date, task.deadline);
          if (itemDate && formatDateString(itemDate) === cellDateStr) {
            const isCompleted = item.completed || task.completed;
            if (!isCompleted) {
              hasMissed = true;
            }
          }
        });
      }
    });
    return hasMissed;
  };

  // Calculate task completion percentage
  const getTaskProgress = (task: Task) => {
    if (task.completed) return 100;
    if (!task.actionPlan?.schedule || task.actionPlan.schedule.length === 0) return 0;
    const total = task.actionPlan.schedule.length;
    const completed = task.actionPlan.schedule.filter(item => item.completed).length;
    return Math.round((completed / total) * 100);
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Toggle Subtask Completion in Firestore
  const handleToggleSubtask = async (taskId: string, subtaskIndex: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.actionPlan) return;

    const updatedSchedule = [...task.actionPlan.schedule];
    const targetItem = updatedSchedule[subtaskIndex];
    const newCompletedStatus = !targetItem.completed;
    targetItem.completed = newCompletedStatus;

    // Check if all subtasks are complete to auto-complete the parent task
    const allSubtasksCompleted = updatedSchedule.every(item => item.completed);

    await updateTask(taskId, {
      completed: allSubtasksCompleted ? true : task.completed,
      actionPlan: {
        ...task.actionPlan,
        schedule: updatedSchedule
      }
    });

    // Invalidate local cache for this day to force refresh insights
    const dateStr = formatDateString(selectedDate);
    const updatedCache = { ...aiCache };
    delete updatedCache[dateStr];
    setAiCache(updatedCache);
  };

  // Reschedule tasks based on Gemini suggestions
  const handleAcceptReschedule = async (taskId: string, subtaskIndex: number, suggestedDateStr: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.actionPlan) return;

    // Format target date cleanly for display (e.g. "Jun 29")
    const [y, m, d] = suggestedDateStr.split("-").map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedShort = `${months[m - 1]} ${d}`;

    const updatedSchedule = [...task.actionPlan.schedule];
    updatedSchedule[subtaskIndex] = {
      ...updatedSchedule[subtaskIndex],
      date: formattedShort
    };

    await updateTask(taskId, {
      actionPlan: {
        ...task.actionPlan,
        schedule: updatedSchedule
      }
    });

    // Reset cache entries to trigger recalculation of daily feedback
    setAiCache({});
  };

  // Export to Google Calendar (ICS Generator)
  const handleExportToGoogleCalendar = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VibePilot AI//NONSGML Calendar Export//EN\n";

    tasks.forEach(t => {
      if (t.actionPlan?.schedule) {
        t.actionPlan.schedule.forEach(item => {
          const date = getScheduleItemDate(item.date, t.deadline);
          if (date) {
            const yyyymmdd = formatDateString(date).replace(/-/g, "");
            const start = `${yyyymmdd}T090000`;
            const endHour = 9 + item.hoursAllocated;
            const endHourStr = String(Math.floor(endHour)).padStart(2, "0");
            const endMinStr = String(Math.round((endHour % 1) * 60)).padStart(2, "0");
            const end = `${yyyymmdd}T${endHourStr}${endMinStr}00`;

            icsContent += "BEGIN:VEVENT\n";
            icsContent += `SUMMARY:${t.title} - Subtask: ${item.plan.substring(0, 30)}\n`;
            icsContent += `DESCRIPTION:${item.plan.replace(/\n/g, " ")} | Status: ${item.completed ? "Completed" : "Pending"}\n`;
            icsContent += `DTSTART:${start}\n`;
            icsContent += `DTEND:${end}\n`;
            icsContent += "END:VEVENT\n";
          }
        });
      }
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vibepilot_ai_schedule.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top level KPIs (FEATURE 7 - Calendar Analytics)
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const upcomingDeadlinesCount = tasks.filter(t => !t.completed && t.deadline && t.deadline >= todayStr).length;
  
  const totalAiHours = tasks.reduce((sum, task) => {
    if (task.actionPlan?.schedule) {
      return sum + task.actionPlan.schedule.reduce((s, item) => s + item.hoursAllocated, 0);
    }
    return sum;
  }, 0);

  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const getNextDeadlineCountdown = () => {
    const upcoming = tasks
      .filter(t => !t.completed && t.deadline)
      .map(t => ({
        title: t.title,
        deadline: t.deadline,
        diff: new Date(t.deadline).getTime() - new Date().setHours(0,0,0,0)
      }))
      .filter(t => t.diff >= 0)
      .sort((a, b) => a.diff - b.diff);

    if (upcoming.length === 0) return "No deadlines";
    const diffDays = Math.ceil(upcoming[0].diff / (1000 * 3600 * 24));
    if (diffDays === 0) return "Due today! 🚨";
    if (diffDays === 1) return "Due tomorrow! ⏳";
    return `${diffDays} days left`;
  };

  // Selected Day Details calculation
  const selectedDeadlines = getDeadlinesForDate(selectedDate);
  const selectedScheduled = getScheduledItemsForDate(selectedDate);
  
  // Daily Productivity Score Calculations (FEATURE 4)
  const plannedHours = selectedScheduled.reduce((sum, item) => sum + item.hoursAllocated, 0);
  const completedHours = selectedScheduled.reduce((sum, item) => sum + (item.completed ? item.hoursAllocated : 0), 0);
  const pendingHours = Math.max(0, plannedHours - completedHours);
  const dailyProductivityScore = plannedHours > 0 ? Math.round((completedHours / plannedHours) * 100) : 0;

  // Cache entry for selected day
  const currentDayAiAnalysis = aiCache[selectedDateStr];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            AI Productivity Planner <CalendarIcon className="w-7 h-7 text-violet-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Active scheduling, mathematical feasibility tracking, and Gemini task recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportToGoogleCalendar}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white rounded-lg transition-all shadow-lg shadow-violet-500/10"
          >
            <Download className="w-4 h-4" /> Export to Google Calendar
          </motion.button>

          <button
            onClick={handleToday}
            className="px-4 py-2 text-sm font-medium bg-slate-900 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center bg-slate-950 border border-white/5 rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 text-sm font-semibold text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE 7: Calendar Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Tasks", value: totalTasksCount, color: "text-slate-400" },
          { label: "Upcoming Deadlines", value: upcomingDeadlinesCount, color: "text-rose-400" },
          { label: "AI Scheduled Hours", value: `${totalAiHours}h`, color: "text-violet-400" },
          { label: "Completed Tasks", value: completedTasksCount, color: "text-emerald-400" },
          { label: "Completion Rate", value: `${completionRate}%`, color: "text-sky-400" },
          { label: "Next Deadline", value: getNextDeadlineCountdown(), color: "text-amber-400", size: "text-xs" },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="glass-card p-4 flex flex-col justify-between"
          >
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {kpi.label}
            </span>
            <span className={`mt-2 font-bold ${kpi.size || "text-xl"} ${kpi.color}`}>
              {kpi.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Calendar left, Sidebar right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Calendar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 flex flex-col">
            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-2 flex-1">
              {daysGrid.map((cell, idx) => {
                const isSelected = formatDateString(cell.date) === selectedDateStr;
                const isToday = formatDateString(cell.date) === todayStr;
                const dayDeadlines = getDeadlinesForDate(cell.date);
                const dayScheduled = getScheduledItemsForDate(cell.date);
                const cellHours = dayScheduled.reduce((sum, item) => sum + item.hoursAllocated, 0);
                const isMissed = isCellMissed(cell.date);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`min-h-[95px] p-2 flex flex-col justify-between rounded-xl border text-left transition-all ${
                      !cell.isCurrentMonth 
                        ? "bg-slate-950/20 border-white/[0.02] text-slate-600" 
                        : "bg-slate-950/40 border-white/5 text-slate-300 hover:bg-white/[0.03]"
                    } ${
                      isSelected 
                        ? "ring-2 ring-violet-500 border-transparent bg-violet-950/10" 
                        : ""
                    } ${
                      isToday && !isSelected
                        ? "border-violet-500/40 bg-violet-500/[0.02]"
                        : ""
                    } ${
                      isMissed 
                        ? "border-rose-500/30 bg-rose-950/5 text-rose-300"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-semibold ${
                        isToday 
                          ? "text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-md" 
                          : isSelected 
                            ? "text-white font-bold" 
                            : ""
                      }`}>
                        {cell.date.getDate()}
                      </span>

                      {/* Dot indicators */}
                      <div className="flex gap-1">
                        {isMissed && (
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        )}
                        {dayDeadlines.length > 0 && !isMissed && (
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        )}
                        {cellHours > 0 && !isMissed && (
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        )}
                      </div>
                    </div>

                    {/* Cell details */}
                    <div className="mt-2 space-y-1 w-full overflow-hidden text-[9px]">
                      {/* Deadlines */}
                      {dayDeadlines.slice(0, 1).map(d => (
                        <div 
                          key={d.id}
                          className={`truncate px-1 py-0.5 rounded border ${
                            d.completed
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 line-through"
                              : d.priority === "High"
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                : d.priority === "Medium"
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                          }`}
                        >
                          🎯 {d.title}
                        </div>
                      ))}

                      {/* Scheduled workload */}
                      {cellHours > 0 && (
                        <div className={`px-1 py-0.5 rounded flex items-center gap-1 font-medium truncate ${
                          dayScheduled.every(s => s.completed)
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-violet-950/40 border border-violet-500/10 text-violet-300"
                        }`}>
                          <Sparkles className="w-2.5 h-2.5 text-violet-400 shrink-0" />
                          <span>{cellHours}h scheduled</span>
                        </div>
                      )}

                      {/* Missed Warning */}
                      {isMissed && (
                        <div className="bg-rose-950/20 border border-rose-500/20 px-1 py-0.5 rounded text-rose-400 font-bold truncate">
                          ⚠️ Missed
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEATURE 8: Calendar Legend */}
          <div className="glass-card p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Calendar Indicator Legend
            </span>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-3 h-3 rounded-md bg-rose-500/20 border border-rose-500/30" />
                <span>High Priority</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500/30" />
                <span>Medium Priority</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-3 h-3 rounded-md bg-sky-500/20 border border-sky-500/30" />
                <span>Low Priority</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-3 h-3 rounded-md bg-violet-500/20 border border-violet-500/30" />
                <span>AI Scheduled Focus</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/30" />
                <span>Completed Tasks</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-3 h-3 rounded-md bg-rose-950/40 border border-rose-500/30 border-dashed" />
                <span>Missed / Overdue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Daily Planner details & AI summary */}
        <div className="space-y-6">
          {/* Daily Panel Header */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                  Daily Overview
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
              </div>

              {/* FEATURE 4: Daily Productivity Score Gauge */}
              {plannedHours > 0 && (
                <div className="flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-4 border-slate-800 flex items-center justify-center">
                      <span className={`text-xs font-bold ${
                        dailyProductivityScore >= 80 
                          ? "text-emerald-400" 
                          : dailyProductivityScore >= 40 
                            ? "text-amber-400" 
                            : "text-rose-400"
                      }`}>
                        {dailyProductivityScore}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1">
                    Productivity
                  </span>
                </div>
              )}
            </div>

            {/* Daily Hours Stats */}
            {plannedHours > 0 ? (
              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 border border-white/5 rounded-xl p-3 text-center text-xs">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Planned</span>
                  <span className="text-white font-bold">{plannedHours}h</span>
                </div>
                <div>
                  <span className="text-emerald-500 block text-[9px] uppercase font-bold">Done</span>
                  <span className="text-emerald-400 font-bold">{completedHours}h</span>
                </div>
                <div>
                  <span className="text-amber-500 block text-[9px] uppercase font-bold">Pending</span>
                  <span className="text-amber-400 font-bold">{pendingHours}h</span>
                </div>
              </div>
            ) : null}

            {/* AI Warning Conflict Banner (FEATURE 3) */}
            {currentDayAiAnalysis?.conflict && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{currentDayAiAnalysis.conflict}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentDayAiAnalysis.conflictResolution}
                </p>
                {currentDayAiAnalysis.conflictMoveDetails && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAcceptReschedule(
                      currentDayAiAnalysis.conflictMoveDetails.taskId,
                      currentDayAiAnalysis.conflictMoveDetails.subtaskIndex,
                      currentDayAiAnalysis.conflictMoveDetails.suggestedDate
                    )}
                    className="w-full text-center py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold mt-1 transition-colors"
                  >
                    Accept AI Rescheduling Suggestion
                  </motion.button>
                )}
              </div>
            )}

            {/* AI Missed Task Recovery Banner (FEATURE 6) */}
            {currentDayAiAnalysis?.missedTaskRecovery && (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Recovery Plan Required</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentDayAiAnalysis.missedTaskRecovery}
                </p>
                {currentDayAiAnalysis.missedTaskMoveDetails && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAcceptReschedule(
                      currentDayAiAnalysis.missedTaskMoveDetails.taskId,
                      currentDayAiAnalysis.missedTaskMoveDetails.subtaskIndex,
                      currentDayAiAnalysis.missedTaskMoveDetails.suggestedDate
                    )}
                    className="w-full text-center py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold mt-1 transition-colors"
                  >
                    Accept AI Recovery Date
                  </motion.button>
                )}
              </div>
            )}

            {/* FEATURE 2 & 5: AI Daily Insights and Recommendations */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2 border-b border-white/5 pb-2">
                <Sparkles className="w-4 h-4 text-violet-400" /> AI Insights Summary
              </h3>

              {isAiLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-10 bg-slate-800 rounded" />
                </div>
              ) : aiError ? (
                <div className="text-xs text-rose-400 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {aiError}
                </div>
              ) : currentDayAiAnalysis ? (
                <div className="space-y-3">
                  {/* Daily Insight */}
                  <div className="bg-slate-950/30 border border-white/5 rounded-xl p-4 flex gap-3">
                    <Activity className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">Analysis</span>
                      <p className="text-xs text-white leading-relaxed">{currentDayAiAnalysis.dailyInsight}</p>
                    </div>
                  </div>

                  {/* Daily Recommendation */}
                  <div className="bg-slate-950/30 border border-white/5 rounded-xl p-4 flex gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Recommendation</span>
                      <p className="text-xs text-white leading-relaxed">{currentDayAiAnalysis.dailyRecommendation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-950/10 rounded-xl border border-white/[0.01]">
                  Add tasks or choose a date to generate AI planners.
                </p>
              )}
            </div>

            {/* FEATURE 1: AI Auto Scheduling subtask lists */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-violet-400" /> Daily Action Checklist
              </h3>

              {selectedScheduled.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-950/20 p-3 rounded-lg border border-white/[0.02]">
                  No tasks or subtasks scheduled for this day.
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {selectedScheduled.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border bg-slate-950/60 transition-all flex items-start gap-3 relative overflow-hidden ${
                        item.completed 
                          ? "border-emerald-500/20 opacity-60" 
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleSubtask(item.taskId, item.subtaskIndex)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          item.completed 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "bg-slate-950 border-white/20 hover:border-violet-500"
                        }`}
                      >
                        {item.completed && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                      </button>

                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 truncate max-w-[120px] font-bold">
                            {item.taskTitle}
                          </span>
                          <span className="text-sky-300 font-bold bg-sky-500/10 px-1 rounded text-[9px] shrink-0">
                            {item.hoursAllocated}h
                          </span>
                        </div>
                        <p className={`text-xs text-white leading-relaxed ${item.completed ? "line-through text-slate-400" : ""}`}>
                          {item.plan}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FEATURE 9: Progress Visualization list */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Goal Completion Progress
              </h3>

              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-950/20 p-3 rounded-lg border border-white/[0.02]">
                  No active goals to track.
                </p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 4).map(task => {
                    const progress = getTaskProgress(task);
                    return (
                      <div key={task.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white font-medium truncate max-w-[160px]">
                            {task.title}
                          </span>
                          <span className="text-slate-400 text-[10px]">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
