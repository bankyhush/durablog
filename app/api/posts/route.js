import { NextResponse } from "next/server";
import prisma from "@/database/prisma";

// GET /api/posts
export async function GET() {
  try {
    const posts = await prisma.blogpost.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts
export async function POST(req) {
  try {
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Field is required" },
        { status: 400 }
      );
    }

    const existingPost = await prisma.blogpost.findFirst({
      where: { title },
    });

    if (existingPost) {
      return NextResponse.json(
        { success: false, message: "A post with this title already exists" },
        { status: 409 }
      );
    }

    const post = await prisma.blogpost.create({
      data: { title, content },
    });

    return NextResponse.json(
      { success: true, message: "Post created successfully", data: post },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
