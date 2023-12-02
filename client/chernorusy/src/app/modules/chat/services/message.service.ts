import {computed, effect, Injectable, signal} from '@angular/core';
import {of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  public getMessages$() {
    return signal<IMessage[]>([
      { author: 'Nikita', text: 'First Message', timestamp: new Date().toISOString()},
      { author: 'Egor', text: 'Second Message', timestamp: new Date().toISOString()},
    ])
  }
}

export interface IMessage{
  author: string;
  text: string;
  timestamp: string;
}
