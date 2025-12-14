import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sweetId, quantity } = body;

    if (!sweetId || !quantity || quantity < 1) {
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

    const sweet = await prisma.sweet.findUnique({ where: { id: sweetId } });
    if (!sweet || sweet.quantity < quantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          total: sweet.price * quantity,
          status: "PENDING", 
          items: {
            create: {
              sweetId,
              quantity,
              price: sweet.price * quantity,
            },
          },
        },
      });

      await tx.sweet.update({
        where: { id: sweetId },
        data: { quantity: { decrement: quantity } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /order error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
