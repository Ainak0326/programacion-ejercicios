import { createFeatureSelector, createSelector } from '@ngrx/store';
import { signedAmount, Transaction } from '../../models/transaction.model';
import {
  transactionsAdapter,
  transactionsFeatureKey,
  TransactionsState
} from './transactions.reducer';

const selectTransactionsState =
  createFeatureSelector<TransactionsState>(transactionsFeatureKey);

const selectors = transactionsAdapter.getSelectors(selectTransactionsState);

export const selectTransactionEntities = selectors.selectEntities;
export const selectAllTransactions = selectors.selectAll;
export const selectTransactionIds = selectors.selectIds;
export const selectTransactionsLoaded = createSelector(
  selectTransactionsState,
  (state) => state.loaded
);
export const selectTransactionsError = createSelector(
  selectTransactionsState,
  (state) => state.error
);

export const selectTotalBalance = createSelector(selectAllTransactions, (transactions) =>
  transactions.reduce((acc, transaction) => acc + signedAmount(transaction), 0)
);

export const selectMovingAverageLast10Seconds = createSelector(
  selectAllTransactions,
  (transactions) => {
    const now = Date.now();
    const floor = now - 10_000;
    const recent = transactions.filter((transaction) => transaction.timestamp >= floor);

    if (recent.length === 0) {
      return 0;
    }

    const total = recent.reduce((acc, transaction) => acc + signedAmount(transaction), 0);
    return total / recent.length;
  }
);

export const selectRecentTransactions = createSelector(selectAllTransactions, (transactions: Transaction[]) =>
  [...transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 60)
);
