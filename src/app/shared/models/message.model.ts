export interface Message {
  id?: string;
  invoice_id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  content: string;
  is_read: boolean;
  created_at?: string;
}
