export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: TransactionType;
  timestamp: number;
}

export const signedAmount = (transaction: Transaction): number =>
  transaction.type === 'credit' ? transaction.amount : -transaction.amount;
