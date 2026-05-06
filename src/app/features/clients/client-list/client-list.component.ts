import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../shared/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Clientes</h1>
          <p class="subtitle">Gestiona tus clientes de forma eficiente</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" routerLink="/dashboard">← Volver</button>
          <button class="btn-primary" routerLink="/clients/new">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nuevo Cliente
          </button>
        </div>
      </div>

      @if (loadError) {
        <div class="error-message">{{ loadError }}</div>
      }

      <div class="filters">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Buscar cliente..." [(ngModel)]="searchTerm" (ngModelChange)="filterClients()" />
        </div>
      </div>

      <div class="table-container" *ngIf="filteredClients.length > 0; else noClients">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CIF/NIF</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let client of filteredClients" class="table-row">
              <td>
                <div class="client-info">
                  <div class="client-avatar">{{ (client.name || 'C')[0] }}</div>
                  <div>
                    <strong>{{ client.name }}</strong>
                    <small>{{ client.address || 'Sin dirección' }}</small>
                  </div>
                </div>
              </td>
              <td><span class="badge">{{ client.cif_nif || '-' }}</span></td>
              <td>{{ client.email || '-' }}</td>
              <td>{{ client.phone || '-' }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon" [routerLink]="['/clients/edit', client.id]" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn-icon btn-danger" (click)="deleteClient(client)" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #noClients>
        <div class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
            <path d="M16 3.13a4 4 0 010 7.75"></path>
          </svg>
          <h3>No hay clientes registrados</h3>
          <p>Comienza agregando tu primer cliente</p>
          <button class="btn-primary" routerLink="/clients/new">Agregar Cliente</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin:0 auto; padding: 2rem; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 2rem;
    }
    h1 { font-size: 2rem; margin:0 0 0.5rem; background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subtitle { color: #64748b; margin:0; font-size: 0.95rem; }
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white;
      border: none; border-radius: 12px; font-weight: 500; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4); }
    .filters { margin-bottom: 1.5rem; }
    .search-box {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
      background: white; border: 2px solid #e2e8f0; border-radius: 12px;
      max-width: 400px; transition: all 0.2s; }
    .search-box:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .search-box svg { color: #94a3b8; flex-shrink: 0; }
    .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 0.95rem; }
    .table-container {
      background: white; border-radius: 16px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f8fafc; padding: 1rem; text-align: left; font-weight: 600;
      color: #475569; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .table-row { transition: background 0.2s; }
    .table-row:hover { background: #f8fafc; }
    td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
    .client-info { display: flex; align-items: center; gap: 0.75rem; }
    .client-avatar {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.875rem; }
    .client-info strong { display: block; color: #0f172a; }
    .client-info small { color: #94a3b8; font-size: 0.8rem; }
    .badge {
      display: inline-block; padding: 0.25rem 0.75rem; background: #f1f5f9;
      border-radius: 6px; font-size: 0.875rem; color: #475569; font-weight: 500; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-icon {
      width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: #f1f5f9; color: #475569; transition: all 0.2s; }
    .btn-icon:hover { background: #e2e8f0; transform: translateY(-1px); }
    .btn-danger { background: #fee2e2; color: #dc2626; }
    .btn-danger:hover { background: #fecaca; }
    .error-message {
      margin-bottom: 1rem; padding: 0.75rem 1rem; background: #fee2e2;
      color: #dc2626; border-radius: 8px; font-size: 0.875rem; }
    .empty-state {
      text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
    .empty-state svg { margin-bottom: 1rem; }
    .empty-state h3 { color: #334155; margin-bottom: 0.5rem; }
    .empty-state p { color: #94a3b8; margin-bottom: 1.5rem; }
  `]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  loadError = '';

  constructor(
    private clientService: ClientService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadClients();
  }

  async loadClients() {
    this.loadError = '';
    try {
      this.clients = await this.clientService.getClients();
      this.filteredClients = this.clients;
    } catch (error: any) {
      console.error('Error loading clients:', error);
      this.loadError = error.message || 'Error al cargar los clientes';
    } finally {
      this.cdr.detectChanges();
    }
  }

  filterClients() {
    if (!this.searchTerm) {
      this.filteredClients = this.clients;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredClients = this.clients.filter(c =>
        c.name.toLowerCase().includes(term) ||
        (c.cif_nif && c.cif_nif.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
      );
    }
  }

  async deleteClient(client: Client) {
    if (confirm(`¿Eliminar al cliente ${client.name}?`)) {
      try {
        await this.clientService.deleteClient(client.id!);
        await this.loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  }
}
