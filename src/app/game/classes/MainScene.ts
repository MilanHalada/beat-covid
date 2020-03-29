import {Person} from './Person';
import {Detector} from './Detector';
import {Settings} from './Settings';

export class MainScene extends Phaser.Scene {

  public static wallThickness = 64;
  public static sides = (MainScene.wallThickness * 2) + 96;
  public static worldBounds = new Phaser.Geom.Rectangle(0, 0, (1280 * Settings.worldSize), (920 * Settings.worldSize));
  public static spriteBounds =
    Phaser.Geom.Rectangle.Inflate(Phaser.Geom.Rectangle.Clone(MainScene.worldBounds), -MainScene.sides, -MainScene.sides);

  public people: Person[] = [];
  public detector: Detector;


  private controls: Phaser.Cameras.Controls.SmoothedKeyControl;
  private origDragPoint: Phaser.Math.Vector2;

  constructor() {
    super({ key: 'main' });
  }

  create() {
    this.people.forEach((p) => p.destroy());
    this.people = [];
    this.physics.world.setBounds(0, 0, MainScene.worldBounds.width, MainScene.worldBounds.height);
    this.cameras.main.setBounds(0, 0, MainScene.worldBounds.width, MainScene.worldBounds.height);
    this.setupControls();
    for (let i = 0; i < Settings.population; i++) {
      const person = new Person(i, this, MainScene.spriteBounds);
      if (i < Settings.infectedStart) {
        person.infect(null);
      }
      this.people.push(person);
    }

    this.detector = new Detector(this, MainScene.spriteBounds);
    this.cameras.main.setZoom(0.1);
  }

  preload() {
    this.load.image('biohazard', '/assets/images/biohazard.png');
  }

  update(time, delta) {
    for (const person of this.people) {
      person.step();
    }

    this.controls.update(delta);

    if (this.input.activePointer.isDown) {
      if (this.origDragPoint) {
        // move the camera by the amount the mouse has moved since last update
        this.cameras.main.scrollX +=
          (this.origDragPoint.x - this.input.activePointer.position.x) / this.cameras.main.zoom;
        this.cameras.main.scrollY +=
          (this.origDragPoint.y - this.input.activePointer.position.y) / this.cameras.main.zoom;
      } // set new drag origin to current position
      this.origDragPoint = this.input.activePointer.position.clone();
    } else {
      this.origDragPoint = null;
    }
  }

  setupControls() {
    const cursors = this.input.keyboard.createCursorKeys();

    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      acceleration: 0.1,
      drag: 0.0005,
      maxSpeed: 1.0
    };

    this.input.on('wheel', (pointer, gameObject, deltaX, deltaY, deltaZ) => {
      this.cameras.main.setZoom(this.cameras.main.zoom + (deltaY < 0 ? 0.02 : -0.02));
      if (deltaY < 0) {
        this.cameras.main.scrollX = pointer.worldX;
        this.cameras.main.scrollY = pointer.worldY;
      }
      if (this.cameras.main.zoom > 2) {
        this.cameras.main.setZoom(2);
      }
      if (this.cameras.main.zoom < 0.1) {
        this.cameras.main.setZoom(0.1);
      }
    });

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
  }
}
