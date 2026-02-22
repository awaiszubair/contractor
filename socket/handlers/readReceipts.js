const { getSocketIds } = require("../onlineUsers");

const registerReadReceiptHandlers = (io, socket) => {
  socket.on("message_delivered", ({ messageId, senderId }) => {
    console.log(
      `📬 Message ${messageId} delivered, notifying sender ${senderId}`,
    );

    const senderSockets = getSocketIds(senderId);
    for (const sid of senderSockets) {
      io.to(sid).emit("message_delivered", { messageId });
    }
  });

  socket.on("message_read", ({ messageId, senderId }) => {
    console.log(`👁️ Message ${messageId} read, notifying sender ${senderId}`);

    const senderSockets = getSocketIds(senderId);
    for (const sid of senderSockets) {
      io.to(sid).emit("message_read", { messageId });
    }
  });
};

module.exports = { registerReadReceiptHandlers };
