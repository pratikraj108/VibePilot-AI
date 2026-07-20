import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();

    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
      include: { actionPlan: true, subtasks: true, scheduleItems: true },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { actionPlan, ...scalarUpdates } = updates;

    const updatedTask = await prisma.$transaction(async (tx) => {
      const taskRes = await tx.task.update({
        where: { id },
        data: scalarUpdates,
      });

      if (actionPlan) {
        if (actionPlan.schedule) {
          await tx.schedule.deleteMany({ where: { taskId: id } });
          await tx.schedule.createMany({
            data: actionPlan.schedule.map((sc: any) => ({
              taskId: id,
              day: sc.day,
              date: sc.date,
              hoursAllocated: Number(sc.hoursAllocated) || 1,
              plan: sc.plan,
              completed: sc.completed || false,
            })),
          });
        }

        if (actionPlan.subtasks) {
          await tx.subTask.deleteMany({ where: { taskId: id } });
          await tx.subTask.createMany({
            data: actionPlan.subtasks.map((s: any) => ({
              taskId: id,
              title: s.title,
              description: s.description || "",
              estimatedHours: Number(s.estimatedHours) || 1,
              priority: s.priority || "Medium",
            })),
          });
        }

        if (actionPlan.risk) {
          await tx.aIPlan.upsert({
            where: { taskId: id },
            update: {
              riskScore: Number(actionPlan.risk.riskScore) || 0,
              riskLevel: actionPlan.risk.riskLevel || "Low",
              reason: actionPlan.risk.reason || "",
              suggestions: actionPlan.risk.suggestions || [],
              isEmergency: actionPlan.risk.isEmergency || false,
              emergencyPlan: actionPlan.risk.emergencyPlan || null,
              generatedAt: actionPlan.generatedAt ? BigInt(actionPlan.generatedAt) : BigInt(Date.now()),
            },
            create: {
              taskId: id,
              riskScore: Number(actionPlan.risk.riskScore) || 0,
              riskLevel: actionPlan.risk.riskLevel || "Low",
              reason: actionPlan.risk.reason || "",
              suggestions: actionPlan.risk.suggestions || [],
              isEmergency: actionPlan.risk.isEmergency || false,
              emergencyPlan: actionPlan.risk.emergencyPlan || null,
              generatedAt: actionPlan.generatedAt ? BigInt(actionPlan.generatedAt) : BigInt(Date.now()),
            },
          });
        }
      }

      return taskRes;
    });

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    console.error("Error in PATCH /api/tasks/[id]:", error);
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/tasks/[id]:", error);
    return NextResponse.json({ error: error.message || "Failed to delete task" }, { status: 500 });
  }
}
