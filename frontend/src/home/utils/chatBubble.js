import { Container, Graphics, Text } from "pixi.js";
import { createBubbleManager, BubbleRegistry } from "./bubbleManager";

export function showTypingBubble(app, player, onDisappear) {
  const manager = createBubbleManager(app, player);

  // Prevent duplicates
  if (player.typingBubble) {
    // Reset timer / animation
    player.typingBubble.elapsed = 0;
    player.repositionStack?.();
    return player.typingBubble;
  }

  const bubble = new Container();
  manager.add(bubble);

  bubble._w = 40;
  bubble._h = 20;

  // Add to player's chat stack so it pushes other bubbles upward
  player.chatStack = player.chatStack || [];
  player.chatStack.push(bubble);

  // DOTS
  const dots = [];
  for (let i = 0; i < 3; i++) {
    const dot = new Graphics().fill(0xffffff).circle(0, 0, 3).fill();
    dot.x = i * 10 - 10;
    dots.push(dot);
    bubble.addChild(dot);
  }

  const cleanup = () => {
    BubbleRegistry.typingBubbles.delete(entry);
    manager.remove(bubble);

    const idx = player.chatStack.indexOf(bubble);
    if (idx !== -1) player.chatStack.splice(idx, 1);

    player.typingBubble = null;
    player.hasTypingBubble = false;

    player.repositionStack?.();

    if (onDisappear) onDisappear();
  };

  const entry = {
    bubble,
    dots,
    t: 0,
    elapsed: 0,
    cleanup,
  };

  BubbleRegistry.typingBubbles.add(entry);

  // Call reposition after creation so it pushes other bubbles up
  player.repositionStack?.();

  const api = {
    bubble,
    cleanup,
    resetTimeout() {
      entry.elapsed = 0;
      player.repositionStack?.();
    },
  };

  player.typingBubble = api;
  return api;
}

// ======================================================
// CHAT BUBBLE
// ======================================================

export function showChatBubble(app, player, rawText, style = {}) {
  if (!app || !player?.container) return;

  if (!player.container || !app.layers?.uiLayer) {
    requestAnimationFrame(() => {
      showChatBubble(app, player, rawText, style);
    });
    return;
  }

  const { add, remove } = createBubbleManager(app, player);

  const padding = 12;
  const maxWidth = 200;

  const bubble = new Container();
  add(bubble);

  player.chatStack = player.chatStack || [];
  player.chatStack.push(bubble);

  const txt = new Text({
    text: rawText,
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

    // Background rectangle
    const bg = new Graphics()
      .roundRect(-w / 2, -h / 2, w, h, 6)
      .fill(0xffffff);

    // Tail triangle
    const tail = new Graphics()
      .poly([
        -8, 0,
         0, 10,
         8, 0
      ])
      .fill(0xffffff);

    tail.x = 0;
    tail.y = h / 2;
    bubble.tail = tail;

    bubble.addChildAt(bg, 0);
    bubble.addChild(tail);

    // Reposition bubbles with clamping
    player.repositionStack?.();
  });

  // Add bubble to global registry
  const lifetime = 8000;
  const entry = {
    bubble,
    elapsed: 0,
    lifetime,
    cleanup: () => {
      BubbleRegistry.chatBubbles.delete(entry);
      remove(bubble);
      const index = player.chatStack.indexOf(bubble);
      if (index !== -1) player.chatStack.splice(index, 1);
      player.repositionStack?.();
    }
  };
  BubbleRegistry.chatBubbles.add(entry);

  // API for external control
  const api = {
    bubble,
    cleanup: entry.cleanup,
    resetTimeout() {
      entry.elapsed = 0;
    }
  };

  return api;
}
