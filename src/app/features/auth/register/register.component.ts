import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="register-page">
      <div class="animated-bg">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
      <div class="register-container">
        <div class="register-card">
          <div class="brand">
            <div class="logo-wrapper">
              <div class="logo-icon">GF</div>
            </div>
            <h1>Crear<br/><span class="gradient-text">Cuenta</span></h1>
            <p class="tagline">Comienza a gestionar tus facturas hoy</p>
          </div>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-section">
              <h3>Datos de Acceso</h3>
              <div class="form-group">
                <label>Email</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input type="email" formControlName="email" placeholder="tu@empresa.com" />
                </div>
              </div>
              <div class="form-group">
                <label>Contraseña</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0110 0v4"></path>
                  </svg>
                  <input type="password" formControlName="password" placeholder="Minimo 6 caracteres" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Datos de la Empresa</h3>
              <div class="form-group">
                <label>Nombre de la Empresa</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                  </svg>
                  <input type="text" formControlName="company_name" placeholder="Mi Empresa S.L." />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>CIF/NIF</label>
                  <input type="text" formControlName="cif_nif" placeholder="B12345678" />
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input type="tel" formControlName="phone" placeholder="600000000" />
                </div>
              </div>
              <div class="form-group">
                <label>Domicilio</label>
                <input type="text" formControlName="address" placeholder="Calle Mayor 123" />
              </div>
              <div class="form-group">
                <label>Provincia</label>
                <input type="text" formControlName="province" placeholder="Madrid" />
              </div>
            </div>

            <button type="submit" class="btn-register" [disabled]="registerForm.invalid || loading">
              <span *ngIf="!loading">Crear Cuenta</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
            <div class="error-message" *ngIf="error">{{ error }}</div>
          </form>
          <div class="footer">
            <p>¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia Sesión</a></p>
            <button class="btn-back" routerLink="/dashboard">Volver al Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
      padding: 2rem 1rem;
    }

    .animated-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 20s infinite ease-in-out;
    }

    .circle-1 {
      width: 500px;
      height: 500px;
      top: -250px;
      right: -150px;
      animation-delay: 0s;
    }

    .circle-2 {
      width: 400px;
      height: 400px;
      bottom: -200px;
      left: -150px;
      animation-delay: -7s;
    }

    .circle-3 {
      width: 300px;
      height: 300px;
      top: 50%;
      right: 10%;
      animation-delay: -14s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(30px, -30px) scale(1.1); }
      50% { transform: translate(-20px, 20px) scale(0.9); }
      75% { transform: translate(20px, 30px) scale(1.05); }
    }

    .register-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 500px;
    }

    .register-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .logo-icon {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.5rem;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }

    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tagline {
      margin-top: 0.5rem;
      color: #64748b;
      font-size: 0.95rem;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .form-section h3 {
      margin: 0 0 1rem;
      color: #475569;
      font-size: 1rem;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #334155;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.2s;
      box-sizing: border-box;
      background: #f8fafc;
    }

    input:focus {
      border-color: #6366f1;
      background: white;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-row input {
      padding: 0.875rem 1rem;
    }

    .btn-register {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 0.5rem;
    }

    .btn-register:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
    }

    .btn-register:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 8px;
      font-size: 0.875rem;
      text-align: center;
    }

    .footer {
      margin-top: 1.5rem;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }

    .footer a {
      color: #6366f1;
      font-weight: 600;
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    .btn-back {
      display: block;
      width: 100%;
      padding: 0.75rem 1.5rem;
      background: #f1f5f9;
      color: #475569;
      border: none;
      border-radius: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 1rem;
    }

    .btn-back:hover {
      background: #e2e8f0;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      company_name: ['', Validators.required],
      cif_nif: ['', Validators.required],
      phone: [''],
      address: ['', Validators.required],
      province: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      await this.authService.signUp(
        this.registerForm.value.email,
        this.registerForm.value.password,
        {
          company_name: this.registerForm.value.company_name,
          address: this.registerForm.value.address,
          province: this.registerForm.value.province,
          cif_nif: this.registerForm.value.cif_nif,
          phone: this.registerForm.value.phone
        }
      );
      alert('Registro exitoso. Revisa tu email para confirmar la cuenta.');
      this.router.navigate(['/auth/login']);
    } catch (err: any) {
      this.error = err.message || 'Error al registrarse';
    } finally {
      this.loading = false;
    }
  }
}
