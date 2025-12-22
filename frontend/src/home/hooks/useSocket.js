import { io } from "socket.io-client";
import { SERVER_URL } from "../utils/constants";

export function useSocket(socketRef, playersRef, handlers) {
  const initSocket = () => {
    const socket = io(SERVER_URL, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", { room: "main" });
    });

    socket.on("localUser", ({ id }) => {
      socketRef.current.userId = id;
      if (!playersRef.current) playersRef.current = {};
      playersRef.current.localUserId = id;
      if (handlers?.localUser) handlers.localUser(id);
      socket.emit("initChats");
    });

    socket.on("chatHistory", (history) => {
      if (handlers?.chatHistory) handlers.chatHistory(history);
    });

    if (handlers) {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.on(event, handler);
      });
    }

    return socket;
  };

  const switchRoom = (newRoom) => {
    if (!socketRef.current) return;

    const currentRoom = socketRef.current.currentRoom || "main";
    socketRef.current.emit("leaveRoom", { room: currentRoom });
    socketRef.current.emit("joinRoom", { room: newRoom });

    socketRef.current.currentRoom = newRoom; // store locally
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  return { initSocket, disconnectSocket, switchRoom };
}
