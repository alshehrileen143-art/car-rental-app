import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "لا يمكنك حظر نفسك" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "CUSTOMER") {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (typeof body?.isBlocked !== "boolean") {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isBlocked: body.isBlocked },
    select: { id: true, isBlocked: true },
  });

  return NextResponse.json({ user });
}
