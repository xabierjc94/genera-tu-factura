import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clients',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent)
          }
        ]
      },
      {
        path: 'invoices',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent)
          }
        ]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/messages/message-inbox/message-inbox.component').then(m => m.MessageInboxComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'm/:invoiceId',
    loadComponent: () => import('./features/messages/message-form/message-form.component').then(m => m.MessageFormComponent)
  },
  { path: '**', redirectTo: '/auth/login' }
];
