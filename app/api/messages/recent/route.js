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

export async function GET(req) {
  try {
    await dbConnect();
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userObjectId = new mongoose.Types.ObjectId(user.id);

    const messages = await Message.aggregate([
      { $match: { receiver: userObjectId } }, // ✅ use ObjectId
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$sender", latestMessage: { $first: "$$ROOT" } } },
      { $sort: { "latestMessage.createdAt": -1 } },
      { $limit: 5 },
      { $replaceRoot: { newRoot: "$latestMessage" } },
    ]);

    // populate manually after aggregate
    await Message.populate(messages, [
      { path: "sender", select: "name email" },
      { path: "receiver", select: "name email" },
      { path: "project", select: "title" },
    ]);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching recent messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
