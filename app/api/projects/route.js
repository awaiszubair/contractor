import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import { verifyToken, signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { cookies } from "next/headers";

// Helper to get user
async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}


// Flow: Client email -> project create
// export async function POST(req) {
//   try {
//     await dbConnect();
//     const user = await getUser();
//     if (!user || user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
//     }

//     const body = await req.json();
//     console.log("The recieved data is: ", body);

//     // Validate required fields (simplified)
//     if (!body.title) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 },
//       );
//     }

//     // Handle Client Finding/Creation
//     const { clientDetails, ...projectData } = body;

//     let clientId = null;

//     if (clientDetails && clientDetails.email) {
//       const { name, email, phone } = clientDetails;
//       let existingUser = await User.findOne({ email });

//       if (!existingUser) {
//         // Create new client user if not exists
//         // const tempPassword = Math.random().toString(36).slice(-8); // Random temp password
//         // In real app, we'd enable the "invite" flow properly, but here we just create user
//         // to satisfy the foreign key constraint.
//         // existingUser = await User.create({
//         //   email,
//         //   name: name || email.split("@")[0],
//         //   role: "client",
//         //   password: "temp_password_placeholder", // Should hash this if we use it, strictly.
//         //   // But since they need to register, maybe we mark them as 'pending_invite' status if we had that field.
//         //   // For now, let's just creating them is enough to link.
//         //   phone: phone,
//         // });
//         const inviteToken = signToken({ name, email, phone, role: "client" });
//         const registrationLink = `${process.env.NEXT_PUBLIC_API_URL}/register?token=${inviteToken}`;
//         if (process.env.EMAIL_USER) {
//           await sendEmail({
//             to: email,
//             subject: "You have been invited to Contractor CMS",
//             html: `<p>Hello ${name || "User"},</p><p>You have been invited to join as Client.</p><p><a href="${registrationLink}">Click here to register</a></p>`,
//           });
//         }
//       }
//       else {
//   clientId = existingUser._id;

//   const { title } = projectData;

// const siteUrl = process.env.NEXT_PUBLIC_API_URL;

// if (process.env.EMAIL_USER) {
//   await sendEmail({
//     to: email,
//     subject: "You have been assigned a new project",
//     html: `
//       <p>Hello ${name || "User"},</p>
//       <p>You have been assigned a new project in Contractor CMS.</p>
//       <p><strong>Project Title:</strong> ${title}</p>
//       <p>
//         <a href="${siteUrl}" 
//            style="display:inline-block;padding:10px 15px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">
//            View Dashboard
//         </a>
//       </p>
//     `,
//   });
// }
// }
      
//     }

//     const newProject = await Project.create({
//       ...projectData, // safe project fields only
//       client: clientId, // can be null (allowed)
//       createdBy: user.id,
//       // Ensure assignedContractors is array of IDs
//     });

//     return NextResponse.json(
//       { message: "Project created", project: newProject },
//       { status: 201 },
//     );
//   } catch (error) {
//     console.error("Create Project Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

// Flow: Project created id -> embedd in email link
export async function POST(req) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    console.log("The recieved data is: ", body);

    if (!body.title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { clientDetails, ...projectData } = body;

    let clientId = null;

    // 🔥 STEP 1: First create project (client can be null)
    const newProject = await Project.create({
      ...projectData,
      client: null,
      createdBy: user.id,
    });

    if (clientDetails && clientDetails.email) {
      const { name, email, phone } = clientDetails;
      let existingUser = await User.findOne({ email });

      // 🔹 CASE 1: Client does NOT exist → Send invite WITH projectId
      if (!existingUser) {
        const inviteToken = signToken(
          { name, email, phone, role: "client", projectId: newProject._id },
          "3d"
        );

        const registrationLink = `${process.env.NEXT_PUBLIC_API_URL}/register?token=${inviteToken}`;

        if (process.env.EMAIL_USER) {
          await sendEmail({
            to: email,
            subject: "You have been invited to Contractor CMS",
            html: `
              <p>Hello ${name || "User"},</p>
              <p>You have been invited to join as Client.</p>
              <p><strong>Project Title:</strong> ${newProject.title}</p>
              <p>
                <a href="${registrationLink}">
                  Click here to register
                </a>
              </p>
            `,
          });
        }
      }

      // 🔹 CASE 2: Client already exists → assign project immediately
      else {
        clientId = existingUser._id;

        await Project.findByIdAndUpdate(newProject._id, {
          client: clientId,
        });

        const siteUrl = process.env.NEXT_PUBLIC_API_URL;

        if (process.env.EMAIL_USER) {
          await sendEmail({
            to: email,
            subject: "You have been assigned a new project",
            html: `
              <p>Hello ${name || "User"},</p>
              <p>You have been assigned a new project in Contractor CMS.</p>
              <p><strong>Project Title:</strong> ${newProject.title}</p>
              <p>
                <a href="${siteUrl}" 
                   style="display:inline-block;padding:10px 15px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">
                   View Dashboard
                </a>
              </p>
            `,
          });
        }
      }
    }

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
