import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class RemoteIntegrityService {
  private readonly okCache = new Set<string>();
  private readonly sessionBaseline = new Map<string, string>();

  async assertRemoteEntry(remoteEntry: string, expectedIntegrity: string): Promise<void> {
    const cacheKey = `${remoteEntry}|${expectedIntegrity}`;
    if (this.okCache.has(cacheKey)) {
      return;
    }

    const response = await fetch(remoteEntry, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`No se pudo leer remoteEntry: ${remoteEntry}`);
    }

    const content = await response.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", content);
    const actual = `sha256-${this.toBase64(digest)}`;

    const baseline = this.sessionBaseline.get(remoteEntry);
    if (baseline) {
      if (actual !== baseline) {
        throw new Error(`Integridad de remoteEntry invalida para ${remoteEntry}`);
      }
      this.okCache.add(cacheKey);
      return;
    }

    if (actual === expectedIntegrity) {
      this.sessionBaseline.set(remoteEntry, actual);
      this.okCache.add(cacheKey);
      return;
    }

    // En desarrollo (localhost + HMR) el remoteEntry cambia con frecuencia.
    // Se fija el primer hash observado de la sesion y se valida consistencia desde ahi.
    if (this.isLocalhost(remoteEntry)) {
      this.sessionBaseline.set(remoteEntry, actual);
      this.okCache.add(cacheKey);
      console.warn(
        `[integrity] Hash dinamico detectado en dev para ${remoteEntry}. Baseline de sesion: ${actual}`
      );
      return;
    }

    throw new Error(`Integridad de remoteEntry invalida para ${remoteEntry}`);
  }

  private toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private isLocalhost(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    } catch {
      return false;
    }
  }
}
