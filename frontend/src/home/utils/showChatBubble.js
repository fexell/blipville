import { Container, Graphics, Text } from "pixi.js";
import { createBubbleManager, BubbleRegistry } from "./bubbleManager";

export function showChatBubble(app, player, text, style = {}) {
  if (!app || !player?.container) return;

  const manager = createBubbleManager(app, player);

  const padding = 12;
  const maxWidth = 200;

  const bubble = new Container();
  manager.add(bubble);

  player.chatStack = player.chatStack || [];

  // add on top of typing bubble
  player.chatStack.unshift(bubble);
  player.repositionStack?.();

  const txt = new Text({
    text,
    anchor: 0.5,
    style: {
      ...style,
      fontFamily: "Arial, 'Segoe UI Emoji', 'Noto Color Emoji'",
      wordWrap: true,
      wordWrapWidth: maxWidth,
    },
  });

  bubble.addChild(txt);

  queueMicrotask(() => {
    const w = txt.width + padding * 2;
    const h = txt.height + padding * 2;

    bubble._w = w;
    bubble._h = h;

    const bg = new Graphics()
      .roundRect(-w / 2, -h / 2, w, h, 6)
      .fill(0xffffff);

    const tail = new Graphics()
      .poly([-8, 0, 0, 10, 8, 0])
      .fill(0xffffff);

    tail.x = 0;
    tail.y = h / 2;
    bubble.tail = tail;

    bubble.addChildAt(bg, 0);
    bubble.addChild(tail);

    player.repositionStack?.();
  });

  const entry = {
    bubble,
    elapsed: 0,
    lifetime: 5000,
    cleanup: () => {
      BubbleRegistry.chatBubbles.delete(entry);
      manager.remove(bubble);
      const idx = player.chatStack.indexOf(bubble);
      if (idx !== -1) player.chatStack.splice(idx, 1);
      player.repositionStack?.();
    },
  };

  BubbleRegistry.chatBubbles.add(entry);

  return {
    bubble,
    cleanup: entry.cleanup,
    resetTimeout() {
      entry.elapsed = 0;
    }
  };
}
