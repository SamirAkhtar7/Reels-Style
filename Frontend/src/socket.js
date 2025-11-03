import { io } from "socket.io-client";
let socket = null;
export function getSocket(userId) {
  if (!socket) {
    const serverUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
    socket = io(serverUrl, { withCredentials: true });
    socket.on("connect", () => {
      if (userId) {
        socket.emit("identify", { userId });
      }
    });
  }
  return socket;
}
