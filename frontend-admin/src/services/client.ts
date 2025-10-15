import { apiClient } from './api';
import type { Client, CreateClientRequest, UpdateClientRequest, ClientListResponse } from '../types/api';

interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const clientService = {
  // Get all clients with pagination
  getClients: async (params: GetClientsParams | number = 1, limit = 10) => {
    if (typeof params === 'number') {
      // Backward compatibility
      const response = await apiClient.get<ClientListResponse>(`/clients?page=${params}&limit=${limit}`);
      return response.data;
    }
    
    const { page = 1, limit: paramLimit = 10, search } = params;
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: paramLimit.toString(),
    });
    
    if (search) searchParams.append('search', search);
    
    const response = await apiClient.get<ClientListResponse>(`/clients?${searchParams.toString()}`);
    return response.data;
  },

  // Get client by ID
  getClient: async (id: number) => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  // Create new client
  createClient: async (clientData: CreateClientRequest) => {
    const response = await apiClient.post<Client>('/clients', clientData);
    return response.data;
  },

  // Update client
  updateClient: async (id: number, clientData: UpdateClientRequest) => {
    const response = await apiClient.put<Client>(`/clients/${id}`, clientData);
    return response.data;
  },

  // Delete client
  deleteClient: async (id: number) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },
};