import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-message-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="animated-bg">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
      </div>
      <div class="card-wrapper">
        <div class="card" *ngIf="!sent && !notFound">
          <div class="brand">
            <div class="logo-icon">GF</div>
            <h1>Enviar <span class="gradient-text">Consulta</span></h1>
            <p class="subtitle" *ngIf="invoiceNumber">Factura <strong>{{ invoiceNumber }}</strong></p>
          </div>

          <div *ngIf="loading" class="loading-state">Cargando...</div>

          <form *ngIf="!loading" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Tu nombre</label>
              <input type="text" [(ngModel)]="clientName" name="clientName" placeholder="Nombre completo" required />
            </div>
            <div class="form-group">
              <label>Tu email</label>
              <input type="email" [(ngModel)]="clientEmail" name="clientEmail" placeholder="tu@email.com" required />
            </div>
            <div class="form-group">
              <label>Mensaje</label>
              <textarea [(ngModel)]="content" name="content" placeholder="Escribe tu consulta aquí..." rows="5" required></textarea>
            </div>
            <button type="submit" class="btn-send" [disabled]="sending || !clientName || !clientEmail || !content">
              <span *ngIf="!sending">Enviar mensaje</span>
              <span *ngIf="sending" class="spinner"></span>
            </button>
            <div class="error" *ngIf="error">{{ error }}</div>
          </form>
        </div>

        <div class="card success-card" *ngIf="sent">
          <div class="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>¡Mensaje enviado!</h2>
          <p>Tu consulta ha sido recibida. Te responderemos a la mayor brevedad posible.</p>
        </div>

        <div class="card error-card" *ngIf="notFound">
          <h2>Enlace no válido</h2>
          <p>No encontramos la factura asociada a este enlace.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
      padding: 2rem 1rem;
    }
    .animated-bg { position: absolute; width: 100%; height: 100%; overflow: hidden; }
    .circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.08); animation: float 20s infinite ease-in-out; }
    .circle-1 { width: 400px; height: 400px; top: -200px; right: -100px; }
    .circle-2 { width: 300px; height: 300px; bottom: -150px; left: -100px; animation-delay: -7s; }
    @keyframes float {
      0%, 100% { transform: translate(0,0) scale(1); }
      50% { transform: translate(-20px, 20px) scale(0.95); }
    }
    .card-wrapper { position: relative; z-index: 1; width: 100%; max-width: 480px; }
    .card {
      background: rgba(255,255,255,0.97);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .brand { text-align: center; margin-bottom: 2rem; }
    .logo-icon {
      width: 60px; height: 60px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 700; font-size: 1.25rem;
      margin: 0 auto 1rem;
      box-shadow: 0 8px 24px rgba(99,102,241,0.4);
    }
    h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem; }
    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .subtitle { color: #64748b; font-size: 0.9rem; margin: 0; }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; margin-bottom: 0.5rem; color: #334155; font-weight: 500; font-size: 0.875rem; }
    input, textarea {
      width: 100%; padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0; border-radius: 12px;
      font-size: 1rem; transition: all 0.2s;
      box-sizing: border-box; background: #f8fafc;
      font-family: inherit;
    }
    textarea { resize: vertical; }
    input:focus, textarea:focus {
      border-color: #6366f1; background: white;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1); outline: none;
    }
    .btn-send {
      width: 100%; padding: 1rem;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: white; border: none; border-radius: 12px;
      font-size: 1rem; font-weight: 600; cursor: pointer;
      transition: all 0.3s; margin-top: 0.5rem;
    }
    .btn-send:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }
    .btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
    .spinner {
      display: inline-block; width: 20px; height: 20px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error { margin-top: 1rem; padding: 0.75rem 1rem; background: #fee2e2; color: #dc2626; border-radius: 8px; font-size: 0.875rem; }
    .loading-state { text-align: center; color: #64748b; padding: 2rem 0; }
    .success-card, .error-card { text-align: center; }
    .success-icon { margin-bottom: 1rem; }
    .success-card h2 { color: #10b981; margin: 0 0 0.75rem; }
    .success-card p, .error-card p { color: #64748b; margin: 0; }
    .error-card h2 { color: #dc2626; margin: 0 0 0.75rem; }
  `]
})
export class MessageFormComponent implements OnInit {
  invoiceId = '';
  invoiceNumber = '';
  clientName = '';
  clientEmail = '';
  content = '';
  loading = true;
  sending = false;
  sent = false;
  notFound = false;
  error = '';
  private userId = '';

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId') || '';
    if (!this.invoiceId) { this.notFound = true; this.loading = false; return; }

    try {
      const data = await this.messageService.getInvoicePublicData(this.invoiceId);
      if (!data) { this.notFound = true; return; }
      this.invoiceNumber = data.invoice_number;
      this.clientName = data.client_name;
      this.clientEmail = data.client_email;
      this.userId = data.user_id;
    } catch {
      this.notFound = true;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async onSubmit() {
    if (!this.clientName || !this.clientEmail || !this.content) return;
    this.sending = true;
    this.error = '';
    try {
      await this.messageService.sendMessage({
        invoice_id: this.invoiceId,
        user_id: this.userId,
        client_name: this.clientName,
        client_email: this.clientEmail,
        content: this.content
      });
      this.sent = true;
    } catch (err: any) {
      this.error = 'Error al enviar el mensaje. Inténtalo de nuevo.';
    } finally {
      this.sending = false;
      this.cdr.detectChanges();
    }
  }
}
