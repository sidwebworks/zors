import { Program } from "../Program";
import { EventsMap, Listener, ProgramEvents } from "../types";

export class EventsManager<
  P extends Program,
  Events extends Record<ProgramEvents, P> = Record<ProgramEvents, P>,
  TypedListener extends Listener<any> = Listener<Events[keyof Events]>
> {
  constructor(private events: EventsMap<Events> = new Map()) {}

  on = <K extends keyof Events>(
    type: K,
    listener: K extends "onError"
      ? Listener<{ error: any; program?: Program }>
      : TypedListener
  ) => {
    const listeners = this.events.get(type);

    if (listeners) {
      listeners.push(listener);
    } else {
      this.events.set(type, [listener]);
    }
  };

  off = <K extends keyof Events>(type: K, listener?: TypedListener) => {
    const listeners = this.events.get(type);

    if (listeners) {
      if (listener) {
        listeners.splice(listeners.indexOf(listener) >>> 0, 1);
      } else {
        this.events.set(type, []);
      }
    }
  };

  emit = <K extends keyof Events>(
    type: K,
    data?: K extends "onError" ? { error: any; program?: Program } : Events[K]
  ) => {
    const listeners = this.events.get(type);

    if (listeners) {
      (listeners as Listener<typeof data>[]).forEach((l) => {
        l(data);
      });
    }
  };
}
