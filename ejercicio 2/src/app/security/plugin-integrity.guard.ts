import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { PluginRegistryService } from "../plugins/plugin-registry.service";
import { RemoteWidgetManifest } from "../plugins/plugin.types";
import { loadRemoteModule } from "../plugins/module-federation.runtime";
import { RemoteIntegrityService } from "./remote-integrity.service";

export const pluginIntegrityGuard: CanActivateFn = async (route) => {
  const pluginId = route.paramMap.get("id");
  if (!pluginId) {
    return false;
  }

  const registry = inject(PluginRegistryService);
  const integrity = inject(RemoteIntegrityService);
  const definition = registry.getById(pluginId);
  if (!definition) {
    return false;
  }

  try {
    await integrity.assertRemoteEntry(definition.remoteEntry, definition.remoteEntryIntegrity);

    const remoteModule = await loadRemoteModule<Record<string, unknown>>({
      remoteEntry: definition.remoteEntry,
      remoteName: definition.remoteName,
      exposedModule: definition.exposedModule
    });

    const manifest = remoteModule[definition.manifestExport] as RemoteWidgetManifest;
    return (
      !!manifest &&
      manifest.id === definition.id &&
      manifest.version === definition.version &&
      manifest.integrity === definition.integrity
    );
  } catch {
    return false;
  }
};
