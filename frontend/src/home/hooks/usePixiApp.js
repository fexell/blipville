import * as PIXI from "pixi.js";
import { createPixiApp } from "../utils/pixiApp";
import { BubbleRegistry } from '../utils/bubbleManager';
import { RoomManager } from '../utils/roomManager';

export function usePixiApp(canvasRef, appRef, playersRef, levelKey = "forest") {
  const initPixi = async () => {
    if (!canvasRef.current) return;

    if (appRef.current && !appRef.current.destroyed) {
      appRef.current.destroy({ children: true, texture: true, baseTexture: true });
      appRef.current = null;
    }

    if(playersRef?.current) playersRef.current = {};

    const app = await createPixiApp(canvasRef.current);
    appRef.current = app;
    app.stage.sortableChildren = true;

    // RoomManager handles layers
    const roomManager = new RoomManager(app);
    await roomManager.loadLevel(levelKey);
    app.roomManager = roomManager; // attach for easy access

    // Bubble ticker
    app.ticker.add(() => {
      const dt = app.ticker.deltaMS;
      for (const entry of [...BubbleRegistry.typingBubbles]) {
        entry.t += dt / 160;
        entry.elapsed += dt;
        entry.dots.forEach((d, i) => (d.y = Math.sin(entry.t + i * 0.5) * 2));
        if (entry.elapsed > entry.lifetime) entry.cleanup();
      }
      for (const entry of [...BubbleRegistry.chatBubbles]) {
        entry.elapsed += dt;
        if (entry.elapsed > entry.lifetime) {
          entry.bubble.alpha -= 0.025;
          if (entry.bubble.alpha <= 0) entry.cleanup();
        }
      }
    });

    return app;
  };

  return { initPixi };
}
