import { apiClient } from './api';
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../types/api';

export const menuItemService = {
  // Get all menu items with pagination
  getMenuItems: async (page = 1, limit = 10, menuId?: number, categoryId?: number) => {
    let url = `/menu-items?page=${page}&limit=${limit}`;
    if (menuId) {
      url += `&menuId=${menuId}`;
    }
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    const response = await apiClient.get<MenuItem[]>(url);
    return response.data;
  },

  // Get menu items by menu ID
  getMenuItemsByMenu: async (menuId: number) => {
    const response = await apiClient.get<MenuItem[]>(`/menu-items/menu/${menuId}`);
    return response.data;
  },

  // Get menu items by category ID
  getMenuItemsByCategory: async (categoryId: number) => {
    const response = await apiClient.get<MenuItem[]>(`/menu-items/category/${categoryId}`);
    return response.data;
  },

  // Get menu item by ID
  getMenuItem: async (id: number) => {
    const response = await apiClient.get<MenuItem>(`/menu-items/${id}`);
    return response.data;
  },

  // Create new menu item
  createMenuItem: async (itemData: CreateMenuItemRequest) => {
    const response = await apiClient.post<MenuItem>('/menu-items', itemData);
    return response.data;
  },

  // Update menu item
  updateMenuItem: async (id: number, itemData: UpdateMenuItemRequest) => {
    const response = await apiClient.put<MenuItem>(`/menu-items/${id}`, itemData);
    return response.data;
  },

  // Delete menu item
  deleteMenuItem: async (id: number) => {
    const response = await apiClient.delete(`/menu-items/${id}`);
    return response.data;
  },

  // Reorder menu items
  reorderMenuItems: async (categoryId: number, itemIds: number[]) => {
    const response = await apiClient.put(`/menu-items/reorder/${categoryId}`, { itemIds });
    return response.data;
  },
};