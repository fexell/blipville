import React, { useEffect, useRef, useState } from "react";
import ChatUI from "./ChatUI";
import { usePixiApp } from "../hooks/usePixiApp";
import { useSocket } from "../hooks/useSocket";
import { createOrUpdatePlayer } from "../hooks/usePlayers";
import { showChatBubble } from "../utils/chatBubble";
import { animateTo } from "../utils/animate";
import { textStyle } from "../utils/constants";
import "../styles/style.css";

export default function Game() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const socketRef = useRef(null);
  const playersRef = useRef({});

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { initPixi } = usePixiApp(canvasRef, appRef);

  // Chat message handler
  const handleChat = ({ id, username, message }) => {
    const localUserId = playersRef.current.localUserId;
    const isLocal = id === localUserId;
    setMessages((m) => [...m, { from: id, name: isLocal ? "You" : username, message }]);

    const p = playersRef.current[id];
    if (p && appRef.current) {
      showChatBubble(appRef.current, p, message, textStyle);
    }
  };

  // Socket init with event handlers
  const { initSocket } = useSocket(socketRef, {
    initPlayers: (players) => {
      players.forEach((p) =>
        createOrUpdatePlayer(
          appRef.current,
          playersRef,
          p.id,
          p,
          p.id === socketRef.current.userId
        )
      );
    },
    playerJoined: (p) => createOrUpdatePlayer(appRef.current, playersRef, p.id, p, false),
    playerMoved: ({ id, x, y }) => {
      const player = playersRef.current[id];
      if (player && !player.isLocal) animateTo(player.container, x, y);
    },
    playerLeft: ({ id }) => {
      const p = playersRef.current[id];
      if (!p || !appRef.current) return;
      appRef.current.stage.removeChild(p.container);
      delete playersRef.current[id];
    },
    chatMessage: handleChat
  });

  // Init PIXI and socket, plus click-to-move
  useEffect(() => {
    let app;
    let socket;
    let clickHandler;

    const setup = async () => {
      app = await initPixi();
      socket = initSocket();

      clickHandler = (ev) => {
        if (!appRef.current || !socketRef.current) return;

        const rect = appRef.current.canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;

        socketRef.current.emit("move", { x, y });

        const localUserId = playersRef.current.localUserId;
        const local = localUserId ? playersRef.current[localUserId] : null;
        if (local) animateTo(local.container, x, y);
      };

      app.canvas.addEventListener("click", clickHandler);
    };

    setup();

    return () => {
      // Cleanup PIXI
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      // Cleanup socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // Clear players and canvas
      playersRef.current = {};
      if (canvasRef.current) canvasRef.current.innerHTML = "";
      // Remove click handler if app was created
      if (app?.canvas && clickHandler) {
        app.canvas.removeEventListener("click", clickHandler);
      }
    };
  }, []); // handlers are registered via useSocket; no re-init on state changes

  const sendChat = () => {
    if (!socketRef.current || !input.trim()) return;

    const localUserId = playersRef.current.localUserId;
    if (localUserId && playersRef.current[localUserId] && appRef.current) {
      showChatBubble(appRef.current, playersRef.current[localUserId], input, textStyle);
    }

    socketRef.current.emit("chat", { message: input });
    setInput("");
  };

  return (
    <div className="game-ui flex flex-row">
      <div className="w-full" ref={canvasRef} />
      <ChatUI
        messages={messages}
        input={input}
        setInput={setInput}
        sendChat={sendChat}
      />
    </div>
  );
}
