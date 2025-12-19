import { useEffect } from "react";
import { animateTo } from "../utils/animate";

export function usePixiGame(initPixi, appRef, socketRef, playersRef, canvasRef) {
  useEffect(() => {
    let clickHandler;

    const setup = async () => {
      const app = await initPixi();
      appRef.current = app;

      // Clear old players layer for Fast Refresh safety
      app.layers?.playersLayer.removeChildren();

      clickHandler = (ev) => {
        if (!appRef.current || !socketRef.current) return;

        const rect = appRef.current.canvas.getBoundingClientRect();
        const x = ((ev.clientX - rect.left) / rect.width) * appRef.current.renderer.width;
        const y = ((ev.clientY - rect.top) / rect.height) * appRef.current.renderer.height;

        socketRef.current.emit("move", { x, y });

        const localId = playersRef.current.localUserId;
        const local = localId ? playersRef.current[localId] : null;
        if (local?.container) {
          animateTo(local.container, x, y);
          local.x = x;
          local.y = y;
        }
      };

      app.canvas.addEventListener("click", clickHandler);

      return () => {
        app.layers?.playersLayer.removeChildren();
        if (canvasRef.current) canvasRef.current.innerHTML = "";
        if (clickHandler) app.canvas.removeEventListener("click", clickHandler);
        appRef.current.destroy({ children: true, texture: true, baseTexture: true });
        appRef.current = null;
      };
    };

    setup();
  }, []);
}
