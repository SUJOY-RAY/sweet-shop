import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sweets = await prisma.sweet.findMany();
    return NextResponse.json(sweets);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch sweets" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const { name, price, category, quantity, imageUrl } = await req.json();

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const sweet = await prisma.sweet.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        quantity: Number(quantity),
        imageUrl,
      },
    });

    return NextResponse.json(sweet, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create sweet" },
      { status: 500 }
    );
  }
}

