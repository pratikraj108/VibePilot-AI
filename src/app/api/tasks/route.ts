import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userObj = await currentUser();
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        email: userObj?.emailAddresses[0]?.emailAddress || null,
        name: userObj?.fullName || userObj?.firstName || null,
      },
      create: {
        id: userId,
        email: userObj?.emailAddresses[0]?.emailAddress || null,
        name: userObj?.fullName || userObj?.firstName || null,
      },
    });

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        subtasks: true,
        scheduleItems: true,
        actionPlan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedTasks = tasks.map((t) => {
      let actionPlan = undefined;

      if (t.actionPlan) {
        actionPlan = {
          subtasks: t.subtasks.map((s) => ({
            title: s.title,
            description: s.description,
            estimatedHours: s.estimatedHours,
            priority: s.priority,
          })),
          schedule: t.scheduleItems.map((sc) => ({
            day: sc.day,
            date: sc.date,
            hoursAllocated: sc.hoursAllocated,
            plan: sc.plan,
            completed: sc.completed,
          })),
          risk: {
            riskScore: t.actionPlan.riskScore,
            riskLevel: t.actionPlan.riskLevel,
            reason: t.actionPlan.reason,
            suggestions: t.actionPlan.suggestions,
            isEmergency: t.actionPlan.isEmergency,
            emergencyPlan: (t.actionPlan.emergencyPlan as any) || undefined,
          },
          generatedAt: Number(t.actionPlan.generatedAt),
        };
      }

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        deadline: t.deadline,
        priority: t.priority,
        estimatedHours: t.estimatedHours,
        completed: t.completed,
        createdAt: Number(t.createdAt),
        actionPlan,
      };
    });

    return NextResponse.json(formattedTasks);
  } catch (error: any) {
    console.error("Error in GET /api/tasks:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, deadline, priority, estimatedHours, createdAt, actionPlan } = body;

    const userObj = await currentUser();
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: userObj?.emailAddresses[0]?.emailAddress || null,
        name: userObj?.fullName || userObj?.firstName || null,
      },
    });

    const taskId = id || crypto.randomUUID();
    const taskCreatedAt = createdAt ? BigInt(createdAt) : BigInt(Date.now());

    const newTask = await prisma.task.create({
      data: {
        id: taskId,
        userId,
        title,
        description,
        deadline,
        priority: priority || "Medium",
        estimatedHours: Number(estimatedHours) || 1,
        createdAt: taskCreatedAt,
        completed: false,
        subtasks: actionPlan?.subtasks
          ? {
              create: actionPlan.subtasks.map((s: any) => ({
                title: s.title,
                description: s.description || "",
                estimatedHours: Number(s.estimatedHours) || 1,
                priority: s.priority || "Medium",
              })),
            }
          : undefined,
        scheduleItems: actionPlan?.schedule
          ? {
              create: actionPlan.schedule.map((sc: any) => ({
                day: sc.day,
                date: sc.date,
                hoursAllocated: Number(sc.hoursAllocated) || 1,
                plan: sc.plan,
                completed: sc.completed || false,
              })),
            }
          : undefined,
        actionPlan: actionPlan?.risk
          ? {
              create: {
                riskScore: Number(actionPlan.risk.riskScore) || 0,
                riskLevel: actionPlan.risk.riskLevel || "Low",
                reason: actionPlan.risk.reason || "",
                suggestions: actionPlan.risk.suggestions || [],
                isEmergency: actionPlan.risk.isEmergency || false,
                emergencyPlan: actionPlan.risk.emergencyPlan || null,
                generatedAt: actionPlan.generatedAt ? BigInt(actionPlan.generatedAt) : BigInt(Date.now()),
              },
            }
          : undefined,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/tasks:", error);
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 });
  }
}
