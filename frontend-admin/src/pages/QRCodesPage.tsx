import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, qrService } from '../services';
import type { Client } from '../types/api';

interface QRCodeDisplayData {
  client: Client;
  qrCodeUrl?: string;
  menuUrl?: string;
  hasQRCode: boolean;
}

const QRCodesPage = () => {
  const [selectedClient, setSelectedClient] = useState<number>(0);
  const queryClient = useQueryClient();

  // Fetch all clients
  const { data: clientsResponse, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      console.log('📡 [QRCodesPage] Fetching clients...');
      const result = await clientService.getClients({ page: 1, limit: 100 });
      console.log('✅ [QRCodesPage] Clients response:', result);
      return result;
    }
  });

  console.log('🔍 [QRCodesPage] Full clientsResponse structure:', clientsResponse);
  console.log('🔍 [QRCodesPage] clientsResponse?.data:', clientsResponse?.data);
  console.log('🔍 [QRCodesPage] clientsResponse?.data?.data:', clientsResponse?.data?.data);
  
  // Extract clients array correctly
  let clients: Client[] = [];
  if (clientsResponse?.data?.data) {
    clients = clientsResponse.data.data;
  } else if (Array.isArray(clientsResponse?.data)) {
    clients = clientsResponse.data;
  }
  console.log('👥 [QRCodesPage] Processed clients array:', clients);

  // Create display data for all clients (with or without QR codes)
  const { data: qrCodes, isLoading: isLoadingQRCodes, refetch } = useQuery({
    queryKey: ['qr-codes', clients.map((c: Client) => c.id)],
    queryFn: async (): Promise<QRCodeDisplayData[]> => {
      console.log('🔄 [QRCodesPage] Starting QR codes query with clients:', clients.length);
      if (!clients.length) {
        console.log('⚠️ [QRCodesPage] No clients found, returning empty array');
        return [];
      }
      
      // Always return all clients, check QR codes individually
      const qrCodePromises = clients.map(async (client: Client): Promise<QRCodeDisplayData> => {
        console.log(`🔍 Checking QR code for client: ${client.name} (ID: ${client.id}, slug: ${client.slug})`);
        try {
          const response: any = await qrService.getQRCode(client.id);
          console.log(`✅ Found QR code for ${client.name}:`, response.data);
          return {
            client,
            qrCodeUrl: response.data?.qrCodeUrl,
            menuUrl: response.data?.menuUrl,
            hasQRCode: true
          };
        } catch (error: any) {
          console.log(`⚠️ No QR code for ${client.name} (ID: ${client.id}):`, error.response?.status, error.response?.data);
          // Client exists but no QR code generated yet
          return {
            client,
            hasQRCode: false
          };
        }
      });

      const results = await Promise.allSettled(qrCodePromises);
      const finalResults = results.map((result: any) => 
        result.status === 'fulfilled' ? result.value : { client: null, hasQRCode: false }
      ).filter(item => item.client) as QRCodeDisplayData[];
      
      console.log('🎯 [QRCodesPage] Final QR codes results:', finalResults);
      console.log('📊 [QRCodesPage] Results summary:', {
        totalClients: clients.length,
        withQRCode: finalResults.filter(r => r.hasQRCode).length,
        withoutQRCode: finalResults.filter(r => !r.hasQRCode).length
      });
      
      return finalResults;
    },
    enabled: clients.length > 0
  });

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: async (clientId: number) => {
      console.log('🔄 Generating QR code for client ID:', clientId);
      const result = await qrService.generateQRCode(clientId);
      console.log('✅ QR generation result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🎉 QR code generated successfully:', data);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
    },
    onError: (error: any) => {
      console.error('❌ Error generating QR code:', error);
      console.error('Error response:', error.response?.data);
    }
  });

  const handleGenerateQR = (clientId: number) => {
    generateQRMutation.mutate(clientId);
  };

  const downloadQRCode = (qrCodeUrl: string, clientName: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000${qrCodeUrl}`;
    link.download = `qr-code-${clientName.replace(/\s+/g, '-').toLowerCase()}.png`;
    console.log('📥 Downloading QR code from:', link.href);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredQRCodes = selectedClient 
    ? qrCodes?.filter(item => item.client.id === selectedClient)
    : qrCodes;
    
  console.log('🎨 [QRCodesPage] Render state:', {
    isLoadingClients,
    isLoadingQRCodes,
    clientsCount: clients.length,
    qrCodesCount: qrCodes?.length || 0,
    filteredCount: filteredQRCodes?.length || 0,
    selectedClient
  });

  if (isLoadingClients) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Зареждане на клиенти...</p>
      </div>
    );
  }

  return (
    <div className="qr-codes-page">
      <div className="page-header">
        <h1>QR Кодове</h1>
        <p>Управление на QR кодове за менютата на клиентите</p>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <div className="filter-group">
          <label htmlFor="client-filter" className="filter-label">
            Филтър по клиент:
          </label>
          <select
            id="client-filter"
            value={selectedClient}
            onChange={(e) => setSelectedClient(Number(e.target.value))}
            className="filter-select"
          >
            <option value={0}>Всички клиенти</option>
            {clients.map((client: Client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="results-count">
            {filteredQRCodes?.length || 0} QR кода
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingQRCodes && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Зареждане на QR кодове...</p>
        </div>
      )}

      {/* QR Codes Grid */}
      {!isLoadingQRCodes && (
        <div className="qr-codes-grid">
          {!filteredQRCodes || filteredQRCodes.length === 0 ? (
            <div className="no-data">
              <h3>Няма намерени QR кодове</h3>
              <p>Изберете клиент и генерирайте QR код за неговото меню</p>
            </div>
          ) : (
            filteredQRCodes.map((item) => (
              <div key={item.client.id} className="qr-code-card">
                <div className="card-header">
                  <h3 className="client-name">{item.client.name}</h3>
                  <div className="client-details">
                    <span className="client-slug">/{item.client.slug}</span>
                    {item.client.active ? (
                      <span className="status-badge status-badge--active">Активен</span>
                    ) : (
                      <span className="status-badge status-badge--inactive">Неактивен</span>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  {item.hasQRCode && item.qrCodeUrl ? (
                    <div className="qr-code-display">
                      <div className="qr-image-container">
                        <img
                          src={`http://localhost:5000${item.qrCodeUrl}`}
                          alt={`QR код за ${item.client.name}`}
                          className="qr-image"
                          onError={(e) => {
                            console.error('QR image failed to load:', `http://localhost:5000${item.qrCodeUrl}`);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      
                      <div className="qr-info">
                        <div className="menu-url">
                          <label>URL на менюто:</label>
                          <a 
                            href={item.menuUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="url-link"
                          >
                            {item.menuUrl}
                          </a>
                        </div>
                      </div>

                      <div className="qr-actions">
                        <button
                          onClick={() => downloadQRCode(item.qrCodeUrl!, item.client.name)}
                          className="btn btn--secondary"
                        >
                          📥 Изтегли QR код
                        </button>
                        <button
                          onClick={() => handleGenerateQR(item.client.id)}
                          className="btn btn--primary"
                          disabled={generateQRMutation.isPending}
                        >
                          🔄 Регенерирай
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="no-qr-code">
                      <div className="no-qr-placeholder">
                        <div className="placeholder-icon">📱</div>
                        <p>QR код не е генериран</p>
                      </div>
                      
                      <button
                        onClick={() => handleGenerateQR(item.client.id)}
                        className="btn btn--primary"
                        disabled={generateQRMutation.isPending}
                      >
                        {generateQRMutation.isPending ? '⏳ Генериране...' : '✨ Генерирай QR код'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default QRCodesPage;