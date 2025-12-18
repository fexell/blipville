import { io } from "socket.io-client";
import { SERVER_URL } from "../utils/constants";

export function useSocket(socketRef, handlers) {
  const initSocket = () => {
    const socket = io(SERVER_URL, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("joinRoom", { room: "main" }));
    socket.on("localUser", ({ id }) => { socketRef.current.userId = id });

    if (handlers) {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.on(event, handler);
      });
    }

    return socket;
  };

  return { initSocket };
}
