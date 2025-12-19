// utils/rooms.js
import { Container, Mesh, PlaneGeometry, Texture, TextureStyle, Graphics, Assets } from "pixi.js";

export async function buildRoom(levelData) {
  const { cols, rows, tileSize, texturePath } = levelData;

  const w = cols * tileSize;
  const h = rows * tileSize;

  // Load texture with repeat style
  const baseTex = await Assets.load(texturePath);
  const repeatTexture = new Texture({
    source: baseTex.source,
    style: new TextureStyle({
      addressModeU: "repeat",
      addressModeV: "repeat",
    }),
  });

  // Background mesh
  const geo = new PlaneGeometry({ width: w, height: h });
  const mesh = new Mesh({ geometry: geo, texture: repeatTexture });

  // Scale UVs to repeat texture across the board
  const uv = mesh.texture.uvMatrix;
  if (uv) {
    uv.scale.set(w / mesh.texture.width, h / mesh.texture.height);
  }

  // Grid overlay (optional)
  const grid = new Graphics();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileSize;
      const y = r * tileSize;
      grid.rect(x, y, tileSize, tileSize);
    }
  }

  // Room container
  const room = new Container();
  room.zIndex = 0;
  room.addChild(mesh);  // background
  room.addChild(grid);  // overlay

  return room;
}
