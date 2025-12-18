import React, { useEffect, useRef, useState } from "react";
import ChatUI from "./ChatUI";
import { usePixiApp } from "../hooks/usePixiApp";
import { usePixiGame } from "../hooks/usePixiGame";  // ← NEW IMPORT
import { useSocket } from "../hooks/useSocket";
import { createOrUpdatePlayer } from "../hooks/usePlayers";
import { showChatBubble } from "../utils/chatBubble";
import { animateTo } from "../utils/animate";
import { textStyle } from "../utils/constants";
import useAuthStore from '../../auth/stores/Auth.store';
import "../styles/style.css";

export default function Game({ onLogout }) {

  const { userId } = useAuthStore();

  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const socketRef = useRef(null);
  const playersRef = useRef({});

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // PIXI init function
  const { initPixi } = usePixiApp(canvasRef, appRef);

  // PIXI GAME lifecycle – replaces entire old useEffect
  usePixiGame(
    initPixi,
    appRef,
    socketRef,
    playersRef,
    canvasRef                // ← same arguments from earlier
  );

  // Chat message handler (unchanged)
  const handleChat = ({ id, username, message }) => {
    const localUserId = playersRef.current.localUserId;
    const isLocal = id === localUserId;
    setMessages((m) => {
      const updated = [
        { from: id, name: isLocal ? "You" : username, message },
        ...m,
      ];
      return updated.slice(0, 15);
    });

    const p = playersRef.current[id];
    if (p && appRef.current) {
      showChatBubble(appRef.current, p, message, textStyle);
    }
  };

  // socket event handlers (unchanged)
  const { initSocket, disconnectSocket } = useSocket(socketRef, {
    localUser: (id) => {
      playersRef.current.localUserId = id;
    },
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
    playerJoined: (p) =>
      createOrUpdatePlayer(appRef.current, playersRef, p.id, p, false),
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
    chatMessage: handleChat,
    chatHistory: (history) => {
      const localUserId = socketRef.current?.userId;

      setMessages(
        history
          .map((c) => ({
            from: c.userId,
            name: c.userId.toString() === localUserId ? "You" : c.username,
            message: c.message,
          }))
          .slice(-15)
      );
    },
  });

  // connect/disconnect based on auth (unchanged)
  useEffect(() => {
    if (userId) initSocket();
    else disconnectSocket();

    return () => disconnectSocket();
  }, [userId]);

  // removed PIXI useEffect completely – handled by usePixiGame

  const sendChat = () => {
    if (!socketRef.current || !input.trim()) return;

    const localUserId = playersRef.current.localUserId;
    if (localUserId && playersRef.current[localUserId] && appRef.current) {
      showChatBubble(
        appRef.current,
        playersRef.current[localUserId],
        input,
        textStyle
      );
    }

    socketRef.current.emit("chat", { message: input });
    setInput("");
  };

  const handleLogoutClick = () => {
    disconnectSocket();
    onLogout();
  };

  return (
    <div className="game-ui flex flex-col max-h-screen">
      <div className="flex flex-row gap-2">
        <div className="w-full" ref={canvasRef} />
        <ChatUI
          messages={[...messages]}
          input={input}
          setInput={setInput}
          sendChat={sendChat}
        />
      </div>
      <button onClick={handleLogoutClick}>Logout</button>
    </div>
  );
}
