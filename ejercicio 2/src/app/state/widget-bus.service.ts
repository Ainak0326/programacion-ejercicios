import { Injectable, signal } from "@angular/core";
import { WidgetBusPort, WidgetMessage } from "../plugins/plugin.types";

@Injectable({ providedIn: "root" })
export class WidgetBusService {
  readonly events = signal<WidgetMessage[]>([]);

  publish(event: WidgetMessage): void {
    this.events.update((current) => [...current.slice(-49), event]);
  }

  asPort(): WidgetBusPort {
    return {
      events: this.events,
      publish: this.publish.bind(this)
    };
  }
}
