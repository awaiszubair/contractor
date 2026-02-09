import { Server } from "socket.io";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = async (req, res) => {
  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io*");

    const io = new Server(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      // Join project room
      socket.on("join_project", (projectId) => {
        socket.join(projectId);
        console.log(`User joined project room: ${projectId}`);
      });

      // Handle sending message
      socket.on(
        "---------------------send_message---------------------",
        async (data) => {
          console.log("Send Message event is firing", data);
          // Data: { senderId, projectId, content, type, fileUrl }
          // We save to DB here or via API?
          // Usually better to save to DB then emit.
          // But to be fast, we can emit then save or save then emit.

          try {
            // We'll trust the client to call the API to save, and just use socket for notification?
            // Or socket handles saving.
            // Let's have socket handle distribution, but maybe API saves it.
            // Logic: Client POST /api/messages -> API saves -> API emits via res.socket.server.io
            // This is cleaner for auth and validation.
            // IF we accept message via socket directly:
            // console.log('Socket received message:', data);
            // io.to(data.projectId).emit('receive_message', data);
          } catch (e) {
            console.error(e);
          }
        },
      );

      socket.on("private_message", (data) => {
        console.log(
          "--------------------Received private message:---------------------",
          data,
        );
        // Broadcast to the chat room (for users actively viewing the chat)
        if (data.roomId) {
          console.log("::::::::Emitting to chat room:::::::", data.roomId);
          socket.to(data.roomId).emit("new_message", data);
        }

        // Also broadcast to receiver's personal room (for delivery even when not viewing)
        if (data.receiver) {
          console.log(
            "::::::::Emitting to receiver's personal room:::::::",
            data.receiver,
          );
          const receiverId =
            typeof data.receiver === "object"
              ? data.receiver._id
              : data.receiver;
          socket.to(`user_${receiverId}`).emit("new_message", data);
        }
      });
    });
  } else {
    console.log("socket.io already running");
  }
  res.end();
};

export default ioHandler;
