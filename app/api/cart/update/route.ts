import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PUT(req: Request) {
  try {
    const { cartItemId, quantity: newQty } = await req.json();
    if (!cartItemId || newQty <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const userId = decoded.id;

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        sweet: true,
        cart: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const oldQty = item.quantity;
    const diff = newQty - oldQty;

    // Check stock if increasing
    if (diff > 0 && item.sweet.quantity < diff) {
      return NextResponse.json(
        { error: "Not enough stock" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      // update sweet stock
      prisma.sweet.update({
        where: { id: item.sweetId },
        data: {
          quantity: {
            increment: -diff, // negative diff adds back stock
          },
        },
      }),

      // update cart item
      prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity: newQty,
          price: item.sweet.price * newQty,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
