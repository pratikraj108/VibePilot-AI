import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";
import { Task } from "@/types/task";

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

const formatDateString = (d: Date) => {
  const yStr = d.getFullYear();
  const mStr = String(d.getMonth() + 1).padStart(2, "0");
  const dStr = String(d.getDate()).padStart(2, "0");
  return `${yStr}-${mStr}-${dStr}`;
};

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured." },
        { status: 500 }
      );
    }

    const { selectedDate, tasks, availableHoursPerDay = 4 } = await req.json();

    if (!selectedDate || !tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const todayStr = formatDateString(new Date());
    const targetDateStr = selectedDate; // YYYY-MM-DD
    const targetDate = new Date(targetDateStr);
    const todayDate = new Date(todayStr);

    // Find deadlines and scheduled items for selected day
    const dayDeadlines: any[] = [];
    const dayScheduled: any[] = [];
    let dayTotalHours = 0;

    // Find missed tasks (scheduled date is before today, and not marked completed)
    const missedTasks: any[] = [];

    tasks.forEach((task: Task) => {
      // 1. Check Deadlines
      if (task.deadline === targetDateStr) {
        dayDeadlines.push({
          id: task.id,
          title: task.title,
          priority: task.priority,
          completed: task.completed,
          risk: task.actionPlan?.risk
        });
      }

      // 2. Check Scheduled Items
      if (task.actionPlan?.schedule) {
        task.actionPlan.schedule.forEach((item, index) => {
          const itemDate = getScheduleItemDate(item.date, task.deadline);
          if (itemDate) {
            const itemDateStr = formatDateString(itemDate);
            const isCompleted = item.completed || task.completed;

            if (itemDateStr === targetDateStr) {
              dayScheduled.push({
                taskId: task.id,
                taskTitle: task.title,
                subtaskIndex: index,
                plan: item.plan,
                hoursAllocated: item.hoursAllocated,
                priority: task.priority,
                completed: isCompleted
              });
              dayTotalHours += item.hoursAllocated;
            }

            // 3. Check Missed Tasks
            // Scheduled date is in the past, and not completed
            if (itemDate.getTime() < todayDate.getTime() && !isCompleted) {
              missedTasks.push({
                taskId: task.id,
                taskTitle: task.title,
                subtaskIndex: index,
                originalDateStr: item.date,
                originalDateFormatted: itemDateStr,
                plan: item.plan,
                hoursAllocated: item.hoursAllocated,
                priority: task.priority
              });
            }
          }
        });
      }
    });

    const prompt = `
      You are an expert productivity analyzer and assistant. Review the following schedule statistics for the user on ${targetDateStr}.
      Today is ${todayStr}.
      Daily workload capacity limit: ${availableHoursPerDay} hours.

      === WORKLOAD ON ${targetDateStr} ===
      Deadlines Due: ${JSON.stringify(dayDeadlines, null, 2)}
      AI Scheduled Focus Blocks: ${JSON.stringify(dayScheduled, null, 2)}
      Total Planned Hours: ${dayTotalHours} hours

      === INCOMPLETE PAST SCHEDULED BLOCKS (MISSED) ===
      ${JSON.stringify(missedTasks, null, 2)}

      Tasks list context for reference:
      ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, deadline: t.deadline })), null, 2)}

      Please analyze this data and generate a JSON response strictly matching this schema:
      {
        "dailyInsight": string, // A short encouraging 1-2 sentence productivity summary for this day based on workload.
        "dailyRecommendation": string, // An actionable recommendation for the selected day (e.g. "Completing task X today reduces risk by Y%", "Today has free time, try to complete X").
        
        "conflict": string | null, // If total scheduled hours (${dayTotalHours}h) exceed the daily limit (${availableHoursPerDay}h), or if multiple subtasks overlap, provide a warning title. Otherwise null.
        "conflictResolution": string | null, // An explanation of how to resolve this (e.g. "Move Subtask A to tomorrow"). Otherwise null.
        "conflictMoveDetails": {
          "taskId": string,
          "subtaskIndex": number,
          "originalDate": string, // YYYY-MM-DD
          "suggestedDate": string // YYYY-MM-DD (typically next day or another open day close to the deadline)
        } | null,
        
        "missedTaskRecovery": string | null, // Suggestion to recover the first missed past task (e.g., "You missed 'Outline page grids'. Move it to tomorrow evening"). Otherwise null.
        "missedTaskMoveDetails": {
          "taskId": string,
          "subtaskIndex": number,
          "originalDate": string, // original date string from originalDateStr
          "suggestedDate": string // YYYY-MM-DD (typically today or tomorrow)
        } | null
      }

      Return ONLY valid JSON. No markdown code blocks.
    `;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response from Gemini");
    }

    const cleanedText = textResult.replace(/```json/gi, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      analysis: data
    });

  } catch (error: any) {
    console.error("Gemini AI Calendar Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate calendar AI analysis." },
      { status: 500 }
    );
  }
}
