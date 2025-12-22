import { useEffect } from "react";
import { animateTo } from "../utils/animate";

export function usePixiGame(initPixi, appRef, socketRef, playersRef, canvasRef) {
  useEffect(() => {
    let clickHandler;

    const setup = async () => {
      const app = await initPixi();
      appRef.current = app; // store PIXI app directly

      // Update bubbles every frame
      app.ticker.add(() => {
        const players = playersRef.current;
        for (const id in players) {
          const p = players[id];
          if (p.updateBubbles) p.updateBubbles();
        }
      });

      // Clear old players layer for Fast Refresh safety
      app.layers?.playersLayer.removeChildren();

      clickHandler = (event) => {
        if (!appRef.current || !socketRef.current) return;

        // PIXI pointer event → screen coordinates
        const screenPos = event.global;

        // Convert screen → world coordinates (undo scale + offset)
        const worldPos = appRef.current.stage.toLocal(screenPos);

        const x = worldPos.x;
        const y = worldPos.y;

        // Send to server
        socketRef.current.emit("move", { x, y });

        // Move local avatar immediately
        const localId = playersRef.current.localUserId;
        const local = localId ? playersRef.current[localId] : null;
        if (local?.container) {
          animateTo(local.container, x, y);
        }
      };

      // Instead of: app.canvas.addEventListener("click", clickHandler);
      app.stage.eventMode = "static";
      app.stage.on("pointerdown", clickHandler);

      return () => {
        app.layers?.playersLayer.removeChildren();
        if (canvasRef.current) canvasRef.current.innerHTML = "";
        if (clickHandler) app.canvas.removeEventListener("click", clickHandler);
        app.destroy({ children: true, texture: true, baseTexture: true });
        appRef.current = null;
      };
    };

    setup();
  }, []);
}
