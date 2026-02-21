# Evidencia de Cumplimiento - Ejercicio 1

## 1) Optimización de detección de cambios (OnPush)
- `src/app/app.ts`
- `src/app/features/shell/shell.component.ts`
- `src/app/features/dashboard/dashboard.page.ts`
- `src/app/features/transactions/transactions.page.ts`
- `src/app/shared/components/metric-card/metric-card.component.ts`

Todos los componentes están configurados con `ChangeDetectionStrategy.OnPush`.

## 2) NgRx Entities + CRUD + selector de balance y promedio móvil 10s
- Actions: `src/app/core/state/transactions/transactions.actions.ts`
- Reducer con EntityAdapter: `src/app/core/state/transactions/transactions.reducer.ts`
- Selectors:
  - `selectTotalBalance`
  - `selectMovingAverageLast10Seconds`
  - en `src/app/core/state/transactions/transactions.selectors.ts`
- CRUD UI: `src/app/features/transactions/transactions.page.ts`
- Feed 100 tx/s via effect + stream:
  - `src/app/core/services/transaction-stream.service.ts`
  - `src/app/core/state/transactions/transactions.effects.ts`

## 3) Streams avanzados RxJS (Precios, Alertas, Usuarios) y anti memory leaks
- Servicio de mercado:
  - `src/app/core/services/live-market.service.ts`
  - `BehaviorSubject` para estado (`prices`, `users`)
  - `Subject` para eventos (`alerts`)
- Fusión de flujos:
  - `combineLatest([prices$, users$, alertsWindow$])`
  - `src/app/features/dashboard/dashboard.page.ts`
- Prevención de fugas:
  - `takeUntil` en effects (`stopFeed`)
  - `takeUntilDestroyed` en servicio de streams
  - `async` pipe estricto en templates (`dashboard.page.html`, `transactions.page.html`)

## 4) Web Worker para cálculo pesado (regresión lineal)
- Worker: `src/app/core/workers/risk-projection.worker.ts`
- Servicio wrapper: `src/app/core/services/risk-projection.service.ts`
- Consumo en dashboard: `src/app/features/dashboard/dashboard.page.ts`

## Criterios extra
### Subject vs BehaviorSubject
Implementado en `src/app/core/services/live-market.service.ts`.

### Lazy Loading + Preloading Strategy
- Rutas lazy: `src/app/app.routes.ts`
- Strategy custom: `src/app/core/routing/selective-preloading.strategy.ts`
- Registro: `src/app/app.config.ts` con `withPreloading(...)`

### HttpInterceptor global de errores
- Interceptor: `src/app/core/interceptors/http-error.interceptor.ts`
- Registro global: `src/app/app.config.ts`

## Micro-frontends (Native Federation)
- Host: `criptoactivos`
- Remotos: `mfe-dashboard`, `mfe-transactions`
- Manifest: `public/federation.manifest.json`
- Carga remota por rutas:
  - `src/app/app.routes.ts` (`remote-dashboard`, `remote-transactions`)

## Pruebas agregadas
- Reducer CRUD: `src/app/core/state/transactions/transactions.reducer.spec.ts`
- Selectors (balance/promedio/últimos 60): `src/app/core/state/transactions/transactions.selectors.spec.ts`
