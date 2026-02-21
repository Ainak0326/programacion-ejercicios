import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  auditTime,
  combineLatest,
  filter,
  map,
  scan,
  startWith,
  switchMap
} from 'rxjs';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { AlertEvent, RiskProjection } from '../../core/models/market.models';
import { signedAmount } from '../../core/models/transaction.model';
import { LiveMarketService } from '../../core/services/live-market.service';
import { RiskProjectionService } from '../../core/services/risk-projection.service';
import { TransactionsActions } from '../../core/state/transactions/transactions.actions';
import {
  selectMovingAverageLast10Seconds,
  selectRecentTransactions,
  selectTotalBalance,
  selectTransactionsError
} from '../../core/state/transactions/transactions.selectors';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, MetricCardComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly market = inject(LiveMarketService);
  private readonly riskProjection = inject(RiskProjectionService);

  readonly totalBalance$ = this.store.select(selectTotalBalance);
  readonly movingAverage$ = this.store.select(selectMovingAverageLast10Seconds);
  readonly feedError$ = this.store.select(selectTransactionsError);
  readonly recentTransactions$ = this.store.select(selectRecentTransactions);
  readonly txPerSecond$ = this.recentTransactions$.pipe(
    map((transactions) => {
      const floor = Date.now() - 1_000;
      return transactions.filter((transaction) => transaction.timestamp >= floor).length;
    }),
    startWith(0)
  );

  readonly alertsWindow$ = this.market.alerts$.pipe(
    scan((acc, current) => [current, ...acc].slice(0, 6), [] as AlertEvent[]),
    startWith([] as AlertEvent[])
  );

  readonly streamsVm$ = combineLatest([
    this.market.prices$,
    this.market.users$,
    this.alertsWindow$
  ]).pipe(
    map(([prices, users, alerts]) => ({
      prices,
      users,
      alerts
    }))
  );

  readonly riskProjection$ = this.recentTransactions$.pipe(
    map((transactions) => transactions.map((transaction) => signedAmount(transaction)).reverse()),
    filter((series) => series.length > 2),
    auditTime(700),
    switchMap((series) => this.riskProjection.projectRisk$(series)),
    startWith({
      slope: 0,
      intercept: 0,
      r2: 0,
      projectedNext: 0,
      sampleSize: 0
    } as RiskProjection)
  );

  ngOnInit(): void {
    this.store.dispatch(TransactionsActions.startFeed());
  }

  ngOnDestroy(): void {
    this.store.dispatch(TransactionsActions.stopFeed());
  }
}
