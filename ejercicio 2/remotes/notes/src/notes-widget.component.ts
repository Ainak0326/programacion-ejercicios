import { CommonModule } from "@angular/common";
import { Component, Injector, Input, OnInit, effect, inject, signal } from "@angular/core";
import { WIDGET_CONFIG } from "../../../src/app/plugins/widget-config.token";
import { WidgetBusPort } from "../../../src/app/plugins/plugin.types";

@Component({
  selector: "remote-notes-widget",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="widget">
      <h4>{{ title }}</h4>
      <p>Canal: #{{ channel }}</p>
      <p>Ultimo mensaje: {{ lastBusMessage() || "sin mensajes" }}</p>
      <button type="button" (click)="pingSibling()">Ping a sibling</button>
    </section>
  `,
  styles: [
    `
      .widget {
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--surface-elevated);
        color: var(--text-color);
      }
    `
  ]
})
export class NotesWidgetComponent implements OnInit {
  @Input() instanceId = "";
  @Input() title = "Notes Widget";
  @Input() bus?: WidgetBusPort;
  @Input() siblingIds: string[] = [];

  private readonly config = inject<Record<string, unknown>>(WIDGET_CONFIG as never);
  private readonly injector = inject(Injector);

  readonly lastBusMessage = signal("");
  readonly channel = String(this.config["channel"] ?? "general");

  ngOnInit(): void {
    effect(
      () => {
        const last = this.bus?.events().at(-1);
        if (last && last.to === this.instanceId && last.from !== this.instanceId) {
          this.lastBusMessage.set(last.payload);
        }
      },
      { injector: this.injector }
    );
  }

  pingSibling(): void {
    const target = this.siblingIds.find((id) => id !== this.instanceId) ?? this.instanceId;
    this.bus?.publish({
      from: this.instanceId,
      to: target,
      payload: `${this.title} publica una nota en #${this.channel} a ${target}`,
      at: Date.now()
    });
  }
}
