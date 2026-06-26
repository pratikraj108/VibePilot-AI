import { NextResponse } from "next/server";
import { gemini } from "@/lib/gemini";

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured in environment variables." },
        { status: 500 }
      );
    }

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say exactly 'Hello from Gemini' and nothing else.",
    });

    return NextResponse.json({
      success: true,
      data: response.text,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate content from Gemini API." 
      },
      { status: 500 }
    );
  }
}
