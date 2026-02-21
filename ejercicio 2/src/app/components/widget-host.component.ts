import {
  Component,
  EnvironmentInjector,
  Input,
  OnChanges,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
  createEnvironmentInjector,
  inject
} from "@angular/core";
import { loadRemoteModule } from "../plugins/module-federation.runtime";
import { RemoteWidgetManifest, WidgetInstance } from "../plugins/plugin.types";
import { WIDGET_CONFIG } from "../plugins/widget-config.token";
import { WidgetBusService } from "../state/widget-bus.service";
import { RemoteIntegrityService } from "../security/remote-integrity.service";

@Component({
  selector: "app-widget-host",
  standalone: true,
  template: `<ng-container #slot />`
})
export class WidgetHostComponent implements OnChanges {
  @Input({ required: true }) instance!: WidgetInstance;
  @Input() siblingIds: string[] = [];

  @ViewChild("slot", { read: ViewContainerRef, static: true })
  private slot!: ViewContainerRef;

  private readonly envInjector = inject(EnvironmentInjector);
  private readonly bus = inject(WidgetBusService);
  private readonly integrity = inject(RemoteIntegrityService);

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes["instance"]) {
      return;
    }
    await this.mountRemoteComponent();
  }

  private async mountRemoteComponent(): Promise<void> {
    this.slot.clear();
    await this.integrity.assertRemoteEntry(
      this.instance.remoteEntry,
      this.instance.expectedRemoteEntryIntegrity
    );

    const remoteModule = await loadRemoteModule<Record<string, unknown>>({
      remoteEntry: this.instance.remoteEntry,
      remoteName: this.instance.remoteName,
      exposedModule: this.instance.exposedModule
    });

    const manifest = remoteModule[this.instance.manifestExport] as RemoteWidgetManifest;
    if (
      !manifest ||
      manifest.integrity !== this.instance.expectedIntegrity ||
      manifest.version !== this.instance.expectedVersion
    ) {
      throw new Error(`Integridad invalida en widget ${this.instance.widgetId}`);
    }

    const widgetInjector = createEnvironmentInjector(
      [{ provide: WIDGET_CONFIG, useValue: this.instance.config }],
      this.envInjector
    );

    const componentRef = this.slot.createComponent(manifest.component as Type<unknown>, {
      environmentInjector: widgetInjector
    });
    componentRef.setInput("instanceId", this.instance.instanceId);
    componentRef.setInput("title", this.instance.title);
    componentRef.setInput("bus", this.bus.asPort());
    componentRef.setInput("siblingIds", this.siblingIds);
  }
}
