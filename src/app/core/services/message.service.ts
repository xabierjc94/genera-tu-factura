import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Message } from '../../shared/models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  constructor(private supabase: SupabaseService) {}

  async sendMessage(message: Omit<Message, 'id' | 'created_at' | 'is_read'>): Promise<void> {
    const { error } = await this.supabase.client
      .from('messages')
      .insert([{ ...message, is_read: false }]);
    if (error) throw error;
  }

  async getMessages(): Promise<Message[]> {
    const { data, error } = await this.supabase.client
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('messages')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  }

  async deleteMessage(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('messages')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async getInvoicePublicData(invoiceId: string): Promise<{ invoice_number: string; client_name: string; client_email: string; user_id: string } | null> {
    const { data, error } = await this.supabase.client
      .rpc('get_invoice_public_data', { p_invoice_id: invoiceId });
    if (error || !data) return null;
    return data as { invoice_number: string; client_name: string; client_email: string; user_id: string };
  }
}
