import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Invoice, InvoiceItem } from '../../shared/models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await this.supabase.client
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        items:invoice_items(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    const { data, error } = await this.supabase.client
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        items:invoice_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at'>, items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]): Promise<Invoice> {
    const { data: invoiceData, error: invoiceError } = await this.supabase.client
      .from('invoices')
      .insert([invoice])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoiceData.id
      }));
      const { error: itemsError } = await this.supabase.client
        .from('invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;
    }

    return this.getInvoice(invoiceData.id) as Promise<Invoice>;
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>, items?: Omit<InvoiceItem, 'id' | 'invoice_id'>[]): Promise<Invoice> {
    const { error: invoiceError } = await this.supabase.client
      .from('invoices')
      .update(invoice)
      .eq('id', id);

    if (invoiceError) throw invoiceError;

    if (items) {
      await this.supabase.client
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: id
      }));
      await this.supabase.client
        .from('invoice_items')
        .insert(itemsWithInvoiceId);
    }

    return this.getInvoice(id) as Promise<Invoice>;
  }

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}-${random}`;
  }

  calculateInvoiceTotals(items: { quantity: number, unit_price: number, total?: number }[], taxRate: number = 21) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }
}
