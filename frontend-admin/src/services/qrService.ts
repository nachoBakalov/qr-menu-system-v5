import { apiClient } from './api';

// QR Code Response types
export interface QRCodeData {
  qrCodeUrl: string;
  menuUrl: string;
  client: {
    id?: number;
    name: string;
    slug: string;
  };
}

export interface GenerateQRCodeResponse {
  qrCodeUrl: string;
  menuUrl: string;
  client: {
    id: number;
    name: string;
    slug: string;
  };
}

export const qrService = {
  // Generate QR code for client
  generateQRCode: async (clientId: number) => {
    const fullUrl = `http://localhost:5000/api/public/qr-code/${clientId}/generate`;
    const token = localStorage.getItem('token');
    console.log('📡 [qrService] Sending POST request to:', fullUrl);
    console.log('🔑 [qrService] Auth token exists:', !!token);
    try {
      const response = await apiClient.post(`/public/qr-code/${clientId}/generate`);
      console.log('✅ [qrService] Generate QR response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [qrService] Generate QR error:', error);
      console.error('❌ [qrService] Error response:', error.response?.data);
      console.error('❌ [qrService] Error status:', error.response?.status);
      throw error;
    }
  },

  // Get existing QR code for client
  getQRCode: async (clientId: number) => {
    const fullUrl = `http://localhost:5000/api/public/qr-code/${clientId}`;
    const token = localStorage.getItem('token');
    console.log('📡 [qrService] Sending GET request to:', fullUrl);
    console.log('🔑 [qrService] Auth token exists:', !!token);
    console.log('🔑 [qrService] Auth token (first 20 chars):', token?.substring(0, 20));
    try {
      const response = await apiClient.get(`/public/qr-code/${clientId}`);
      console.log('✅ [qrService] Get QR response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('⚠️ [qrService] Get QR error:', error.response?.status, error.response?.data);
      throw error;
    }
  }
};