import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ClientService } from '../../../core/services/client.service';
import { Invoice } from '../../../shared/models/invoice.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Facturas</h1>
          <p class="subtitle">Gestiona tus facturas de forma eficiente</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" routerLink="/dashboard">← Volver</button>
          <button class="btn-primary" routerLink="/invoices/new">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Factura
          </button>
        </div>
      </div>

      <div class="filters">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Buscar factura..." [(ngModel)]="searchTerm" (ngModelChange)="filterInvoices()" />
        </div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="filterInvoices()">
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="issued">Emitida</option>
          <option value="paid">Pagada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <div class="table-container" *ngIf="filteredInvoices.length > 0; else noInvoices">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let invoice of filteredInvoices" class="table-row">
              <td><strong>{{ invoice.invoice_number }}</strong></td>
              <td>
                <div class="client-info">
                  <div class="client-avatar">{{ (invoice.client?.name || 'C')[0] }}</div>
                  <span>{{ invoice.client?.name || 'N/A' }}</span>
                </div>
              </td>
              <td>{{ invoice.issue_date | date:'shortDate' }}</td>
              <td><strong>{{ invoice.total | currency:'EUR':'symbol':'1.2-2' }}</strong></td>
              <td><span class="status" [ngClass]="invoice.status || 'draft'">{{ statusLabels[invoice.status || 'draft'] }}</span></td>
              <td>
                <div class="actions">
                  <button class="btn-icon" [routerLink]="['/invoices/edit', invoice.id]" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="btn-icon" (click)="downloadPDF(invoice)" title="Descargar PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                  <button class="btn-icon btn-danger" (click)="deleteInvoice(invoice)" title="Eliminar">
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
      <ng-template #noInvoices>
        <div class="empty-state">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <h3>No hay facturas registradas</h3>
          <p>Comienza creando tu primera factura</p>
          <button class="btn-primary" routerLink="/invoices/new">Crear Factura</button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin:0 auto; padding: 2rem; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 2rem; }
    .header-actions {
      display: flex; gap: 1rem; align-items: center;
    }
    h1 { font-size: 2rem; margin:0 0 0.5rem; color: #0f172a; }
    .subtitle { color: #64748b; margin:0; font-size: 0.95rem; }
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white;
      border: none; border-radius: 12px; font-weight: 500; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4); }
    .filters {
      display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .search-box {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
      background: white; border: 2px solid #e2e8f0; border-radius: 12px;
      flex: 1; max-width: 400px; transition: all 0.2s; }
    .search-box:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    .search-box svg { color: #94a3b8; flex-shrink: 0; }
    .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 0.95rem; }
    select {
      padding: 0.75rem 1rem; border: 2px solid #e2e8f0; border-radius: 12px;
      font-size: 0.95rem; background: white; cursor: pointer; outline: none;
      transition: all 0.2s; }
    select:focus { border-color: #6366f1; }
    .table-container {
      background: white; border-radius: 16px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
    table { width:100%; border-collapse: collapse; }
    th {
      background: #f8fafc; padding: 1rem; text-align: left; font-weight: 600;
      color: #475569; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .table-row { transition: background 0.2s; }
    .table-row:hover { background: #f8fafc; }
    td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
    .client-info { display: flex; align-items: center; gap: 0.75rem; }
    .client-avatar {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.75rem; }
    .status {
      display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px;
      font-size: 0.8rem; font-weight: 500; }
    .draft { background: #fef3c7; color: #92400e; }
    .issued { background: #dbeafe; color: #1e40af; }
    .paid { background: #d1fae5; color: #065f46; }
    .cancelled { background: #fee2e2; color: #991b1b; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-icon {
      width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: #f1f5f9; color: #475569; transition: all 0.2s; }
    .btn-icon:hover { background: #e2e8f0; transform: translateY(-1px); }
    .btn-danger { background: #fee2e2; color: #dc2626; }
    .btn-danger:hover { background: #fecaca; }
    .empty-state {
      text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
    .empty-state svg { margin-bottom: 1rem; }
    .empty-state h3 { color: #334155; margin-bottom: 0.5rem; }
    .empty-state p { color: #94a3b8; margin-bottom: 1.5rem; }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  searchTerm = '';
  statusFilter = '';
  statusLabels: any = {
    draft: 'Borrador',
    issued: 'Emitida',
    paid: 'Pagada',
    cancelled: 'Cancelada'
  };

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadInvoices();
  }

  async loadInvoices() {
    try {
      this.invoices = await this.invoiceService.getInvoices();
      this.filteredInvoices = this.invoices;
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  }

  filterInvoices() {
    let filtered = this.invoices;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoice_number.toLowerCase().includes(term) ||
        (inv.client?.name && inv.client.name.toLowerCase().includes(term))
      );
    }
    if (this.statusFilter) {
      filtered = filtered.filter(inv => inv.status === this.statusFilter);
    }
    this.filteredInvoices = filtered;
  }

  async deleteInvoice(invoice: Invoice) {
    if (confirm(`¿Eliminar la factura ${invoice.invoice_number}?`)) {
      try {
        await this.invoiceService.deleteInvoice(invoice.id!);
        await this.loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  }

  async downloadPDF(invoice: Invoice) {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('FACTURA', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Número: ${invoice.invoice_number}`, 20, 40);
    doc.text(`Fecha: ${invoice.issue_date}`, 20, 50);
    doc.text(`Cliente: ${invoice.client?.name || 'N/A'}`, 20, 60);
    doc.text(`Dirección: ${invoice.client?.address || 'N/A'}`, 20, 70);
    doc.text(`CIF/NIF: ${invoice.client?.cif_nif || 'N/A'}`, 20, 80);
    let y = 100;
    doc.text('Descripción', 20, y);
    doc.text('Cantidad', 100, y);
    doc.text('Precio', 140, y);
    doc.text('Total', 180, y);
    y += 10;
    if (invoice.items) {
      for (const item of invoice.items) {
        doc.text(item.description, 20, y);
        doc.text(item.quantity?.toString() || '1', 100, y);
        doc.text(`${item.unit_price}€`, 140, y);
        doc.text(`${item.total}€`, 180, y);
        y += 10;
      }
    }
    y += 10;
    doc.text(`Subtotal: ${invoice.subtotal}€`, 140, y);
    y += 10;
    doc.text(`IVA: ${invoice.tax_amount}€`, 140, y);
    y += 10;
    doc.text(`TOTAL: ${invoice.total}€`, 140, y, { maxWidth: 50 });
    doc.save(`factura-${invoice.invoice_number}.pdf`);
  }
}
