import { Container, Graphics, Text } from "pixi.js";

export function createOrUpdatePlayer(app, playersRef, id, data = {}, isLocal) {
  const pos = data.position || {};
  const px = pos.x ?? data.x ?? 0;
  const py = pos.y ?? data.y ?? 0;

  const existing = playersRef.current[id];
  if (existing) {
    existing.container.x = px;
    existing.container.y = py;
    return;
  }

  const cont = new Container();
  cont.x = px; cont.y = py;

  const avatar = new Graphics();
  avatar.circle(0, 0, 14).fill(isLocal ? 0x66ccff : 0xffcc66);
  cont.addChild(avatar);

  const displayName = isLocal ? "You" : data.username || data.name || id.slice(0, 6);
  const nameText = new Text({ text: displayName, style: { fontSize: 12, fill: 0xffffff }, anchor: 0.5 });
  nameText.y = 25;
  cont.addChild(nameText);

  app.stage.addChild(cont);
  playersRef.current[id] = { container: cont, isLocal, chatBubble: null };

  if (isLocal) playersRef.current.localUserId = id;
}
