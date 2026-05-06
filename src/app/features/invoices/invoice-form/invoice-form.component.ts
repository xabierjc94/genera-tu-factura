import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { Invoice, InvoiceItem } from '../../../shared/models/invoice.model';
import { Client } from '../../../shared/models/client.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Editar' : 'Nueva' }} <span class="gradient-text">Factura</span></h1>
          <p class="subtitle">{{ isEdit ? 'Actualiza los datos de la factura' : 'Crea una nueva factura' }}</p>
        </div>
        <button class="btn-secondary" routerLink="/invoices">← Volver</button>
      </div>

      <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-section">
          <h3>Datos Generales</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Cliente *</label>
              <select formControlName="client_id">
                <option value="">Seleccionar cliente...</option>
                @for (client of clients; track client.id) {
                  <option [value]="client.id">{{ client.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Número de Factura</label>
              <input type="text" formControlName="invoice_number" />
            </div>
            <div class="form-group">
              <label>Fecha de Emisión</label>
              <input type="date" formControlName="issue_date" />
            </div>
            <div class="form-group">
              <label>Fecha de Vencimiento</label>
              <input type="date" formControlName="due_date" />
            </div>
            <div class="form-group">
              <label>IVA (%)</label>
              <input type="number" formControlName="tax_rate" (input)="calculateTotals()" />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select formControlName="status">
                <option value="draft">Borrador</option>
                <option value="issued">Emitida</option>
                <option value="paid">Pagada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h3>Items de Factura</h3>
            <button type="button" class="btn-add" (click)="addItem()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Agregar Item
            </button>
          </div>
          <div formArrayName="items">
            @for (item of items.controls; track item; let i = $index) {
              <div [formGroupName]="i" class="item-row">
                <div class="item-desc">
                  <label>Descripción</label>
                  <input type="text" formControlName="description" placeholder="Descripción del servicio/producto" />
                </div>
                <div class="item-qty">
                  <label>Cantidad</label>
                  <input type="number" formControlName="quantity" (input)="calculateTotals()" />
                </div>
                <div class="item-price">
                  <label>Precio Unit.</label>
                  <input type="number" formControlName="unit_price" (input)="calculateTotals()" />
                </div>
                <div class="item-total">
                  <label>Total</label>
                  <input type="number" formControlName="total" readonly />
                </div>
                <button type="button" class="btn-remove" (click)="removeItem(i)" title="Eliminar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            }
          </div>
        </div>

        <div class="totals-card">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>{{ subtotal | currency:'EUR' }}</span>
          </div>
          <div class="total-row">
            <span>IVA ({{ invoiceForm.get('tax_rate')?.value }}%):</span>
            <span>{{ taxAmount | currency:'EUR' }}</span>
          </div>
          <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>{{ total | currency:'EUR' }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" routerLink="/invoices">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="invoiceForm.invalid || loading">
            @if (!loading) {
              {{ isEdit ? 'Actualizar' : 'Guardar' }} Factura
            } @else {
              <span class="spinner"></span>
            }
          </button>
        </div>
        @if (error) {
          <div class="error-message">{{ error }}</div>
        }
      </form>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1400px; margin:0 auto; padding: 2rem; }
    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 2rem; }
    h1 { font-size: 2rem; margin:0 0 0.5rem; color: #0f172a; }
    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subtitle { color: #64748b; margin:0; font-size: 0.95rem; }
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white;
      border: none; border-radius: 12px; font-weight: 500; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary {
      padding: 0.75rem 1.5rem; background: #f1f5f9; color: #475569;
      border: none; border-radius: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: #e2e8f0; }
    .form-card {
      background: white; border-radius: 16px; padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
    .form-section { margin-bottom: 2rem; }
    .section-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1rem; }
    .section-header h3 { margin: 0; color: #334155; font-size: 1rem; }
    .btn-add {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
      background: #eef2ff; color: #6366f1; border: none; border-radius: 8px;
      font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-add:hover { background: #e0e7ff; }
    .form-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-group.full-width { grid-column: 1 / -1; }
    label { display: block; margin-bottom: 0.5rem; color: #334155; font-weight: 500; font-size: 0.875rem; }
    input, select {
      width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0;
      border-radius: 12px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;
      background: #f8fafc; }
    input:focus, select:focus {
      border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
    select { cursor: pointer; }
    .item-row {
      display: grid; grid-template-columns: 3fr 1fr 1fr 1fr auto; gap: 1rem;
      margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; }
    .item-row label { font-size: 0.8rem; }
    .btn-remove {
      width: 32px; height: 32px; align-self: flex-end; background: #fee2e2; color: #dc2626;
      border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; }
    .btn-remove:hover { background: #fecaca; }
    .totals-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;
      padding: 1.5rem 2rem; border-radius: 12px; margin: 2rem 0; }
    .total-row {
      display: flex; justify-content: space-between; padding: 0.5rem 0;
      font-size: 0.95rem; }
    .total-final { font-size: 1.25rem; font-weight: bold; border-top: 2px solid rgba(255,255,255,0.3); padding-top: 1rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; }
    .spinner {
      display: inline-block; width: 20px; height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-message {
      margin-top: 1rem; padding: 0.75rem 1rem; background: #fee2e2;
      color: #dc2626; border-radius: 8px; font-size: 0.875rem; text-align: center; }
  `]
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  items: FormArray;
  clients: Client[] = [];
  isEdit = false;
  invoiceId?: string;
  loading = false;
  error = '';
  subtotal = 0;
  taxAmount = 0;
  total = 0;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.items = this.fb.array([]);
    this.invoiceForm = this.fb.group({
      client_id: ['', Validators.required],
      invoice_number: [''],
      issue_date: [new Date().toISOString().split('T')[0]],
      due_date: [new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]],
      tax_rate: [21, Validators.required],
      status: ['draft'],
      items: this.items
    });
  }

  async ngOnInit() {
    await this.loadClients();
    this.invoiceId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.invoiceId) {
      this.isEdit = true;
      await this.loadInvoice();
    } else {
      this.invoiceForm.patchValue({
        invoice_number: this.invoiceService.generateInvoiceNumber()
      });
      this.addItem();
    }
  }

  async loadClients() {
    try {
      this.clients = await this.clientService.getClients();
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async loadInvoice() {
    if (!this.invoiceId) return;
    try {
      const invoice = await this.invoiceService.getInvoice(this.invoiceId);
      if (invoice) {
        this.invoiceForm.patchValue({
          client_id: invoice.client_id,
          invoice_number: invoice.invoice_number,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          tax_rate: invoice.tax_rate,
          status: invoice.status
        });
        this.items.clear();
        if (invoice.items) {
          for (const item of invoice.items) {
            this.items.push(this.fb.group({
              description: [item.description, Validators.required],
              quantity: [item.quantity, Validators.required],
              unit_price: [item.unit_price, Validators.required],
              total: [item.total]
            }));
          }
        }
        this.calculateTotals();
      }
    } catch (error) {
      this.error = 'Error al cargar la factura';
    } finally {
      this.cdr.detectChanges();
    }
  }

  createItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      quantity: [1, Validators.required],
      unit_price: [0, Validators.required],
      total: [0]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  calculateTotals() {
    this.subtotal = 0;
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items.at(i);
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unit_price')?.value || 0;
      const itemTotal = quantity * unitPrice;
      item.patchValue({ total: itemTotal });
      this.subtotal += itemTotal;
    }
    const taxRate = this.invoiceForm.get('tax_rate')?.value || 21;
    this.taxAmount = this.subtotal * (taxRate / 100);
    this.total = this.subtotal + this.taxAmount;
  }

  async onSubmit() {
    if (this.invoiceForm.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      const user = await this.authService.getUser();
      if (!user) throw new Error('No user logged in');

      const formValue = this.invoiceForm.value;
      const invoiceData: any = {
        user_id: user.id,
        client_id: formValue.client_id,
        invoice_number: formValue.invoice_number,
        issue_date: formValue.issue_date,
        due_date: formValue.due_date,
        tax_rate: formValue.tax_rate,
        subtotal: this.subtotal,
        tax_amount: this.taxAmount,
        total: this.total,
        status: formValue.status
      };

      const itemsData = formValue.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total
      }));

      if (this.isEdit && this.invoiceId) {
        await this.invoiceService.updateInvoice(this.invoiceId, invoiceData, itemsData);
      } else {
        await this.invoiceService.createInvoice(invoiceData, itemsData);
      }
      this.router.navigate(['/invoices']);
    } catch (err: any) {
      this.error = err.message || 'Error al guardar la factura';
    } finally {
      this.loading = false;
    }
  }
}
