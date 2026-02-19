import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Edit or Delete message
export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const messageId = id;
    const { content, attachments, type, action } = await req.json();

    const message = await Message.findById(messageId);
    if (!message)
      return NextResponse.json({ error: "Message not found" }, { status: 404 });

    // Check sender & 40 hours limit
    const fortyHours = 40 * 60 * 60 * 1000;
    if (
      message.sender.toString() !== user.id ||
      Date.now() - new Date(message.createdAt).getTime() > fortyHours
    ) {
      return NextResponse.json(
        { error: "You cannot edit/delete this message" },
        { status: 403 },
      );
    }

    if (action === "delete") {
      message.content = "[Deleted]";
      message.attachments = [];
      message.type = "text";
    } else if (action === "edit") {
      if (content) message.content = content;
      if (attachments) message.attachments = attachments;
      if (type) message.type = type;
    }

    await message.save();

    const populatedMessage = await message.populate("sender", "name avatar");

    return NextResponse.json({ message: populatedMessage });
  } catch (error) {
    console.error("Edit/Delete Message Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
