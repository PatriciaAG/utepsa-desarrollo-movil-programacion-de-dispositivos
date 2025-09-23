import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'persona',
    loadComponent: () => import('./pages/persona/persona.page').then((m) => m.PersonaPage),
  },
  {
    path: '',
    redirectTo: 'persona',
    pathMatch: 'full',
  },
];
