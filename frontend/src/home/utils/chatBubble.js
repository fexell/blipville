import { Container, Graphics, Text } from "pixi.js";

export function showChatBubble(app, player, text, style) {
  if (!app || !player?.container) return;

  // Remove existing bubble
  if (player.chatBubble) {
    const parent = app.layers?.uiLayer ?? player.container;
    parent.removeChild(player.chatBubble);
    player.chatBubble = null;
  }

  const bubble = new Container();
  player.chatBubble = bubble;

  const padding = 12;
  const maxWidth = 200;

  // Text (v8 constructor style)
  const txt = new Text({
    text,
    style: {
      ...style,
      wordWrap: true,
      wordWrapWidth: maxWidth,
    },
    anchor: 0.5,
  });
  bubble.addChild(txt);

  // Bubble size
  const w = txt.width + padding * 2;
  const h = txt.height + padding * 2;

  // Background (v8 API)
  const bg = new Graphics()
    .fill(0xffffff)
    .roundRect(-w / 2, -h / 2, w, h, 6)
    .fill(); // commit fill
  bubble.addChildAt(bg, 0);

  // Tail (triangle pointing down)
  const tailWidth = 16;
  const tailHeight = 10;
  const tail = new Graphics()
    .fill(0xffffff)
    .poly([
      0, tailHeight,            // bottom tip
      -tailWidth / 2, 0,        // left
      tailWidth / 2, 0          // right
    ])
    .fill();
  tail.x = -18;
  tail.y = h / 2;
  bubble.addChild(tail);

  // Add to layer
  const parent = app.layers?.uiLayer ?? player.container;
  parent.addChild(bubble);

  // Position updater
  const updatePosition = () => {
    bubble.x = player.container.x + player.container.width / 2;
    bubble.y = player.container.y - player.container.height / 2 - h / 2 - tailHeight;
  };
  app.ticker.add(updatePosition);

  // Fade out
  let elapsed = 0;
  const lifetime = 8000;
  const fade = (ticker) => {
    elapsed += ticker.deltaMS;
    if (elapsed > lifetime) {
      bubble.alpha -= 0.03;
      if (bubble.alpha <= 0) {
        app.ticker.remove(fade);
        app.ticker.remove(updatePosition);
        parent.removeChild(bubble);
        if (player.chatBubble === bubble) player.chatBubble = null;
      }
    }
  };
  app.ticker.add(fade);
}
