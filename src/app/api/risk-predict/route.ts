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

    const { deadline, remainingWork, availableHours } = await req.json();

    if (!deadline || remainingWork === undefined || availableHours === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const deadlineDate = new Date(deadline);
    const todayDate = new Date(new Date().toISOString().split('T')[0]);
    
    // Calculate difference in days, ignoring time of day
    const timeDiffMs = deadlineDate.getTime() - todayDate.getTime();
    const daysDiff = timeDiffMs / (1000 * 3600 * 24);
    
    // It's an emergency if deadline is today (0 days) or tomorrow (1 day), or already past
    const isEmergency = daysDiff <= 1;

    const today = new Date().toISOString().split('T')[0];
    
    let prompt = `
      Evaluate the feasibility of the following task and predict the deadline risk.
      Today's Date: ${today}
      Deadline: ${deadline}
      Remaining Work: ${remainingWork} hours
      Available Hours Per Day: ${availableHours} hours
      
      Calculate if it is mathematically possible to finish the remaining work by the deadline given the available hours per day.
      First, calculate the number of days between Today's Date and the Deadline.
      Then, multiply the days by Available Hours Per Day to get total possible hours.
      Compare total possible hours with Remaining Work.
      Then, provide a risk score (0-100 where 0 is very safe and 100 is mathematically impossible/guaranteed failure), risk level (Low, Medium, High), a detailed reason for your assessment including the math, and actionable suggestions to mitigate risk.
    `;

    if (isEmergency) {
      prompt += `
      
      CRITICAL: The deadline is less than 24 hours away. This is an EMERGENCY MODE situation.
      You must also provide an emergency plan including:
      - "criticalTasks": Array of absolute must-do tasks
      - "optionalTasks": Array of tasks that can be skipped
      - "fastestCompletionPlan": A step-by-step plan for the fastest possible completion.
      `;
    }

    const responseSchemaProperties: any = {
      riskScore: { type: "NUMBER" },
      riskLevel: { type: "STRING" },
      reason: { type: "STRING" },
      suggestions: {
        type: "ARRAY",
        items: { type: "STRING" }
      }
    };
    
    const requiredFields = ["riskScore", "riskLevel", "reason", "suggestions"];

    if (isEmergency) {
      responseSchemaProperties.emergencyPlan = {
        type: "OBJECT",
        properties: {
          criticalTasks: { type: "ARRAY", items: { type: "STRING" } },
          optionalTasks: { type: "ARRAY", items: { type: "STRING" } },
          fastestCompletionPlan: { type: "STRING" }
        },
        required: ["criticalTasks", "optionalTasks", "fastestCompletionPlan"]
      };
      requiredFields.push("emergencyPlan");
    }

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: responseSchemaProperties,
          required: requiredFields
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No text returned from Gemini");
    }

    const data = JSON.parse(textResult);
    data.isEmergency = isEmergency;

    return NextResponse.json({
      success: true,
      prediction: data
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate risk prediction." },
      { status: 500 }
    );
  }
}
