import { Injectable, computed, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AuthStateService {
  private readonly _roles = signal<string[]>(["viewer"]);
  readonly roles = this._roles.asReadonly();
  readonly isEditor = computed(() => this._roles().includes("editor"));

  hasAnyRole(required: string[]): boolean {
    const current = this._roles();
    return required.some((role) => current.includes(role));
  }

  toggleRole(role: string): void {
    this._roles.update((current) =>
      current.includes(role) ? current.filter((r) => r !== role) : [...current, role]
    );
  }
}
