// @refresh reset
import React, { useEffect, useRef, useState } from "react";
import ChatUI from "./ChatUI";
import { usePixiApp } from "../hooks/usePixiApp";
import { usePixiGame } from "../hooks/usePixiGame";
import { useSocket } from "../hooks/useSocket";
import { createOrUpdatePlayer, safeCreateOrUpdatePlayer } from "../hooks/usePlayers";
import { animateTo } from "../utils/animate";
import { textStyle } from "../utils/constants";
import useAuthStore from '../../auth/stores/Auth.store';
import { showChatBubble } from '../utils/showChatBubble';
import { showTypingBubble } from '../utils/showTypingBubble';
import { WORLD } from '../utils/constants';
import "../styles/style.css";

export default function Game({ onLogout, level = "forest" }) {
  const { userId } = useAuthStore();

  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const socketRef = useRef(null);
  const playersRef = useRef({});
  const typingRef = useRef(null);
  const wasTypingRef = useRef(false);

  // Function to switch levels dynamically
  const switchLevel = async (newLevel) => {
    const app = appRef.current;
    if (!app?.roomManager) return;

    try {
      await app.roomManager.loadLevel(newLevel);
      console.log(`Switched to level: ${newLevel}`);
    } catch (err) {
      console.error("Failed to switch level:", err);
    }
  };

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const { initPixi } = usePixiApp(canvasRef, appRef, level);
  usePixiGame(initPixi, appRef, socketRef, playersRef, canvasRef);

  const handleChat = ({ id, username, message }) => {
    const localUserId = playersRef.current.localUserId;
    const isLocal = id === localUserId;

    setMessages((m) => [
      { from: isLocal ? "You" : username, name: isLocal ? "You" : username, message },
      ...m
    ].slice(0, 20));

    const player = playersRef.current[id];
    if (player && appRef.current) showChatBubble(appRef.current, player, message, textStyle);
  };

  const { initSocket, disconnectSocket } = useSocket(socketRef, playersRef, {
    localUser: (id) => {
      playersRef.current.localUserId = id;
    },

    initPlayers: (players) => {
      players.forEach((p) => {
        safeCreateOrUpdatePlayer(appRef, playersRef, p.id, p, p.id === socketRef.current.userId);
      });
    },

    playerJoined: (p) => {
      safeCreateOrUpdatePlayer(appRef, playersRef, p.id, p, p.id === socketRef.current.userId);
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
        history
          .map((c) => ({
            from: c.userId,
            name: c.userId === localUserId ? "You" : c.username,
            message: c.message,
          }))
          .slice(-25)
      );
    },

    playerTyping: ({ id, typing }) => {
      const player = playersRef.current[id];
      if (!player || !appRef.current) return;

      if (typing) {
        if (!player.typingBubble) {
          player.typingBubble = showTypingBubble(appRef.current, player, () => {
            wasTypingRef.current = false;
          });
        } else {
          player.typingBubble.resetTimeout();
        }
      } else {
        if (player.typingBubble) {
          player.typingBubble.cleanup();
          player.typingBubble = null;
        }
      }
    },
  });

  useEffect(() => {
    if (userId) initSocket();
    else disconnectSocket();
    
    const handleBeforeUnload = () => {
      disconnectSocket();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      disconnectSocket();
    }
  }, [userId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const isTyping = input.length > 0;

    if (isTyping !== wasTypingRef.current) {
      socket.emit("typing", { typing: isTyping });
      wasTypingRef.current = isTyping;
    }
  }, [input]);

  const sendChat = () => {
    if (!socketRef.current || !input.trim()) return;

    // Stop typing bubble
    if (typingRef.current) {
      typingRef.current.cleanup();
      typingRef.current = null;
    }

    socketRef.current.emit("chat", { message: input });
    setInput("");
  };

  const handleLogoutClick = () => {
    disconnectSocket();
    onLogout();
  };

  return (
    <div className="game-ui flex items-center justify-center min-h-screen w-full">
      <div className="game-wrapper flex w-full max-w-8xl h-[700px] items-center justify-center">
        <button
          className="absolute top-4 right-4 text-white hover:text-neutral-50"
          onClick={handleLogoutClick}>Logout</button>
        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            maxHeight: "auto",
          }}
          className="canvas-container flex-1 h-full w-full"
          ref={canvasRef}></div>
        <ChatUI messages={[...messages]} input={input} setInput={setInput} sendChat={sendChat} />
      </div>
    </div>
  );
}
