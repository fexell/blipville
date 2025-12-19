import { Application } from 'pixi.js';
import { WORLD } from './constants';

const app = new Application();

// WORLD.cols * WORLD.tileSize
// WORLD.rows * WORLD.tileSize

await app.init({
  width: WORLD.cols * WORLD.tileSize,
  height: WORLD.rows * WORLD.tileSize,
  //background: 0x333333,
  resolution: window.devicePixelRatio || 1,
});

app.view.style.width = "100%";
app.view.style.height = "auto";

export default app
