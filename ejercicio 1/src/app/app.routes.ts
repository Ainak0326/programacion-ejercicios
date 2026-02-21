import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        data: { preload: true },
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'transactions',
        data: { preload: true },
        loadChildren: () =>
          import('./features/transactions/transactions.routes').then((m) => m.TRANSACTIONS_ROUTES)
      },
      {
        path: 'remote-dashboard',
        data: { remote: 'mfe-dashboard', port: 4201 },
        loadComponent: () =>
          loadRemoteModule('mfe-dashboard', './Component')
            .then((m) => m.App)
            .catch(() =>
              import('./features/shell/remote-unavailable.component').then(
                (m) => m.RemoteUnavailableComponent
              )
            )
      },
      {
        path: 'remote-transactions',
        data: { remote: 'mfe-transactions', port: 4202 },
        loadComponent: () =>
          loadRemoteModule('mfe-transactions', './Component')
            .then((m) => m.App)
            .catch(() =>
              import('./features/shell/remote-unavailable.component').then(
                (m) => m.RemoteUnavailableComponent
              )
            )
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
