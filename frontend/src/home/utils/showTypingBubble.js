import { Container, Graphics } from "pixi.js";
import { createBubbleManager, BubbleRegistry } from "./bubbleManager";

export function showTypingBubble(app, player, onDisappear) {
  const manager = createBubbleManager(app, player);

  player.chatStack = player.chatStack || [];

  // prevent dupes
  if (player.typingBubble) {
    player.typingBubble.resetTimeout();
    return player.typingBubble;
  }

  const bubble = new Container();
  manager.add(bubble);

  bubble._w = 40;
  bubble._h = 20;

  // put typing bubble at bottom
  player.chatStack.unshift(bubble);
  player.repositionStack?.();

  // dots
  const dots = [];
  for (let i = 0; i < 3; i++) {
    const d = new Graphics().fill(0xffffff).circle(0, 0, 3).fill();
    d.x = i * 10 - 10;
    dots.push(d);
    bubble.addChild(d);
  }

  const entry = {
    bubble,
    dots,
    t: 0,
    elapsed: 0,
    lifetime: 6000,
    cleanup: () => {
      BubbleRegistry.typingBubbles.delete(entry);
      manager.remove(bubble);

      const idx = player.chatStack.indexOf(bubble);
      if (idx !== -1) player.chatStack.splice(idx, 1);

      player.typingBubble = null;
      player.repositionStack?.();

      if (onDisappear) onDisappear();
    }
  };

  BubbleRegistry.typingBubbles.add(entry);

  const api = {
    bubble,
    cleanup: entry.cleanup,
    resetTimeout() {
      entry.elapsed = 0;
    }
  };

  player.typingBubble = api;
  return api;
}
