import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, menuService } from '../services';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/api';
import Modal from '../components/Modal';

interface CategoriesPageState {
  search: string;
  page: number;
  limit: number;
  selectedMenu?: number;
}

const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<CategoriesPageState>({
    search: '',
    page: 1,
    limit: 10,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Fetch categories
  const { 
    data: categoriesData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['categories', state],
    queryFn: () => {
      console.log('🔍 Categories Query Debug:', {
        page: state.page,
        limit: state.limit,
        selectedMenu: state.selectedMenu,
        state
      });
      // Temporarily load all categories and filter client-side due to backend filtering issue
      return categoryService.getCategories(state.page, state.limit); // Remove menuId parameter
    },
  });

  // Fetch menus for filter dropdown  
  const { data: menusData } = useQuery({
    queryKey: ['menus'],
    queryFn: () => menuService.getMenus({ limit: 100 }),
  });

  // Extract data from API responses and handle different response structures
  let categories: Category[] = [];
  let menus: any[] = [];

  // Process categories data
  if (categoriesData?.data) {
    const responseData = categoriesData.data as any;
    let allCategories: Category[] = [];
    
    if (Array.isArray(responseData)) {
      allCategories = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      allCategories = responseData.data;
    }
    
    // Apply client-side filtering since backend filtering has issues
    categories = allCategories;
    
    // Filter by menu
    if (state.selectedMenu) {
      categories = categories.filter((cat: Category) => cat.menuId === state.selectedMenu);
    }
    
    // Filter by search term
    if (state.search) {
      const searchTerm = state.search.toLowerCase();
      categories = categories.filter((cat: Category) => 
        cat.name.toLowerCase().includes(searchTerm) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm))
      );
    }
    
    console.log('🔍 Client-side filtering:', {
      selectedMenu: state.selectedMenu,
      searchTerm: state.search,
      allCategories: allCategories.length,
      filteredCategories: categories.length,
      sampleCategory: allCategories[0]
    });
  }

  // Process menus data  
  if (menusData?.data) {
    const responseData = menusData.data as any;
    if (Array.isArray(responseData)) {
      menus = responseData;
    } else if (responseData.menus && Array.isArray(responseData.menus)) {
      menus = responseData.menus;
    } else if (Array.isArray(responseData.data)) {
      menus = responseData.data;
    }
  }

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'categories' });
      setIsCreateModalOpen(false);
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) => 
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'categories' });
      setEditingCategory(null);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'categories' });
      setDeletingCategory(null);
    },
  });

  const handleSearch = (value: string) => {
    setState(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleMenuFilter = (menuId: number | undefined) => {
    setState(prev => ({ ...prev, selectedMenu: menuId, page: 1 }));
  };

  // Pagination not implemented yet, but keeping for future use
  // const handlePageChange = (page: number) => {
  //   setState(prev => ({ ...prev, page }));
  // };

  const handleCreateCategory = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    await createCategoryMutation.mutateAsync(data as CreateCategoryRequest);
  };

  const handleUpdateCategory = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    if (editingCategory) {
      await updateCategoryMutation.mutateAsync({ id: editingCategory.id, data: data as UpdateCategoryRequest });
    }
  };

  const handleDeleteCategory = async () => {
    if (deletingCategory) {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="error-message">
        <h3>Възникна грешка при зареждането на категориите</h3>
        <p>{error instanceof Error ? error.message : 'Неизвестна грешка'}</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Категории</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn--primary"
        >
          + Нова категория
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Търсене по име..."
            value={state.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={state.selectedMenu || ''}
            onChange={(e) => handleMenuFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="filter-select"
          >
            <option value="">Всички менюта</option>
            {menus.map((menu: any) => (
              <option key={menu.id} value={menu.id}>
                {menu.name} ({menu.client?.name})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="results-count">
            {categories.length} категории
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Зареждане на категориите...</p>
        </div>
      )}

      {/* Categories Table */}
      {!isLoading && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Име</th>
                <th>Меню</th>
                <th>Описание</th>
                <th>Пореден №</th>
                <th>Статус</th>
                <th>Продукти</th>
                <th>Създадено</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {!categories || categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    {state.search || state.selectedMenu 
                      ? 'Няма категории, отговарящи на критериите'
                      : 'Все още няма създадени категории'
                    }
                  </td>
                </tr>
              ) : (
                categories.map((category: Category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="table-primary">{category.name}</div>
                    </td>
                    <td>
                      <div className="table-menu">
                        <div className="menu-name">{category.menu?.name}</div>
                        {category.menu?.client && (
                          <div className="client-name">({category.menu.client.name})</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-description">
                        {category.description || <span className="text-muted">Няма описание</span>}
                      </div>
                    </td>
                    <td>
                      <span className="order-badge">{category.order}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${category.active ? 'status--success' : 'status--danger'}`}>
                        {category.active ? 'Активна' : 'Неактивна'}
                      </span>
                    </td>
                    <td>
                      <span className="count-badge">
                        {category._count?.items || 0}
                      </span>
                    </td>
                    <td>{formatDate(category.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="btn btn--sm btn--secondary"
                          title="Редактиране"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeletingCategory(category)}
                          className="btn btn--sm btn--danger"
                          title="Изтриване"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Създаване на нова категория"
        size="md"
      >
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createCategoryMutation.isPending}
          menus={menus}
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Редактиране на категория"
        size="md"
      >
        {editingCategory && (
          <CategoryForm
            category={editingCategory}
            onSubmit={handleUpdateCategory}
            onCancel={() => setEditingCategory(null)}
            isLoading={updateCategoryMutation.isPending}
            menus={menus}
          />
        )}
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Потвърждение за изтриване"
        size="sm"
      >
        {deletingCategory && (
          <div className="delete-confirmation">
            <p>
              Сигурни ли сте, че искате да изтриете категорията <strong>"{deletingCategory.name}"</strong>?
            </p>
            <p className="warning-text">
              ⚠️ Това действие е необратимо и ще изтрие всички продукти в категорията!
            </p>
            <div className="flex flex--end" style={{ gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setDeletingCategory(null)}
                className="btn btn--secondary"
                disabled={deleteCategoryMutation.isPending}
              >
                Отказ
              </button>
              <button
                onClick={handleDeleteCategory}
                className="btn btn--danger"
                disabled={deleteCategoryMutation.isPending}
              >
                {deleteCategoryMutation.isPending && <span className="spinner" style={{ marginRight: '8px' }}></span>}
                Изтриване
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Simple CategoryForm component for now
interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  menus: any[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  category, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  menus 
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    menuId: category?.menuId || 0,
    order: category?.order || 0,
    active: category?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Името на категорията е задължително';
    }

    if (!formData.menuId || formData.menuId === 0) {
      newErrors.menuId = 'Моля изберете меню';
    }

    if (formData.order < 0) {
      newErrors.order = 'Пореден номер трябва да е положително число';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreateCategoryRequest | UpdateCategoryRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      menuId: formData.menuId,
      order: formData.order,
    };

    // Add active field for updates
    if (category) {
      (submitData as UpdateCategoryRequest).active = formData.active;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Category Name */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Име на категорията *
        </label>
        <input
          id="name"
          type="text"
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          placeholder="Например: Основни ястия, Десерти, Напитки..."
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        {errors.name && (
          <div className="form-error">{errors.name}</div>
        )}
      </div>

      {/* Menu Selection */}
      <div className="form-group">
        <label htmlFor="menuId" className="form-label">
          Меню *
        </label>
        <select
          id="menuId"
          className={`form-input ${errors.menuId ? 'form-input--error' : ''}`}
          value={formData.menuId}
          onChange={(e) => setFormData(prev => ({ ...prev, menuId: Number(e.target.value) }))}
          required
          disabled={!!category} // Can't change menu after creation
        >
          <option value={0}>Изберете меню</option>
          {menus.map((menu: any) => (
            <option key={menu.id} value={menu.id}>
              {menu.name} ({menu.client?.name})
            </option>
          ))}
        </select>
        {errors.menuId && (
          <div className="form-error">{errors.menuId}</div>
        )}
        {category && (
          <div className="form-help">
            Менюто не може да се променя след създаването на категорията
          </div>
        )}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Описание
        </label>
        <textarea
          id="description"
          className="form-input"
          placeholder="Кратко описание на категорията..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      {/* Order */}
      <div className="form-group">
        <label htmlFor="order" className="form-label">
          Пореден номер
        </label>
        <input
          id="order"
          type="number"
          className={`form-input ${errors.order ? 'form-input--error' : ''}`}
          placeholder="0"
          value={formData.order}
          onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
          min={0}
        />
        {errors.order && (
          <div className="form-error">{errors.order}</div>
        )}
        <div className="form-help">
          По-малки числа се показват първи в менюто
        </div>
      </div>

      {/* Active Status (only for editing) */}
      {category && (
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            <span className="form-checkbox-label">Активна категория</span>
          </label>
          <div className="form-help">
            Неактивните категории не се показват в публичното меню
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn--secondary"
          disabled={isLoading}
        >
          Отказ
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading}
        >
          {isLoading && <span className="spinner" style={{ marginRight: '8px' }}></span>}
          {category ? 'Обновяване' : 'Създаване'}
        </button>
      </div>
    </form>
  );
};

export default CategoriesPage;