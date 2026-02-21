import { DOCUMENT } from "@angular/common";
import { Injectable, computed, inject, signal } from "@angular/core";

type ThemeMode = "light" | "dark";

@Injectable({ providedIn: "root" })
export class ThemeStateService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = "cms-theme-mode";
  private readonly _mode = signal<ThemeMode>("light");

  readonly mode = this._mode.asReadonly();
  readonly isDark = computed(() => this._mode() === "dark");

  constructor() {
    const stored = this.getStoredMode();
    const mode = stored ?? this.getPreferredMode();
    this.setMode(mode);
  }

  toggle(): void {
    this.setMode(this._mode() === "dark" ? "light" : "dark");
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    this.document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem(this.storageKey, mode);
  }

  private getStoredMode(): ThemeMode | null {
    const value = localStorage.getItem(this.storageKey);
    return value === "light" || value === "dark" ? value : null;
  }

  private getPreferredMode(): ThemeMode {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
}
