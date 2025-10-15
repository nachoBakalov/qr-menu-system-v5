import React, { useState, useEffect } from 'react';
import type { Client, CreateClientRequest, UpdateClientRequest } from '../types/api';

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: CreateClientRequest | UpdateClientRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  client, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    slogan: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        slug: client.slug || '',
        description: client.description || '',
        address: client.address || '',
        phone: client.phone || '',
        slogan: client.slogan || '',
        active: client.active,
      });
    }
  }, [client]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      // Auto-generate slug only if we're creating a new client
      slug: !client ? generateSlug(value) : prev.slug,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Името е задължително';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug-ът е задължителен';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug-ът може да съдържа само малки букви, цифри и тирета';
    }

    if (formData.phone && !/^\+?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Невалиден формат на телефонен номер';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreateClientRequest | UpdateClientRequest = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || undefined,
      address: formData.address.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      slogan: formData.slogan.trim() || undefined,
    };

    // Add active field for updates
    if (client) {
      (submitData as UpdateClientRequest).active = formData.active;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid--cols-1 grid--sm-cols-2" style={{ gap: '1rem' }}>
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Име на заведението *
          </label>
          <input
            id="name"
            type="text"
            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
            placeholder="Например: Ресторант Морски Бриз"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
          {errors.name && (
            <div className="form-error">{errors.name}</div>
          )}
        </div>

        {/* Slug */}
        <div className="form-group">
          <label htmlFor="slug" className="form-label">
            Slug (URL идентификатор) *
          </label>
          <input
            id="slug"
            type="text"
            className={`form-input ${errors.slug ? 'form-input--error' : ''}`}
            placeholder="morski-briz"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            required
          />
          {errors.slug && (
            <div className="form-error">{errors.slug}</div>
          )}
          <div className="form-help">
            Използва се в URL адреса: /menu/{formData.slug}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Описание
        </label>
        <textarea
          id="description"
          className="form-textarea"
          placeholder="Кратко описание на заведението..."
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* Address */}
      <div className="form-group">
        <label htmlFor="address" className="form-label">
          Адрес
        </label>
        <input
          id="address"
          type="text"
          className="form-input"
          placeholder="бул. Витоша 15, София"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>

      <div className="grid grid--cols-1 grid--sm-cols-2" style={{ gap: '1rem' }}>
        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Телефон
          </label>
          <input
            id="phone"
            type="tel"
            className={`form-input ${errors.phone ? 'form-input--error' : ''}`}
            placeholder="+359888123456"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
          {errors.phone && (
            <div className="form-error">{errors.phone}</div>
          )}
        </div>

        {/* Slogan */}
        <div className="form-group">
          <label htmlFor="slogan" className="form-label">
            Слоган
          </label>
          <input
            id="slogan"
            type="text"
            className="form-input"
            placeholder="Автентична италианска кухня"
            value={formData.slogan}
            onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
          />
        </div>
      </div>

      {/* Active checkbox (only for editing) */}
      {client && (
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
            />
            <span className="checkbox-text">Активно заведение</span>
          </label>
        </div>
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
          disabled={isLoading}
        >
          {isLoading && <span className="spinner" style={{ marginRight: '8px' }}></span>}
          {client ? 'Обновяване' : 'Създаване'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;