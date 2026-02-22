// app/api/users/[userId]/route.js (App Router)
// OR
// pages/api/users/[userId].js (Pages Router)

import dbConnect from "@/lib/db";
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
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // Find the user by ID
    const user = await User.findById(userId)
      .select("name email avatar role")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}