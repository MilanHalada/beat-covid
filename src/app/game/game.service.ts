import { Injectable } from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {map, filter} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  public static gameOver = false;

  public static subject: Subject<any>;

  constructor() {
    GameService.subject = new Subject<any>();
  }

  static emit(event: EmitEvent) {
    GameService.subject.next(event);
  }

  on(event: Events, action: any): Subscription {
    return GameService.subject
      .pipe(
        filter((e: EmitEvent) => {
          return e.name === event;
        }),
        map((e: EmitEvent) => {
          return e.value;
        })
      ).subscribe(action);
  }

  emit(event: EmitEvent) {
    GameService.subject.next(event);
  }
}

export class EmitEvent {
  constructor(public name: any, public value?: any) {
  }
}

export enum Events {
  GameRestart,
  GamePause,
  GameStart,
  StatsUpdate,
  GameOver
}
