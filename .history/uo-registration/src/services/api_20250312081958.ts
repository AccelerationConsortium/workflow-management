import axios from 'axios';
import { UnitOperation, UnitOperationFormData } from '../types/UnitOperation';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Unit Operations API
export const unitOperationsApi = {
  // Get all unit operations
  getAll: async (): Promise<UnitOperation[]> => {
    const response = await api.get('/unit-operations');
    return response.data;
  },
  
  // Get a single unit operation by ID
  getById: async (id: string): Promise<UnitOperation> => {
    const response = await api.get(`/unit-operations/${id}`);
    return response.data;
  },
  
  // Create a new unit operation
  create: async (data: UnitOperationFormData): Promise<UnitOperation> => {
    const response = await api.post('/unit-operations', data);
    return response.data;
  },
  
  // Update an existing unit operation
  update: async (id: string, data: Partial<UnitOperationFormData>): Promise<UnitOperation> => {
    const response = await api.put(`/unit-operations/${id}`, data);
    return response.data;
  },
  
  // Delete a unit operation
  delete: async (id: string): Promise<void> => {
    await api.delete(`/unit-operations/${id}`);
  }
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or other auth state management
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      switch (error.response.status) {
        case 401:
          // Handle unauthorized error (e.g., redirect to login)
          console.error('Unauthorized access. Please login again.');
          // Clear auth token
          localStorage.removeItem('auth_token');
          break;
        case 404:
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error during request setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 
