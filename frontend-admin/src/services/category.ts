import { apiClient } from './api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/api';

export const categoryService = {
  // Get all categories with pagination
  getCategories: async (page = 1, limit = 10, menuId?: number) => {
    let url = `/categories?page=${page}&limit=${limit}`;
    if (menuId) {
      url += `&menuId=${menuId}`;
    }
    console.log('🍽️ CategoryService Debug:', {
      page,
      limit,
      menuId,
      finalUrl: url
    });
    const response = await apiClient.get<Category[]>(url);
    return response.data;
  },

  // Get categories by menu ID (admin)
  getCategoriesByMenu: async (menuId: number) => {
    const response = await apiClient.get<Category[]>(`/categories?menuId=${menuId}`);
    return response.data;
  },

  // Get category by ID
  getCategory: async (id: number) => {
    const response = await apiClient.get<Category>(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  createCategory: async (categoryData: CreateCategoryRequest) => {
    const response = await apiClient.post<Category>('/categories', categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (id: number, categoryData: UpdateCategoryRequest) => {
    const response = await apiClient.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: number) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  // Reorder categories
  reorderCategories: async (menuId: number, categoryIds: number[]) => {
    const response = await apiClient.put(`/categories/reorder/${menuId}`, { categoryIds });
    return response.data;
  },
};