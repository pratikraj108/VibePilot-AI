"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query } from "firebase/firestore";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setIsLoaded(true);
      return;
    }

    const tasksRef = collection(db, "users", user.uid, "tasks");
    const q = query(tasksRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTasks: Task[] = [];
        snapshot.forEach((doc) => {
          fetchedTasks.push(doc.data() as Task);
        });
        setTasks(fetchedTasks);
        setIsLoaded(true);
      },
      (error) => {
        console.error("Error fetching tasks from Firestore:", error);
        setIsLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "completed">) => {
    if (!user) return;
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      completed: false,
    };
    try {
      await setDoc(doc(db, "users", user.uid, "tasks", newTask.id), newTask);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "tasks", id), updates);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id: string) => {
    if (!user) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "tasks", id), {
        completed: !task.completed,
      });
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
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
