import { Application } from "pixi.js";
import { WORLD } from "./constants";

export async function createPixiApp(container) {
  if (!container) throw new Error("Container div required for PIXI canvas");

  const app = new Application();
  await app.init({
    background: 0x000000,
    antialias: true,
  });

  // Mount canvas
  container.innerHTML = "";
  container.appendChild(app.canvas);

  // Set fixed world size
  app.renderer.resize(WORLD.cols * WORLD.tileSize, WORLD.rows * WORLD.tileSize);

  return app;
}
