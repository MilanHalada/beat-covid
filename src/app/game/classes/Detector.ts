import {MainScene} from './MainScene';
import { Person } from './Person';
import {Settings} from './Settings';

export class Detector {

  private actor: Phaser.GameObjects.Rectangle;



  constructor(
    private scene: MainScene,
    private spriteBounds: Phaser.Geom.Rectangle) {

    this.actor = this.scene.add.rectangle(0, 0, 600 * Settings.detectorSizeKoef, 400 * Settings.detectorSizeKoef);
    this.actor.setFillStyle(0xffff00, 0.2);
    this.scene.physics.add.existing(this.actor);

    this.scene.input.on('pointermove', (pointer) => {
      this.actor.x = pointer.worldX;
      this.actor.y = pointer.worldY;

    }, this);

    this.scene.physics.add.overlap(this.actor, this.scene.people.map((p) => p.actor), (a, b) => {
      const target = this.scene.people.find((p) => p.name === b.name);
      target.checking();
      if (this.scene.input.activePointer.leftButtonDown()) {
        console.log('button down');
        target.identify();
        target.showInfector();
      }
    });
  }
}
