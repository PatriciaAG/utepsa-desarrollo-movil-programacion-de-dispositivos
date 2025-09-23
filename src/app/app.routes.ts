import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'persona',
    loadComponent: () => import('./pages/persona/persona.page').then( m => m.PersonaPage)
  },
];
