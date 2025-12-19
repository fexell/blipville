import { Container, Graphics, Text } from "pixi.js";

export function createOrUpdatePlayer(app, playersRef, id, data = {}, isLocal) {
  const pos = data.position || {};
  const px = pos.x ?? data.x ?? 0;
  const py = pos.y ?? data.y ?? 0;

  const existing = playersRef.current[id];
  if (existing) {
    // Update position if player already exists
    existing.container.x = px;
    existing.container.y = py;
    return;
  }

  // 🔧 If a container with this id is already in the layer, remove it
  const old = app.layers?.playersLayer.children.find(
    (c) => c.playerId === id
  );
  if (old) {
    app.layers.playersLayer.removeChild(old);
    old.destroy();
  }

  const cont = new Container();
  cont.playerId = id; // tag container with player id
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

  // ✅ Add to players layer
  if (app.layers?.playersLayer) {
    app.layers.playersLayer.addChild(cont);
  } else {
    app.stage.addChild(cont);
  }

  playersRef.current[id] = { container: cont, isLocal, chatBubble: null };

  if (isLocal) playersRef.current.localUserId = id;
}
