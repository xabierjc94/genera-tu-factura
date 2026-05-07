export interface Profile {
  id: string;
  company_name: string;
  address: string;
  province: string;
  cif_nif: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  invoice_prefix?: string;
  description_options?: string[];
  created_at?: string;
}
