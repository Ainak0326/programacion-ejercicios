import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RiskProjection } from '../models/market.models';

@Injectable({ providedIn: 'root' })
export class RiskProjectionService {
  projectRisk$(points: number[]): Observable<RiskProjection> {
    return new Observable<RiskProjection>((subscriber) => {
      if (typeof Worker === 'undefined') {
        subscriber.next(this.fallback(points));
        subscriber.complete();
        return;
      }

      const worker = new Worker(new URL('../workers/risk-projection.worker', import.meta.url));

      const onMessage = (event: MessageEvent<RiskProjection>) => {
        subscriber.next(event.data);
        subscriber.complete();
      };

      const onError = (error: ErrorEvent) => {
        subscriber.error(error);
      };

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      worker.postMessage({ points });

      return () => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        worker.terminate();
      };
    });
  }

  private fallback(points: number[]): RiskProjection {
    const sampleSize = points.length;
    const average = sampleSize
      ? points.reduce((acc, value) => acc + value, 0) / sampleSize
      : 0;

    return {
      slope: 0,
      intercept: average,
      r2: 0,
      projectedNext: average,
      sampleSize
    };
  }
}
