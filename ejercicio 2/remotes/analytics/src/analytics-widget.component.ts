import {
  Component,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription, interval } from "rxjs";
import { WIDGET_CONFIG } from "../../../src/app/plugins/widget-config.token";
import { WidgetBusPort } from "../../../src/app/plugins/plugin.types";

@Component({
  selector: "remote-analytics-widget",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="widget">
      <h4>{{ title }}</h4>
      <p>Metrica: {{ metricName }}</p>
      <p>Threshold: {{ threshold }}%</p>
      <p>Ticks de stream: {{ ticks() }}</p>
      <p *ngIf="lastMessage()">Mensaje bus: {{ lastMessage() }}</p>
      <button type="button" (click)="sendToSibling()">Enviar a sibling</button>
    </section>
  `,
  styles: [
    `
      .widget {
        padding: 0.75rem;
        background: var(--widget-analytics-bg);
        border: 1px solid var(--border-color);
        border-radius: 8px;
      }
    `
  ]
})
export class AnalyticsWidgetComponent implements OnInit, OnDestroy {
  @Input() instanceId = "";
  @Input() title = "Analytics Widget";
  @Input() bus?: WidgetBusPort;
  @Input() siblingIds: string[] = [];

  private readonly config = inject<Record<string, unknown>>(WIDGET_CONFIG as never);
  private readonly injector = inject(Injector);
  private readonly subscription = new Subscription();

  readonly ticks = signal(0);
  readonly lastMessage = signal("");

  metricName = String(this.config["metricName"] ?? "Metric");
  threshold = Number(this.config["threshold"] ?? 0);

  ngOnInit(): void {
    this.subscription.add(interval(1000).subscribe(() => this.ticks.update((value) => value + 1)));
    effect(
      () => {
        const all = this.bus?.events() ?? [];
        const incoming = [...all].reverse().find((msg) => msg.to === this.instanceId);
        if (incoming) {
          this.lastMessage.set(incoming.payload);
        }
      },
      { injector: this.injector }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  sendToSibling(): void {
    const target = this.siblingIds.find((id) => id !== this.instanceId) ?? this.instanceId;
    this.bus?.publish({
      from: this.instanceId,
      to: target,
      payload: `${this.title} reporta KPI ${this.metricName} a ${target}`,
      at: Date.now()
    });
  }
}
