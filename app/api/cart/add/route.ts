import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { sweetId, quantity } = await req.json();

    if (!sweetId || quantity <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "USER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = decoded.id;

    const sweet = await prisma.sweet.findUnique({
      where: { id: sweetId },
    });

    if (!sweet) {
      return NextResponse.json({ error: "Sweet not found" }, { status: 404 });
    }

    if (sweet.quantity < quantity) {
      return NextResponse.json(
        { error: "Not enough stock" },
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        sweetId,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.sweet.update({
        where: { id: sweetId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
            price: sweet.price * (existingItem.quantity + quantity),
          },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            sweetId,
            quantity,
            price: sweet.price * quantity,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Sweet added to cart",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}
