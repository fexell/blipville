import { Container, Graphics, Text } from "pixi.js";
import { WORLD } from "../utils/constants";

export function createOrUpdatePlayer(app, playersRef, id, data = {}, isLocal) {
  if (!app || app.destroyed || !app.layers?.playersLayer) {
    // Retry next frame if PIXI not ready
    requestAnimationFrame(() => createOrUpdatePlayer(app, playersRef, id, data, isLocal));
    return;
  }

  const pos = data.position || {};
  const px = pos.x ?? data.x ?? 0;
  const py = pos.y ?? data.y ?? 0;

  const existing = playersRef.current?.[id];
  if (existing) {
    existing.container.x = px;
    existing.container.y = py;
    return;
  }

  // Remove old container if exists
  const old = app.layers.playersLayer.children.find(c => c.playerId === id);
  if (old) {
    app.layers.playersLayer.removeChild(old);
    old.destroy();
  }

  const cont = new Container();
  cont.playerId = id;
  cont.x = px;
  cont.y = py;

  const avatar = new Graphics();
  avatar.circle(0, 0, 18).fill(isLocal ? 0x66ccff : 0xffcc66);
  cont.addChild(avatar);

  const displayName = isLocal ? "You" : data.username || data.name || id.slice(0, 6);
  const nameText = new Text({
    text: displayName,
    style: { fontSize: 16, fill: 0xffffff },
    anchor: 0.5,
  });
  nameText.y = 30;
  cont.addChild(nameText);

  cont.zIndex = 10;
  app.layers.playersLayer.addChild(cont);

  playersRef.current[id] = { container: cont, isLocal, chatBubble: null };
  if (isLocal) playersRef.current.localUserId = id;
}
