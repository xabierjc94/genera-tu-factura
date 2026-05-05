import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { ClientService } from '../../core/services/client.service';
import { Profile } from '../../shared/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <div class="header-content">
          <div class="logo">
            <div class="logo-icon">GF</div>
            <div>
              <h1>Genera tu Factura</h1>
              <p class="subtitle">Gestiona tus facturas de forma inteligente</p>
            </div>
          </div>
          <div class="user-menu" *ngIf="profile">
            <div class="avatar">{{ (profile.company_name || 'U')[0] }}</div>
            <div class="user-info">
              <span class="company-name">{{ profile.company_name }}</span>
              <button class="logout-btn" (click)="logout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav class="main-nav">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Dashboard
        </a>
        <a routerLink="/clients" routerLinkActive="active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
            <path d="M16 3.13a4 4 0 010 7.75"></path>
          </svg>
          Clientes
        </a>
        <a routerLink="/invoices" routerLinkActive="active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Facturas
        </a>
        <a routerLink="/profile" routerLinkActive="active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Perfil
        </a>
      </nav>

      <main class="main-content">
        <div class="stats-grid">
          <div class="stat-card stat-primary">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ invoiceCount }}</span>
              <span class="stat-label">Facturas</span>
            </div>
            <a routerLink="/invoices" class="stat-link">Ver todas →</a>
          </div>

          <div class="stat-card stat-secondary">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ clientCount }}</span>
              <span class="stat-label">Clientes</span>
            </div>
            <a routerLink="/clients" class="stat-link">Ver todos →</a>
          </div>

          <div class="stat-card stat-success">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ totalAmount | currency:'EUR':'symbol':'1.2-2' }}</span>
              <span class="stat-label">Total facturado</span>
            </div>
          </div>

          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ pendingInvoices }}</span>
              <span class="stat-label">Pendientes</span>
            </div>
          </div>
        </div>

        <div class="actions-grid">
          <button class="action-card" routerLink="/invoices/new">
            <div class="action-icon">+</div>
            <span>Crear Factura</span>
          </button>
          <button class="action-card" routerLink="/clients/new">
            <div class="action-icon">+</div>
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.2rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .logo h1 {
      margin: 0;
      font-size: 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .company-name {
      font-weight: 500;
      color: #334155;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #fecaca;
      transform: translateY(-1px);
    }

    .main-nav {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem 2rem 0;
      display: flex;
      gap: 0.5rem;
    }

    .main-nav a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.9);
      color: #64748b;
      border-radius: 12px 12px 0 0;
      font-weight: 500;
      transition: all 0.2s;
    }

    .main-nav a:hover, .main-nav a.active {
      background: white;
      color: #6366f1;
      transform: translateY(-2px);
    }

    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      min-height: calc(100vh - 200px);
      border-radius: 16px 16px 0 0;
    }

    .welcome-section {
      margin-bottom: 2rem;
    }

    .welcome-section h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #0f172a;
    }

    .welcome-section p {
      color: #64748b;
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }

    .stat-primary::before { background: linear-gradient(90deg, #6366f1, #818cf8); }
    .stat-secondary::before { background: linear-gradient(90deg, #ec4899, #f472b6); }
    .stat-success::before { background: linear-gradient(90deg, #10b981, #34d399); }
    .stat-warning::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .stat-primary .stat-icon { background: #eef2ff; color: #6366f1; }
    .stat-secondary .stat-icon { background: #fdf2f8; color: #ec4899; }
    .stat-success .stat-icon { background: #ecfdf5; color: #10b981; }
    .stat-warning .stat-icon { background: #fffbeb; color: #f59e0b; }

    .stat-content {
      display: flex;
      flex-direction: column;
      margin-bottom: 1rem;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .stat-link {
      display: inline-block;
      color: #6366f1;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .stat-link:hover {
      transform: translateX(4px);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.3s;
      cursor: pointer;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
    }

    .action-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  profile: Profile | null = null;
  invoiceCount = 0;
  clientCount = 0;
  totalAmount = 0;
  pendingInvoices = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private invoiceService: InvoiceService,
    private clientService: ClientService
  ) {}

  async ngOnInit() {
    try {
      this.profile = await this.authService.getProfile();
      if (!this.profile) {
        this.router.navigate(['/auth/login']);
        return;
      }
      const invoices = await this.invoiceService.getInvoices();
      this.invoiceCount = invoices.length;
      this.totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      this.pendingInvoices = invoices.filter(inv => inv.status === 'issued').length;
      const clients = await this.clientService.getClients();
      this.clientCount = clients.length;
    } catch (error) {
      this.router.navigate(['/auth/login']);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }
}
