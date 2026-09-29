import { APIResponse } from '@playwright/test';
import { BaseApi } from '../base-api';

export interface CreateInvoiceRequest {
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_postal_code: string;
  payment_method: string;
  payment_details: Record<string, string>;
  cart_id: string;
}

export interface InvoiceResponse {
  id: string;
  invoice_number: string;
  invoice_date: string;
  user_id: string;
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_postal_code: string;
  total: number;
}

export class InvoicesApi extends BaseApi {
  async createInvoice(invoice: CreateInvoiceRequest): Promise<APIResponse> {
    return this.request.post('/invoices', { data: invoice });
  }

  async getInvoice(invoiceId: string): Promise<APIResponse> {
    return this.request.get(`/invoices/${invoiceId}`);
  }
}
