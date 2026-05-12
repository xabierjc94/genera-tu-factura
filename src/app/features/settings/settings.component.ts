import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Ajustes de <span class="gradient-text">Facturación</span></h1>
          <p class="subtitle">Configura las opciones disponibles en tus facturas</p>
        </div>
      </div>

      <!-- Prefijo de factura -->
      <div class="card" style="margin-bottom:1.5rem">
        <div class="card-header">
          <h2>Numeración de facturas</h2>
          <p class="card-subtitle">Sin prefijo, el número se genera como <strong>{{ currentYear }}-0001</strong></p>
        </div>
        <div class="prefix-row">
          <div class="prefix-input-wrap">
            <input
              type="text"
              [(ngModel)]="invoicePrefix"
              placeholder="Ej: FAC-{{ currentYear }} (opcional)"
              class="input-add"
            />
            <small>Resultado: <strong>{{ previewInvoiceNumber }}</strong></small>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-primary" (click)="save()" [disabled]="loading">
            @if (!loading) { Guardar cambios } @else { <span class="spinner"></span> }
          </button>
          @if (success) { <span class="success-msg">¡Guardado correctamente!</span> }
          @if (error) { <span class="error-msg">{{ error }}</span> }
        </div>
      </div>

      <!-- Descripciones -->
      <div class="card">
        <div class="card-header">
          <h2>Descripciones de servicios / productos</h2>
          <p class="card-subtitle">Estas opciones aparecerán en el desplegable al crear una factura</p>
        </div>

        <div class="add-row">
          <input
            type="text"
            [(ngModel)]="newOption"
            placeholder="Nueva descripción..."
            (keydown.enter)="addOption()"
            class="input-add"
          />
          <button class="btn-primary" (click)="addOption()" [disabled]="!newOption.trim()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Añadir
          </button>
        </div>

        <div class="options-list">
          @if (options.length === 0) {
            <div class="empty">No hay descripciones configuradas todavía.</div>
          }
          @for (option of options; track option; let i = $index) {
            <div class="option-row">
              <span class="option-text">{{ option }}</span>
              <button class="btn-remove" (click)="removeOption(i)" title="Eliminar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          }
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .page-header { margin-bottom: 2rem; }
    h1 { font-size: 2rem; margin: 0 0 0.5rem; color: #f1f5f9; }
    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subtitle { color: #94a3b8; margin: 0; font-size: 0.95rem; }
    .card {
      background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 2rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
    .card-header { margin-bottom: 1.5rem; }
    .card-header h2 { margin: 0 0 0.25rem; color: #f1f5f9; font-size: 1.1rem; }
    .card-subtitle { color: #94a3b8; font-size: 0.875rem; margin: 0; }
    .add-row { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
    .input-add {
      flex: 1; padding: 0.75rem 1rem; border: 2px solid #334155; border-radius: 12px;
      font-size: 1rem; background: #0f172a; color: #f1f5f9; transition: all 0.2s; outline: none; }
    .input-add::placeholder { color: #475569; }
    .input-add:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white;
      border: none; border-radius: 12px; font-weight: 500; cursor: pointer;
      transition: all 0.2s; white-space: nowrap; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .options-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
    .empty { color: #64748b; font-size: 0.9rem; text-align: center; padding: 1.5rem 0; }
    .option-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.75rem 1rem; background: #0f172a; border-radius: 10px;
      border: 1px solid #334155; }
    .option-text { color: #cbd5e1; font-size: 0.95rem; }
    .btn-remove {
      width: 28px; height: 28px; border: none; border-radius: 6px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: rgba(220,38,38,0.15); color: #f87171; transition: all 0.2s; flex-shrink: 0; }
    .btn-remove:hover { background: rgba(220,38,38,0.25); }
    .prefix-row { margin-bottom: 1.5rem; }
    .prefix-input-wrap { display: flex; flex-direction: column; gap: 0.4rem; max-width: 360px; }
    .prefix-input-wrap small { color: #64748b; font-size: 0.8rem; }
    .card-footer { display: flex; align-items: center; gap: 1rem; padding-top: 1rem; border-top: 1px solid #334155; }
    .spinner {
      display: inline-block; width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .success-msg { color: #34d399; font-size: 0.875rem; }
    .error-msg { color: #f87171; font-size: 0.875rem; }
  `]
})
export class SettingsComponent implements OnInit {
  options: string[] = [];
  newOption = '';
  invoicePrefix = '';
  loading = false;
  success = false;
  error = '';
  readonly currentYear = new Date().getFullYear();

  get previewInvoiceNumber(): string {
    const base = this.invoicePrefix.trim() || String(this.currentYear);
    return `${base}-0001`;
  }

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    try {
      const profile = await this.authService.getProfile();
      this.options = profile?.description_options ?? [];
      this.invoicePrefix = profile?.invoice_prefix ?? '';
    } catch {
      this.error = 'Error al cargar la configuración';
    } finally {
      this.cdr.detectChanges();
    }
  }

  addOption() {
    const val = this.newOption.trim();
    if (!val || this.options.includes(val)) return;
    this.options = [...this.options, val];
    this.newOption = '';
  }

  removeOption(i: number) {
    this.options = this.options.filter((_, idx) => idx !== i);
  }

  async save() {
    this.loading = true;
    this.error = '';
    this.success = false;
    try {
      await this.authService.updateProfile({
        description_options: this.options,
        invoice_prefix: this.invoicePrefix.trim()
      });
      this.success = true;
      setTimeout(() => { this.success = false; this.cdr.detectChanges(); }, 3000);
    } catch (err: any) {
      this.error = err.message || 'Error al guardar';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
