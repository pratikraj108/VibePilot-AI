import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured." },
        { status: 500 }
      );
    }

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const prompt = `
      Break down the following high-level task into smaller, actionable subtasks.
      Task Title: ${title}
      Task Description: ${description || "No description provided."}
      
      For each subtask, provide a concise title, a brief description, an estimated time in hours, and a priority level (Low, Medium, High).
    `;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            subtasks: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  description: { type: "STRING" },
                  estimatedHours: { type: "NUMBER" },
                  priority: { type: "STRING", enum: ["Low", "Medium", "High"] }
                },
                required: ["title", "description", "estimatedHours", "priority"]
              }
            }
          },
          required: ["subtasks"]
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No text returned from Gemini");
    }

    const cleanedText = textResult.replace(/```json/gi, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanedText);

    return NextResponse.json({
      success: true,
      subtasks: data.subtasks
    });

  } catch (error: any) {
    console.error("Gemini API Error in breakdown-task:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate subtasks." },
      { status: 500 }
    );
  }
}
