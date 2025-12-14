import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; 
  const id = Number(params.id);

  try {
    const { name, price, category, imageUrl } = await req.json();

    const updated = await prisma.sweet.update({
      where: { id },
      data: { name, price: Number(price), category, imageUrl },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Sweet not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; 
  const id = Number(params.id);

  try {
    await prisma.sweet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Sweet not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
