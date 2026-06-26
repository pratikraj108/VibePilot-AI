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

    const { title, deadline, estimatedHours, availableHoursPerDay } = await req.json();

    if (!title || !deadline || !estimatedHours || !availableHoursPerDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `
      Create a study/work schedule for the following task.
      Task: ${title}
      Deadline: ${deadline}
      Total Estimated Hours: ${estimatedHours}
      Available Hours Per Day: ${availableHoursPerDay}
      
      Generate a day-by-day timeline that allocates the estimated hours across the available days leading up to the deadline. 
      For each day, provide the date (e.g., "Oct 24"), the hours allocated for that day, and a brief description of what to focus on ("plan").
    `;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            schedule: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  day: { type: "NUMBER" },
                  date: { type: "STRING" },
                  hoursAllocated: { type: "NUMBER" },
                  plan: { type: "STRING" }
                },
                required: ["day", "date", "hoursAllocated", "plan"]
              }
            }
          },
          required: ["schedule"]
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
      schedule: data.schedule
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate schedule." },
      { status: 500 }
    );
  }
}
