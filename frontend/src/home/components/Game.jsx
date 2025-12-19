// @refresh reset
import React, { useEffect, useRef, useState } from "react";
import ChatUI from "./ChatUI";
import { usePixiApp } from "../hooks/usePixiApp";
import { usePixiGame } from "../hooks/usePixiGame";
import { useSocket } from "../hooks/useSocket";
import { createOrUpdatePlayer } from "../hooks/usePlayers";
import { showChatBubble } from "../utils/chatBubble";
import { animateTo } from "../utils/animate";
import { textStyle } from "../utils/constants";
import useAuthStore from '../../auth/stores/Auth.store';
import "../styles/style.css";

export default function Game({ onLogout, level = "forest" }) {
  const { userId } = useAuthStore();

  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const socketRef = useRef(null);
  const playersRef = useRef({});

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { initPixi } = usePixiApp(canvasRef, appRef, level);
  usePixiGame(initPixi, appRef, socketRef, playersRef, canvasRef);

  const handleChat = ({ id, username, message }) => {
    const localUserId = playersRef.current.localUserId;
    const isLocal = id === localUserId;

    setMessages((m) => [{ from: id, name: isLocal ? "You" : username, message }, ...m].slice(0, 15));

    const p = playersRef.current[id];
    if (p && appRef.current) showChatBubble(appRef.current, p, message, textStyle);
  };

  const { initSocket, disconnectSocket } = useSocket(socketRef, {
    localUser: (id) => { playersRef.current.localUserId = id; },

    initPlayers: (players) => {
      players.forEach((p) => {
        if(!appRef.current) {
          requestAnimationFrame(() => 
            createOrUpdatePlayer(appRef.current, playersRef, p.id, p, p.id === socketRef.current.userId)
          )
        } else {
          createOrUpdatePlayer(appRef.current, playersRef, p.id, p, p.id === socketRef.current.userId)
        }
      });
    },

    playerJoined: (p) => {
      if(!appRef.current) {
        requestAnimationFrame(() => 
          createOrUpdatePlayer(appRef.current, playersRef, p.id, p, p.id === socketRef.current.userId)
        )
      } else {
        createOrUpdatePlayer(appRef.current, playersRef, p.id, p, p.id === socketRef.current.userId)
      }
    },

    playerMoved: ({ id, x, y }) => {
      const player = playersRef.current[id];
      if (player && !player.isLocal) animateTo(player.container, x, y);
    },

    playerLeft: ({ id }) => {
      const p = playersRef.current[id];
      if (!p || !appRef.current?.layers?.playersLayer) return;

      appRef.current.layers.playersLayer.removeChild(p.container);
      delete playersRef.current[id];
    },

    chatMessage: handleChat,

    chatHistory: (history) => {
      const localUserId = socketRef.current?.userId;
      setMessages(
        history.map((c) => ({
          from: c.userId,
          name: c.userId === localUserId ? "You" : c.username,
          message: c.message,
        })).slice(-15)
      );
    },
  });

  useEffect(() => {
    if (userId) initSocket();
    else disconnectSocket();
    return () => disconnectSocket();
  }, [userId]);

  const sendChat = () => {
    if (!socketRef.current || !input.trim()) return;
    const localUserId = playersRef.current.localUserId;
    if (localUserId && playersRef.current[localUserId] && appRef.current) {
      showChatBubble(appRef.current, playersRef.current[localUserId], input, textStyle);
    }
    socketRef.current.emit("chat", { message: input });
    setInput("");
  };

  const handleLogoutClick = () => {
    disconnectSocket();
    onLogout();
  };

  return (
    <div className="game-ui flex flex-col max-w-5xl min-h-screen max-h-screen justify-center items-center px-4 mx-auto">
      <div className="flex flex-row gap-4 max-w-full mx-auto">
        <div
          className="flex justify-center"
          ref={canvasRef}
        />
        <ChatUI messages={[...messages]} input={input} setInput={setInput} sendChat={sendChat} />
      </div>
      <button onClick={handleLogoutClick}>Logout</button>
    </div>
  );
}
