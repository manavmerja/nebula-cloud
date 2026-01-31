import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb'; // 👈 Imports your file

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Destructure the fields we want to save
    const { nodes, edges, name } = body;

    // 1. Validate ID format (MongoDB IDs must be 24 hex characters)
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Project ID format" },
        { status: 400 }
      );
    }

    // 2. Connect to the Client
    const client = await clientPromise;
    const db = client.db(); // Uses the database name from your connection string

    console.log(`[API] Saving Project via Native Driver: ${id}`);

    // 3. Update the Document
    // We use $set to only update specific fields and update 'updatedAt' manually
    const result = await db.collection("projects").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          nodes,
          edges,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project saved successfully"
    });

  } catch (error) {
    console.error("[API] Save Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}