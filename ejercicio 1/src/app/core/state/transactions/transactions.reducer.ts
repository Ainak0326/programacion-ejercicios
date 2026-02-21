import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Transaction } from '../../models/transaction.model';
import { TransactionsActions } from './transactions.actions';

export const transactionsFeatureKey = 'transactions';

export interface TransactionsState extends EntityState<Transaction> {
  loaded: boolean;
  error: string | null;
}

export const transactionsAdapter = createEntityAdapter<Transaction>({
  selectId: (transaction) => transaction.id,
  sortComparer: (a, b) => a.timestamp - b.timestamp
});

export const initialTransactionsState: TransactionsState =
  transactionsAdapter.getInitialState({
    loaded: false,
    error: null
  });

export const transactionsReducer = createReducer(
  initialTransactionsState,
  on(TransactionsActions.loadSuccess, (state, { transactions }) =>
    transactionsAdapter.setAll(transactions, {
      ...state,
      loaded: true,
      error: null
    })
  ),
  on(TransactionsActions.add, (state, { transaction }) =>
    transactionsAdapter.addOne(transaction, state)
  ),
  on(TransactionsActions.addBatch, (state, { transactions }) =>
    transactionsAdapter.addMany(transactions, state)
  ),
  on(TransactionsActions.update, (state, { id, changes }) =>
    transactionsAdapter.updateOne({ id, changes }, state)
  ),
  on(TransactionsActions.delete, (state, { id }) =>
    transactionsAdapter.removeOne(id, state)
  ),
  on(TransactionsActions.clear, (state) =>
    transactionsAdapter.removeAll({
      ...state,
      loaded: true,
      error: null
    })
  ),
  on(TransactionsActions.feedError, (state, { message }) => ({
    ...state,
    error: message
  }))
);
