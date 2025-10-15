import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientService } from '../services/client';
import type { MenuWithRelations, CreateMenuRequest, UpdateMenuRequest, Client, Template } from '../types/api';

interface MenuFormProps {
  menu?: MenuWithRelations | null;
  onSubmit: (data: CreateMenuRequest | UpdateMenuRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MenuForm: React.FC<MenuFormProps> = ({ 
  menu, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    clientId: 0,
    templateId: undefined as number | undefined,
    active: true,
    published: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch clients for dropdown
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients({ limit: 100 }),
  });

  const clientsResponse = clientsData?.data;

  // For now, we'll use mock templates until we implement the template service
  const mockTemplates: Template[] = [
    {
      id: 1,
      name: 'Класически дизайн',
      description: 'Традиционен дизайн подходящ за всички видове заведения',
      config: {},
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Модерен дизайн',
      description: 'Съвременен минималистичен дизайн',
      config: {},
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name || '',
        clientId: menu.clientId || 0,
        templateId: menu.templateId || undefined,
        active: menu.active,
        published: menu.published,
      });
    }
  }, [menu]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Името на менюто е задължително';
    }

    if (!formData.clientId || formData.clientId === 0) {
      newErrors.clientId = 'Моля изберете заведение';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreateMenuRequest | UpdateMenuRequest = {
      name: formData.name.trim(),
      clientId: formData.clientId,
      templateId: formData.templateId,
    };

    // Add active and published fields for updates
    if (menu) {
      (submitData as UpdateMenuRequest).active = formData.active;
      (submitData as UpdateMenuRequest).published = formData.published;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getSelectedClient = () => {
    return clientsResponse?.find((client: Client) => client.id === formData.clientId);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Menu Name */}
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Име на менюто *
        </label>
        <input
          id="name"
          type="text"
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          placeholder="Например: Основно меню, Десерти, Напитки..."
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        {errors.name && (
          <div className="form-error">{errors.name}</div>
        )}
      </div>

      {/* Client Selection */}
      <div className="form-group">
        <label htmlFor="clientId" className="form-label">
          Заведение *
        </label>
        <select
          id="clientId"
          className={`form-input ${errors.clientId ? 'form-input--error' : ''}`}
          value={formData.clientId}
          onChange={(e) => setFormData(prev => ({ ...prev, clientId: Number(e.target.value) }))}
          required
          disabled={!!menu} // Can't change client for existing menus
        >
          <option value={0}>Изберете заведение...</option>
          {clientsLoading ? (
            <option disabled>Зареждане на заведения...</option>
          ) : (
            clientsResponse
              ?.filter((client: Client) => client.active)
              ?.map((client: Client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))
          )}
        </select>
        {errors.clientId && (
          <div className="form-error">{errors.clientId}</div>
        )}
        {menu && (
          <div className="form-help">
            Заведението не може да се променя след създаването на менюто
          </div>
        )}
      </div>

      {/* Selected Client Info */}
      {getSelectedClient() && (
        <div className="form-group">
          <div className="client-info">
            <div className="client-info-item">
              <span className="label">Заведение:</span>
              <span className="value">{getSelectedClient()?.name}</span>
            </div>
            <div className="client-info-item">
              <span className="label">URL:</span>
              <span className="value">/menu/{getSelectedClient()?.slug}</span>
            </div>
            {getSelectedClient()?.address && (
              <div className="client-info-item">
                <span className="label">Адрес:</span>
                <span className="value">{getSelectedClient()?.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Selection */}
      <div className="form-group">
        <label htmlFor="templateId" className="form-label">
          Дизайн шаблон
        </label>
        <select
          id="templateId"
          className="form-input"
          value={formData.templateId || ''}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            templateId: e.target.value ? Number(e.target.value) : undefined 
          }))}
        >
          <option value="">Използване на стандартния дизайн</option>
          {mockTemplates
            .filter(template => template.active)
            .map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))
          }
        </select>
        <div className="form-help">
          Можете да промените дизайна на менюто по-късно
        </div>
      </div>

      {/* Status checkboxes (only for editing) */}
      {menu && (
        <>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.active}
                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              />
              <span className="checkbox-text">Активно меню</span>
            </label>
            <div className="form-help">
              Неактивните менюта не са достъпни за разглеждане
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              />
              <span className="checkbox-text">Публикувано меню</span>
            </label>
            <div className="form-help">
              Само публикуваните менюта са видими за клиентите
            </div>
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="flex flex--end" style={{ gap: '1rem', marginTop: '2rem' }}>
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
          disabled={isLoading || clientsLoading}
        >
          {isLoading && <span className="spinner" style={{ marginRight: '8px' }}></span>}
          {menu ? 'Обновяване' : 'Създаване'}
        </button>
      </div>
    </form>
  );
};

export default MenuForm;