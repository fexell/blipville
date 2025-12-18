import { Container, Graphics, Text } from "pixi.js";

export function showChatBubble(app, player, text, style) {
  if (!app || !player?.container) return;

  if (player.chatBubble) {
    player.container.removeChild(player.chatBubble);
    player.chatBubble = null;
  }

  const bubble = new Container();
  player.chatBubble = bubble;

  const padding = 12;
  const txt = new Text({ text, style, anchor: 0.5 });
  bubble.addChild(txt);
  player.container.addChild(bubble);

  app.ticker.addOnce(() => {
    const extraBottom = 16;
    const w = txt.width + padding * 2;
    const h = txt.height + padding * 2;
    const bg = new Graphics();
    bg.roundRect(-w/2, -h/2, w, h, 6).fill(0xffffff);

    const tailWidth = 20;
    const tailHeight = 12;
    const tail = new Graphics();
    tail.beginFill(0xffffff);
    tail.moveTo(0, 0);
    tail.lineTo(-tailWidth / 2, -tailHeight);
    tail.lineTo(tailWidth / 2, -tailHeight);
    tail.closePath();
    tail.endFill();

    tail.x = -(w / 2) * 0.5;
    tail.y = h / 2 + 10;

    bubble.addChildAt(bg, 0);
    bubble.addChildAt(tail, 1);

    txt.y -= extraBottom / 2;
    bubble.y = -(h + tailHeight);
    bubble.x = w / 4;
  });

  let elapsed = 0;
  const lifetime = 8000;
  const fade = (ticker) => {
    elapsed += ticker.deltaMS;
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
