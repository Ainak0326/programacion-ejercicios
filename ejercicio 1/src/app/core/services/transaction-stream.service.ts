import { Injectable } from '@angular/core';
import { Observable, interval, map } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionStreamService {
  createBurstStream(): Observable<Transaction[]> {
    return interval(100).pipe(
      map(() => Array.from({ length: 10 }, () => this.buildTransaction()))
    );
  }

  createManualTransaction(): Transaction {
    return this.buildTransaction();
  }

  private buildTransaction(): Transaction {
    const isCredit = Math.random() >= 0.45;
    const amount = Number((Math.random() * 1200 + 40).toFixed(2));

    return {
      id: this.buildId(),
      userId: `USR-${Math.floor(Math.random() * 20 + 1)}`,
      description: isCredit ? 'Ingreso de mercado' : 'Salida operativa',
      amount,
      type: isCredit ? 'credit' : 'debit',
      timestamp: Date.now()
    };
  }

  private buildId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  }
}
