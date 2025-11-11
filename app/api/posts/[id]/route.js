import { NextResponse } from "next/server";
import prisma from "@/database/prisma";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Blogpost not found" },
        { status: 400 }
      );
    }

    await prisma.blogpost.delete({ where: { id: Number(id) } });

    return NextResponse.json(
      { success: true, message: "Blogpost deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
