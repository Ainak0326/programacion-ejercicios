import { Injectable } from "@angular/core";
import { RemoteWidgetDefinition, WidgetInstance } from "./plugin.types";

@Injectable({ providedIn: "root" })
export class PluginRegistryService {
  private readonly catalog: RemoteWidgetDefinition[] = [
    {
      id: "analytics-kpi",
      title: "KPI Analytics",
      remoteName: "remoteAnalytics",
      remoteEntry: "http://localhost:4201/remoteEntry.js",
      exposedModule: "./Widget",
      manifestExport: "manifest",
      version: "1.0.0",
      integrity: "sha256-analytics-kpi-v1",
      remoteEntryIntegrity: "sha256-Lain6ofFsTX37QkHPQX9vDc5Ue46GGzKjZZYGb5oXbY=",
      requiredRoles: ["editor"],
      defaultConfig: { metricName: "Conversion Rate", threshold: 4.2 }
    },
    {
      id: "team-notes",
      title: "Team Notes",
      remoteName: "remoteNotes",
      remoteEntry: "http://localhost:4202/remoteEntry.js",
      exposedModule: "./Widget",
      manifestExport: "manifest",
      version: "1.0.0",
      integrity: "sha256-team-notes-v1",
      remoteEntryIntegrity: "sha256-N1YzQEX04OHzgo224YKWSxnvHQNsQ367B6qbyDB+5Oc=",
      requiredRoles: ["editor", "viewer"],
      defaultConfig: { channel: "general", color: "#fef3c7" }
    }
  ];

  listCatalog(): RemoteWidgetDefinition[] {
    return this.catalog;
  }

  getById(widgetId: string): RemoteWidgetDefinition | undefined {
    return this.catalog.find((item) => item.id === widgetId);
  }

  createInstance(widgetId: string): WidgetInstance {
    const plugin = this.getById(widgetId);
    if (!plugin) {
      throw new Error(`Widget ${widgetId} no registrado.`);
    }

    return {
      instanceId: crypto.randomUUID(),
      widgetId: plugin.id,
      title: plugin.title,
      remoteName: plugin.remoteName,
      remoteEntry: plugin.remoteEntry,
      exposedModule: plugin.exposedModule,
      manifestExport: plugin.manifestExport,
      expectedIntegrity: plugin.integrity,
      expectedRemoteEntryIntegrity: plugin.remoteEntryIntegrity,
      expectedVersion: plugin.version,
      requiredRoles: plugin.requiredRoles,
      config: { ...plugin.defaultConfig }
    };
  }
}
