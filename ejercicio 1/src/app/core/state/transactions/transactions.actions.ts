import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Transaction } from '../../models/transaction.model';

export const TransactionsActions = createActionGroup({
  source: 'Transactions',
  events: {
    'Load Success': props<{ transactions: Transaction[] }>(),
    'Add': props<{ transaction: Transaction }>(),
    'Add Batch': props<{ transactions: Transaction[] }>(),
    'Update': props<{ id: string; changes: Partial<Transaction> }>(),
    'Delete': props<{ id: string }>(),
    'Clear': emptyProps(),
    'Start Feed': emptyProps(),
    'Stop Feed': emptyProps(),
    'Feed Error': props<{ message: string }>()
  }
});
