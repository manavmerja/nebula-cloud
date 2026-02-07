import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Frontend se ye data aa raha hoga
    const { userId, name, nodes, edges, projectId } = body;
    
    console.log(`[API_SAVE] Saving for: ${userId}`);

    const client = await clientPromise;
    const db = client.db();

    // CASE 1: UPDATE Existing Project
    if (projectId && ObjectId.isValid(projectId)) {
        const result = await db.collection("projects").updateOne(
            { _id: new ObjectId(projectId) },
            { 
              $set: { 
                name, 
                nodes, 
                edges, 
                updatedAt: new Date() 
              } 
            }
        );
        return NextResponse.json({ success: true, projectId, message: "Updated" });
    } 
    
    // CASE 2: CREATE New Project
    else {
        const newProject = {
            userId: userId, // Email (e.g. 24dce...charusat.edu.in)
            name: name || "Untitled Project",
            nodes: nodes || [],
            edges: edges || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await db.collection("projects").insertOne(newProject);
        return NextResponse.json({ success: true, projectId: result.insertedId, message: "Created" });
    }

  } catch (error) {
    console.error("[API_SAVE] Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}