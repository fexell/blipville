import { Ticker } from "pixi.js";

export function animateTo(container, tx, ty) {
  if (!container) return;
  if (container._moveTicker) container._moveTicker.stop();

  const speed = 240;
  const dx = tx - container.x;
  const dy = ty - container.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist < 2) return;

  const ticker = new Ticker();
  container._moveTicker = ticker;

  ticker.add(() => {
    const dt = ticker.deltaMS / 1000;
    container.x += (dx / dist) * speed * dt;
    container.y += (dy / dist) * speed * dt;
    if (Math.abs(tx - container.x) < 4 && Math.abs(ty - container.y) < 4) {
      container.x = tx;
      container.y = ty;
      ticker.stop();
    }
  });

  ticker.start();
}
