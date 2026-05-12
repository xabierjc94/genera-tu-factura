import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="animated-bg">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
      <div class="login-container">
        <div class="login-card">
          <div class="brand">
            <div class="logo-wrapper">
              <div class="logo-icon">GF</div>
            </div>
            <h1>Genera tu<br/><span class="gradient-text">Factura</span></h1>
            <p class="tagline">Gestiona tus facturas de forma inteligente</p>
          </div>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input type="email" formControlName="email" placeholder="tu@email.com" />
              </div>
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0110 0v4"></path>
                </svg>
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="********" />
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword" tabindex="-1">
                  <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"></path>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" class="btn-login" [disabled]="loginForm.invalid || loading">
              <span *ngIf="!loading">Ingresar</span>
              <span *ngIf="loading" class="spinner"></span>
            </button>
            <div class="error-message" *ngIf="error">{{ error }}</div>
          </form>
          <div class="footer">
            <p>¿No tienes cuenta? <a routerLink="/auth/register">Regístrate gratis</a></p>
            <button class="btn-back" routerLink="/dashboard">Volver al Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
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
      width: 400px;
      height: 400px;
      top: -200px;
      right: -100px;
      animation-delay: 0s;
    }

    .circle-2 {
      width: 300px;
      height: 300px;
      bottom: -150px;
      left: -100px;
      animation-delay: -7s;
    }

    .circle-3 {
      width: 200px;
      height: 200px;
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

    .login-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: 1rem;
    }

    .login-card {
      background: rgba(30, 41, 59, 0.97);
      backdrop-filter: blur(20px);
      border: 1px solid #334155;
      border-radius: 24px;
      padding: 3rem 2.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .brand {
      text-align: center;
      margin-bottom: 2.5rem;
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
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4); }
      50% { box-shadow: 0 8px 32px rgba(99, 102, 241, 0.6); }
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #f1f5f9;
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
      color: #94a3b8;
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #94a3b8;
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
      border: 2px solid #334155;
      border-radius: 12px;
      font-size: 1rem;
      transition: all 0.2s;
      box-sizing: border-box;
      background: #0f172a;
      color: #f1f5f9;
    }

    input::placeholder { color: #475569; }

    input:focus {
      border-color: #6366f1;
      background: #0f172a;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      padding: 0;
      display: flex;
      align-items: center;
    }
    .toggle-password:hover { color: #6366f1; }

    .btn-login {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 0.5rem;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }

    .btn-login:disabled {
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
      background: rgba(220, 38, 38, 0.15);
      color: #f87171;
      border-radius: 8px;
      font-size: 0.875rem;
      text-align: center;
    }

    .footer {
      margin-top: 2rem;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }

    .footer a {
      color: #6366f1;
      font-weight: 600;
      text-decoration: none;
    }

    .btn-back {
      display: block;
      width: 100%;
      padding: 0.75rem 1.5rem;
      background: #334155;
      color: #94a3b8;
      border: none;
      border-radius: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 1rem;
      text-align: center;
    }
    .btn-back:hover { background: #475569; color: #f1f5f9; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      await this.authService.signIn(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Error al iniciar sesión';
    } finally {
      this.loading = false;
    }
  }
}
