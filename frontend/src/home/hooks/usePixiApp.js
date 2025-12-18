import { Application, Graphics } from "pixi.js";
import { WORLD } from "../utils/constants";

export function usePixiApp(canvasRef, appRef) {
  const initPixi = async () => {
    const app = new Application();
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

    return app;
  };

  return { initPixi };
}
