import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { RoleCheckDirective } from "../directives/role-check.directive";
import { WidgetHostComponent } from "../components/widget-host.component";
import { PluginRegistryService } from "../plugins/plugin-registry.service";
import { WidgetInstance } from "../plugins/plugin.types";
import { AuthStateService } from "../state/auth-state.service";
import { ThemeStateService } from "../state/theme-state.service";

@Component({
  selector: "app-cms-page",
  standalone: true,
  imports: [CommonModule, RouterLink, RoleCheckDirective, WidgetHostComponent],
  template: `
    <main class="layout">
      <section class="left">
        <h2>Catalogo de Widgets Remotos</h2>
        <p>Arrastra o pulsa "Agregar" para crear instancias runtime.</p>
        <article class="card" *ngFor="let widget of catalog()">
          <h3>{{ widget.title }}</h3>
          <small>Remote: {{ widget.remoteName }}</small>
          <div
            class="drag-source"
            draggable="true"
            (dragstart)="onDragStart($event, widget.id)"
            title="Arrastra este widget al canvas"
          >
            Arrastrar al canvas
          </div>
          <button type="button" (click)="addWidget(widget.id)">Agregar</button>
          <a [routerLink]="['/plugin', widget.id]">Validar integridad</a>
        </article>
      </section>

      <section
        class="center"
        [class.drop-active]="dropActive()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave()"
        (drop)="onDrop($event)"
      >
        <header class="toolbar">
          <h2>Canvas CMS</h2>
          <div class="toolbar-actions">
            <button type="button" (click)="toggleRole('editor')">
              Rol editor: {{ authState.isEditor() ? 'ON' : 'OFF' }}
            </button>
            <button type="button" (click)="toggleTheme()">
              Tema: {{ themeState.isDark() ? 'Oscuro' : 'Claro' }}
            </button>
          </div>
        </header>
        <ng-container *ngIf="layout().length; else empty">
          <article class="widget-shell" *ngFor="let instance of layout(); trackBy: trackByInstanceId">
            <header>
              <strong>{{ instance.title }}</strong>
              <button type="button" (click)="removeWidget(instance.instanceId)">Quitar</button>
            </header>
            <section *appRoleCheck="instance.requiredRoles">
              <app-widget-host [instance]="instance" [siblingIds]="instanceIds()" />
            </section>
            <p class="forbidden" *ngIf="!authState.hasAnyRole(instance.requiredRoles)">
              Sin permisos para este widget. Al perder rol se destruye el componente y sus subscriptions.
            </p>
          </article>
        </ng-container>
        <ng-template #empty>
          <p>Canvas vacio. Agrega widgets desde el catalogo.</p>
        </ng-template>
      </section>

      <section class="right">
        <h2>Estado de Roles</h2>
        <p>Roles actuales: {{ rolesLabel() }}</p>
        <ul>
          <li>viewer: acceso base</li>
          <li>editor: habilita widgets restringidos</li>
        </ul>
      </section>
    </main>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 300px 1fr 260px;
        gap: 1rem;
        padding: 1rem;
      }
      .card,
      .widget-shell,
      .left,
      .center,
      .right {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 12px;
      }
      .left,
      .center,
      .right {
        padding: 1rem;
      }
      .card {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
      }
      .drag-source {
        margin: 0.6rem 0;
        padding: 0.4rem 0.6rem;
        border: 1px dashed var(--border-strong-color);
        color: var(--text-color);
        border-radius: 8px;
        cursor: grab;
        user-select: none;
        width: fit-content;
        font-size: 0.9rem;
      }
      .drop-active {
        outline: 2px dashed var(--accent-color);
        outline-offset: -8px;
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .toolbar-actions {
        display: flex;
        gap: 0.5rem;
      }
      .widget-shell {
        margin-top: 0.75rem;
        padding: 0.75rem;
      }
      .widget-shell header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.6rem;
      }
      .forbidden {
        color: var(--danger-color);
        font-size: 0.9rem;
      }
      @media (max-width: 980px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class CmsPageComponent {
  private readonly registry = inject(PluginRegistryService);
  readonly authState = inject(AuthStateService);
  readonly themeState = inject(ThemeStateService);

  readonly catalog = signal(this.registry.listCatalog());
  readonly layout = signal<WidgetInstance[]>([]);
  readonly instanceIds = computed(() => this.layout().map((item) => item.instanceId));
  readonly rolesLabel = computed(() => this.authState.roles().join(", "));
  readonly dropActive = signal(false);

  addWidget(widgetId: string): void {
    this.layout.update((current) => [...current, this.registry.createInstance(widgetId)]);
  }

  removeWidget(instanceId: string): void {
    this.layout.update((current) => current.filter((item) => item.instanceId !== instanceId));
  }

  toggleRole(role: string): void {
    this.authState.toggleRole(role);
  }

  toggleTheme(): void {
    this.themeState.toggle();
  }

  onDragStart(event: DragEvent, widgetId: string): void {
    if (!event.dataTransfer) {
      return;
    }
    event.dataTransfer.setData("application/x-widget-id", widgetId);
    event.dataTransfer.effectAllowed = "copy";
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dropActive.set(true);
  }

  onDragLeave(): void {
    this.dropActive.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const widgetId = event.dataTransfer?.getData("application/x-widget-id");
    if (widgetId) {
      this.addWidget(widgetId);
    }
    this.dropActive.set(false);
  }

  trackByInstanceId(_: number, instance: WidgetInstance): string {
    return instance.instanceId;
  }
}
