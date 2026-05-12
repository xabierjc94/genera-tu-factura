import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="visible" (click)="onCancel()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="actions">
          <button class="btn-cancel" (click)="onCancel()">Cancelar</button>
          <button class="btn-confirm" (click)="onConfirm()">Eliminar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 2000; padding: 1rem;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .dialog {
      background: #1e293b; border: 1px solid #334155; border-radius: 20px; padding: 2rem;
      width: 100%; max-width: 400px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      text-align: center;
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .icon { margin-bottom: 1rem; }
    h3 { margin: 0 0 0.5rem; color: #f1f5f9; font-size: 1.2rem; }
    p { margin: 0 0 1.5rem; color: #94a3b8; font-size: 0.95rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: center; }
    .btn-cancel {
      padding: 0.7rem 1.5rem; background: #334155; color: #94a3b8;
      border: none; border-radius: 10px; font-weight: 500; cursor: pointer;
      transition: all 0.2s; font-size: 0.95rem;
    }
    .btn-cancel:hover { background: #475569; color: #f1f5f9; }
    .btn-confirm {
      padding: 0.7rem 1.5rem; background: #ef4444; color: white;
      border: none; border-radius: 10px; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-size: 0.95rem;
    }
    .btn-confirm:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239,68,68,0.4); }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = '¿Estás seguro?';
  @Input() message = 'Esta acción no se puede deshacer.';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}
