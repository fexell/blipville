// bubbleManager.js
export const BubbleRegistry = {
  typingBubbles: new Set(),
  chatBubbles: new Set(),
};

export function createBubbleManager(app, player) {
  const uiLayer = app.layers.uiLayer;

  return {
    add(bubble) {
      uiLayer.addChild(bubble);
    },
    remove(bubble) {
      uiLayer.removeChild(bubble);
    }
  };
}


// --------------------------------------------
// POSITIONING + STACKING
// --------------------------------------------

export function attachRepositionFn(player, app) {
  player.repositionStack = function () {
    if (!player.chatStack || !player.container) return;

    const screenLeft = 0;
    const screenRight = app.renderer.width;
    const screenTop = 0;

    const avatarHeight = 48;

    // Distance from the top of the avatar’s head to the FIRST bubble
    const headOffset = 10; // ← increase this to push bubbles higher

    const spacing = 10; // vertical spacing between bubbles

    let offset = headOffset;

    for (let i = 0; i < player.chatStack.length; i++) {
      const bubble = player.chatStack[i];
      const bw = bubble._w || 0;
      const bh = bubble._h || 0;
      if (!bw || !bh) continue;

      // Compute avatar head position
      const avatarTop = player.container.y - avatarHeight / 2;

      // Bubble center Y
      let y = avatarTop - offset - bh / 2;

      // Clamp to top of screen
      if (y - bh / 2 < screenTop + 5) {
        y = screenTop + bh / 2 + 5;
      }

      bubble.y = y;
      bubble.x = player.container.x;

      // Tail fix
      if (bubble.tail) {
        bubble.tail.y = bh / 2;
        bubble.tail.scale.y = 1;
      }

      // Horizontal clamp
      const halfW = bw / 2;
      if (bubble.x - halfW < screenLeft + 5) bubble.x = screenLeft + halfW + 5;
      if (bubble.x + halfW > screenRight - 5) bubble.x = screenRight - halfW - 5;

      offset += bh + spacing;
    }
  };
}
