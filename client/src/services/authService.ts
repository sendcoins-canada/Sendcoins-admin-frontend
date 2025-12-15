import { delay } from '../lib/api';

export interface LoginCredentials {
  email: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    await delay(1000); // Simulate API latency
    
    // Mock response
    return {
      id: '1',
      name: 'Demo User',
      email: credentials.email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    };
  },
  
  logout: async (): Promise<void> => {
    await delay(500);
  }
};
