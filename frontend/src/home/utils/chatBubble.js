import { Container, Graphics, Text } from "pixi.js";

export function showChatBubble(app, player, text, style) {
  if (!app || !player?.container) return;

  if (player.chatBubble) {
    player.container.removeChild(player.chatBubble);
    player.chatBubble = null;
  }

  const bubble = new Container();
  player.chatBubble = bubble;

  const padding = 6;
  const txt = new Text({ text, style, anchor: 0.5 });
  bubble.addChild(txt);
  player.container.addChild(bubble);

  app.ticker.addOnce(() => {
    const w = txt.width + padding * 2;
    const h = txt.height + padding * 2;
    const bg = new Graphics();
    bg.roundRect(-w/2, -h/2, w, h, 6).fill(0xffffff);
    bubble.addChildAt(bg, 0);
    bubble.y = -h - 10;
  });

  let elapsed = 0;
  const lifetime = 2500;
  const fade = (delta) => {
    elapsed += delta * 16.67;
    if (elapsed > lifetime) {
      bubble.alpha -= 0.03;
      if (bubble.alpha <= 0) {
        app.ticker.remove(fade);
        player.container.removeChild(bubble);
        if (player.chatBubble === bubble) player.chatBubble = null;
      }
    }
  };
  app.ticker.add(fade);
}
