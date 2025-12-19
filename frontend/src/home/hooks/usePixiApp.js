import { Container } from "pixi.js";
import { buildRoom } from "../utils/rooms";
import { forestLevel } from "../utils/levels";
import { createPixiApp } from "../utils/pixiApp";

export function usePixiApp(canvasRef, appRef, playersRef) {
  const initPixi = async () => {
    if (!canvasRef.current) return;

    if (appRef.current) {
      appRef.current.destroy(true);
      appRef.current = null;
    }
    if(playersRef?.current) playersRef.current = {};


    const app = await createPixiApp(canvasRef.current);
    appRef.current = app;

    app.stage.sortableChildren = true;

    // Layers
    const roomLayer = new Container();
    roomLayer.zIndex = 0;

    const playersLayer = new Container();
    playersLayer.zIndex = 10;

    const uiLayer = new Container();
    uiLayer.zIndex = 20;

    app.stage.addChild(roomLayer, playersLayer, uiLayer);

    // Build initial room
    const room = await buildRoom(forestLevel);
    roomLayer.addChild(room);

    app.layers = { roomLayer, playersLayer, uiLayer };

    return app;
  };

  return { initPixi };
}
