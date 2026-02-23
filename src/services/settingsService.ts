/**
 * Settings Service
 * Admin management of system settings
 */

import { api } from '../lib/api';

export interface SystemSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  settingType: 'string' | 'number' | 'boolean' | 'json';
  description: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
  createdAt: string;
}

export const settingsService = {
  /**
   * Get all system settings
   */
  getSettings: async (): Promise<{ settings: SystemSetting[] }> => {
    const response = await api.get<{ settings: SystemSetting[] }>('/settings');
    return response;
  },

  /**
   * Get a single setting by key
   */
  getSetting: async (key: string): Promise<SystemSetting | null> => {
    try {
      const response = await api.get<SystemSetting>(`/settings/${key}`);
      return response;
    } catch {
      return null;
    }
  },

  /**
   * Update a system setting
   */
  updateSetting: async (
    key: string,
    value: string
  ): Promise<{ success: boolean; setting: SystemSetting }> => {
    const response = await api.put<{ success: boolean; setting: SystemSetting }>(
      `/settings/${key}`,
      { value }
    );
    return response;
  },

  /**
   * Create a new system setting
   */
  createSetting: async (params: {
    key: string;
    value: string;
    type: SystemSetting['settingType'];
    description: string;
  }): Promise<{ success: boolean; setting: SystemSetting }> => {
    const response = await api.post<{ success: boolean; setting: SystemSetting }>(
      '/settings',
      params
    );
    return response;
  },

  /**
   * Delete a system setting
   */
  deleteSetting: async (key: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/settings/${key}`);
    return response;
  },

  /**
   * Get fee settings (platform fee %, etc.)
   */
  getFeeSettings: async (): Promise<{
    platformFeePercentage: number;
    platformFeePercentageKey: string;
  }> => {
    const response = await api.get<{
      platformFeePercentage: number;
      platformFeePercentageKey: string;
    }>('/settings/fees');
    return response;
  },

  /**
   * Update fee settings
   */
  updateFeeSettings: async (body: {
    platformFeePercentage: number;
  }): Promise<{ success: boolean; platformFeePercentage?: number }> => {
    const response = await api.put<{
      success: boolean;
      platformFeePercentage?: number;
      error?: string;
    }>('/settings/fees', body);
    return response;
  },
};
