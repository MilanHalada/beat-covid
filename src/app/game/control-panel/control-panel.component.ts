import {Component, OnInit} from '@angular/core';
import {EmitEvent, Events, GameService} from '../game.service';
import {Stats} from '../classes/Stats';
import {Settings} from '../classes/Settings';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.sass']
})
export class ControlPanelComponent implements OnInit {

  stats: Stats = new Stats();
  hospitalCapacity = Settings.hospitalCapacity;
  money = 0;

  isImprovedTreatmentActive = false;
  isShowInfectorActive = false;
  isFaceMasksActive = false;
  isGameOver = false;
  noMoreStayAtHome = false;
  round = 1;


  constructor(
    private gameService: GameService
  ) { }

  ngOnInit(): void {

    this.gameService.on(Events.StatsUpdate, (stats) => {
      this.stats = stats;
    });

    this.gameService.on(Events.GameOver, (stats) => {

      this.stats = stats;
      this.money += (this.stats.notInfected + this.stats.cured - this.stats.dead) * 10;
      this.isGameOver = true;
      this.round++;

    });

  }

  restartGame() {
    this.isGameOver = false;
    GameService.gameOver = false;
    Settings.infectedStart = this.round;
    this.gameService.emit(new EmitEvent(Events.GameRestart));
  }

  pauseGame() {
    this.gameService.emit(new EmitEvent(Events.GamePause));
  }

  addHospitalBeds() {
    this.money -= 1000;
    Settings.hospitalCapacity += 5;
    this.hospitalCapacity = Settings.hospitalCapacity;
  }

  improveTesting() {
    this.money -= 1000;
    Settings.detectorSizeKoef += 0.1;
  }

  encourageStayingAtHome() {
    this.money -= 5000;
    Settings.personSpeedKoef -= 0.1;
    if (Settings.personSpeedKoef <= 0.2) {
      this.noMoreStayAtHome = true;
    }
  }

  showInfector() {
    this.money -= 10000;
    this.isShowInfectorActive = true;
    Settings.showInfector = true;
  }

  improvedTreatment() {
    this.money -= 10000;
    this.isImprovedTreatmentActive = true;
    Settings.improvedTreatment = true;
  }

  faceMasks() {
    this.money -= 2000;
    this.isFaceMasksActive = true;
    Settings.infectRadius = 90;
    Settings.infectionChance = 8;
  }

}
