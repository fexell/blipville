import { useEffect } from "react";
import { animateTo } from "../utils/animate";

export function usePixiGame(initPixi, appRef, socketRef, playersRef, canvasRef) {
  useEffect(() => {
    let clickHandler;

    const setup = async () => {
      const app = await initPixi();
      appRef.current = app;

      // Clear only the players layer to avoid ghost containers after Fast Refresh
      if (app.layers?.playersLayer) {
        app.layers.playersLayer.removeChildren();
      }

      // Do NOT reset playersRef.current here — it holds localUserId set by useSocket
      // and the current player map created by Game.jsx handlers.

      // Click: emit move and animate local player
      clickHandler = (ev) => {
        const pixi = appRef.current;
        const socket = socketRef.current;
        if (!pixi || !socket) return;

        const rect = pixi.canvas.getBoundingClientRect();
        const x = ((ev.clientX - rect.left) / rect.width) * pixi.renderer.width;
        const y = ((ev.clientY - rect.top) / rect.height) * pixi.renderer.height;

        // Tell server
        socket.emit("move", { x, y });

        // Animate local player instantly
        const localId = playersRef.current.localUserId;
        const local = localId ? playersRef.current[localId] : null;
        if (local?.container) {
          animateTo(local.container, x, y);
          local.x = x;
          local.y = y;
        }
      };

      app.canvas.addEventListener("click", clickHandler);

      // Cleanup: detach canvas handlers and leave socket lifecycle to Game.jsx/useSocket
      return () => {
        const pixi = appRef.current;

        if (pixi?.layers?.playersLayer) {
          pixi.layers.playersLayer.removeChildren();
        }

        if (canvasRef.current) {
          canvasRef.current.innerHTML = "";
        }

        if (pixi?.canvas && clickHandler) {
          pixi.canvas.removeEventListener("click", clickHandler);
        }

        appRef.current = null;
      };
    };

    setup();
  }, []);
}
