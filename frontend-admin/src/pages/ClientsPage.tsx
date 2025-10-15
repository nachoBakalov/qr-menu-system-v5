import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services';
import type { Client, CreateClientRequest, UpdateClientRequest } from '../types/api';

// Временен Modal компонент
interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Временна форма за клиенти
interface SimpleClientFormProps {
  client?: Client | null;
  onSubmit: (data: CreateClientRequest | UpdateClientRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SimpleClientForm: React.FC<SimpleClientFormProps> = ({ client, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    slug: client?.slug || '',
    description: client?.description || '',
    address: client?.address || '',
    phone: client?.phone || '',
    slogan: client?.slogan || '',
    active: client?.active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('Моля попълнете задължителните полета');
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Грешка при запазването');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Име на заведението *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Slug (URL) *
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Адрес
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Телефон
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Слоган
        </label>
        <input
          type="text"
          value={formData.slogan}
          onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>
      
      {client && (
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            Активно заведение
          </label>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isLoading}
          style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
        >
          Отказ
        </button>
        <button 
          type="submit"
          disabled={isLoading}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Запазване...' : (client ? 'Обновяване' : 'Създаване')}
        </button>
      </div>
    </form>
  );
};

const ClientsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clientsResponse, isLoading, error } = useQuery({
    queryKey: ['clients', currentPage],
    queryFn: () => clientService.getClients(currentPage, 10),
  });

  // Проверяваме дали данните са в правилния формат
  let data;
  let clients: Client[] = [];
  let pagination = null;
  
  if (clientsResponse?.data) {
    console.log('clientsResponse:', clientsResponse);
    
    // Ако backend връща ClientListResponse структура
    if (clientsResponse.data.data && Array.isArray(clientsResponse.data.data)) {
      data = clientsResponse.data;
      clients = clientsResponse.data.data;
      pagination = clientsResponse.data.pagination;
    } 
    // Ако backend връща директно Client[]
    else if (Array.isArray(clientsResponse.data)) {
      clients = clientsResponse.data;
      data = { data: clients, pagination: { total: clients.length } };
      pagination = { total: clients.length };
    }
    // Ако има data свойство с масив
    else if (clientsResponse.data.data && Array.isArray(clientsResponse.data.data)) {
      clients = clientsResponse.data.data;
      pagination = clientsResponse.data.pagination;
      data = clientsResponse.data;
    }
  }
  
  console.log('processed clients:', clients);
  console.log('pagination:', pagination);

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: (clientData: CreateClientRequest) => clientService.createClient(clientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
    },
  });

  // Update client mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data: updateData }: { id: number; data: UpdateClientRequest }) =>
      clientService.updateClient(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
      setEditingClient(null);
    },
  });

  // Delete client mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };



  const handleDelete = async (client: Client) => {
    if (window.confirm(`Сигурни ли сте, че искате да изтриете клиента "${client.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(client.id);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Възникна грешка при изтриването');
      }
    }
  };

  const handleSubmit = async (formData: CreateClientRequest | UpdateClientRequest) => {
    try {
      if (editingClient) {
        await updateMutation.mutateAsync({
          id: editingClient.id,
          data: formData as UpdateClientRequest,
        });
      } else {
        await createMutation.mutateAsync(formData as CreateClientRequest);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log('filteredClients:', filteredClients);

  if (error) {
    return (
      <div className="alert alert--error">
        Възникна грешка при зареждането на клиентите
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex--between mb-6">
        <div>
          <h1 className="text--3xl text--bold text--gray-900">Клиенти</h1>
          <p className="text--sm text--gray-600 mt-1">
            Управление на ресторанти и заведения ({clients.length} клиента)
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn--primary"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending && <span className="spinner" style={{ marginRight: '8px' }}></span>}
          Добави клиент
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="card__body">
          <div className="form-group mb-0">
            <label htmlFor="search" className="form-label">Търсене</label>
            <input
              id="search"
              type="text"
              className="form-input"
              placeholder="Търси по име или slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="card">
        <div className="card__header">
          <h3 className="text--lg text--semibold">
            Всички клиенти ({pagination?.total || clients.length || 0})
          </h3>
        </div>
        
        <div className="card__body p-0">
          {isLoading ? (
            <div className="flex flex--center p-8">
              <div className="spinner" style={{ width: '2rem', height: '2rem' }}></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text--center p-8 text--gray-500">
              {searchTerm ? 'Няма клиенти, отговарящи на търсенето' : 'Няма добавени клиенти'}
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Име</th>
                    <th>Slug</th>
                    <th>Телефон</th>
                    <th>Статус</th>
                    <th>Меню</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div>
                          <div className="text--semibold">{client.name}</div>
                          {client.description && (
                            <div className="text--sm text--gray-500 mt-1">
                              {client.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <code className="text--sm">{client.slug}</code>
                      </td>
                      <td>{client.phone || '-'}</td>
                      <td>
                        <span className={`badge ${client.active ? 'badge--success' : 'badge--gray'}`}>
                          {client.active ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td>
                        {client.menu ? (
                          <span className="badge badge--info">
                            {client.menu.name}
                          </span>
                        ) : (
                          <span className="text--gray-400">Няма меню</span>
                        )}
                      </td>
                      <td>
                        <div className="flex" style={{ gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(client)}
                            className="btn btn--sm btn--secondary"
                            disabled={updateMutation.isPending}
                            title="Редактирай"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="btn btn--sm btn--danger"
                            disabled={deleteMutation.isPending}
                            title="Изтрий"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages && pagination.totalPages > 1 && (
          <div className="card__footer">
            <div className="flex flex--between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrev}
                className="btn btn--secondary btn--sm"
              >
                Предишна
              </button>
              <span className="text--sm text--gray-600">
                Страница {pagination.page || currentPage} от {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNext}
                className="btn btn--secondary btn--sm"
              >
                Следваща
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <SimpleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        title={editingClient ? 'Редактиране на клиент' : 'Добавяне на нов клиент'}
      >
        <SimpleClientForm
          client={editingClient}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingClient(null);
          }}
        />
      </SimpleModal>
    </div>
  );
};

export default ClientsPage;