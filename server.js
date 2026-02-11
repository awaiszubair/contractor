const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    allowUpgrades: true,
  });

  // Track online users: Map of userId -> socketId
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    // Send current online users to the newly connected client
    socket.emit("online_users_list", Array.from(onlineUsers.keys()));
    console.log("📋 Sent online users list:", Array.from(onlineUsers.keys()));

    // Join personal room
    socket.on("join_personal_room", (userId) => {
      const roomId = `user_${userId}`;
      socket.join(roomId);

      // Track user as online
      if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
      onlineUsers.get(userId).add(socket.id);

      console.log(
        `📍 ${userId} joined, sockets:`,
        Array.from(onlineUsers.get(userId)),
      );

      // Broadcast to ALL clients that this user is online
      io.emit("user_online", userId);
      console.log(`✅ Broadcasting: User ${userId} is online`);
    });

    // Join chat room
    socket.on("join_chat_room", (roomId) => {
      socket.join(roomId);
      console.log(`💬 Joined chat room: ${roomId}`);
    });

    socket.on("private_message", (data) => {
      console.log("📨 Received private_message for room:", data.roomId);

      // Broadcast to chat room
      if (data.roomId) {
        socket.to(data.roomId).emit("new_message", data);
        console.log(`✉️  Emitted to chat room: ${data.roomId}`);
      }

      // Broadcast to receiver's personal room
      if (data.receiver) {
        const receiverId =
          typeof data.receiver === "object" ? data.receiver._id : data.receiver;
        const personalRoom = `user_${receiverId}`;
        socket.to(personalRoom).emit("new_message", data);
        console.log(`✉️  Emitted to personal room: ${personalRoom}`);
      }
    });

    // Handle typing indicator
    socket.on("typing", ({ userId, receiverId }) => {
      console.log(`⌨️  User ${userId} is typing to ${receiverId}`);

      // Send typing event to receiver's personal room
      const receiverRoom = `user_${receiverId}`;
      socket.to(receiverRoom).emit("user_typing", { userId, receiverId });
      console.log(`✉️  Sent typing indicator to ${receiverRoom}`);
    });

    // Handle stop typing
    socket.on("stop_typing", ({ userId, receiverId }) => {
      console.log(`⌨️  User ${userId} stopped typing to ${receiverId}`);

      // Send stop typing event to receiver's personal room
      const receiverRoom = `user_${receiverId}`;
      socket
        .to(receiverRoom)
        .emit("user_stopped_typing", { userId, receiverId });
      console.log(`✉️  Sent stop typing indicator to ${receiverRoom}`);
    });

    // Handle message delivered status
    socket.on("message_delivered", ({ messageId, senderId }) => {
      console.log(
        `📬 Message ${messageId} delivered, notifying sender ${senderId}`,
      );

      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) {
        for (const sid of senderSockets) {
          io.to(sid).emit("message_delivered", { messageId });
        }
      }
    });

    // Handle message read status
    socket.on("message_read", ({ messageId, senderId }) => {
      console.log(`👁️ Message ${messageId} read, notifying sender ${senderId}`);

      // Notify the sender that their message was read
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) {
        for (const sid of senderSockets) {
          io.to(sid).emit("message_read", { messageId });
        }
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Client disconnected:", socket.id, "Reason:", reason);

      for (const [userId, socketSet] of onlineUsers.entries()) {
        if (socketSet.has(socket.id)) {
          socketSet.delete(socket.id);
          if (socketSet.size === 0) {
            onlineUsers.delete(userId);
            io.emit("user_offline", userId);
          }
          break;
        }
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`🔌 Socket.IO server running`);
    });
});
