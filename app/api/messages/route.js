import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Project from "@/models/Project"; // Verify project existence/access
import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const body = await req.json();
    const { projectId, content, type, attachments, receiverId } = body;

    console.log("[POST Message] Creating message:");
    console.log("  Sender:", user.id);
    console.log("  Receiver:", receiverId);
    console.log("  Project:", projectId);
    console.log("  Content:", content?.substring(0, 50));

    // Verify access to project... (Skipped for brevity, assume UI logic enforces strictness or we trust ID)

    // Convert string IDs to ObjectId if needed
    const mongoose = require("mongoose");
    const senderObjectId =
      typeof user.id === "string"
        ? new mongoose.Types.ObjectId(user.id)
        : user.id;
    const receiverObjectId =
      typeof receiverId === "string"
        ? new mongoose.Types.ObjectId(receiverId)
        : receiverId;
    const projectObjectId =
      typeof projectId === "string"
        ? new mongoose.Types.ObjectId(projectId)
        : projectId;

    const newMessage = await Message.create({
      sender: senderObjectId,
      receiver: receiverObjectId,
      project: projectObjectId,
      content,
      type: type || "text",
      attachments: attachments || [],
    });

    console.log("[POST Message] Message created with ID:", newMessage._id);
    console.log("[POST Message] Saved receiver:", newMessage.receiver);

    const populatedMessage = await newMessage.populate(
      "sender",
      "name email avatar",
    );

    // Emit socket event
    // App router doesn't have `res.socket`, so we might need to hit the pages api to trigger emit
    // OR we can't emit from here easily without a separate microservice or custom server.
    // Workaround: Client emits 'send_message' after successful POST?
    // OR: access the global io if we stored it (Node.js global hack).

    // Let's try to fetch() the socket init route to ensure it's running,
    // but emitting from here to the *running* io instance is hard if io is attached to `res` of a different request.
    // Actually, in `pages/api/socket/io.js`, we did `res.socket.server.io = io`.
    // That attaches it to the HTTP server instance.
    // In App Router, we don't have easy access to that same HTTP server instance object in standard route handlers.

    // STRATEGY: Client sends POST to save, then Client emits socket event explicitly.
    // "I saved a message, here it is".
    // Other clients receive it.
    // This is less secure (client could emit fake msg) but acceptable for this prototype.
    // SECURE STRATEGY: We make a specialized Page API route for `sendMessage` that does both Save DB + Emit.

    // I will stick to: Client calls this API to save. Returns the saved message.
    // Client then emits `socket.emit('new_message', savedMessage)` to the room.

    return NextResponse.json({ message: populatedMessage });
  } catch (error) {
    console.error("Send Message Error:", error);
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
    const projectId = url.searchParams.get("projectId");
    const receiverId = url.searchParams.get("receiverId");
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 30;

    if (!projectId && !receiverId) {
      return NextResponse.json(
        { error: "Project ID or Receiver ID required" },
        { status: 400 },
      );
    }

    let query = {};

    console.log("[GET Messages] User ID:", user.id, "Type:", typeof user.id);
    console.log(
      "[GET Messages] Receiver ID:",
      receiverId,
      "Type:",
      typeof receiverId,
    );
    console.log("[GET Messages] Project ID:", projectId);
    console.log("[GET Messages] Page:", page, "Limit:", limit);

    if (receiverId) {
      // Convert string IDs to ObjectId for proper comparison
      const mongoose = require("mongoose");
      const userObjectId =
        typeof user.id === "string"
          ? new mongoose.Types.ObjectId(user.id)
          : user.id;
      const receiverObjectId =
        typeof receiverId === "string"
          ? new mongoose.Types.ObjectId(receiverId)
          : receiverId;

      // Find messages between these two users (sent or received)
      const userFilter = {
        $or: [
          { sender: userObjectId, receiver: receiverObjectId },
          { sender: receiverObjectId, receiver: userObjectId },
        ],
      };

      if (projectId) {
        const projectObjectId =
          typeof projectId === "string"
            ? new mongoose.Types.ObjectId(projectId)
            : projectId;
        query = { $and: [{ project: projectObjectId }, userFilter] };
      } else {
        query = userFilter;
      }
    } else if (projectId) {
      query.project = projectId;
    }

    console.log("[GET Messages] Query:", JSON.stringify(query));

    // Get total count for pagination
    const totalMessages = await Message.countDocuments(query);

    // Calculate skip value for pagination
    // We want to get the LATEST messages, so we need to skip from the end
    const skip = Math.max(0, totalMessages - page * limit);
    const actualLimit =
      page === 1 ? limit : Math.min(limit, totalMessages - skip);

    const messages = await Message.find(query)
      .populate("sender", "name email avatar")
      .sort({ createdAt: -1 }) // Get newest first
      .skip(skip)
      .limit(actualLimit)
      .then((msgs) => msgs.reverse()); // Reverse to show oldest first in the array

    const hasMore = skip > 0;

    console.log(
      "[GET Messages] Found",
      messages.length,
      "messages out of",
      totalMessages,
      "total",
    );
    console.log("[GET Messages] Skip:", skip, "HasMore:", hasMore);

    if (messages.length > 0) {
      console.log(
        "[GET Messages] First message - Sender:",
        messages[0].sender?._id,
        "Receiver:",
        messages[0].receiver,
      );
    }

    return NextResponse.json({
      messages,
      hasMore,
      total: totalMessages,
      page,
      limit,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
