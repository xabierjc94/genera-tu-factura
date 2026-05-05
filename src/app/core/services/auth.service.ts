import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Profile } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private supabase: SupabaseService) {}

  async signUp(email: string, password: string, profile: Omit<Profile, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await this.supabase.client
        .from('profiles')
        .update({
          company_name: profile.company_name,
          address: profile.address,
          province: profile.province,
          cif_nif: profile.cif_nif,
          phone: profile.phone,
          email: email
        })
        .eq('id', data.user.id);

      if (profileError) throw profileError;
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) throw error;
  }

  async getProfile(): Promise<Profile | null> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(profile: Partial<Profile>) {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await this.supabase.client
      .from('profiles')
      .update(profile)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async uploadLogo(file: File): Promise<string> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    console.log('Uploading logo to:', filePath);

    const { data: uploadData, error: uploadError } = await this.supabase.client
      .storage
      .from('logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Upload successful:', uploadData);

    const { data: { publicUrl } } = this.supabase.client
      .storage
      .from('logos')
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrl);

    return publicUrl;
  }

  async getUser() {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    return user;
  }

  getSession() {
    return this.supabase.client.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.client.auth.onAuthStateChange(callback);
  }
}
