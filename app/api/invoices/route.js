import dbConnect from "@/lib/db";
import Invoice from "@/models/Invoice";
import Project from "@/models/Project";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import { cookies } from "next/headers";
import path from "path";
import { uploadToB2 } from "@/lib/uploadFile";

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
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    const description = formData.get("description");
    const projectId = formData.get("project");
    const amount = formData.get("amount");

    if (!file || !projectId) {
      return NextResponse.json(
        { error: "Missing file or project" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Ensure uploadDir exists (handled by run_command previously but good to be safe)
    // await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, filename), buffer);
    const fileUrl = `/uploads/${filename}`;

    // Wait, schema says required. I'll just put the Project's creator (usually admin).
    const project = await Project.findById(projectId);
    let receiverId = project.createdBy; // Default to project creator (Admin)

    if (user.role === "admin") {
      // receiverId = user.id; // Self assign if admin for now to avoid error
      if (!project.assignedContractors || project.assignedContractors.length === 0) {
        return NextResponse.json(
          { error: "No contractors assigned to this project" },
          { status: 400 },
        );
      }
      receiverId = project.assignedContractors.map(c => c._id);
    }

    const newInvoice = await Invoice.create({
      project: projectId,
      sender: user.id,
      receiver: receiverId,
      fileUrl,
      description,
      amount: amount || 0,
      status: "pending", // Default
    });

    return NextResponse.json(
      { message: "Invoice submitted", invoice: newInvoice },
      { status: 201 },
    );
  } catch (error) {
    console.error("Invoice Upload Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// export async function POST(req) {
//   try {
//     await dbConnect();
//     const user = await getUser();
//     if (!user)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const formData = await req.formData();
//     const file = formData.get("file");
//     const description = formData.get("description");
//     const projectId = formData.get("project");
//     const amount = formData.get("amount");

//     if (!file || !projectId) {
//       return NextResponse.json(
//         { error: "Missing file or project" },
//         { status: 400 },
//       );
//     }

//     // Upload to Backblaze B2 using shared function
//     const { url: fileUrl } = await uploadToB2(file, "invoices"); // Use 'invoices' folder

//     // Get project and determine receiver
//     const project = await Project.findById(projectId);
//     let receiverId = project.createdBy;

//     if (user.role === "admin") {
//       receiverId = user.id;
//     }

//     // Create invoice with B2 URL
//     const newInvoice = await Invoice.create({
//       project: projectId,
//       sender: user.id,
//       receiver: receiverId,
//       fileUrl, // This is now a Backblaze B2 URL
//       description,
//       amount: amount || 0,
//       status: "pending",
//     });

//     return NextResponse.json(
//       {
//         message: "Invoice submitted",
//         invoice: newInvoice,
//       },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("Invoice Upload Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let query = {};

    if (user.role === "client") {
      query.sender = user.id;
    } else if (user.role === "contractor") {
      query.sender = user.id;
      // Also maybe invoices sentenced TO them?
      // "can send invoice to contractor" -> query.$or = [{sender: user.id}, {receiver: user.id}]
      // query = { $or: [{ sender: user.id }, { receiver: user.id }] };
       query = { 
        $or: [
          { sender: user.id }, 
          { receiver: user.id } // ✅ Check in array
        ] 
      };
    }
    // Admin sees all

    const invoices = await Invoice.find(query)
      .populate("sender", "name email role")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Get Invoices Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
