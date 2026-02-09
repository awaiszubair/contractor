// server.js
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
      onlineUsers.set(userId, socket.id);

      console.log(`📍 Joined personal room: ${roomId}`);
      console.log(`👥 Total online users: ${onlineUsers.size}`);

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

    socket.on("disconnect", (reason) => {
      console.log("❌ Client disconnected:", socket.id, "Reason:", reason);

      // Find and remove user from online users
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      // Broadcast to ALL clients that this user is offline
      if (disconnectedUserId) {
        io.emit("user_offline", disconnectedUserId);
        console.log(`❌ Broadcasting: User ${disconnectedUserId} is offline`);
        console.log(`👥 Total online users: ${onlineUsers.size}`);
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
