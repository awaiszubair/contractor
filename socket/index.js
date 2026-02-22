const { Server } = require("socket.io");
const { registerPresenceHandlers } = require("./handlers/presence");
const { registerMessagingHandlers } = require("./handlers/messaging");
const { registerTypingHandlers } = require("./handlers/typing");
const { registerReadReceiptHandlers } = require("./handlers/readReceipts");

const initSocket = (httpServer) => {
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

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    registerPresenceHandlers(io, socket);
    registerMessagingHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerReadReceiptHandlers(io, socket);
  });

  return io;
};

module.exports = { initSocket };
