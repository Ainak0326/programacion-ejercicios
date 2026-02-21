import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Subject, interval, map } from 'rxjs';
import { AlertEvent, ConnectedUser, PriceTick } from '../models/market.models';

const SEED_PRICES: PriceTick[] = [
  { symbol: 'BTC', price: 82340, changePercent: 0.3, timestamp: Date.now() },
  { symbol: 'ETH', price: 3140, changePercent: -0.12, timestamp: Date.now() },
  { symbol: 'SOL', price: 128, changePercent: 0.08, timestamp: Date.now() }
];

const SEED_USERS: ConnectedUser[] = [
  { id: 'U-1', name: 'Ana', role: 'trader', connectedAt: Date.now() - 2_000 },
  { id: 'U-2', name: 'Luis', role: 'risk', connectedAt: Date.now() - 6_000 },
  { id: 'U-3', name: 'Marta', role: 'ops', connectedAt: Date.now() - 12_000 }
];

@Injectable({ providedIn: 'root' })
export class LiveMarketService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly pricesSubject = new BehaviorSubject<PriceTick[]>(SEED_PRICES);
  private readonly usersSubject = new BehaviorSubject<ConnectedUser[]>(SEED_USERS);
  private readonly alertsSubject = new Subject<AlertEvent>();

  readonly prices$ = this.pricesSubject.asObservable();
  readonly users$ = this.usersSubject.asObservable();
  readonly alerts$ = this.alertsSubject.asObservable();

  constructor() {
    interval(350)
      .pipe(
        map(() => this.nextPrices(this.pricesSubject.value)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((prices) => this.pricesSubject.next(prices));

    interval(2200)
      .pipe(
        map(() => this.nextAlert(this.pricesSubject.value)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((alert) => this.alertsSubject.next(alert));

    interval(5000)
      .pipe(
        map(() => this.nextUsers(this.usersSubject.value)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((users) => this.usersSubject.next(users));
  }

  private nextPrices(current: PriceTick[]): PriceTick[] {
    return current.map((tick) => {
      const delta = (Math.random() - 0.5) * 0.008;
      const nextPrice = Number((tick.price * (1 + delta)).toFixed(2));

      return {
        ...tick,
        price: nextPrice,
        changePercent: Number((delta * 100).toFixed(2)),
        timestamp: Date.now()
      };
    });
  }

  private nextAlert(prices: PriceTick[]): AlertEvent {
    const volatile = prices.reduce((prev, current) =>
      Math.abs(current.changePercent) > Math.abs(prev.changePercent) ? current : prev
    );

    return {
      id: `${Date.now()}-${volatile.symbol}`,
      level: Math.abs(volatile.changePercent) > 0.55 ? 'critical' : 'warning',
      message: `${volatile.symbol} variacion ${volatile.changePercent}%`,
      timestamp: Date.now()
    };
  }

  private nextUsers(users: ConnectedUser[]): ConnectedUser[] {
    const next = [...users];
    const random = Math.random();

    if (random > 0.65 && next.length < 7) {
      next.push({
        id: `U-${Math.floor(Math.random() * 1000)}`,
        name: `User-${Math.floor(Math.random() * 90)}`,
        role: ['trader', 'risk', 'ops'][Math.floor(Math.random() * 3)] as ConnectedUser['role'],
        connectedAt: Date.now()
      });
    } else if (random < 0.25 && next.length > 2) {
      next.splice(Math.floor(Math.random() * next.length), 1);
    }

    return next;
  }
}
