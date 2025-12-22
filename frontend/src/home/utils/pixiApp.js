import { Application } from "pixi.js";
import { WORLD } from "./constants";

export async function createPixiApp(container) {
  if (!container) throw new Error("Container div required for PIXI canvas");

  const worldW = WORLD.cols * WORLD.tileSize;
  const worldH = WORLD.rows * WORLD.tileSize;

  const app = new Application();
  await app.init({
    width: worldW,
    height: worldH,
    background: 0x000000,
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  container.innerHTML = "";
  container.appendChild(app.canvas);

  app.canvas.style.width = "100%";
  app.canvas.style.height = "100%";

  function resize() {
    const bounds = container.getBoundingClientRect();
    const parentW = bounds.width;
    const parentH = bounds.height;

    app.renderer.resize(parentW, parentH);

    const scale = Math.min(parentW / worldW, parentH / worldH);
    app.stage.scale.set(scale);

    app.stage.position.set(
      (parentW - worldW * scale) / 2,
      (parentH - worldH * scale) / 2
    );
  }

  resize();

  window.addEventListener("resize", resize);
  const observer = new ResizeObserver(resize);
  observer.observe(container);

  return app;
}
