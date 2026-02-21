import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { Transaction } from '../../core/models/transaction.model';
import { TransactionStreamService } from '../../core/services/transaction-stream.service';
import { TransactionsActions } from '../../core/state/transactions/transactions.actions';
import { selectRecentTransactions } from '../../core/state/transactions/transactions.selectors';

@Component({
  selector: 'app-transactions-page',
  imports: [CommonModule],
  templateUrl: './transactions.page.html',
  styleUrl: './transactions.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsPageComponent {
  private readonly store = inject(Store);
  private readonly streamService = inject(TransactionStreamService);

  readonly transactions$ = this.store.select(selectRecentTransactions);
  readonly total$ = this.transactions$.pipe(map((items) => items.length));

  addOne(): void {
    this.store.dispatch(
      TransactionsActions.add({
        transaction: this.streamService.createManualTransaction()
      })
    );
  }

  updateFirst(items: Transaction[]): void {
    const first = items[0];
    if (!first) {
      return;
    }

    this.store.dispatch(
      TransactionsActions.update({
        id: first.id,
        changes: {
          amount: Number((first.amount * 1.03).toFixed(2)),
          description: 'Ajuste manual'
        }
      })
    );
  }

  deleteFirst(items: Transaction[]): void {
    const first = items[0];
    if (!first) {
      return;
    }

    this.store.dispatch(TransactionsActions.delete({ id: first.id }));
  }

  clearAll(): void {
    this.store.dispatch(TransactionsActions.clear());
  }
}
