import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper to get user
async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    console.log("The recieved data is: ", body);

    // Validate required fields (simplified)
    if (!body.title || !body.clientDetails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Handle Client Finding/Creation
    let clientId = body.clientDetails;

    if (body.clientDetails && body.clientDetails.email) {
      const { name, email, phone } = body.clientDetails;
      let existingUser = await User.findOne({ email });

      if (!existingUser) {
        // Create new client user if not exists
        const tempPassword = Math.random().toString(36).slice(-8); // Random temp password
        // In real app, we'd enable the "invite" flow properly, but here we just create user
        // to satisfy the foreign key constraint.
        existingUser = await User.create({
          email,
          name: name || email.split("@")[0],
          role: "client",
          password: "temp_password_placeholder", // Should hash this if we use it, strictly.
          // But since they need to register, maybe we mark them as 'pending_invite' status if we had that field.
          // For now, let's just creating them is enough to link.
          phone: phone,
        });
      }
      clientId = existingUser._id;
    }

    if (!clientId) {
      return NextResponse.json(
        { error: "Client identification failed" },
        { status: 400 },
      );
    }

    const newProject = await Project.create({
      ...body,
      client: clientId,
      createdBy: user.id,
      // Ensure assignedContractors is array of IDs
    });

    return NextResponse.json(
      { message: "Project created", project: newProject },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    let query = {};

    // Contextual access control
    if (user.role === "client") {
      query.client = user.id;
    } else if (user.role === "contractor") {
      query.assignedContractors = user.id;
    }
    // Admin sees all, or can filter

    if (status && status !== "All Projects") {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate("client", "name email avatar")
      .populate("assignedContractors", "name email avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
