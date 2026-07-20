import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      return NextResponse.json({
        weeklyDigest: true,
        taskUpdates: true,
        securityAlerts: true,
      });
    }

    return NextResponse.json({
      weeklyDigest: preferences.weeklyDigest,
      taskUpdates: preferences.taskUpdates,
      securityAlerts: preferences.securityAlerts,
    });
  } catch (error: any) {
    console.error("Error in GET /api/user/preferences:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { weeklyDigest, taskUpdates, securityAlerts } = body;

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    const updated = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        weeklyDigest: Boolean(weeklyDigest),
        taskUpdates: Boolean(taskUpdates),
        securityAlerts: Boolean(securityAlerts),
      },
      create: {
        userId,
        weeklyDigest: Boolean(weeklyDigest),
        taskUpdates: Boolean(taskUpdates),
        securityAlerts: Boolean(securityAlerts),
      },
    });

    return NextResponse.json({
      weeklyDigest: updated.weeklyDigest,
      taskUpdates: updated.taskUpdates,
      securityAlerts: updated.securityAlerts,
    });
  } catch (error: any) {
    console.error("Error in POST /api/user/preferences:", error);
    return NextResponse.json({ error: error.message || "Failed to save preferences" }, { status: 500 });
  }
}
