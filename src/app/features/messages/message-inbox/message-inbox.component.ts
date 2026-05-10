import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { Message } from '../../../shared/models/message.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-message-inbox',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      [visible]="confirmVisible"
      [title]="'Eliminar mensaje'"
      [message]="'Este mensaje será eliminado permanentemente.'"
      (confirmed)="onConfirmDelete()"
      (cancelled)="confirmVisible = false"
    ></app-confirm-dialog>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Mensajes</h1>
          <p class="subtitle">Consultas recibidas de tus clientes</p>
        </div>
        <button class="btn-secondary" routerLink="/dashboard">← Volver</button>
      </div>

      <div *ngIf="messages.length === 0" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
        </svg>
        <h3>Sin mensajes</h3>
        <p>Cuando un cliente envíe una consulta aparecerá aquí</p>
      </div>

      <div class="messages-list" *ngIf="messages.length > 0">
        <div
          class="message-card"
          [class.unread]="!msg.is_read"
          *ngFor="let msg of messages"
          (click)="openMessage(msg)"
        >
          <div class="message-header">
            <div class="client-info">
              <div class="avatar">{{ msg.client_name[0] }}</div>
              <div>
                <strong class="client-name">{{ msg.client_name }}</strong>
                <span class="client-email">{{ msg.client_email }}</span>
              </div>
            </div>
            <div class="meta">
              <span class="unread-dot" *ngIf="!msg.is_read"></span>
              <span class="date">{{ msg.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
              <button class="btn-delete" (click)="deleteMessage($event, msg)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="message-preview">{{ msg.content }}</p>
          <span class="invoice-ref">Factura relacionada</span>
        </div>
      </div>

      <!-- Modal detalle -->
      <div class="modal-overlay" *ngIf="selectedMessage" (click)="closeMessage()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="client-info">
              <div class="avatar large">{{ selectedMessage.client_name[0] }}</div>
              <div>
                <strong>{{ selectedMessage.client_name }}</strong>
                <a [href]="'mailto:' + selectedMessage.client_email" class="email-link">{{ selectedMessage.client_email }}</a>
              </div>
            </div>
            <button class="btn-close" (click)="closeMessage()">✕</button>
          </div>
          <div class="modal-date">{{ selectedMessage.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
          <div class="modal-content">{{ selectedMessage.content }}</div>
          <div class="modal-actions">
            <a [href]="'mailto:' + selectedMessage.client_email + '?subject=Re: Factura ' + selectedMessage.invoice_id" class="btn-reply">
              Responder por email
            </a>
            <button class="btn-secondary" (click)="closeMessage()">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    h1 { font-size: 2rem; margin: 0 0 0.5rem; color: #0f172a; }
    .subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }
    .btn-secondary {
      padding: 0.6rem 1.25rem; background: #f1f5f9; color: #475569;
      border: none; border-radius: 10px; font-weight: 500; cursor: pointer; transition: all 0.2s;
    }
    .btn-secondary:hover { background: #e2e8f0; }
    .empty-state {
      text-align: center; padding: 4rem 2rem; background: white;
      border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .empty-state svg { margin-bottom: 1rem; }
    .empty-state h3 { color: #334155; margin-bottom: 0.5rem; }
    .empty-state p { color: #94a3b8; margin: 0; }
    .messages-list { display: flex; flex-direction: column; gap: 1rem; }
    .message-card {
      background: white; border-radius: 16px; padding: 1.25rem 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06); cursor: pointer;
      transition: all 0.2s; border-left: 4px solid transparent;
    }
    .message-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .message-card.unread { border-left-color: #6366f1; }
    .message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .client-info { display: flex; align-items: center; gap: 0.75rem; }
    .avatar {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem; flex-shrink: 0;
    }
    .avatar.large { width: 48px; height: 48px; font-size: 1.25rem; }
    .client-name { display: block; color: #0f172a; font-size: 0.95rem; }
    .client-email { display: block; color: #94a3b8; font-size: 0.8rem; }
    .meta { display: flex; align-items: center; gap: 0.75rem; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #6366f1; flex-shrink: 0; }
    .date { color: #94a3b8; font-size: 0.8rem; }
    .btn-delete {
      width: 30px; height: 30px; border: none; border-radius: 8px;
      background: #fee2e2; color: #dc2626; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .btn-delete:hover { background: #fecaca; }
    .message-preview {
      color: #64748b; font-size: 0.9rem; margin: 0 0 0.5rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .invoice-ref { font-size: 0.75rem; color: #94a3b8; }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 1rem;
    }
    .modal {
      background: white; border-radius: 20px; padding: 2rem;
      width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .email-link { display: block; color: #6366f1; font-size: 0.85rem; text-decoration: none; }
    .email-link:hover { text-decoration: underline; }
    .btn-close {
      width: 32px; height: 32px; border: none; border-radius: 8px;
      background: #f1f5f9; color: #475569; cursor: pointer; font-size: 1rem;
    }
    .modal-date { color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem; }
    .modal-content {
      background: #f8fafc; border-radius: 12px; padding: 1.25rem;
      color: #334155; line-height: 1.6; white-space: pre-wrap; margin-bottom: 1.5rem;
    }
    .modal-actions { display: flex; gap: 1rem; }
    .btn-reply {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
      color: white; border: none; border-radius: 10px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; text-decoration: none;
      display: inline-flex; align-items: center;
    }
    .btn-reply:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.4); }
  `]
})
export class MessageInboxComponent implements OnInit {
  messages: Message[] = [];
  selectedMessage: Message | null = null;
  confirmVisible = false;
  private pendingDeleteMessage: Message | null = null;

  constructor(
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.loadMessages();
  }

  async loadMessages() {
    try {
      this.messages = await this.messageService.getMessages();
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    } finally {
      this.cdr.detectChanges();
    }
  }

  async openMessage(msg: Message) {
    this.selectedMessage = msg;
    if (!msg.is_read && msg.id) {
      await this.messageService.markAsRead(msg.id);
      msg.is_read = true;
    }
  }

  closeMessage() {
    this.selectedMessage = null;
  }

  deleteMessage(event: Event, msg: Message) {
    event.stopPropagation();
    if (!msg.id) return;
    this.pendingDeleteMessage = msg;
    this.confirmVisible = true;
  }

  async onConfirmDelete() {
    this.confirmVisible = false;
    if (!this.pendingDeleteMessage?.id) return;
    await this.messageService.deleteMessage(this.pendingDeleteMessage.id);
    this.messages = this.messages.filter(m => m.id !== this.pendingDeleteMessage!.id);
    this.pendingDeleteMessage = null;
    this.cdr.detectChanges();
  }
}
