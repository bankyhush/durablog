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
      { success: false, message: "Delete Internal Server Error" },
      { status: 500 }
    );
  }
}

// UPDATE

export async function PUT(req, { params }) {
  const { id } = await params;
  const { title, content } = await req.json();

  try {
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Invalid Blogpost" },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 404 }
      );
    }

    const updatedPost = await prisma.blogpost.update({
      where: { id: Number(id) },
      data: { title, content },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("UPDATE Error:", error);
    return NextResponse.json(
      { success: false, message: "Update Internal Server Error" },
      { status: 500 }
    );
  }
}
