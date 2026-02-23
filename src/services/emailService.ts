/**
 * Email service - send mail and list sent emails (Zepto-backed, saved to DB)
 */

import { api } from '../lib/api';

export interface SendEmailPayload {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  fromName?: string;
}

export interface SentEmailRecord {
  id: number;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  subject: string;
  bodyText: string | null;
  bodyHtml: string | null;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

export interface EmailsListResponse {
  data: SentEmailRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const emailService = {
  send: async (payload: SendEmailPayload): Promise<{ id: number; sent: boolean }> => {
    const res = await api.post<{ id: number; sent: boolean }>('/emails/send', payload);
    return res;
  },

  list: async (params?: { page?: number; limit?: number; status?: string }): Promise<EmailsListResponse> => {
    const res = await api.get<EmailsListResponse>('/emails', { params });
    return res;
  },

  getOne: async (id: number): Promise<SentEmailRecord | null> => {
    try {
      return await api.get<SentEmailRecord>(`/emails/${id}`);
    } catch {
      return null;
    }
  },
};
