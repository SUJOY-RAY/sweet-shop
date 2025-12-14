import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = Number(id);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        sweet: true,
        cart: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.sweet.update({
        where: { id: item.sweetId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      }),

      prisma.cartItem.delete({
        where: { id: itemId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
