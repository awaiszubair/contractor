// app/api/messages/read/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import { cookies } from "next/headers";
import { verifyToken, signToken } from "@/lib/auth";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function PATCH(req) {
  try {
    await connectDB();
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = user.id;

    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID required" },
        { status: 400 },
      );
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If already read → just return success (IMPORTANT)
    if (message.status === "read") {
      return NextResponse.json({ success: true });
    }

    message.status = "read";
    await message.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 },
    );
  }
}
