const registerMessagingHandlers = (io, socket) => {
  socket.on("private_message", (data) => {
    console.log("📨 Received private_message:", {
      roomId: data.roomId,
      receiver: data.receiver,
      sender: data.sender,
    });

    // ✅ 1. Broadcast to the chat room (both users are in this room)
    if (data.roomId) {
      socket.to(data.roomId).emit("new_message", data);
      console.log(`✉️  Emitted new_message to chat room: ${data.roomId}`);
    }

    // ✅ 2. Broadcast to receiver's personal room (for sidebar updates)
    if (data.receiver) {
      const receiverId =
        typeof data.receiver === "object" ? data.receiver._id : data.receiver;
      const personalRoom = `user_${receiverId}`;

      // Emit to receiver's personal room for real-time sidebar update
      socket.to(personalRoom).emit("private_message", data);
      console.log(
        `✉️  Emitted private_message to personal room: ${personalRoom}`,
      );
    }

    // ✅ 3. Also emit to sender's personal room (for multi-device support)
    if (data.sender) {
      const senderId =
        typeof data.sender === "object" ? data.sender._id : data.sender;
      const senderPersonalRoom = `user_${senderId}`;

      // Emit to sender's other devices/tabs
      socket.to(senderPersonalRoom).emit("private_message", data);
      console.log(
        `✉️  Emitted private_message to sender's personal room: ${senderPersonalRoom}`,
      );
    }
  });
};

module.exports = { registerMessagingHandlers };
