import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PUT(req: Request) {
  try {
    const { cartItemId, quantity } = await req.json();
    if (!cartItemId || quantity <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { sweet: true } } },
    });
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    const item = cart.items.find(i => i.id === cartItemId);
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity,
        price: item.sweet.price * quantity,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
