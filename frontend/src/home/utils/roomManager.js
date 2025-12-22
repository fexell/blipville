// src/utils/RoomManager.js
import { Container } from "pixi.js";
import { levels } from './levels';
import { buildRoom } from './rooms';

export class RoomManager {
  constructor(app) {
    if (!app) throw new Error("PIXI app is required");
    this.app = app;

    // Layers
    this.roomLayer = new Container();
    this.roomLayer.zIndex = 0;

    this.playersLayer = new Container();
    this.playersLayer.zIndex = 10;

    this.uiLayer = new Container();
    this.uiLayer.zIndex = 20;

    app.stage.addChild(this.roomLayer, this.playersLayer, this.uiLayer);
    app.layers = {
      roomLayer: this.roomLayer,
      playersLayer: this.playersLayer,
      uiLayer: this.uiLayer,
    };

    this.currentRoom = null;
    this.currentLevelKey = null;
  }

  async loadLevel(levelKey) {
    const levelData = levels[levelKey];
    if (!levelData) throw new Error(`Level "${levelKey}" not found`);

    // Remove old room
    if (this.currentRoom) {
      this.roomLayer.removeChild(this.currentRoom);
      if (this.currentRoom.destroy) this.currentRoom.destroy({ children: true });
      this.currentRoom = null;
    }

    // Build new room
    const room = await buildRoom(levelData);
    this.roomLayer.addChild(room);
    this.currentRoom = room;
    this.currentLevelKey = levelKey;

    // Sort layers just in case
    this.app.stage.children.sort((a, b) => a.zIndex - b.zIndex);
  }

  getLayers() {
    return this.app.layers;
  }
}
