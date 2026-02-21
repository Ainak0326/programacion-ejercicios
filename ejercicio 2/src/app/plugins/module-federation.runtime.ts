type Container = {
  get: (module: string) => Promise<() => unknown>;
  init: (scope: unknown) => Promise<void>;
};

declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

declare global {
  interface Window {
    [key: string]: Container | undefined;
  }
}

const loadedRemoteEntries = new Set<string>();

export async function loadRemoteEntry(remoteEntry: string): Promise<void> {
  if (loadedRemoteEntries.has(remoteEntry)) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = remoteEntry;
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      loadedRemoteEntries.add(remoteEntry);
      resolve();
    };
    script.onerror = () => reject(new Error(`No se pudo cargar ${remoteEntry}`));
    document.head.appendChild(script);
  });
}

export async function loadRemoteModule<T = unknown>(options: {
  remoteEntry: string;
  remoteName: string;
  exposedModule: string;
}): Promise<T> {
  await loadRemoteEntry(options.remoteEntry);
  await __webpack_init_sharing__("default");

  const container = window[options.remoteName];
  if (!container) {
    throw new Error(`Remote container ${options.remoteName} no encontrado.`);
  }

  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(options.exposedModule);
  return factory() as T;
}
