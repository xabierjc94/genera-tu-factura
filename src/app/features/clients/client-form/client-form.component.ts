import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { Client } from '../../../shared/models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? 'Editar' : 'Nuevo' }} <span class="gradient-text">Cliente</span></h1>
          <p class="subtitle">{{ isEdit ? 'Actualiza los datos del cliente' : 'Agrega un nuevo cliente a tu lista' }}</p>
        </div>
        <button class="btn-secondary" routerLink="/clients">← Volver</button>
      </div>

      <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Nombre *</label>
            <input type="text" formControlName="name" placeholder="Nombre del cliente" />
          </div>
          <div class="form-group">
            <label>CIF/NIF</label>
            <input type="text" formControlName="cif_nif" placeholder="B12345678" />
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="tel" formControlName="phone" placeholder="600000000" />
          </div>
          <div class="form-group full-width">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="cliente@empresa.com" />
          </div>
          <div class="form-group full-width">
            <label>Dirección</label>
            <input type="text" formControlName="address" placeholder="Calle Mayor 123" />
          </div>
          <div class="form-group">
            <label>Provincia</label>
            <input type="text" formControlName="province" placeholder="Madrid" />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" routerLink="/clients">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="clientForm.invalid || loading">
            @if (!loading) {
              {{ isEdit ? 'Actualizar' : 'Guardar' }} Cliente
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
    .form-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .form-group { display: flex; flex-direction: column; }
    .full-width { grid-column: 1 / -1; }
    label { display: block; margin-bottom: 0.5rem; color: #334155; font-weight: 500; font-size: 0.875rem; }
    input {
      width: 100%; padding: 0.875rem 1rem; border: 2px solid #e2e8f0;
      border-radius: 12px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;
      background: #f8fafc; }
    input:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
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
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEdit = false;
  clientId?: string;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      cif_nif: [''],
      address: [''],
      province: [''],
      email: ['', Validators.email],
      phone: ['']
    });
  }

  async ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('id') || undefined;
    if (this.clientId) {
      this.isEdit = true;
      await this.loadClient();
    }
  }

  async loadClient() {
    if (!this.clientId) return;
    try {
      const client = await this.clientService.getClient(this.clientId);
      if (client) {
        this.clientForm.patchValue(client);
      }
    } catch (error) {
      this.error = 'Error al cargar el cliente';
    }
  }

  async onSubmit() {
    if (this.clientForm.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      const user = await this.authService.getUser();
      if (!user) throw new Error('No user logged in');

      const clientData = {
        ...this.clientForm.value,
        user_id: user.id
      };

      if (this.isEdit && this.clientId) {
        await this.clientService.updateClient(this.clientId, clientData);
      } else {
        await this.clientService.createClient(clientData);
      }
      this.router.navigate(['/clients']);
    } catch (err: any) {
      this.error = err.message || 'Error al guardar el cliente';
    } finally {
      this.loading = false;
    }
  }
}
