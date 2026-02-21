import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandler);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      errorHandler.handleError({
        source: 'http-interceptor',
        url: req.url,
        status: error.status,
        message: error.message
      });

      return throwError(() => error);
    })
  );
};
