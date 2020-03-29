import {Component, OnInit} from '@angular/core';
import * as Phaser from 'phaser';
import {MainScene} from '../classes/MainScene';
import {UIScene} from '../classes/UIScene';
import {Events, GameService} from '../game.service';

@Component({
  selector: 'app-game-component',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {

  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor(
    private gameService: GameService
  ) {
    this.config = {
      type: Phaser.AUTO,
      height: 920,
      width: 1280,
      scene: [ MainScene, UIScene ],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          useTree: false,
          debug: false
        }
      }
    };

  }

  public static emit(data) {
    this.emit(data);
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);

    this.gameService.on(Events.GameRestart, () => {
      this.phaserGame.scene.stop('main');
      this.phaserGame.scene.start('main');
      this.phaserGame.scene.stop('ui');
      this.phaserGame.scene.start('ui');
      GameService.gameOver = false;
    });

    this.gameService.on(Events.GamePause, () => {
      if (this.phaserGame.scene.isPaused('main')) {
        this.phaserGame.scene.resume('main');
      } else {
        this.phaserGame.scene.pause('main');
      }
    });

    this.gameService.on(Events.GameStart, () => {
      this.phaserGame.scene.start('main');
    });
  }

}
