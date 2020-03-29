import {MainScene} from './MainScene';
import {PersonState} from '../enums/PersonStateEnum';
import {Settings} from './Settings';
import {Events, GameService, EmitEvent} from '../game.service';
import {Stats} from './Stats';
import {GameComponent} from '../game-component/game.component';

export class UIScene extends Phaser.Scene {

  private tick: number;

  private score: Phaser.GameObjects.Text;

  isGameOver = false;

  constructor(
  )
  {
    super({ key: 'ui', active: true });
  }

  create()
  {
    this.input.setGlobalTopOnly(false);
    // const debug = this.add.text(10, 10, '', { font: '24px Courier', fill: '#ffffff' });
    this.score = this.add.text(500, 10, '', { font: '36px Courier', fill: '#ffffff' });
    this.tick = this.time.now;

    /*
      const mainScene = this.scene.get('main');
      mainScene.events.on('personHover', (log) => {
        debug.setText((log as []).join('\n'));
      }, this);
    */
  }

  update() {
    if (this.time.now - this.tick > 1000) {
      this.tick = this.time.now;

      this.getStats();
      // this.score.setText(this.getStats().join('\n'));
    }
  }

  getStats(): string[] {
    const mainScene = this.scene.get('main');
    const notInfected = (mainScene as MainScene).people.filter((p) => p.state === PersonState.Healthy).length;
    const infected = (mainScene as MainScene).people.filter((p) => p.state === PersonState.Symptomatic).length;
    const detected = (mainScene as MainScene).people.filter((p) => p.state === PersonState.Positive).length;
    const severe = (mainScene as MainScene).people.filter((p) => p.state === PersonState.Severe).length;
    const hospitalized = (mainScene as MainScene).people.filter((p) => p.state === PersonState.Hospitalized).length;
    const dead = (mainScene as MainScene).people.filter((p) => p.state === PersonState.Dead).length;
    const cured = (mainScene as MainScene).people.filter((p) => p.state === PersonState.Cured).length;

    const stats = new Stats();
    stats.notInfected = notInfected;
    stats.infected = infected;
    stats.detected = detected;
    stats.severe = severe;
    stats.hospitalized = hospitalized;
    stats.dead = dead;
    stats.cured = cured;

    GameService.emit(new EmitEvent(Events.StatsUpdate, stats));

    if (infected === 0 && detected === 0 && severe === 0 && hospitalized === 0 && (dead > 0 || cured > 0) && !GameService.gameOver) {

      GameService.gameOver = true;
      GameService.emit(new EmitEvent(Events.GameOver, stats));

    }

    return [

      `${notInfected} people healthy`,
      `${infected} people are sick`,
      `${detected} people tested positive`,
      `${hospitalized} out of ${Settings.hospitalCapacity} hospital places used`,
      `${severe} people in severe condition`,
      `${dead} people dead`,
      `${cured} people cured`

    ];
  }
}
