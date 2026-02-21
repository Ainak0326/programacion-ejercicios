import { Transaction } from '../../models/transaction.model';
import { transactionsFeatureKey } from './transactions.reducer';
import {
  selectMovingAverageLast10Seconds,
  selectRecentTransactions,
  selectTotalBalance
} from './transactions.selectors';

describe('transactionsSelectors', () => {
  const fixedNow = 200_000;
  let sequence = 0;
  const tx = (overrides: Partial<Transaction>): Transaction => ({
    id: `tx-auto-${++sequence}`,
    userId: 'USR-1',
    description: 'Tx',
    amount: 100,
    type: 'credit',
    timestamp: fixedNow,
    ...overrides
  });

  const createRoot = (transactions: Transaction[]) => ({
    [transactionsFeatureKey]: {
      ids: transactions.map((item) => item.id),
      entities: Object.fromEntries(transactions.map((item) => [item.id, item])),
      loaded: true,
      error: null
    }
  });

  it('calculates total balance', () => {
    const state = createRoot([
      tx({ id: 'a', amount: 200, type: 'credit' }),
      tx({ id: 'b', amount: 75, type: 'debit' })
    ]);

    expect(selectTotalBalance(state)).toBe(125);
  });

  it('calculates moving average for last 10 seconds', () => {
    const originalNow = Date.now;
    Date.now = () => fixedNow;

    const state = createRoot([
      tx({ id: 'recent-credit', amount: 110, type: 'credit', timestamp: fixedNow - 5_000 }),
      tx({ id: 'recent-debit', amount: 30, type: 'debit', timestamp: fixedNow - 2_000 }),
      tx({ id: 'old-credit', amount: 1_000, type: 'credit', timestamp: fixedNow - 20_000 })
    ]);

    expect(selectMovingAverageLast10Seconds(state)).toBe(40);

    Date.now = originalNow;
  });

  it('returns only latest 60 transactions sorted desc by timestamp', () => {
    const items = Array.from({ length: 70 }).map((_, index) =>
      tx({
        id: `tx-${index + 1}`,
        timestamp: fixedNow - (69 - index) * 100
      })
    );

    const state = createRoot(items);
    const recent = selectRecentTransactions(state);

    expect(recent.length).toBe(60);
    expect(recent[0].id).toBe('tx-70');
    expect(recent[59].id).toBe('tx-11');
  });
});
