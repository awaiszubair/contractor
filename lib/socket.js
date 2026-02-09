// lib/socket.js
import io from "socket.io-client";

class SocketSingleton {
  constructor() {
    this.socket = null;
  }

  getSocket() {
    if (!this.socket) {
      console.log("Creating socket instance");

      this.socket = io(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        {
          path: "/api/socket/io",
          addTrailingSlash: false,
          // Now WebSocket will work!
          transports: ["websocket", "polling"],
          upgrade: true,
          rememberUpgrade: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 10,
        },
      );

      this.socket.on("connect", () => {
        console.log("✅ Socket connected:", this.socket.id);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("⚠️  Connection error:", error.message);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

const socketSingleton = new SocketSingleton();

export default socketSingleton;
