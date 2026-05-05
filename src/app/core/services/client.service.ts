import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Client } from '../../shared/models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private supabase: SupabaseService) {}

  async getClients(): Promise<Client[]> {
    const { data, error } = await this.supabase.client
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getClient(id: string): Promise<Client | null> {
    const { data, error } = await this.supabase.client
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
    const { data, error } = await this.supabase.client
      .from('clients')
      .insert([client])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateClient(id: string, client: Partial<Client>): Promise<Client> {
    const { data, error } = await this.supabase.client
      .from('clients')
      .update(client)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteClient(id: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
