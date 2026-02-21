import {
  DestroyRef,
  Directive,
  EmbeddedViewRef,
  Input,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  signal
} from "@angular/core";
import { AuthStateService } from "../state/auth-state.service";

@Directive({
  selector: "[appRoleCheck]",
  standalone: true
})
export class RoleCheckDirective {
  private readonly template = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly requiredRoles = signal<string[]>(["viewer"]);
  private viewRef: EmbeddedViewRef<unknown> | null = null;

  constructor() {
    const roleEffect = effect(() => {
      const allowed = this.authState.hasAnyRole(this.requiredRoles());
      if (allowed && !this.viewRef) {
        this.viewRef = this.viewContainer.createEmbeddedView(this.template);
      }
      if (!allowed && this.viewRef) {
        this.viewRef.destroy();
        this.viewContainer.clear();
        this.viewRef = null;
      }
    });

    this.destroyRef.onDestroy(() => roleEffect.destroy());
  }

  @Input({ required: true })
  set appRoleCheck(value: string | string[]) {
    const normalized = Array.isArray(value) ? value : [value];
    this.requiredRoles.set(normalized.length === 0 ? ["viewer"] : normalized);
  }
}
