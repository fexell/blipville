import { Container, Graphics, Text } from "pixi.js";

export function showChatBubble(app, player, text, style) {
  if (!app || !player?.container) return;

  // Remove any existing bubble
  if (player.chatBubble) {
    if (app.layers?.uiLayer) {
      app.layers.uiLayer.removeChild(player.chatBubble);
    } else {
      player.container.removeChild(player.chatBubble);
    }
    player.chatBubble = null;
  }

  const bubble = new Container();
  player.chatBubble = bubble;

  const padding = 12;
  const txt = new Text({ text, style, anchor: 0.5 });
  bubble.addChild(txt);

  // Add bubble to uiLayer
  if (app.layers?.uiLayer) {
    app.layers.uiLayer.addChild(bubble);
  } else {
    player.container.addChild(bubble);
  }

  // Build bubble graphics
  const extraBottom = 16;
  const w = txt.width + padding * 2;
  const h = txt.height + padding * 2;

  const bg = new Graphics();
  bg.roundRect(-w / 2, -h / 2, w, h, 6).fill(0xffffff);

  const tailWidth = 20;
  const tailHeight = 12;
  const tail = new Graphics();
  tail.moveTo(0, 0);
  tail.lineTo(-tailWidth / 2, -tailHeight);
  tail.lineTo(tailWidth / 2, -tailHeight);
  tail.closePath();
  tail.fill(0xffffff);

  tail.x = -(w / 2) * 0.5;
  tail.y = h / 2 + 10;

  bubble.addChildAt(bg, 0);
  bubble.addChildAt(tail, 1);

  txt.y -= extraBottom / 2;

  // 🔧 Update bubble position every frame so it follows the player
  const updatePosition = () => {
    bubble.x = player.container.x + w / 4;
    bubble.y = player.container.y - player.container.height / 2 - tailHeight - 20;
  };
  app.ticker.add(updatePosition);

  // Lifetime + fade out
  let elapsed = 0;
  const lifetime = 8000;
  const fade = (ticker) => {
    elapsed += ticker.deltaMS;
    if (elapsed > lifetime) {
      bubble.alpha -= 0.03;
      if (bubble.alpha <= 0) {
        app.ticker.remove(fade);
        app.ticker.remove(updatePosition); // stop tracking position
        if (app.layers?.uiLayer) {
          app.layers.uiLayer.removeChild(bubble);
        } else {
          player.container.removeChild(bubble);
        }
        if (player.chatBubble === bubble) player.chatBubble = null;
      }
    }
  };
  app.ticker.add(fade);
}
