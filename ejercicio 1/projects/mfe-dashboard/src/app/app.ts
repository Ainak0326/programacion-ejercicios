import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Subject, combineLatest, interval, map, scan, startWith } from 'rxjs';

type PriceTick = { symbol: string; price: number; changePercent: number; timestamp: number };
type AlertEvent = { id: string; level: 'warning' | 'critical'; message: string; timestamp: number };
type ConnectedUser = { id: string; name: string; role: 'trader' | 'risk' | 'ops' };
type Tx = { id: string; amount: number; type: 'credit' | 'debit'; timestamp: number };

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly destroyRef = inject(DestroyRef);

  private readonly pricesSubject = new BehaviorSubject<PriceTick[]>([
    { symbol: 'BTC', price: 82000, changePercent: 0, timestamp: Date.now() },
    { symbol: 'ETH', price: 3100, changePercent: 0, timestamp: Date.now() },
    { symbol: 'SOL', price: 130, changePercent: 0, timestamp: Date.now() }
  ]);
  private readonly usersSubject = new BehaviorSubject<ConnectedUser[]>([
    { id: 'U1', name: 'Ana', role: 'trader' },
    { id: 'U2', name: 'Luis', role: 'risk' },
    { id: 'U3', name: 'Marta', role: 'ops' }
  ]);
  private readonly alertsSubject = new Subject<AlertEvent>();
  private readonly txSubject = new BehaviorSubject<Tx[]>([]);

  readonly vm$ = combineLatest([
    this.pricesSubject.asObservable(),
    this.usersSubject.asObservable(),
    this.alertsSubject.asObservable().pipe(
      scan((acc, current) => [current, ...acc].slice(0, 5), [] as AlertEvent[]),
      startWith([] as AlertEvent[])
    ),
    this.txSubject.asObservable().pipe(
      map((txs) => {
        const last10 = txs.filter((tx) => tx.timestamp >= Date.now() - 10_000);
        const balance = txs.reduce((acc, tx) => acc + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
        const movingAvg =
          last10.length === 0
            ? 0
            : last10.reduce((acc, tx) => acc + (tx.type === 'credit' ? tx.amount : -tx.amount), 0) / last10.length;
        const txPerSecond = txs.filter((tx) => tx.timestamp >= Date.now() - 1000).length;
        return { balance, movingAvg, txPerSecond, txs: txs.slice(0, 20) };
      })
    )
  ]).pipe(
    map(([prices, users, alerts, txState]) => ({ prices, users, alerts, txState }))
  );

  constructor() {
    interval(350)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const next = this.pricesSubject.value.map((tick) => {
          const delta = (Math.random() - 0.5) * 0.008;
          return {
            ...tick,
            price: Number((tick.price * (1 + delta)).toFixed(2)),
            changePercent: Number((delta * 100).toFixed(2)),
            timestamp: Date.now()
          };
        });

        this.pricesSubject.next(next);
      });

    interval(2000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const volatile = this.pricesSubject.value.reduce((prev, curr) =>
          Math.abs(curr.changePercent) > Math.abs(prev.changePercent) ? curr : prev
        );

        this.alertsSubject.next({
          id: `${Date.now()}`,
          level: Math.abs(volatile.changePercent) > 0.55 ? 'critical' : 'warning',
          message: `${volatile.symbol} variacion ${volatile.changePercent}%`,
          timestamp: Date.now()
        });
      });

    interval(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const burst = Array.from({ length: 10 }).map(() => {
          const credit = Math.random() > 0.45;
          return {
            id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            amount: Number((Math.random() * 1200 + 50).toFixed(2)),
            type: credit ? 'credit' : 'debit',
            timestamp: Date.now()
          } as Tx;
        });

        const merged = [...burst, ...this.txSubject.value].slice(0, 600);
        this.txSubject.next(merged);
      });
  }
}
