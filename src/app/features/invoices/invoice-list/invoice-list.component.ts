import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { PdfService } from '../../../core/services/pdf.service';
import { Invoice } from '../../../shared/models/invoice.model';
import { Profile } from '../../../shared/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  template: `
    <!-- Preview Modal -->
    <div class="preview-overlay" *ngIf="previewVisible" (click)="closePreview()">
      <div class="preview-modal" (click)="$event.stopPropagation()">
        <div class="preview-header">
          <span class="preview-title">{{ previewInvoiceNumber }}</span>
          <div class="preview-actions">
            <button class="btn-secondary" (click)="downloadPDF(previewInvoiceRef!)" [disabled]="previewLoading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Descargar
            </button>
            <button class="preview-close" (click)="closePreview()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="preview-body">
          <div class="preview-loading" *ngIf="previewLoading">
            <div class="spinner"></div>
            <span>Generando previsualización...</span>
          </div>
          <iframe *ngIf="!previewLoading && previewUrl" [src]="previewUrl" class="preview-iframe"></iframe>
        </div>
      </div>
    </div>

    <app-confirm-dialog
      [visible]="confirmVisible"
      [title]="'Eliminar factura'"
      [message]="confirmMessage"
      (confirmed)="onConfirmDelete()"
      (cancelled)="confirmVisible = false"
    ></app-confirm-dialog>
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
                  <button class="btn-icon" (click)="previewPDF(invoice)" title="Previsualizar PDF">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
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
    .header-actions { display: flex; gap: 1rem; align-items: center; }
    h1 { font-size: 2rem; margin:0 0 0.5rem; background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subtitle { color: #94a3b8; margin:0; font-size: 0.95rem; }
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white;
      border: none; border-radius: 12px; font-weight: 500; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4); }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
    .search-box {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
      background: #1e293b; border: 2px solid #334155; border-radius: 12px;
      flex: 1; max-width: 400px; transition: all 0.2s; }
    .search-box:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); }
    .search-box svg { color: #64748b; flex-shrink: 0; }
    .search-box input { border: none; outline: none; background: transparent; width: 100%; font-size: 0.95rem; color: #f1f5f9; }
    .search-box input::placeholder { color: #64748b; }
    select {
      padding: 0.75rem 1rem; border: 2px solid #334155; border-radius: 12px;
      font-size: 0.95rem; background: #1e293b; color: #f1f5f9; cursor: pointer; outline: none; transition: all 0.2s; }
    select:focus { border-color: #6366f1; }
    .table-container {
      background: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow-x: auto;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); }
    table { width:100%; border-collapse: collapse; }
    th {
      background: #141d2e; padding: 1rem; text-align: left; font-weight: 600;
      color: #64748b; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .table-row { transition: background 0.2s; }
    .table-row:hover { background: #273549; }
    td { padding: 1rem; border-bottom: 1px solid #334155; color: #cbd5e1; }
    td strong { color: #f1f5f9; }
    .client-info { display: flex; align-items: center; gap: 0.75rem; }
    .client-avatar {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 600; font-size: 0.75rem; }
    .status {
      display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px;
      font-size: 0.8rem; font-weight: 500; }
    .draft { background: rgba(245,158,11,0.15); color: #fbbf24; }
    .issued { background: rgba(99,102,241,0.15); color: #818cf8; }
    .paid { background: rgba(16,185,129,0.15); color: #34d399; }
    .cancelled { background: rgba(220,38,38,0.15); color: #f87171; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-icon {
      width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: #334155; color: #94a3b8; transition: all 0.2s; }
    .btn-icon:hover { background: #475569; color: #f1f5f9; transform: translateY(-1px); }
    .btn-danger { background: rgba(220, 38, 38, 0.15); color: #f87171; }
    .btn-danger:hover { background: rgba(220, 38, 38, 0.25); }
    .empty-state {
      text-align: center; padding: 4rem 2rem; background: #1e293b; border: 1px solid #334155;
      border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); }
    .empty-state svg { margin-bottom: 1rem; }
    .empty-state h3 { color: #e2e8f0; margin-bottom: 0.5rem; }
    .empty-state p { color: #64748b; margin-bottom: 1.5rem; }
    .preview-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
      z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .preview-modal {
      background: #1e293b; border: 1px solid #334155; border-radius: 16px; width: 100%; max-width: 860px;
      height: 90vh; display: flex; flex-direction: column;
      box-shadow: 0 24px 60px rgba(0,0,0,0.5); overflow: hidden; }
    .preview-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid #334155; background: #141d2e; flex-shrink: 0; }
    .preview-title { font-weight: 600; color: #f1f5f9; font-size: 0.95rem; }
    .preview-actions { display: flex; align-items: center; gap: 0.75rem; }
    .preview-close {
      width: 36px; height: 36px; border: none; border-radius: 8px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: rgba(220,38,38,0.15); color: #f87171; transition: all 0.2s; }
    .preview-close:hover { background: rgba(220,38,38,0.25); }
    .preview-body { flex: 1; overflow: hidden; position: relative; }
    .preview-iframe { width: 100%; height: 100%; border: none; display: block; }
    .preview-loading {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 1rem; color: #64748b; }
    .spinner {
      width: 40px; height: 40px; border: 3px solid #334155;
      border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn-secondary {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
      background: #334155; border: none; border-radius: 8px;
      font-size: 0.875rem; font-weight: 500; color: #94a3b8; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: #475569; color: #f1f5f9; }
    .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 768px) {
      .page-container { padding: 1.25rem 1rem; }
      h1 { font-size: 1.5rem; }
      .page-header { flex-wrap: wrap; gap: 1rem; }
      .header-actions { flex-wrap: wrap; }
      .filters { flex-wrap: wrap; }
      .search-box { max-width: none; flex: 1 1 200px; }
      select { flex: 1 1 140px; }
      table { min-width: 560px; }
      .preview-modal { height: 85vh; }
    }

    @media (max-width: 480px) {
      .page-container { padding: 1rem 0.75rem; }
      h1 { font-size: 1.3rem; }
      .btn-primary, .btn-secondary { padding: 0.6rem 1rem; font-size: 0.875rem; }
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  profile: Profile | null = null;
  searchTerm = '';
  statusFilter = '';
  confirmVisible = false;
  confirmMessage = '';
  private pendingDeleteInvoice: Invoice | null = null;
  previewVisible = false;
  previewLoading = false;
  previewUrl: SafeResourceUrl | null = null;
  previewInvoiceNumber = '';
  previewInvoiceRef: Invoice | null = null;
  private blobUrl: string | null = null;
  statusLabels: any = {
    draft: 'Borrador',
    issued: 'Emitida',
    paid: 'Pagada',
    cancelled: 'Cancelada'
  };

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private authService: AuthService,
    private pdfService: PdfService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    await Promise.all([this.loadInvoices(), this.loadProfile()]);
  }

  async loadProfile() {
    try {
      this.profile = await this.authService.getProfile();
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async loadInvoices() {
    try {
      this.invoices = await this.invoiceService.getInvoices();
      this.filteredInvoices = this.invoices;
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      this.cdr.detectChanges();
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

  deleteInvoice(invoice: Invoice) {
    this.pendingDeleteInvoice = invoice;
    this.confirmMessage = `La factura ${invoice.invoice_number} será eliminada permanentemente.`;
    this.confirmVisible = true;
  }

  async onConfirmDelete() {
    this.confirmVisible = false;
    if (!this.pendingDeleteInvoice) return;
    try {
      await this.invoiceService.deleteInvoice(this.pendingDeleteInvoice.id!);
      await this.loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    } finally {
      this.pendingDeleteInvoice = null;
    }
  }

  async downloadPDF(invoice: Invoice) {
    await this.pdfService.downloadPdf(invoice, this.profile);
  }

  async previewPDF(invoice: Invoice) {
    this.previewVisible = true;
    this.previewLoading = true;
    this.previewUrl = null;
    this.revokeBlobUrl();
    this.previewInvoiceNumber = `Factura ${invoice.invoice_number}`;
    this.previewInvoiceRef = invoice;
    this.cdr.detectChanges();
    try {
      const url = await this.pdfService.getPreviewBlobUrl(invoice, this.profile);
      this.blobUrl = url;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } finally {
      this.previewLoading = false;
      this.cdr.detectChanges();
    }
  }

  private revokeBlobUrl() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  closePreview() {
    this.previewVisible = false;
    this.revokeBlobUrl();
    this.previewUrl = null;
    this.previewInvoiceRef = null;
  }

}
