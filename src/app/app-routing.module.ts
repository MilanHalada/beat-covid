import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AboutComponent} from './about/about.component';


const routes: Routes = [
  { path: 'game', loadChildren: () => import('./game/game.module').then(m => m.GameModule) },
  { path: '**', component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
