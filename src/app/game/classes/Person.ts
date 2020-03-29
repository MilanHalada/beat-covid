import {PersonState} from '../enums/PersonStateEnum';
import {MainScene} from './MainScene';
import * as moment from 'moment';
import {Settings} from './Settings';

export class Person {

  private biohazard: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private speedX: number
  private speedY: number
  private position: Phaser.Geom.Point;
  private velocity: Phaser.Geom.Point;
  private isShowingInfector = false;
  private infectedBy: Person;

  private infectedTimer: Phaser.Time.TimerEvent;
  private treatedTimer: Phaser.Time.TimerEvent;
  private hospitalizationTimer: Phaser.Time.TimerEvent;
  private graphics: Phaser.GameObjects.Graphics;

  public hasCovid = false;
  public actor: Phaser.GameObjects.Text;
  public connector: Phaser.Geom.Line;
  public state: PersonState;
  public name: string;
  public infectedCount = 0;

  private log: string[] = [];


  constructor(
    identifier: number,
    private scene: MainScene,
    private spriteBounds: Phaser.Geom.Rectangle
  ) {
    this.name = `person_${identifier}`;
    this.state = PersonState.Healthy;

    this.position = new Phaser.Geom.Point();
    Phaser.Geom.Rectangle.Random(this.spriteBounds, this.position);
    this.changeVelocity();

    this.actor = this.scene.add.text(this.position.x, this.position.y, PersonState.Healthy, { fontSize: `${Settings.personSize}px` });
    this.actor.name = this.name;
    this.actor.setInteractive( { useHandCursor: true  });
    this.scene.physics.add.existing(this.actor);
    (this.actor.body as Phaser.Physics.Arcade.Body).setVelocity(this.velocity.x, this.velocity.y);
    (this.actor.body as Phaser.Physics.Arcade.Body).setBounce(1, 1);
    (this.actor.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    (this.actor.body as Phaser.Physics.Arcade.Body)
      .setCircle(Settings.personSize,
        -Settings.personSize + Settings.personSize / 2,
        -Settings.personSize + Settings.personSize / 2);
    (this.actor.body as Phaser.Physics.Arcade.Body).debugBodyColor = 0xffffff;
    this.actor.on('pointerdown', (pointer) => {
      this.scene.events.emit('personHover', this.log);
    });
    this.scene.physics.add.overlap(this.actor, this.scene.people.map((p) => p.actor), (a, b) => {
      const target = this.scene.people.find((p) => p.name === b.name);
      if (target && target.state === PersonState.Healthy && this.state === PersonState.Symptomatic) {
        target.infect(this);
      }
      if (target && target.state === PersonState.Symptomatic && this.state === PersonState.Healthy) {
        this.infect(target);
      }
    });

    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(2, 0xff0000);

    this.biohazard = this.scene.add.particles('biohazard');
    const shape1 = new Phaser.Geom.Circle(0, 0, Settings.infectRadius);
    this.biohazard.createEmitter({
      speed: { min: 10, max: 20 },
      quantity: 10,
      lifespan: 200,
      alpha: { start: 0.5, end: 0.1 },
      scale: { start: 0.5, end: 3.5 },
      emitZone: { type: 'random', source: shape1 },
      on: false
    });

    this.log.push(`[${moment().toISOString()}] created`);
  }

  public step() {
    this.update();

    this.graphics.clear();

    if (this.isShowingInfector && this.connector && this.infectedBy && Settings.showInfector) {
      this.connector.x1 = this.actor.x + Settings.personSize / 2;
      this.connector.y1 = this.actor.y + Settings.personSize / 2;
      this.connector.x2 = this.infectedBy.actor.x + Settings.personSize / 2;
      this.connector.y2 = this.infectedBy.actor.y + Settings.personSize / 2;

      this.graphics.lineStyle(3, 0xff0000);

      this.graphics.strokeLineShape(this.connector);

    }
  }

  public infect(source: Person) {
    if (!source
      || (Phaser.Math.Between(0, 1000) < (Settings.infectionChance) && source.hasCovid && source.state === PersonState.Symptomatic)) {
      this.hasCovid = true;
      this.changeState(PersonState.Symptomatic);
      this.log.push(`[${moment().toISOString()}] infecteded by ${source ? source.name : 'bad luck' }`);
      if (source) {
        this.infectedBy = source;
        source.infectedCount++;
        this.connector = new Phaser.Geom.Line();
      }
    }
  }

  public getPosition(): Phaser.Geom.Point {
    return new Phaser.Geom.Point(this.actor.x, this.actor.y);
  }

  public showInfector() {
    this.isShowingInfector = true;
  }


  public identify() {
    if (this.hasCovid && this.state === PersonState.Symptomatic) {
      this.changeState(PersonState.Positive);
      this.log.push(`[${moment().toISOString()}] tested positive`);
    }
  }

  public reset() {
    this.actor.setTint(0xffffff);
  }

  public checking() {
    if (this.hasCovid) {
      this.actor.setTint(0xff0000);
      this.biohazard.emitParticleAt(this.actor.x + Settings.personSize / 2, this.actor.y + Settings.personSize / 2);
    }
  }

  update() {
    if (Phaser.Math.Between(0, 1000) < 1) {
      this.changeVelocity();
    }

    this.reset();
  }

  changeVelocity() {
    if (this.state === PersonState.Symptomatic || this.state === PersonState.Healthy) {
      this.speedX = Phaser.Math.Between(-10 * Settings.personSpeedKoef, 10 * Settings.personSpeedKoef);
      this.speedY = Phaser.Math.Between(-10 * Settings.personSpeedKoef, 10 * Settings.personSpeedKoef);
      this.velocity = new Phaser.Geom.Point(Math.random() * 80 * this.speedX, Math.random() * 80 * this.speedY);
      if (this.actor && this.actor.body) {
        (this.actor.body as Phaser.Physics.Arcade.Body).setVelocity(this.velocity.x, this.velocity.y);
      }
    }
  }

  changeState(newState: PersonState) {
    this.state = newState;
    this.actor.setText(newState.toString());
    switch (newState) {
      case PersonState.Symptomatic: {
        (this.actor.body as Phaser.Physics.Arcade.Body)
          .setCircle(Settings.infectRadius,
            -Settings.infectRadius + Settings.personSize / 2,
            -Settings.infectRadius + Settings.personSize / 2);
        this.infectedTimer = this.scene.time.addEvent({
          delay: Phaser.Math.Between(30000, 60000),
          repeat: 1,
          callback: () => this.undetected()
        });
        break;
      }
      case PersonState.Positive: {
        (this.actor.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.infectedTimer.paused = true;
        this.treatedTimer = this.scene.time.addEvent({
          delay: Phaser.Math.Between(2000, 4000),
          repeat: Phaser.Math.Between(2, Settings.improvedTreatment ? 10 : 20),
          callback: () => this.treat()
        });
        break;
      }
      case PersonState.Severe: {
        (this.actor.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        break;
      }
      case PersonState.Hospitalized: {
        (this.actor.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        break;
      }
      case PersonState.Cured: {
        (this.actor.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        this.infectedTimer.destroy();
        this.velocity = new Phaser.Geom.Point(Math.random() * 80 * this.speedX, Math.random() * 80 * this.speedY);
        this.hasCovid = false;
        break;
      }
      case PersonState.Dead: {
        (this.actor.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        if (this.infectedTimer) {
          this.infectedTimer.destroy();
        }
        if (this.treatedTimer) {
          this.treatedTimer.destroy();
        }
        this.hasCovid = false;
        break;
      }
    }
  }

  treat() {
    this.log.push(`[${moment().toISOString()}] treatment rounds left ${this.treatedTimer.getRepeatCount()}`);

    if (this.state === PersonState.Severe
      && this.scene.people.filter((p) => p.state === PersonState.Hospitalized).length < Settings.hospitalCapacity) {
      this.hospitalize();
    }

    if (Phaser.Math.Between(0, 1000) < (this.state === PersonState.Severe ?  200 : 10)) {
      this.death();
    }

    if (Phaser.Math.Between(0, 1000) < 100) {
      this.severe();
    }

    if (this.treatedTimer.getRepeatCount() === 0) {
      this.cured();
    }
  }

  severe() {
    this.log.push(`[${moment().toISOString()}] need hospitalization`);
    this.changeState(PersonState.Severe);
  }


  cured() {
    this.changeState(PersonState.Cured);
    this.log.push(`[${moment().toISOString()}] cured`);
  }

  hospitalize() {
    this.log.push(`[${moment().toISOString()}] hospitalized`);
    this.changeState(PersonState.Hospitalized);
  }

  death() {
    this.changeState(PersonState.Dead);
    this.log.push(`[${moment().toISOString()}] died`);
  }

  undetected() {
    const nr = Phaser.Math.Between(0, 1000);
    if (nr < 300) {
      this.cured();
    } else if (nr < 800) {
      this.hospitalize();
      this.treatedTimer = this.scene.time.addEvent({
        delay: Phaser.Math.Between(2000, 4000),
        repeat: Phaser.Math.Between(2, 20),
        callback: () => this.treat()
      });
    } else {
      this.death();
    }

  }

  public destroy() {
    this.actor.destroy(true);
  }
}
