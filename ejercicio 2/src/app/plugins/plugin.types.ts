import { Type, WritableSignal } from "@angular/core";

export interface RemoteWidgetDefinition {
  id: string;
  title: string;
  remoteName: string;
  remoteEntry: string;
  exposedModule: string;
  manifestExport: string;
  version: string;
  integrity: string;
  remoteEntryIntegrity: string;
  requiredRoles: string[];
  defaultConfig: Record<string, unknown>;
}

export interface RemoteWidgetManifest {
  id: string;
  title: string;
  version: string;
  integrity: string;
  requiredRoles: string[];
  component: Type<unknown>;
}

export interface WidgetInstance {
  instanceId: string;
  widgetId: string;
  title: string;
  remoteName: string;
  remoteEntry: string;
  exposedModule: string;
  manifestExport: string;
  expectedIntegrity: string;
  expectedRemoteEntryIntegrity: string;
  expectedVersion: string;
  requiredRoles: string[];
  config: Record<string, unknown>;
}

export interface WidgetMessage {
  from: string;
  to: string | "broadcast";
  payload: string;
  at: number;
}

export interface WidgetBusPort {
  events: WritableSignal<WidgetMessage[]>;
  publish: (event: WidgetMessage) => void;
}
