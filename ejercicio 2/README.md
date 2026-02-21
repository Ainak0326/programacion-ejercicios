# Ejercicio 2 - CMS Modular con Plugins Dinamicos (Angular + Module Federation)

Implementacion completa del escenario solicitado:

## Requerimientos cubiertos

1. Dynamic Component Loader
- `src/app/components/widget-host.component.ts`
- Carga de plugin remoto en runtime con `ViewContainerRef.createComponent(...)`
- Resolucion del modulo remoto via `loadRemoteModule(...)` (`src/app/plugins/module-federation.runtime.ts`)

2. DI avanzada por widget
- Token: `src/app/plugins/widget-config.token.ts`
- Provider runtime por instancia con `createEnvironmentInjector(...)` en `widget-host.component.ts`
- Cada remote inyecta `WIDGET_CONFIG` con su configuracion propia

3. Directiva estructural personalizada `*appRoleCheck`
- `src/app/directives/role-check.directive.ts`
- Si el rol no aplica: destruye `EmbeddedViewRef`, limpia el contenedor y dispara `ngOnDestroy` de componentes internos (liberando sus subscriptions)

4. Optimizacion de bundle / Remote Modules (Webpack 5 Module Federation)
- Host: `webpack.host.config.js`
- Remotes:
  - `webpack.remote.analytics.config.js`
  - `webpack.remote.notes.config.js`
- Cada widget se expone como modulo remoto (`./Widget`)

5. Signals para comunicacion entre widgets dinamicos
- Bus con Signals: `src/app/state/widget-bus.service.ts`
- Widgets remotos reciben `bus` por input y publican/consumen eventos en runtime

6. Guard funcional de integridad
- `src/app/security/plugin-integrity.guard.ts`
- Valida id/version/integridad declarada en el manifest remoto antes de activar ruta

## Estructura principal

- Host CMS: `src/app/pages/cms-page.component.ts`
- Preview con guard: `src/app/pages/plugin-preview-page.component.ts`
- Remote analytics:
  - `remotes/analytics/src/analytics-widget.component.ts`
  - `remotes/analytics/src/widget.module.ts`
- Remote notes:
  - `remotes/notes/src/notes-widget.component.ts`
  - `remotes/notes/src/widget.module.ts`

## Comandos

1. Instalar dependencias:
```bash
npm install
```

2. Levantar remotes:
```bash
npm run start:remote:analytics
npm run start:remote:notes
```

3. Levantar host:
```bash
npm start
```

Host en `http://localhost:4200`.

## Flujo de prueba recomendado

1. Agregar widgets desde catalogo en el CMS.
2. Alternar rol `editor` para verificar `*appRoleCheck` (destruye/crea componentes en caliente).
3. Ver comunicacion entre widgets con botones de broadcast/ping.
4. Ir a `/plugin/analytics-kpi` o `/plugin/team-notes` para validar guard de integridad.
