import { Program } from "../Program";
import { ProgramEvents } from "../types";

type EventType = string | symbol;

type EventsMap<E extends Record<EventType, unknown>, D = E[keyof E]> = Map<
  keyof E,
  Listener<D>[]
>;

type Listener<D = unknown> = (data: D) => void;

export class EventsManager<
  P extends Program,
  Events extends Record<ProgramEvents, P> = Record<ProgramEvents, P>,
  TypedListener extends Listener<any> = Listener<Events[keyof Events]>
> {
  private events: EventsMap<Events> = new Map();

  on<K extends keyof Events>(
    type: K,
    listener: K extends "onError"
      ? Listener<{ error: any; program?: Program }>
      : TypedListener
  ): void {
    const listeners = this.events.get(type);

    if (listeners) {
      listeners.push(listener);
    } else {
      this.events.set(type, [listener]);
    }
  }

  off<K extends keyof Events>(type: K, listener?: TypedListener): void {
    const listeners = this.events.get(type);

    if (listeners) {
      if (listener) {
        listeners.splice(listeners.indexOf(listener) >>> 0, 1);
      } else {
        this.events.set(type, []);
      }
    }
  }

  emit<K extends keyof Events>(
    type: K,
    data?: K extends "onError" ? { error: any; program?: Program } : Events[K]
  ): void {
    const listeners = this.events.get(type);

    if (listeners) {
      (listeners as Listener<typeof data>[]).forEach((l) => {
        l(data);
      });
    }
  }
}
