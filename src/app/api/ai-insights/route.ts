import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const { tasks } = await req.json();

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ success: false, error: "Invalid tasks data provided" }, { status: 400 });
    }

    // Simplify tasks to reduce token usage
    const simplifiedTasks = tasks.map(t => ({
      title: t.title,
      priority: t.priority,
      completed: t.completed,
      createdAt: t.createdAt,
      deadline: t.deadline,
      estimatedHours: t.estimatedHours,
      hasRiskPlan: !!t.actionPlan?.risk
    }));

    const prompt = `
      You are an expert productivity analyst. Review the following JSON array of user tasks and generate a comprehensive insight report.
      
      Tasks:
      ${JSON.stringify(simplifiedTasks, null, 2)}
      
      Analyze the data and return a JSON object strictly matching this schema:
      {
        "productivityScore": number, // A score from 0 to 100 based on completion rate and priority management.
        "weeklyInsights": string, // A conversational, encouraging 2-3 sentence summary of their performance.
        "completionTrends": [
          { "day": string, "tasksCompleted": number, "tasksAdded": number }
        ], // Provide data points for the last 7 days (use relative days like "Mon", "Tue" based on the task dates, or mock reasonable data if tasks are too few, but ensure it aligns with the provided tasks).
        "riskTrends": [
          { "category": string, "score": number }
        ], // Provide 4-5 risk categories (e.g., "Procrastination", "Overbooking", "Missed High Priority") and a score from 0-100 for each based on their task habits.
        "recommendations": string[] // 3 actionable tips to improve productivity.
      }
      
      Return ONLY valid JSON. No markdown formatting or code blocks.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(textResponse);
    return NextResponse.json({ success: true, insights: result });

  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate insights" },
      { status: 500 }
    );
  }
}
