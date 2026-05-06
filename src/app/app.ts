import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container" *ngIf="isAuthenticated; else authLayout">
      <nav class="navbar">
        <div class="nav-brand">
          <div class="logo-small">GF</div>
          <span class="brand-text">Genera tu Factura</span>
        </div>
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
          </a>
          <a routerLink="/clients" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
              <path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
            Clientes
          </a>
          <a routerLink="/invoices" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            Facturas
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Perfil
          </a>
        </div>
        <button class="logout-btn" (click)="logout()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Salir
        </button>
      </nav>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
    <ng-template #authLayout>
      <router-outlet />
    </ng-template>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f1f5f9;
    }

    .navbar {
      background: white;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 64px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-small {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1rem;
    }

    .brand-text {
      font-weight: 600;
      color: #0f172a;
      font-size: 1.1rem;
    }

    .nav-links {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: #64748b;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background: #f1f5f9;
      color: #334155;
    }

    .nav-link.active {
      background: #eef2ff;
      color: #6366f1;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #fee2e2;
      color: #dc2626;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #fecaca;
    }

    .main-content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0 1rem;
      }

      .brand-text {
        display: none;
      }

      .nav-link span {
        display: none;
      }

      .logout-btn span {
        display: none;
      }
    }
  `]
})
export class App {
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.checkAuthState();
  }

  async checkAuthState() {
    const session = await this.authService.getSession();
    this.isAuthenticated = !!session.data.session;
    
    this.authService.onAuthStateChange((event, session) => {
      this.isAuthenticated = !!session;
    });
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }
}
