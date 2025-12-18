// hooks/usePixiGame.js
import { useEffect } from "react";
import { animateTo } from "../utils/animate";

export function usePixiGame(initPixi, appRef, socketRef, playersRef, canvasRef) {

  useEffect(() => {
    let app;
    let clickHandler;

    const setup = async () => {
      // initPixi returns same ref you had in Game.jsx
      app = await initPixi();

      clickHandler = (ev) => {
        const pixi = appRef.current;
        const socket = socketRef.current;

        if (!pixi || !socket) return;

        const { canvas, renderer } = pixi;
        if (!canvas || !renderer) return;

        const rect = canvas.getBoundingClientRect();
        const x = ((ev.clientX - rect.left) / rect.width) * renderer.width;
        const y = ((ev.clientY - rect.top) / rect.height) * renderer.height;

        socket.emit("move", { x, y });

        const id = playersRef.current.localUserId;
        const local = id ? playersRef.current[id] : null;

        if (local) animateTo(local.container, x, y);
      };

      app?.canvas?.addEventListener("click", clickHandler);
    };

    setup();

    return () => {
      const pixi = appRef.current;
      const socket = socketRef.current;

      if (pixi) {
        pixi.destroy(true, { children: true });
        appRef.current = null;
      }

      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }

      playersRef.current = {};

      if (canvasRef.current) {
        canvasRef.current.innerHTML = "";
      }

      // remove click listener
      if (app && app.canvas && clickHandler) {
        app.canvas.removeEventListener("click", clickHandler);
      }
    };

  }, []); // runs only once
}
