import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { PdfService } from '../../../core/services/pdf.service';
import { SupabaseService } from '../../../core/services/supabase.service';
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
              <input type="number" formControlName="tax_rate" (input)="onTaxRateChange()" />
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
                  @if (descriptionOptions.length > 0) {
                    <select formControlName="description">
                      <option value="">Seleccionar descripción...</option>
                      @for (opt of descriptionOptions; track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  } @else {
                    <input type="text" formControlName="description" placeholder="Descripción del servicio/producto" />
                  }
                </div>
                <div class="item-qty">
                  <label>Cantidad</label>
                  <input type="number" formControlName="quantity" (input)="onQuantityInput(i, $event)" />
                </div>
                <div class="item-price">
                  <label>Precio Unit. (s/IVA)</label>
                  <input type="number" formControlName="unit_price" (input)="onUnitPriceInput(i)" />
                </div>
                <div class="item-total">
                  <label>Total c/IVA</label>
                  <input type="number" formControlName="total_with_iva" (input)="onTotalWithIvaInput(i, $event)" />
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
  descriptionOptions: string[] = [];
  isEdit = false;
  invoiceId?: string;
  originalStatus = 'draft';
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
    private pdfService: PdfService,
    private supabaseService: SupabaseService,
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
    await Promise.all([this.loadClients(), this.loadDescriptionOptions()]);
    this.invoiceId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.invoiceId) {
      this.isEdit = true;
      await this.loadInvoice();
    } else {
      const profile = await this.authService.getProfile();
      const invoiceNumber = await this.invoiceService.generateInvoiceNumber(profile?.invoice_prefix);
      this.invoiceForm.patchValue({ invoice_number: invoiceNumber });
      this.addItem();
    }
  }

  async loadDescriptionOptions() {
    try {
      const profile = await this.authService.getProfile();
      this.descriptionOptions = profile?.description_options ?? [];
    } catch { /* sin opciones */ }
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
        this.originalStatus = invoice.status || 'draft';
        this.invoiceForm.patchValue({
          client_id: invoice.client_id,
          invoice_number: invoice.invoice_number,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          tax_rate: invoice.tax_rate,
          status: invoice.status
        });
        this.items.clear();
        this.lastEditedField = [];
        this.savedTotalWithIva = [];
        if (invoice.items) {
          const taxRate = invoice.tax_rate || 21;
          for (const item of invoice.items) {
            this.lastEditedField.push('unit_price');
            this.savedTotalWithIva.push(0);
            const totalWithIva = +((item.unit_price ?? 0) * (item.quantity ?? 1) * (1 + taxRate / 100)).toFixed(2);
            this.items.push(this.fb.group({
              description: [item.description, Validators.required],
              quantity: [item.quantity, Validators.required],
              unit_price: [item.unit_price, Validators.required],
              total: [item.total],
              total_with_iva: [totalWithIva]
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
      total: [0],
      total_with_iva: [0]
    });
  }

  lastEditedField: ('unit_price' | 'total_with_iva')[] = [];
  savedTotalWithIva: number[] = [];

  addItem() {
    this.items.push(this.createItem());
    this.lastEditedField.push('unit_price');
    this.savedTotalWithIva.push(0);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.lastEditedField.splice(index, 1);
    this.savedTotalWithIva.splice(index, 1);
    this.recalcInvoiceTotals();
  }

  private getTaxRate(): number {
    return this.invoiceForm.get('tax_rate')?.value || 21;
  }

  private recalcFromUnitPrice(i: number) {
    const item = this.items.at(i);
    const qty = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unit_price')?.value || 0;
    const itemTotal = qty * unitPrice;
    const totalWithIva = +(itemTotal * (1 + this.getTaxRate() / 100)).toFixed(2);
    item.patchValue({ total: +itemTotal.toFixed(4), total_with_iva: totalWithIva }, { emitEvent: false });
  }

  private recalcFromTotalWithIva(i: number, totalWithIva?: number, qty?: number) {
    const item = this.items.at(i);
    const q = qty ?? item.get('quantity')?.value ?? 1;
    const t = totalWithIva ?? item.get('total_with_iva')?.value ?? 0;
    const unitPrice = t / q / (1 + this.getTaxRate() / 100);
    const itemTotal = unitPrice * q;
    item.patchValue({ unit_price: +unitPrice.toFixed(4), total: +itemTotal.toFixed(4) }, { emitEvent: false });
  }

  private recalcInvoiceTotals() {
    const taxRate = this.getTaxRate();
    this.subtotal = 0;
    for (let i = 0; i < this.items.length; i++) {
      this.subtotal += this.items.at(i).get('total')?.value || 0;
    }
    this.taxAmount = this.subtotal * (taxRate / 100);
    this.total = this.subtotal + this.taxAmount;
  }

  calculateTotals() {
    for (let i = 0; i < this.items.length; i++) {
      this.recalcFromUnitPrice(i);
    }
    this.recalcInvoiceTotals();
  }

  onUnitPriceInput(i: number) {
    this.lastEditedField[i] = 'unit_price';
    this.recalcFromUnitPrice(i);
    this.recalcInvoiceTotals();
  }

  onQuantityInput(i: number, event: Event) {
    const qty = +(event.target as HTMLInputElement).value || 1;
    if (this.lastEditedField[i] === 'total_with_iva') {
      const t = this.savedTotalWithIva[i] || 0;
      const unitPrice = t / qty / (1 + this.getTaxRate() / 100);
      const itemTotal = unitPrice * qty;
      this.items.at(i).patchValue(
        { unit_price: +unitPrice.toFixed(4), total: +itemTotal.toFixed(4) },
        { emitEvent: false }
      );
    } else {
      const item = this.items.at(i);
      const unitPrice = item.get('unit_price')?.value || 0;
      const itemTotal = qty * unitPrice;
      const totalWithIva = +(itemTotal * (1 + this.getTaxRate() / 100)).toFixed(2);
      item.patchValue({ total: +itemTotal.toFixed(4), total_with_iva: totalWithIva }, { emitEvent: false });
    }
    this.recalcInvoiceTotals();
  }

  onTotalWithIvaInput(i: number, event: Event) {
    const totalWithIva = +(event.target as HTMLInputElement).value || 0;
    this.lastEditedField[i] = 'total_with_iva';
    this.savedTotalWithIva[i] = totalWithIva;
    this.recalcFromTotalWithIva(i, totalWithIva);
    this.recalcInvoiceTotals();
  }

  onTaxRateChange() {
    for (let i = 0; i < this.items.length; i++) {
      if (this.lastEditedField[i] === 'total_with_iva') {
        this.recalcFromTotalWithIva(i);
      } else {
        this.recalcFromUnitPrice(i);
      }
    }
    this.recalcInvoiceTotals();
  }

  private async sendInvoiceByEmail(invoiceId: string) {
    try {
      const [invoice, profile] = await Promise.all([
        this.invoiceService.getInvoice(invoiceId),
        this.authService.getProfile()
      ]);
      if (!invoice?.client?.email) {
        console.warn('Cliente sin email — no se envía factura');
        return;
      }
      console.log('Generando PDF...');
      const pdfBase64 = await this.pdfService.getPdfBase64(invoice, profile);
      console.log('PDF generado, llamando Edge Function...');
      const messageUrl = `${window.location.origin}/m/${invoiceId}`;
      const { data, error } = await this.supabaseService.invokeFunction('send-invoice', {
        to_email: invoice.client.email,
        client_name: invoice.client.name,
        invoice_number: invoice.invoice_number,
        company_name: profile?.company_name,
        total: invoice.total,
        pdf_base64: pdfBase64,
        message_url: messageUrl
      });
      if (error) {
        const body = await (error as any).context?.json?.().catch(() => null);
        console.error('Error Edge Function:', error, 'Body:', body);
      } else {
        console.log('Email enviado correctamente:', data);
      }
    } catch (err) {
      console.error('Error enviando factura por email:', err);
    }
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
        total: item.unit_price * item.quantity
      }));

      let savedId = this.invoiceId;
      if (this.isEdit && this.invoiceId) {
        await this.invoiceService.updateInvoice(this.invoiceId, invoiceData, itemsData);
      } else {
        const created = await this.invoiceService.createInvoice(invoiceData, itemsData);
        savedId = created.id;
      }

      if (formValue.status === 'issued' && savedId) {
        await this.sendInvoiceByEmail(savedId);
      }

      this.router.navigate(['/invoices']);
    } catch (err: any) {
      this.error = err.message || 'Error al guardar la factura';
    } finally {
      this.loading = false;
    }
  }
}
