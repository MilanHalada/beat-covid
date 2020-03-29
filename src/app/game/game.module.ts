import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GameRoutingModule} from './game-routing.module';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import {GameComponent} from './game-component/game.component';



@NgModule({
  declarations: [
    GameRoutingModule.components,
    ControlPanelComponent
  ],
  exports: [
    ControlPanelComponent,
    GameComponent
  ],
  imports: [
    GameRoutingModule,
    CommonModule
  ]
})
export class GameModule { }
