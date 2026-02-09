// import { useEffect, useState } from "react";
// import io from "socket.io-client";

// export const useSocket = () => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "", {
//       path: "/api/socket/io",
//       addTrailingSlash: false,
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: Infinity,
//       transports: ["websocket", "polling"],
//       upgrade: true,
//     });

//     socketInstance.on("connect", () => {
//       setIsConnected(true);

//       console.log("Socket connected");
//     });

//     socketInstance.on("disconnect", () => {
//       setIsConnected(false);
//       console.log("Socket disconnected");
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, []);

//   return { socket, isConnected };
// };

// useSocket.js
import { useEffect, useState } from "react";
import socketSingleton from "@/lib/socket";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socket = socketSingleton.getSocket();

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Set initial state
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // Don't disconnect the singleton
    };
  }, [socket]);

  return { socket, isConnected };
};
