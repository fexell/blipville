import { Application } from "pixi.js";
import { WORLD } from "./constants";

export async function createPixiApp(container) {
  if (!container) throw new Error("Container div required for PIXI canvas");

  const app = new Application();
  await app.init({
    width: WORLD.cols * WORLD.tileSize,
    height: WORLD.rows * WORLD.tileSize,
    background: 0x000000,
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  // Mount canvas
  container.innerHTML = "";
  container.appendChild(app.canvas);

  app.canvas.style.width = "100%";
  app.canvas.style.height = "100%";
  app.canvas.style.display = "block";

  app.renderer.on("resize", () => {
    const scaleX = app.renderer.width / (WORLD.cols * WORLD.tileSize);
    const scaleY = app.renderer.height / (WORLD.rows * WORLD.tileSize);
    const scale = Math.min(scaleX, scaleY);

    app.stage.scale.set(scale);
  });

  return app;
}
