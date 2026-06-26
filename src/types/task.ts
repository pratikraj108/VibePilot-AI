export type Priority = 'Low' | 'Medium' | 'High';

export interface AIActionPlan {
  subtasks: {
    title: string;
    description: string;
    estimatedHours: number;
    priority: Priority;
  }[];
  schedule: {
    day: number;
    date: string;
    hoursAllocated: number;
    plan: string;
    completed?: boolean;
  }[];
  risk: {
    riskScore: number;
    riskLevel: string;
    reason: string;
    suggestions: string[];
    isEmergency?: boolean;
    emergencyPlan?: {
      criticalTasks: string[];
      optionalTasks: string[];
      fastestCompletionPlan: string;
    };
  };
  generatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: Priority;
  estimatedHours: number;
  completed: boolean;
  createdAt: number;
  actionPlan?: AIActionPlan;
}
