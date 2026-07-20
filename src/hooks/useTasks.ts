"use client";

import { useState, useEffect, useCallback } from "react";
import { Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setIsLoaded(true);
      return;
    }

    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "completed">) => {
    if (!user) return;
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Error adding task:", error);
      await fetchTasks();
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    if (!user) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Error updating task:", error);
      await fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      await fetchTasks();
    }
  };

  const toggleComplete = async (id: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    await updateTask(id, { completed: newCompleted });
  };

  return {
    tasks,
    isLoaded,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}
