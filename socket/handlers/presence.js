// const { addUser, removeSocket, getAllUserIds } = require("../onlineUsers");

// const registerPresenceHandlers = (io, socket) => {
//   // Send current online users to the newly connected client
//   socket.emit("online_users_list", getAllUserIds());
//   console.log("📋 Sent online users list:", getAllUserIds());

//   socket.on("join_personal_room", (userId) => {
//     const roomId = `user_${userId}`;
//     socket.join(roomId);

//     addUser(userId, socket.id);

//     const { getSocketIds } = require("../onlineUsers");
//     console.log(
//       `📍 ${userId} joined, sockets:`,
//       Array.from(getSocketIds(userId)),
//     );

//     io.emit("user_online", userId);
//     console.log(`✅ Broadcasting: User ${userId} is online`);
//   });

//   socket.on("join_chat_room", (roomId) => {
//     socket.join(roomId);
//     console.log(`💬 Joined chat room: ${roomId}`);
//   });

//   socket.on("disconnect", (reason) => {
//     console.log("❌ Client disconnected:", socket.id, "Reason:", reason);

//     const offlineUserId = removeSocket(socket.id);
//     if (offlineUserId) {
//       io.emit("user_offline", offlineUserId);
//     }
//   });
// };

// module.exports = { registerPresenceHandlers };

const { addUser, removeSocket, getAllUserIds } = require("../onlineUsers");

const registerPresenceHandlers = (io, socket) => {
  // ✅ DON'T send online users list here anymore
  // We'll send it AFTER the user joins their room

  socket.on("join_personal_room", (userId) => {
    const roomId = `user_${userId}`;
    socket.join(roomId);

    // ✅ Add user FIRST
    addUser(userId, socket.id);

    const { getSocketIds } = require("../onlineUsers");
    console.log(
      `📍 ${userId} joined, sockets:`,
      Array.from(getSocketIds(userId)),
    );

    // ✅ THEN send the online users list to this specific user
    // Now the list will include everyone (including other users who are online)
    socket.emit("online_users_list", getAllUserIds());
    console.log(`📋 Sent online users list to ${userId}:`, getAllUserIds());

    // ✅ Broadcast to OTHERS that this user is online
    socket.broadcast.emit("user_online", userId);
    console.log(`✅ Broadcasting: User ${userId} is online`);
  });

  socket.on("join_chat_room", (roomId) => {
    socket.join(roomId);
    console.log(`💬 Joined chat room: ${roomId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, "Reason:", reason);

    const offlineUserId = removeSocket(socket.id);
    if (offlineUserId) {
      io.emit("user_offline", offlineUserId);
      console.log(`📣 Broadcasting: User ${offlineUserId} is offline`);
    }
  });
};

module.exports = { registerPresenceHandlers };
