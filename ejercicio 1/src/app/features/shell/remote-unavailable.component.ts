import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-remote-unavailable',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remote-unavailable.component.html',
  styleUrl: './remote-unavailable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemoteUnavailableComponent {
  private readonly route = inject(ActivatedRoute);

  readonly remote = this.route.snapshot.data['remote'] ?? 'remoto';
  readonly port = this.route.snapshot.data['port'] ?? 'N/A';
}
