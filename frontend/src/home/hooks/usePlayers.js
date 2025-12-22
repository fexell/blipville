import { Container, Graphics, Text } from "pixi.js";
import { attachRepositionFn } from '../utils/bubbleManager';
import { WORLD } from "../utils/constants";

export function safeCreateOrUpdatePlayer(appRef, playersRef, id, data, isLocal) {
  if (!playersRef.current) playersRef.current = {};

  // Wait until playersLayer exists and has at least 1 child (background)
  if (!appRef.current?.layers?.playersLayer || !appRef.current.layers.roomLayer.children.length) {
    requestAnimationFrame(() =>
      safeCreateOrUpdatePlayer(appRef, playersRef, id, data, isLocal)
    );
    return;
  }

  createOrUpdatePlayer(appRef.current, playersRef, id, data, isLocal);
}

export function createOrUpdatePlayer(app, playersRef, id, data = {}, isLocal) {
  if (!playersRef.current) playersRef.current = {};

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
  });
  nameText.anchor.set(0.5);
  nameText.x = 0;
  nameText.y = 30;
  cont.addChild(nameText);

  cont.zIndex = 10;
  app.layers.playersLayer.addChild(cont);
  app.layers.playersLayer.children.sort((a, b) => a.zIndex - b.zIndex);

  playersRef.current[id] = {
    container: cont,
    isLocal,
    chatBubble: null,
    chatStack: [],
    updateBubbles() {
      this.repositionStack();
    },
    repositionStack() {
      const screenLeft = 0;
      const screenRight = app.renderer.width;
      const screenTop = 0;

      const avatarRadius = 18;
      let spacing = -10;
      let offset = 0;

      for (let i = this.chatStack.length - 1; i >= 0; i--) {
        const b = this.chatStack[i];
        const bw = b._w || 0;
        const bh = b._h || 0;
        if (!bw || !bh) continue;

        let aboveY = this.container.y - avatarRadius - bh / 2 - offset;
        if (aboveY - bh / 2 < screenTop + 5) aboveY = screenTop + bh / 2 + 5;

        b.y = aboveY;
        b.x = this.container.x;

        if (b.tail) {
          b.tail.scale.y = 1;
          b.tail.y = bh / 2;
        }

        const halfWidth = bw / 2;
        if (b.x - halfWidth < screenLeft + 5) b.x = screenLeft + halfWidth + 5;
        if (b.x + halfWidth > screenRight - 5) b.x = screenRight - halfWidth - 5;

        offset += bh + spacing;
      }
    },
  };

  attachRepositionFn(playersRef.current[id], app);

  if (isLocal) playersRef.current.localUserId = id; // ✅ set here as a fallback
}
