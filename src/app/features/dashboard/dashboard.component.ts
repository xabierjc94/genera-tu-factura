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
    <div class="dashboard-content">
      <div class="welcome-section">
        <h2>¡Bienvenido, {{ profile?.company_name || 'Usuario' }}!</h2>
        <p>Gestiona tu negocio de forma inteligente</p>
      </div>

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
    </div>
  `,
  styles: [`
    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .welcome-section {
      margin-bottom: 2rem;
    }

    .welcome-section h2 {
      font-size: 2rem;
      margin: 0 0 0.5rem;
      color: #0f172a;
    }

    .welcome-section p {
      color: #64748b;
      font-size: 1.1rem;
      margin: 0;
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
      text-decoration: none;
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
}
