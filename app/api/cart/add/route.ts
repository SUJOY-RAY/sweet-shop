import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sweetId, quantity } = body;

        if (!sweetId || quantity <= 0) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = decoded.id;

        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: true },
            });
        }

        const existingItem = cart.items.find((item) => item.sweetId === sweetId);

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    sweetId,
                    quantity,
                },
            });
        }

        return NextResponse.json({ success: true, message: "Sweet added to cart" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
    }
}
