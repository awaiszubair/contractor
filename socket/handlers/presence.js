const { addUser, removeSocket, getAllUserIds } = require("../onlineUsers");

const registerPresenceHandlers = (io, socket) => {
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

    // ✅ Send the full online users list to the user who just joined
    // This list includes all currently online users (but not themselves yet in their view)
    const onlineUsersList = getAllUserIds();
    socket.emit("online_users_list", onlineUsersList);
    console.log(`📋 Sent online users list to ${userId}:`, onlineUsersList);

    // ✅ Broadcast to ALL OTHER users that this user is now online
    socket.broadcast.emit("user_online", userId);
    console.log(`✅ Broadcasting to others: User ${userId} is online`);
  });

  socket.on("join_chat_room", (roomId) => {
    socket.join(roomId);
    console.log(`💬 Joined chat room: ${roomId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Client disconnected:", socket.id, "Reason:", reason);

    const offlineUserId = removeSocket(socket.id);
    if (offlineUserId) {
      // ✅ Broadcast to ALL users (including other sessions of same user)
      io.emit("user_offline", offlineUserId);
      console.log(`📣 Broadcasting to all: User ${offlineUserId} is offline`);
    }
  });
};

module.exports = { registerPresenceHandlers };
