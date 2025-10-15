import { apiClient } from './api';
import type { Menu, CreateMenuRequest, UpdateMenuRequest, QRCodeData, MenuListResponse } from '../types/api';

interface GetMenusParams {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: number;
}

export const menuService = {
  // Get all menus with pagination and filters
  getMenus: async (params: GetMenusParams = {}) => {
    const { page = 1, limit = 10, search, clientId } = params;
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) searchParams.append('search', search);
    if (clientId) searchParams.append('clientId', clientId.toString());
    
    const response = await apiClient.get<MenuListResponse>(`/menus?${searchParams.toString()}`);
    return response.data;
  },

  // Get menu by ID
  getMenu: async (id: number) => {
    const response = await apiClient.get<Menu>(`/menus/${id}`);
    return response.data;
  },

  // Create new menu
  createMenu: async (menuData: CreateMenuRequest) => {
    const response = await apiClient.post<Menu>('/menus', menuData);
    return response.data;
  },

  // Update menu
  updateMenu: async (id: number, menuData: UpdateMenuRequest) => {
    const response = await apiClient.put<Menu>(`/menus/${id}`, menuData);
    return response.data;
  },

  // Delete menu
  deleteMenu: async (id: number) => {
    const response = await apiClient.delete(`/menus/${id}`);
    return response.data;
  },

  // Generate QR code for client
  generateQRCode: async (clientId: number): Promise<QRCodeData> => {
    const response = await apiClient.post<QRCodeData>(`/public/qr-code/${clientId}/generate`);
    if (!response.data.data) {
      throw new Error('No QR code data received');
    }
    return response.data.data;
  },

  // Get QR code by client slug (public)
  getQRCode: async (clientSlug: string) => {
    const response = await apiClient.get<QRCodeData>(`/public/qr/${clientSlug}`);
    return response.data;
  },
};