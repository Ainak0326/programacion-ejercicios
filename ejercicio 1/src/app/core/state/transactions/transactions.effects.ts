import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, takeUntil } from 'rxjs';
import { TransactionStreamService } from '../../services/transaction-stream.service';
import { TransactionsActions } from './transactions.actions';

@Injectable()
export class TransactionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly transactionStream = inject(TransactionStreamService);

  readonly startFeed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionsActions.startFeed),
      switchMap(() =>
        this.transactionStream.createBurstStream().pipe(
          map((transactions) => TransactionsActions.addBatch({ transactions })),
          takeUntil(this.actions$.pipe(ofType(TransactionsActions.stopFeed))),
          catchError((error: Error) =>
            of(
              TransactionsActions.feedError({
                message: `Error en flujo de transacciones: ${error.message}`
              })
            )
          )
        )
      )
    )
  );
}
