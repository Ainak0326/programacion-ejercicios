import { Transaction } from '../../models/transaction.model';
import { TransactionsActions } from './transactions.actions';
import {
  initialTransactionsState,
  transactionsReducer
} from './transactions.reducer';

describe('transactionsReducer', () => {
  const baseTransaction: Transaction = {
    id: 'tx-1',
    userId: 'USR-1',
    description: 'Ingreso de mercado',
    amount: 100,
    type: 'credit',
    timestamp: 1_000
  };

  it('adds one transaction', () => {
    const state = transactionsReducer(
      initialTransactionsState,
      TransactionsActions.add({ transaction: baseTransaction })
    );

    expect(state.ids.length).toBe(1);
    expect(state.entities['tx-1']?.amount).toBe(100);
  });

  it('updates one transaction', () => {
    const seeded = transactionsReducer(
      initialTransactionsState,
      TransactionsActions.add({ transaction: baseTransaction })
    );

    const state = transactionsReducer(
      seeded,
      TransactionsActions.update({
        id: 'tx-1',
        changes: { amount: 180, description: 'Ajuste manual' }
      })
    );

    expect(state.entities['tx-1']?.amount).toBe(180);
    expect(state.entities['tx-1']?.description).toBe('Ajuste manual');
  });

  it('deletes one transaction', () => {
    const seeded = transactionsReducer(
      initialTransactionsState,
      TransactionsActions.add({ transaction: baseTransaction })
    );

    const state = transactionsReducer(
      seeded,
      TransactionsActions.delete({ id: 'tx-1' })
    );

    expect(state.ids.length).toBe(0);
    expect(state.entities['tx-1']).toBeUndefined();
  });

  it('clears all transactions', () => {
    const seeded = transactionsReducer(
      initialTransactionsState,
      TransactionsActions.addBatch({
        transactions: [
          baseTransaction,
          {
            ...baseTransaction,
            id: 'tx-2',
            amount: 50,
            type: 'debit',
            timestamp: 1_200
          }
        ]
      })
    );

    const state = transactionsReducer(seeded, TransactionsActions.clear());

    expect(state.ids.length).toBe(0);
    expect(state.error).toBeNull();
    expect(state.loaded).toBe(true);
  });
});
