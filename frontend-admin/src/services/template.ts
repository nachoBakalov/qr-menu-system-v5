import { apiClient } from './api';
import type { Template } from '../types/api';

interface GetTemplatesParams {
  page?: number;
  limit?: number;
  active?: boolean;
}

interface TemplateListResponse {
  data: Template[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const templateService = {
  // Get all templates with pagination and filters
  getTemplates: async (params: GetTemplatesParams = {}) => {
    const { page = 1, limit = 100, active = true } = params;
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (active !== undefined) searchParams.append('active', active.toString());
    
    const response = await apiClient.get<TemplateListResponse>(`/templates?${searchParams.toString()}`);
    return response.data;
  },

  // Get template by ID
  getTemplate: async (id: number) => {
    const response = await apiClient.get<Template>(`/templates/${id}`);
    return response.data;
  },
};