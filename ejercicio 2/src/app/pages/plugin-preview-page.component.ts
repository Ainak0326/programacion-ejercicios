import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PluginRegistryService } from "../plugins/plugin-registry.service";

@Component({
  selector: "app-plugin-preview-page",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="wrapper">
      <h1>Guard de Integridad OK</h1>
      <p *ngIf="widgetId()">El plugin <strong>{{ widgetId() }}</strong> paso la validacion.</p>
      <p>Esta ruta solo abre si el guard verifica id, version e integrity del modulo remoto.</p>
      <a routerLink="/">Volver al CMS</a>
    </main>
  `,
  styles: [
    `
      .wrapper {
        margin: 2rem auto;
        max-width: 720px;
        padding: 1rem;
        background: var(--surface-color);
        border-radius: 12px;
        border: 1px solid var(--border-color);
      }
    `
  ]
})
export class PluginPreviewPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly registry = inject(PluginRegistryService);
  readonly widgetId = signal("");

  constructor() {
    const id = this.route.snapshot.paramMap.get("id") ?? "";
    if (this.registry.getById(id)) {
      this.widgetId.set(id);
    }
  }
}
