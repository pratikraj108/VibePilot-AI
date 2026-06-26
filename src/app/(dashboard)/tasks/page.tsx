"use client";

import { useState } from "react";
import { Plus, ListTodo, Sparkles } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { AIAgentModal } from "@/components/AIAgentModal";
import { AIScheduleModal } from "@/components/AIScheduleModal";
import { AIActionPlanModal } from "@/components/AIActionPlanModal";
import { Task, Priority } from "@/types/task";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const { tasks, isLoaded, addTask, updateTask, deleteTask, toggleComplete } = useTasks();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [schedulingTask, setSchedulingTask] = useState<Task | null>(null);
  const [actionPlanTask, setActionPlanTask] = useState<Task | null>(null);

  const handleOpenNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSave = (taskData: Omit<Task, "id" | "createdAt" | "completed">) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleAddSubtasks = (subtasks: Array<{title: string, description: string, estimatedHours: number, priority: Priority}>) => {
    subtasks.forEach(task => addTask({ ...task, deadline: new Date(Date.now() + 86400000).toISOString() }));
  };

  if (!isLoaded) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="h-full flex flex-col pb-10"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 w-32 skeleton rounded-md"></div>
            <div className="h-4 w-48 skeleton rounded-md opacity-70"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-36 skeleton rounded-lg"></div>
            <div className="h-10 w-28 skeleton rounded-lg"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-5 h-40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-5 w-5 skeleton rounded-full shrink-0"></div>
                  <div className="h-6 w-3/4 skeleton rounded-md"></div>
                </div>
                <div className="h-4 w-full skeleton rounded-md mb-2"></div>
                <div className="h-4 w-2/3 skeleton rounded-md"></div>
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                <div className="h-4 w-20 skeleton rounded-md"></div>
                <div className="h-4 w-16 skeleton rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return b.createdAt - a.createdAt;
    return a.completed ? 1 : -1;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col pb-10"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Tasks</h1>
          <p className="text-sm text-slate-400">Manage your priorities and deadlines.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAIOpen(true)}
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Breakdown
          </button>
          <button 
            onClick={handleOpenNew}
            className="bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col items-center justify-center p-12 glass-card border-dashed border-white/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-violet-500/5 pointer-events-none" />
          
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-2xl shadow-sky-500/20 backdrop-blur-xl relative"
          >
            <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl" />
            <ListTodo className="w-10 h-10 text-sky-400 relative z-10" />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-3">No tasks yet</h3>
          <p className="text-slate-400 text-base max-w-md text-center mb-8">
            Get started by creating your first task. Track priorities, deadlines, and time estimates all in one place.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenNew}
            className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add your first task
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEdit}
                onDelete={deleteTask}
                onToggleComplete={toggleComplete}
                onSchedule={setSchedulingTask}
                onActionPlan={setActionPlanTask}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingTask}
      />

      <AIAgentModal 
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onAddSubtasks={handleAddSubtasks}
      />

      <AIScheduleModal 
        isOpen={!!schedulingTask}
        onClose={() => setSchedulingTask(null)}
        task={schedulingTask}
      />

      {actionPlanTask && (
        <AIActionPlanModal
          isOpen={!!actionPlanTask}
          onClose={() => setActionPlanTask(null)}
          task={actionPlanTask}
          onSave={updateTask}
        />
      )}
    </motion.div>
  );
}
