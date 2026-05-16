import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Profile } from '../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Perfil de <span class="gradient-text">Empresa</span></h1>
          <p class="subtitle">Gestiona la información de tu empresa</p>
        </div>
        <button class="btn-secondary" routerLink="/dashboard">← Volver</button>
      </div>

      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="form-card">
        <div class="profile-header">
          <div class="profile-logo-container">
            @if (logoPreview || profile?.logo_url) {
              <img [src]="logoPreview || profile?.logo_url"
                   class="profile-logo" alt="Logo" />
            } @else {
              <div class="profile-avatar">{{ (profile?.company_name || 'E')[0] }}</div>
            }
            <label class="logo-upload-btn">
              <input #fileInput type="file" accept="image/*" (change)="onLogoSelected($event)" class="hidden" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Cambiar Logo
            </label>
          </div>
          <div>
            <h2>{{ profile?.company_name || 'Empresa' }}</h2>
            <p>{{ profile?.email || '' }}</p>
          </div>
        </div>

        <div class="form-section">
          <h3>Información de la Empresa</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Nombre de la Empresa *</label>
              <input type="text" formControlName="company_name" />
            </div>
            <div class="form-group">
              <label>CIF/NIF *</label>
              <input type="text" formControlName="cif_nif" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" formControlName="phone" />
            </div>
            <div class="form-group full-width">
              <label>Dirección *</label>
              <input type="text" formControlName="address" />
            </div>
            <div class="form-group">
              <label>Provincia *</label>
              <input type="text" formControlName="province" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Información de Contacto</h3>
          <div class="form-group full-width">
            <label>Email</label>
            <input type="email" formControlName="email" [disabled]="true" />
            <small>El email no se puede cambiar</small>
          </div>
        </div>

        <div class="form-section">
          <h3>Datos Bancarios</h3>
          <div class="form-group full-width">
            <label>Número de Cuenta (IBAN)</label>
            <input type="text" formControlName="bank_account" placeholder="ES00 0000 0000 0000 0000 0000" />
            <small>Se puede incluir en las facturas para recibir pagos</small>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="profileForm.invalid || loading">
            @if (!loading) {
              Guardar Cambios
            } @else {
              <span class="spinner"></span>
            }
          </button>
        </div>
        @if (success) {
          <div class="success-message">¡Perfil actualizado correctamente!</div>
        }
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
    h1 { font-size: 2rem; margin:0 0 0.5rem; color: #f1f5f9; }
    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .subtitle { color: #94a3b8; margin:0; font-size: 0.95rem; }
    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white;
      border: none; border-radius: 12px; font-weight: 500; cursor: pointer;
      transition: all 0.3s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary {
      padding: 0.75rem 1.5rem; background: #334155; color: #94a3b8;
      border: none; border-radius: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: #475569; color: #f1f5f9; }
    .form-card {
      background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 2rem;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3); }
    .profile-header {
      display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 2rem;
      border-bottom: 2px solid #334155; }
    .profile-logo-container {
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .profile-logo {
      width: 100px; height: 100px; border-radius: 20px; object-fit: cover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
    .profile-avatar {
      width: 100px; height: 100px; border-radius: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 2rem; flex-shrink: 0;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4); }
    .logo-upload-btn {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
      background: rgba(99,102,241,0.15); color: #818cf8; border-radius: 8px; cursor: pointer;
      font-size: 0.875rem; font-weight: 500; transition: all 0.2s; }
    .logo-upload-btn:hover { background: rgba(99,102,241,0.25); }
    .hidden { display: none; }
    .profile-header h2 { margin: 0 0 0.25rem; color: #f1f5f9; }
    .profile-header p { margin: 0; color: #64748b; font-size: 0.9rem; }
    .form-section { margin-bottom: 2rem; }
    .form-section h3 { margin: 0 0 1rem; color: #94a3b8; font-size: 1rem; font-weight: 600; }
    .form-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .full-width { grid-column: 1 / -1; }
    .form-group { display: flex; flex-direction: column; }
    label { display: block; margin-bottom: 0.5rem; color: #94a3b8; font-weight: 500; font-size: 0.875rem; }
    input {
      width: 100%; padding: 0.875rem 1rem; border: 2px solid #334155;
      border-radius: 12px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box;
      background: #0f172a; color: #f1f5f9; }
    input::placeholder { color: #475569; }
    input:focus { border-color: #6366f1; background: #0f172a; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); }
    input:disabled { background: #1e293b; color: #475569; cursor: not-allowed; }
    small { margin-top: 0.25rem; color: #64748b; font-size: 0.8rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; }
    .spinner {
      display: inline-block; width: 20px; height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .success-message {
      margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(16,185,129,0.15); color: #34d399;
      border-radius: 8px; font-size: 0.875rem; text-align: center; }
    .error-message {
      margin-top: 1rem; padding: 0.75rem 1rem; background: rgba(220,38,38,0.15); color: #f87171;
      border-radius: 8px; font-size: 0.875rem; text-align: center; }

    @media (max-width: 768px) {
      .page-container { padding: 1.25rem 1rem; }
      h1 { font-size: 1.5rem; }
      .page-header { flex-wrap: wrap; gap: 1rem; }
      .form-card { padding: 1.25rem; }
      .profile-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .form-grid { grid-template-columns: 1fr; gap: 1rem; }
    }

    @media (max-width: 480px) {
      .page-container { padding: 1rem 0.75rem; }
      .form-card { padding: 1rem; }
      .form-actions { flex-direction: column; }
      .btn-primary { width: 100%; justify-content: center; }
      .btn-secondary { width: 100%; text-align: center; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  profile: Profile | null = null;
  logoPreview: string | null = null;
  selectedLogo: File | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      company_name: ['', Validators.required],
      cif_nif: ['', Validators.required],
      address: ['', Validators.required],
      province: ['', Validators.required],
      phone: [''],
      email: [''],
      bank_account: ['']
    });
  }

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    try {
      this.profile = await this.authService.getProfile();
      if (this.profile) {
        this.profileForm.patchValue({
          company_name: this.profile.company_name || '',
          cif_nif: this.profile.cif_nif || '',
          address: this.profile.address || '',
          province: this.profile.province || '',
          phone: this.profile.phone || '',
          email: this.profile.email || '',
          bank_account: this.profile.bank_account || ''
        });
      }
    } catch (err: any) {
      this.error = 'Error al cargar el perfil';
    } finally {
      this.cdr.detectChanges();
    }
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedLogo = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.logoPreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
      input.value = '';
      this.profileForm.markAsDirty();
      this.cdr.detectChanges();
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid) return;
    this.loading = true;
    this.error = '';
    this.success = false;

    try {
      let logoUrl = this.profile?.logo_url || '';

      if (this.selectedLogo) {
        console.log('Uploading logo...');
        logoUrl = await this.authService.uploadLogo(this.selectedLogo);
        console.log('Logo uploaded:', logoUrl);
      }

      const updateData = {
        ...this.profileForm.value,
        logo_url: logoUrl
      };

      console.log('Updating profile with data:', updateData);

      await this.authService.updateProfile(updateData);
      
      this.profile = await this.authService.getProfile();
      this.logoPreview = null;
      this.selectedLogo = null;
      this.profileForm.markAsPristine();
      this.success = true;
      
      setTimeout(() => this.success = false, 3000);
    } catch (err: any) {
      console.error('Error in onSubmit:', err);
      this.error = err.message || 'Error al actualizar el perfil';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
