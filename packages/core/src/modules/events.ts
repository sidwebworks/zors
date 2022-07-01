import { EventsMap, Listener, ProgramEvents } from '../types';
import { Program } from './program';

export class EventsManager<
  Events extends Record<ProgramEvents, Program> = Record<ProgramEvents, Program>
> {
  private events: EventsMap<Events> = new Map();

  on = <K extends keyof Events>(type: K, listener: Listener) => {
    const listeners = this.events.get(type);

    if (listeners) {
      listeners.push(listener);
    } else {
      this.events.set(type, [listener]);
    }
  };

  off = <K extends keyof Events>(type: K, listener?: Listener) => {
    const listeners = this.events.get(type);

    if (listeners) {
      if (listener) {
        listeners.splice(listeners.indexOf(listener) >>> 0, 1);
      } else {
        this.events.set(type, []);
      }
    }
  };

  emit = <K extends keyof Events>(type: K, data?: Events[K]) => {
    const listeners = this.events.get(type);

    if (listeners) {
      listeners.forEach((listener) => {
        listener();
      });
    }
  };
}
