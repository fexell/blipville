// hooks/usePixiApp.js
import { Container } from "pixi.js";
import { buildRoom } from "../utils/rooms";
import { forestLevel } from "../utils/levels";
import app from "../utils/pixiApp";

export function usePixiApp(canvasRef, appRef) {
  const initPixi = async () => {
    if (!canvasRef.current) return;

    canvasRef.current.innerHTML = "";
    canvasRef.current.appendChild(app.canvas);
    appRef.current = app;

    app.stage.sortableChildren = true;

    // Create layers
    const roomLayer = new Container();
    roomLayer.zIndex = 0;

    const playersLayer = new Container();
    playersLayer.zIndex = 10;

    const uiLayer = new Container();
    uiLayer.zIndex = 20;

    app.stage.addChild(roomLayer);
    app.stage.addChild(playersLayer);
    app.stage.addChild(uiLayer);

    // Build and add initial room
    const room = await buildRoom(forestLevel);
    roomLayer.addChild(room);

    // Save references for later use
    app.layers = { roomLayer, playersLayer, uiLayer };

    return app;
  };

  return { initPixi };
}
