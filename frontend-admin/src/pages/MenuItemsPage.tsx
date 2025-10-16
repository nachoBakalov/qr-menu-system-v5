import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuItemService, menuService, categoryService } from '../services';
import type { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest } from '../types/api';
import Modal from '../components/Modal';

interface MenuItemsPageState {
  search: string;
  page: number;
  limit: number;
  selectedMenu?: number;
  selectedCategory?: number;
}

const MenuItemsPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<MenuItemsPageState>({
    search: '',
    page: 1,
    limit: 20, // More items per page since they are smaller
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItem | null>(null);

  // Fetch menu items
  const { 
    data: menuItemsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['menu-items', state],
    queryFn: () => {
      console.log('🍽️ MenuItems Query Debug:', state);
      // Load all menu items and filter client-side (same approach as categories)
      return menuItemService.getMenuItems(state.page, state.limit);
    },
  });

  // Fetch menus for filter dropdown  
  const { data: menusData } = useQuery({
    queryKey: ['menus'],
    queryFn: () => menuService.getMenus({ limit: 100 }),
  });

  // Fetch categories for filter dropdown (load all)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(1, 100),
  });

  // Extract and process data
  let menuItems: MenuItem[] = [];
  let menus: any[] = [];
  let allCategories: any[] = [];

  // Process menu items data
  if (menuItemsData?.data) {
    const responseData = menuItemsData.data as any;
    let allMenuItems: MenuItem[] = [];
    
    if (Array.isArray(responseData)) {
      allMenuItems = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      allMenuItems = responseData.data;
    }
    
    // Apply client-side filtering
    menuItems = allMenuItems;
    
    // Filter by menu
    if (state.selectedMenu) {
      menuItems = menuItems.filter((item: MenuItem) => item.menuId === state.selectedMenu);
    }
    
    // Filter by category  
    if (state.selectedCategory) {
      menuItems = menuItems.filter((item: MenuItem) => item.categoryId === state.selectedCategory);
    }
    
    // Filter by search term
    if (state.search) {
      const searchTerm = state.search.toLowerCase();
      menuItems = menuItems.filter((item: MenuItem) => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
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

  // Process categories data
  if (categoriesData?.data) {
    const responseData = categoriesData.data as any;
    if (Array.isArray(responseData)) {
      allCategories = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      allCategories = responseData.data;
    }
  }

  // Filter categories by selected menu
  const filteredCategories = state.selectedMenu 
    ? allCategories.filter((cat: any) => cat.menuId === state.selectedMenu)
    : allCategories;

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: (data: CreateMenuItemRequest) => menuItemService.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'menu-items' });
      setIsCreateModalOpen(false);
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMenuItemRequest }) => 
      menuItemService.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'menu-items' });
      setEditingMenuItem(null);
    },
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: number) => menuItemService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'menu-items' });
      setDeletingMenuItem(null);
    },
  });

  // Toggle available status mutation
  const toggleAvailableMutation = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      menuItemService.updateMenuItem(id, { available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'menu-items' });
    },
  });

  const handleSearch = (value: string) => {
    setState(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleMenuFilter = (menuId: number | undefined) => {
    setState(prev => ({ 
      ...prev, 
      selectedMenu: menuId, 
      selectedCategory: undefined, // Reset category when menu changes
      page: 1 
    }));
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setState(prev => ({ ...prev, selectedCategory: categoryId, page: 1 }));
  };

  const handleCreateMenuItem = async (data: CreateMenuItemRequest | UpdateMenuItemRequest) => {
    await createMenuItemMutation.mutateAsync(data as CreateMenuItemRequest);
  };

  const handleUpdateMenuItem = async (data: CreateMenuItemRequest | UpdateMenuItemRequest) => {
    if (editingMenuItem) {
      await updateMenuItemMutation.mutateAsync({ id: editingMenuItem.id, data: data as UpdateMenuItemRequest });
    }
  };

  const handleDeleteMenuItem = async () => {
    if (deletingMenuItem) {
      await deleteMenuItemMutation.mutateAsync(deletingMenuItem.id);
    }
  };

  const handleToggleAvailable = (item: MenuItem) => {
    toggleAvailableMutation.mutate({ 
      id: item.id, 
      available: !item.available 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Removed unused formatPrice function

  if (error) {
    return (
      <div className="error-message">
        <h3>Възникна грешка при зареждането на продуктите</h3>
        <p>{error instanceof Error ? error.message : 'Неизвестна грешка'}</p>
      </div>
    );
  }

  return (
    <div className="menu-items-page">
      <div className="page-header">
        <h1>Продукти в менютата</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn--primary"
        >
          + Нов продукт
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Търсене по име, описание, тагове..."
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
          <select
            value={state.selectedCategory || ''}
            onChange={(e) => handleCategoryFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="filter-select"
            disabled={!state.selectedMenu}
          >
            <option value="">Всички категории</option>
            {filteredCategories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="results-count">
            {menuItems.length} продукта
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Зареждане на продуктите...</p>
        </div>
      )}

      {/* Menu Items Table */}
      {!isLoading && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Продукт</th>
                <th>Категория</th>
                <th>Цени</th>
                <th>Тегло</th>
                <th>Статус</th>
                <th>Наличност</th>
                <th>Пореден №</th>
                <th>Създаден</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {!menuItems || menuItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-data">
                    {state.search || state.selectedMenu || state.selectedCategory
                      ? 'Няма продукти, отговарящи на критериите'
                      : 'Все още няма създадени продукти'
                    }
                  </td>
                </tr>
              ) : (
                menuItems.map((item: MenuItem) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-product">
                        <div className="product-name">{item.name}</div>
                        {item.description && (
                          <div className="product-description">{item.description}</div>
                        )}
                        {item.tags.length > 0 && (
                          <div className="product-tags">
                            {item.tags.map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        {item.allergens.length > 0 && (
                          <div className="product-allergens">
                            <small>⚠️ {item.allergens.join(', ')}</small>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-category">
                        <div className="category-name">{item.category?.name}</div>
                      </div>
                    </td>
                    <td>
                      <div className="table-prices">
                        <div className="price-bgn">{Number(item.priceBGN).toFixed(2)} лв</div>
                        <div className="price-eur">{Number(item.priceEUR).toFixed(2)} €</div>
                      </div>
                    </td>
                    <td>
                      <div className="table-weight">
                        {item.weight ? `${item.weight}${item.weightUnit === 'g' ? 'гр' : item.weightUnit === 'ml' ? 'мл' : item.weightUnit}` : '-'}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleAvailable(item)}
                        className={`toggle-btn ${item.available ? 'toggle--on' : 'toggle--off'}`}
                        disabled={toggleAvailableMutation.isPending}
                      >
                        {item.available ? 'Наличен' : 'Не е наличен'}
                      </button>
                    </td>
                    <td>
                      <span className="status-badge status--info">
                        В наличност
                      </span>
                    </td>
                    <td>
                      <span className="order-badge">{item.order}</span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => setEditingMenuItem(item)}
                          className="btn btn--sm btn--secondary"
                          title="Редактиране"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeletingMenuItem(item)}
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

      {/* Create MenuItem Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Създаване на нов продукт"
        size="lg"
      >
        <MenuItemForm
          onSubmit={handleCreateMenuItem}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMenuItemMutation.isPending}
          menus={menus}
          categories={allCategories}
        />
      </Modal>

      {/* Edit MenuItem Modal */}
      <Modal
        isOpen={!!editingMenuItem}
        onClose={() => setEditingMenuItem(null)}
        title="Редактиране на продукт"
        size="lg"
      >
        {editingMenuItem && (
          <MenuItemForm
            menuItem={editingMenuItem}
            onSubmit={handleUpdateMenuItem}
            onCancel={() => setEditingMenuItem(null)}
            isLoading={updateMenuItemMutation.isPending}
            menus={menus}
            categories={allCategories}
          />
        )}
      </Modal>

      {/* Delete MenuItem Modal */}
      <Modal
        isOpen={!!deletingMenuItem}
        onClose={() => setDeletingMenuItem(null)}
        title="Потвърждение за изтриване"
        size="sm"
      >
        {deletingMenuItem && (
          <div className="delete-confirmation">
            <p>
              Сигурни ли сте, че искате да изтриете продукта <strong>"{deletingMenuItem.name}"</strong>?
            </p>
            <p className="warning-text">
              ⚠️ Това действие е необратимо!
            </p>
            <div className="flex flex--end" style={{ gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setDeletingMenuItem(null)}
                className="btn btn--secondary"
                disabled={deleteMenuItemMutation.isPending}
              >
                Отказ
              </button>
              <button
                onClick={handleDeleteMenuItem}
                className="btn btn--danger"
                disabled={deleteMenuItemMutation.isPending}
              >
                {deleteMenuItemMutation.isPending && <span className="spinner" style={{ marginRight: '8px' }}></span>}
                Изтриване
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// MenuItemForm component - comprehensive form for menu items
interface MenuItemFormProps {
  menuItem?: MenuItem | null;
  onSubmit: (data: CreateMenuItemRequest | UpdateMenuItemRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  menus: any[];
  categories: any[];
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ 
  menuItem, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  menus,
  categories 
}) => {
  const [formData, setFormData] = useState({
    name: menuItem?.name || '',
    description: menuItem?.description || '',
    priceBGN: menuItem?.priceBGN || 0,
    priceEUR: menuItem?.priceEUR || 0,
    weight: menuItem?.weight || 0,
    weightUnit: menuItem?.weightUnit || 'g',
    menuId: menuItem?.menuId || 0,
    categoryId: menuItem?.categoryId || 0,
    tags: menuItem?.tags.join(', ') || '',
    allergens: menuItem?.allergens.join(', ') || '',
    order: menuItem?.order || 0,
    available: menuItem?.available ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter categories by selected menu
  const filteredCategories = formData.menuId 
    ? categories.filter((cat: any) => cat.menuId === formData.menuId)
    : [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Името на продукта е задължително';
    }

    if (!formData.menuId || formData.menuId === 0) {
      newErrors.menuId = 'Моля изберете меню';
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      newErrors.categoryId = 'Моля изберете категория';
    }

    if (formData.priceBGN <= 0) {
      newErrors.priceBGN = 'Цената в лв трябва да е положителна';
    }

    if (formData.priceEUR <= 0) {
      newErrors.priceEUR = 'Цената в € трябва да е положителна';
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

    const submitData: CreateMenuItemRequest | UpdateMenuItemRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      priceBGN: formData.priceBGN,
      priceEUR: formData.priceEUR,
      weight: formData.weight > 0 ? formData.weight : undefined,
      weightUnit: formData.weight > 0 ? formData.weightUnit : undefined,
      menuId: formData.menuId,
      categoryId: formData.categoryId,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      allergens: formData.allergens ? formData.allergens.split(',').map(allergen => allergen.trim()).filter(Boolean) : [],
      order: formData.order,
    };

    // Add available field for updates
    if (menuItem) {
      (submitData as UpdateMenuItemRequest).available = formData.available;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="menu-item-form">
      <div className="form-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem' 
      }}>
        {/* Product Name */}
        <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="name" className="form-label">
            Име на продукта *
          </label>
          <input
            id="name"
            type="text"
            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
            placeholder="Например: Пица Маргарита, Греческа салата..."
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          {errors.name && (
            <div className="form-error">{errors.name}</div>
          )}
        </div>

        {/* Menu Selection */}
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="menuId" className="form-label">
            Меню *
          </label>
          <select
            id="menuId"
            className={`form-input ${errors.menuId ? 'form-input--error' : ''}`}
            value={formData.menuId}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              menuId: Number(e.target.value),
              categoryId: 0 // Reset category when menu changes
            }))}
            required
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
        </div>

        {/* Category Selection */}
        <div className="form-group">
          <label htmlFor="categoryId" className="form-label">
            Категория *
          </label>
          <select
            id="categoryId"
            className={`form-input ${errors.categoryId ? 'form-input--error' : ''}`}
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
            required
            disabled={!formData.menuId}
          >
            <option value={0}>Изберете категория</option>
            {filteredCategories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <div className="form-error">{errors.categoryId}</div>
          )}
        </div>

        {/* Description */}
        <div className="form-group span-2">
          <label htmlFor="description" className="form-label">
            Описание
          </label>
          <textarea
            id="description"
            className="form-input"
            placeholder="Подробно описание на продукта, съставки..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Prices */}
        <div className="form-group">
          <label htmlFor="priceBGN" className="form-label">
            Цена в лв *
          </label>
          <input
            id="priceBGN"
            type="number"
            step="0.01"
            min="0"
            className={`form-input ${errors.priceBGN ? 'form-input--error' : ''}`}
            placeholder="0.00"
            value={formData.priceBGN}
            onChange={(e) => setFormData(prev => ({ ...prev, priceBGN: Number(e.target.value) }))}
            required
          />
          {errors.priceBGN && (
            <div className="form-error">{errors.priceBGN}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="priceEUR" className="form-label">
            Цена в € *
          </label>
          <input
            id="priceEUR"
            type="number"
            step="0.01"
            min="0"
            className={`form-input ${errors.priceEUR ? 'form-input--error' : ''}`}
            placeholder="0.00"
            value={formData.priceEUR}
            onChange={(e) => setFormData(prev => ({ ...prev, priceEUR: Number(e.target.value) }))}
            required
          />
          {errors.priceEUR && (
            <div className="form-error">{errors.priceEUR}</div>
          )}
        </div>

        {/* Weight */}
        <div className="form-group">
          <label htmlFor="weight" className="form-label">
            Тегло
          </label>
          <input
            id="weight"
            type="number"
            min="0"
            className="form-input"
            placeholder="0"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="weightUnit" className="form-label">
            Мерна единица
          </label>
          <select
            id="weightUnit"
            className="form-input"
            value={formData.weightUnit}
            onChange={(e) => setFormData(prev => ({ ...prev, weightUnit: e.target.value }))}
          >
            <option value="g">гр</option>
            <option value="ml">мл</option>
          </select>
        </div>

        {/* Tags */}
        <div className="form-group span-2">
          <label htmlFor="tags" className="form-label">
            Тагове
          </label>
          <input
            id="tags"
            type="text"
            className="form-input"
            placeholder="Вегетариански, Острo, Топло, разделени със запетаи"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          />
          <div className="form-help">
            Разделете таговете със запетаи
          </div>
        </div>

        {/* Allergens */}
        <div className="form-group span-2">
          <label htmlFor="allergens" className="form-label">
            Алергени
          </label>
          <input
            id="allergens"
            type="text"
            className="form-input"
            placeholder="Глутен, Лактоза, Ядки, разделени със запетаи"
            value={formData.allergens}
            onChange={(e) => setFormData(prev => ({ ...prev, allergens: e.target.value }))}
          />
          <div className="form-help">
            Разделете алергените със запетаи
          </div>
        </div>

        {/* Order */}
        <div className="form-group">
          <label htmlFor="order" className="form-label">
            Пореден номер
          </label>
          <input
            id="order"
            type="number"
            min="0"
            className={`form-input ${errors.order ? 'form-input--error' : ''}`}
            placeholder="0"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
          />
          {errors.order && (
            <div className="form-error">{errors.order}</div>
          )}
          <div className="form-help">
            По-малки числа се показват първи в категорията
          </div>
        </div>

        {/* Available Status (only for editing) */}
        {menuItem && (
          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
              />
              <span className="form-checkbox-label">Продуктът е наличен</span>
            </label>
            <div className="form-help">
              Неналичните продукти не се показват в публичното меню
            </div>
          </div>
        )}
      </div>

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
          {menuItem ? 'Обновяване' : 'Създаване'}
        </button>
      </div>
    </form>
  );
};

export default MenuItemsPage;