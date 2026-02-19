// import dbConnect from '@/lib/db';
// import User from '@/models/User';
// import { hashPassword, verifyToken, signToken, setCookie } from '@/lib/auth';
// import { NextResponse } from 'next/server';

// export async function POST(req) {
//     try {
//         await dbConnect();
//         const { token, password, name, phone, description } = await req.json();

//         if (!token || !password) {
//             return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
//         }

//         const decoded = verifyToken(token);
//         if (!decoded) {
//             return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
//         }

//         const { email, role, name: decodedName } = decoded;

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return NextResponse.json({ error: 'User already exists' }, { status: 400 });
//         }

//         const hashedPassword = await hashPassword(password);

//         const newUser = await User.create({
//             email,
//             password: hashedPassword,
//             role: role || 'client',
//             name: name || decodedName || 'New User',
//             phone,
//             description,
//         });

//         // Auto login
//         const sessionToken = signToken({ id: newUser._id, role: newUser.role, email: newUser.email });

//         const response = NextResponse.json({
//             message: 'Registration successful',
//             user: {
//                 id: newUser._id,
//                 name: newUser.name,
//                 email: newUser.email,
//                 role: newUser.role,
//             },
//         });

//         setCookie(response, sessionToken);

//         return response;

//     } catch (error) {
//         console.error('Register error:', error);
//         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//     }
// }

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project"; // ← add this import
import { hashPassword, verifyToken, signToken, setCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await dbConnect();

    const { token, password, name, phone, description } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const {
      email,
      role,
      name: decodedName,
      phone: decodedPhone,
      description: decodedDescription,
      projectId, // ← new field we added in invite token
    } = decoded;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || "client",
      name: name || decodedName || "New User",
      phone: phone || decodedPhone || "",
      description: description || decodedDescription || "",
    });

    // ────────────────────────────────────────────────
    //     AUTO-ASSIGN TO PROJECT IF INVITED FOR ONE
    // ────────────────────────────────────────────────
    if (projectId && ["client", "contractor"].includes(newUser.role)) {
      try {
        const project = await Project.findById(projectId);

        if (project) {
          if (newUser.role === "client") {
            // Client is singular → we replace / set it
            // (you can add logic to warn if already assigned if you want)
            project.client = newUser._id;
          } else if (newUser.role === "contractor") {
            // Contractors are multiple → add if not already present
            if (!project.assignedContractors.includes(newUser._id)) {
              project.assignedContractors.push(newUser._id);
            }
          }

          await project.save();
          console.log(
            `User ${newUser._id} auto-assigned to project ${projectId} as ${newUser.role}`,
          );
        } else {
          console.warn(`Project ${projectId} not found during registration`);
        }
      } catch (assignErr) {
        console.error("Failed to auto-assign user to project:", assignErr);
        // We don't fail registration — just log
      }
    }

    // Auto login
    const sessionToken = signToken({
      id: newUser._id,
      role: newUser.role,
      email: newUser.email,
    });

    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

    setCookie(response, sessionToken);

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
