import React, { useEffect, useRef, useState, useCallback } from "react";
import { Application, Container, Graphics, Text, TextStyle, Ticker } from "pixi.js";
import { io } from "socket.io-client";

import "../styles/style.css";

const SERVER_URL = "http://localhost:5000";
const WORLD = { cols: 40, rows: 12, tileSize: 48 };

const style = new TextStyle({
  fill: "#000000",
  fontSize: 12,
  fontFamily: "Arial",
  wordWrap: true,
  wordWrapWidth: 120
});

export default function Game() {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const socketRef = useRef(null);
  const playersRef = useRef({});
  const localPlayerReady = useRef(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // --- Chat bubble ---
  const showChatBubble = useCallback((player, text) => {
    const app = appRef.current;
    if (!app || !player?.container) return;

    if (player.chatBubble) {
      player.container.removeChild(player.chatBubble);
      player.chatBubble = null;
    }

    const bubble = new Container();
    player.chatBubble = bubble;

    const padding = 6;

    const txt = new Text({ text, style, anchor: 0.5 });
    txt.x = 0; txt.y = 0;
    bubble.addChild(txt);
    player.container.addChild(bubble);

    app.ticker.addOnce(() => {
      const w = txt.width + padding * 2;
      const h = txt.height + padding * 2;
      const bg = new Graphics();
      bg.roundRect(-w/2, -h/2, w, h, 6).fill(0xffffff);
      bubble.addChildAt(bg, 0);
      bubble.y = -h - 10;
      bubble.x = 0;
    });

    let elapsed = 0;
    const lifetime = 2500;
    const fade = (delta) => {
      elapsed += delta * 16.67;
      if (elapsed > lifetime) {
        bubble.alpha -= 0.03;
        if (bubble.alpha <= 0) {
          app.ticker.remove(fade);
          player.container.removeChild(bubble);
          if (player.chatBubble === bubble) player.chatBubble = null;
        }
      }
    };
    app.ticker.add(fade);
  }, []);

  const handleChat = useCallback(({ id, username, message }) => {
    const localUserId = playersRef.current.localUserId;
    const isLocal = id === localUserId;

    setMessages((m) => [...m, { from: id, name: isLocal ? "You" : username, message }]);
    const p = playersRef.current[id];
    if (p) showChatBubble(p, message);
  }, [showChatBubble]);

  useEffect(() => {
    let app;
    let socket;
    let clickHandler;

    const init = async () => {
      // PIXI v8
      app = new Application();
      await app.init({
        width: WORLD.cols * WORLD.tileSize,
        height: WORLD.rows * WORLD.tileSize,
        background: 0x1e1e1e,
        resolution: window.devicePixelRatio || 1
      });

      canvasRef.current.innerHTML = "";
      canvasRef.current.appendChild(app.canvas);
      appRef.current = app;

      // Grid
      const grid = new Graphics();
      for (let r = 0; r < WORLD.rows; r++) {
        for (let c = 0; c < WORLD.cols; c++) {
          const x = c * WORLD.tileSize;
          const y = r * WORLD.tileSize;
          const color = (c + r) % 2 === 0 ? 0x2b2b2b : 0x282828;
          grid.fill(color).rect(x, y, WORLD.tileSize, WORLD.tileSize);
        }
      }
      app.stage.addChild(grid);

      // Socket
      socket = io(SERVER_URL, { withCredentials: true, transports: ["websocket", "polling"] });
      socketRef.current = socket;

      socket.on("connect", () => socket.emit("joinRoom", { room: "main" }));
      socket.on("localUser", ({ id }) => { socketRef.current.userId = id });
      socket.on("initPlayers", (players) => {
        players.forEach((p) => createOrUpdatePlayer(p.id, p, p.id === socketRef.current.userId));
      });
      socket.on("playerJoined", (p) => createOrUpdatePlayer(p.id, p, false));
      socket.on("playerMoved", ({ id, x, y }) => {
        const p = playersRef.current[id];
        if (p && !p.isLocal) animateTo(p.container, x, y);
      });
      socket.on("playerLeft", ({ id }) => {
        const p = playersRef.current[id];
        if (!p) return;
        app.stage.removeChild(p.container);
        delete playersRef.current[id];
      });
      socket.on("chatMessage", handleChat);

      // Click to move
      clickHandler = (ev) => {
        const rect = app.canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;

        socket.emit("move", { x, y });

        const localUserId = playersRef.current.localUserId;
        const local = localUserId ? playersRef.current[localUserId] : null;
        if (local) animateTo(local.container, x, y);
      };

      app.canvas.addEventListener("click", clickHandler);
    };

    const animateTo = (container, tx, ty) => {
      if (!container) return;
      if (container._moveTicker) container._moveTicker.stop();

      const speed = 240;
      const dx = tx - container.x;
      const dy = ty - container.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 2) return;

      const ticker = new Ticker();
      container._moveTicker = ticker;

      ticker.add(() => {
        const dt = ticker.deltaMS / 1000;
        container.x += (dx / dist) * speed * dt;
        container.y += (dy / dist) * speed * dt;
        if (Math.abs(tx - container.x) < 4 && Math.abs(ty - container.y) < 4) {
          container.x = tx;
          container.y = ty;
          ticker.stop();
        }
      });

      ticker.start();
    };

    const createOrUpdatePlayer = (id, data = {}, isLocal) => {
      const app = appRef.current;
      if (!app) return;

      const pos = data.position || {};
      const px = pos.x ?? data.x ?? 0;
      const py = pos.y ?? data.y ?? 0;

      const existing = playersRef.current[id];
      if (existing) {
        existing.container.x = px;
        existing.container.y = py;
        return;
      }

      const cont = new Container();
      cont.x = px; cont.y = py;

      const avatar = new Graphics();
      avatar.circle(0, 0, 14).fill(isLocal ? 0x66ccff : 0xffcc66);
      cont.addChild(avatar);

      const displayName = isLocal ? "You" : data.username || data.name || id.slice(0, 6);
      const nameText = new Text({ text: displayName, style: { fontSize: 12, fill: 0xffffff }, anchor: 0.5 });
      nameText.y = 25; nameText.x = 0;
      cont.addChild(nameText);

      app.stage.addChild(cont);
      playersRef.current[id] = { container: cont, isLocal, chatBubble: null };

      if (isLocal) localPlayerReady.current = true;
      if (isLocal) playersRef.current.localUserId = id;
    };

    init();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      playersRef.current = {};
      if (canvasRef.current) canvasRef.current.innerHTML = "";
    };
  }, [handleChat]);

  const sendChat = () => {
    if (!socketRef.current || !input.trim()) return;

    const localUserId = playersRef.current.localUserId;
    if (localUserId && playersRef.current[localUserId]) {
      showChatBubble(playersRef.current[localUserId], input);
    }

    socketRef.current.emit("chat", { message: input });
    setInput("");
  };

  return (
    <div className="game-ui flex flex-row">
      <div className="w-full" ref={canvasRef} />
      <div className="flex flex-col flex-1 p-2 rounded-2xl bg-neutral-950">
        <div className="flex-1 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className="msg">
              <strong>{m.name || m.from}: </strong>
              {m.message}
            </div>
          ))}
        </div>
        <div className="flex flex-row py-2">
          <input
            className="flex-1 grow-4 p-2 rounded-2xl bg-neutral-800"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
          />
          <button className="flex-1" onClick={sendChat}>Send</button>
        </div>
      </div>
    </div>
  );
}
