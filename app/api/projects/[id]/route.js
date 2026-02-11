import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const project = await Project.findById(id)
      .populate("client", "name email phone description avatar")
      .populate("assignedContractors", "name email phone avatar")
      .populate("createdBy", "name");

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Access control
    if (user.role === "client" && project.client._id.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (
      user.role === "contractor" &&
      !project.assignedContractors.some((c) => c._id.toString() === user.id)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Get Project Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const user = await getUser();

    // Only admin can update for now (assign contractors, change status)
    // Client/Contractor might update specific fields in future but strictly admin for assignment
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const project = await Project.findById(id);

    // If assigning contractor (email provided)
    if (body.assignContractorEmail) {
      const contractor = await User.findOne({
        email: body.assignContractorEmail,
        role: "contractor",
      });
      if (!contractor) {
        return NextResponse.json(
          { error: "Contractor not found with that email" },
          { status: 404 },
        );
      }
      // Add to assignedContractors if not already

      if (!project.assignedContractors.includes(contractor._id)) {
        project.assignedContractors.push(contractor._id);
        await project.save();
        return NextResponse.json({ message: "Contractor assigned", project });
      }
      return NextResponse.json({
        message: "Contractor already assigned",
        project,
      });
    }

    // Remove Contractor
    if (body.removeContractorEmail) {
      const contractor = await User.findOne({
        email: body.removeContractorEmail,
        role: "contractor",
      });
      if (!contractor) {
        return NextResponse.json(
          { error: "Contractor not found with that email" },
          { status: 404 },
        );
      }
      project.assignedContractors = project.assignedContractors.filter(
        (cId) => cId.toString() !== contractor._id.toString(),
      );
      await project.save();
      const populatedProject = await Project.findById(id)
        .populate("client", "name email")
        .populate("assignedContractors", "name email");
      return NextResponse.json({
        message: "Contractor removed",
        project: populatedProject,
      });
    }

    // General Update
    const updatedProject = await Project.findByIdAndUpdate(id, body, {
      new: true,
    })
      .populate("client", "name email")
      .populate("assignedContractors", "name email");

    return NextResponse.json({
      message: "Project updated",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update Project Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!["Draft", "Pending", "Active", "Completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    )
      .populate("client", "name email")
      .populate("assignedContractors", "name email");

    return NextResponse.json({
      message: "Status updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
