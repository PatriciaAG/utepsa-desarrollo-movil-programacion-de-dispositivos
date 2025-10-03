import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'agendar',
    loadComponent: () =>
      import('./features/citas/agendar-visita.page').then(m => m.AgendarVisitaPage),
  },
  { path: '', redirectTo: 'agendar', pathMatch: 'full' },
];
