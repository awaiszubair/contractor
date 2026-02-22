const registerTypingHandlers = (io, socket) => {
  socket.on("typing", ({ userId, receiverId }) => {
    console.log(`⌨️  User ${userId} is typing to ${receiverId}`);

    const receiverRoom = `user_${receiverId}`;
    socket.to(receiverRoom).emit("user_typing", { userId, receiverId });
    console.log(`✉️  Sent typing indicator to ${receiverRoom}`);
  });

  socket.on("stop_typing", ({ userId, receiverId }) => {
    console.log(`⌨️  User ${userId} stopped typing to ${receiverId}`);

    const receiverRoom = `user_${receiverId}`;
    socket.to(receiverRoom).emit("user_stopped_typing", { userId, receiverId });
    console.log(`✉️  Sent stop typing indicator to ${receiverRoom}`);
  });
};

module.exports = { registerTypingHandlers };
