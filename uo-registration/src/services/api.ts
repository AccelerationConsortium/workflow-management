import axios from 'axios';
import { 
  UnitOperation, 
  UnitOperationFormData, 
  GenericUnitOperation,
  SpecificUnitOperation,
  UnitOperationType
} from '../types/UnitOperation';

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
  
  // Get only generic unit operations
  getGeneric: async (): Promise<GenericUnitOperation[]> => {
    const response = await api.get('/unit-operations/generic');
    return response.data;
  },
  
  // Get only specific unit operations (optionally filtered by laboratory)
  getSpecific: async (laboratoryId?: string): Promise<SpecificUnitOperation[]> => {
    const url = laboratoryId 
      ? `/unit-operations/specific?laboratoryId=${encodeURIComponent(laboratoryId)}`
      : '/unit-operations/specific';
    const response = await api.get(url);
    return response.data;
  },
  
  // Get specific operations derived from a generic operation
  getDerivedOperations: async (genericId: string): Promise<SpecificUnitOperation[]> => {
    const response = await api.get(`/unit-operations/generic/${genericId}/derived`);
    return response.data;
  },
  
  // Get a single unit operation by ID
  getById: async (id: string): Promise<UnitOperation> => {
    const response = await api.get(`/unit-operations/${id}`);
    return response.data;
  },
  
  // Create a new unit operation (generic or specific)
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

// Laboratories API (mock for now)
export const laboratoriesApi = {
  // Get all laboratories
  getAll: async () => {
    // Mock data - would be a real API call in production
    return [
      { id: 'lab001', name: 'Laboratory A', location: 'Building A, Floor 1' },
      { id: 'lab002', name: 'Laboratory B', location: 'Building B, Floor 2' },
      { id: 'lab003', name: 'Laboratory C', location: 'Building C, Floor 3' },
    ];
  },
  
  // Get a laboratory by ID
  getById: async (id: string) => {
    // Mock data - would be a real API call in production
    const labs = [
      { 
        id: 'lab001', 
        name: 'Laboratory A', 
        description: 'Chemical Analysis Laboratory', 
        location: 'Building A, Floor 1',
        contactPerson: 'John Doe',
        contactEmail: 'john.doe@example.com',
        createdAt: '2023-01-15',
        updatedAt: '2023-09-20'
      },
      { 
        id: 'lab002', 
        name: 'Laboratory B', 
        description: 'Biochemistry Research Laboratory', 
        location: 'Building B, Floor 2',
        contactPerson: 'Jane Smith',
        contactEmail: 'jane.smith@example.com',
        createdAt: '2023-02-20',
        updatedAt: '2023-08-15'
      },
      { 
        id: 'lab003', 
        name: 'Laboratory C', 
        description: 'Environmental Testing Laboratory', 
        location: 'Building C, Floor 3',
        contactPerson: 'Robert Johnson',
        contactEmail: 'robert.johnson@example.com',
        createdAt: '2023-03-10',
        updatedAt: '2023-09-05'
      },
    ];
    
    return labs.find(lab => lab.id === id);
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
