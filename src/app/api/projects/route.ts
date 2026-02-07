import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure ye path sahi ho

export async function GET() {
  try {
    // 1. Check Session (Security)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Connect DB
    const client = await clientPromise;
    const db = client.db();

    // 3. Fetch Projects
    // (Abhi sab projects manga rahe hain, baad me filter laga sakte hain)
    const projects = await db.collection("projects")
      .find({})
      .sort({ updatedAt: -1 }) // Latest pehle
      .toArray();

    return NextResponse.json({ projects });

  } catch (error) {
    console.error("[API_GET_PROJECTS] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Create New Project (POST)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    const client = await clientPromise;
    const db = client.db();

    const newProject = {
      name: name || "Untitled Project",
      nodes: [],
      edges: [],
      userId: session.user?.email, // User Link
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("projects").insertOne(newProject);

    return NextResponse.json({ 
      success: true, 
      projectId: result.insertedId 
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}