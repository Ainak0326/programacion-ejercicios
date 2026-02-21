import {
  ApplicationConfig,
  ErrorHandler,
  Injectable,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withPreloading } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { SelectivePreloadingStrategy } from './core/routing/selective-preloading.strategy';
import { TransactionsEffects } from './core/state/transactions/transactions.effects';
import {
  transactionsFeatureKey,
  transactionsReducer
} from './core/state/transactions/transactions.reducer';

@Injectable({ providedIn: 'root' })
class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('Global error handler', error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(SelectivePreloadingStrategy)),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    provideStore({
      [transactionsFeatureKey]: transactionsReducer
    }),
    provideEffects([TransactionsEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};
