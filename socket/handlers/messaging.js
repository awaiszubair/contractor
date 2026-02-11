const registerMessagingHandlers = (io, socket) => {
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
};

module.exports = { registerMessagingHandlers };
