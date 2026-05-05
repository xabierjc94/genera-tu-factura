import { Client } from './client.model';

export interface Invoice {
  id?: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  issue_date?: string;
  due_date?: string;
  subtotal?: number;
  tax_rate?: number;
  tax_amount?: number;
  total?: number;
  status?: 'draft' | 'issued' | 'paid' | 'cancelled';
  created_at?: string;
  client?: Client;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}
