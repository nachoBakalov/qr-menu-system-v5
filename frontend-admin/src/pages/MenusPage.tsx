import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../services/menu';
import { clientService } from '../services/client';
import type { MenuWithRelations, CreateMenuRequest, UpdateMenuRequest, QRCodeData } from '../types/api';
import Modal from '../components/Modal';
import MenuForm from '../components/MenuForm';

interface MenusPageState {
  search: string;
  page: number;
  limit: number;
  selectedClient?: number;
}

const MenusPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const [state, setState] = useState<MenusPageState>({
    search: '',
    page: 1,
    limit: 10,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuWithRelations | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<MenuWithRelations | null>(null);

  const [qrCodeData, setQRCodeData] = useState<QRCodeData | null>(null);

  // Fetch menus
  const { 
    data: menusData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['menus', state],
    queryFn: () => menuService.getMenus({
      page: state.page,
      limit: state.limit,
      search: state.search || undefined,
      clientId: state.selectedClient,
    }),
  });

  // Fetch clients for filter dropdown
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients({ limit: 100 }),
  });

  // Extract data from API responses and handle different response structures
  let menus: any[] = [];
  let pagination: any = null;
  
  if (menusData?.data) {
    const responseData = menusData.data as any;
    
    // If backend returns { data: Menu[], pagination: {...} }
    if (Array.isArray(responseData.data)) {
      menus = responseData.data;
      pagination = responseData.pagination;
    }
    // If backend returns { data: { menus: Menu[], pagination: {...} } }
    else if (responseData.menus && Array.isArray(responseData.menus)) {
      menus = responseData.menus;
      pagination = responseData.pagination;
    }
    // If backend returns { data: Menu[] } (current case)
    else if (Array.isArray(responseData)) {
      menus = responseData;
      pagination = (menusData as any).pagination || { currentPage: 1, totalPages: 1, totalCount: menus.length };
    }
  }
  
  // Debug logging
  console.log('🍽️ MenusPage Debug:', {
    menusData,
    processedMenus: menus,
    menuCount: menus.length,
    pagination,
  });
  
  // Process clients data similar to ClientsPage
  let clients: any[] = [];
  if (clientsData?.data) {
    if (clientsData.data.data && Array.isArray(clientsData.data.data)) {
      clients = clientsData.data.data;
    } else if (Array.isArray(clientsData.data)) {
      clients = clientsData.data;
    }
  }

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: (data: CreateMenuRequest) => menuService.createMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'menus' }); // Invalidate all menus queries
      setIsCreateModalOpen(false);
    },
  });

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMenuRequest }) => 
      menuService.updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'menus' }); // Invalidate all menus queries
      setEditingMenu(null);
    },
  });

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: (id: number) => menuService.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'menus' }); // Invalidate all menus queries
      setDeletingMenu(null);
    },
  });

  // Toggle published status mutation
  const togglePublishedMutation = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      menuService.updateMenu(id, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'menus' }); // Invalidate all menus queries
    },
  });

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: (clientId: number) => menuService.generateQRCode(clientId),
    onSuccess: (data: QRCodeData) => {
      setQRCodeData(data);
    },
  });

  const handleSearch = (value: string) => {
    setState(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleClientFilter = (clientId: number | undefined) => {
    setState(prev => ({ ...prev, selectedClient: clientId, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, page }));
  };

  const handleCreateMenu = async (data: CreateMenuRequest | UpdateMenuRequest) => {
    await createMenuMutation.mutateAsync(data as CreateMenuRequest);
  };

  const handleUpdateMenu = async (data: CreateMenuRequest | UpdateMenuRequest) => {
    if (editingMenu) {
      await updateMenuMutation.mutateAsync({ id: editingMenu.id, data: data as UpdateMenuRequest });
    }
  };

  const handleDeleteMenu = async () => {
    if (deletingMenu) {
      await deleteMenuMutation.mutateAsync(deletingMenu.id);
    }
  };

  const handleTogglePublished = (menu: MenuWithRelations) => {
    togglePublishedMutation.mutate({ 
      id: menu.id, 
      published: !menu.published 
    });
  };

  const handleGenerateQR = (menu: MenuWithRelations) => {
    generateQRMutation.mutate(menu.clientId);
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
        Грешка при зареждането на менютата: {error.message}
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Менюта</h1>
          <p className="page-description">
            Управление на менюта за всички заведения
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn--primary"
        >
          Ново меню
        </button>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Търсене по име на меню..."
            value={state.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="filter-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={state.selectedClient || ''}
            onChange={(e) => handleClientFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="filter-select"
          >
            <option value="">Всички заведения</option>
            {clients.map((client: any) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={state.limit}
            onChange={(e) => setState(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
            className="filter-select"
          >
            <option value={10}>10 на страница</option>
            <option value={25}>25 на страница</option>
            <option value={50}>50 на страница</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">Зареждане на менютата...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Име на менюто</th>
                <th>Заведение</th>
                <th>Статус</th>
                <th>Публикувано</th>
                <th>Категории</th>
                <th>Продукти</th>
                <th>Създадено</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {!menus || menus.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    {state.search || state.selectedClient 
                      ? 'Няма менюта, отговарящи на критериите'
                      : 'Все още няма създадени менюта'
                    }
                  </td>
                </tr>
              ) : (
                menus.map((menu: any) => (
                  <tr key={menu.id}>
                    <td>
                      <div className="table-primary">{menu.name}</div>
                    </td>
                    <td>
                      <div className="table-client">
                        <div className="client-name">{menu.client.name}</div>
                        <div className="client-slug">/{menu.client.slug}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${menu.active ? 'status--success' : 'status--danger'}`}>
                        {menu.active ? 'Активно' : 'Неактивно'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublished(menu)}
                        className={`toggle-btn ${menu.published ? 'toggle--on' : 'toggle--off'}`}
                        disabled={togglePublishedMutation.isPending}
                      >
                        {menu.published ? 'Публикувано' : 'Чернова'}
                      </button>
                    </td>
                    <td>
                      <span className="count-badge">
                        {menu._count?.categories || 0}
                      </span>
                    </td>
                    <td>
                      <span className="count-badge">
                        {menu._count?.items || 0}
                      </span>
                    </td>
                    <td>{formatDate(menu.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleGenerateQR(menu)}
                          className="btn btn--sm btn--info"
                          disabled={generateQRMutation.isPending}
                          title="Генериране на QR код"
                        >
                          QR
                        </button>
                        <button
                          onClick={() => setEditingMenu(menu)}
                          className="btn btn--sm btn--secondary"
                          title="Редактиране"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeletingMenu(menu)}
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
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(state.page - 1)}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            ← Предишна
          </button>
          
          <div className="pagination-info">
            Страница {state.page} от {pagination.totalPages}
            ({pagination.totalCount || pagination.total} общо)
          </div>
          
          <button
            onClick={() => handlePageChange(state.page + 1)}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Следваща →
          </button>
        </div>
      )}

      {/* Create Menu Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Създаване на ново меню"
        size="md"
      >
        <MenuForm
          onSubmit={handleCreateMenu}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMenuMutation.isPending}
        />
      </Modal>

      {/* Edit Menu Modal */}
      <Modal
        isOpen={!!editingMenu}
        onClose={() => setEditingMenu(null)}
        title="Редактиране на меню"
        size="md"
      >
        {editingMenu && (
          <MenuForm
            menu={editingMenu}
            onSubmit={handleUpdateMenu}
            onCancel={() => setEditingMenu(null)}
            isLoading={updateMenuMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingMenu}
        onClose={() => setDeletingMenu(null)}
        title="Потвърждение за изтриване"
        size="sm"
      >
        {deletingMenu && (
          <div>
            <p>
              Сигурни ли сте, че искате да изтриете менюто <strong>{deletingMenu.name}</strong>?
            </p>
            <p className="warning-text">
              ⚠️ Това действие ще изтрие и всички категории и продукти в менюто!
            </p>
            <div className="flex flex--end" style={{ gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setDeletingMenu(null)}
                className="btn btn--secondary"
                disabled={deleteMenuMutation.isPending}
              >
                Отказ
              </button>
              <button
                onClick={handleDeleteMenu}
                className="btn btn--danger"
                disabled={deleteMenuMutation.isPending}
              >
                {deleteMenuMutation.isPending && <span className="spinner" style={{ marginRight: '8px' }}></span>}
                Изтриване
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Code Display Modal */}
      <Modal
        isOpen={!!qrCodeData}
        onClose={() => setQRCodeData(null)}
        title="QR Код на менюто"
        size="md"
      >
        {qrCodeData && (
          <div className="qr-display">
            <div className="qr-image">
              <img 
                src={qrCodeData.qrCodeUrl} 
                alt="QR Code" 
                style={{ width: '200px', height: '200px' }}
              />
            </div>
            <div className="qr-info">
              <p><strong>Заведение:</strong> {qrCodeData.client.name}</p>
              <p><strong>URL на менюто:</strong></p>
              <a href={qrCodeData.menuUrl} target="_blank" rel="noopener noreferrer">
                {qrCodeData.menuUrl}
              </a>
            </div>
            <div className="flex flex--center" style={{ marginTop: '2rem' }}>
              <button
                onClick={() => setQRCodeData(null)}
                className="btn btn--primary"
              >
                Затваряне
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MenusPage;