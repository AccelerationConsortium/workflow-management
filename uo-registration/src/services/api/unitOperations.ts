import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { GenericUnitOperation, SpecificUnitOperation, UnitOperationFormData, UnitOperationCategory, Laboratory } from '../../types/UnitOperation';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// 单元操作API端点
const UO_API = {
  GENERIC: `${API_BASE_URL}/unit-operations/generic`,
  SPECIFIC: `${API_BASE_URL}/unit-operations/specific`,
};

/**
 * 获取所有通用单元操作
 */
export const useGetGenericUnitOperations = (
  category?: UnitOperationCategory,
  lab?: Laboratory,
  options?: UseQueryOptions<GenericUnitOperation[]>
) => {
  return useQuery<GenericUnitOperation[]>(
    ['genericUnitOperations', category, lab],
    async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (lab) params.append('lab', lab);
      
      const response = await axios.get(`${UO_API.GENERIC}?${params.toString()}`);
      return response.data;
    },
    options
  );
};

/**
 * 获取单个通用单元操作
 */
export const useGetGenericUnitOperation = (
  id: string,
  options?: UseQueryOptions<GenericUnitOperation>
) => {
  return useQuery<GenericUnitOperation>(
    ['genericUnitOperation', id],
    async () => {
      const response = await axios.get(`${UO_API.GENERIC}/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
      ...options,
    }
  );
};

/**
 * 创建通用单元操作
 */
export const useCreateGenericUnitOperation = () => {
  return useMutation<GenericUnitOperation, Error, UnitOperationFormData>(
    async (data) => {
      const response = await axios.post(UO_API.GENERIC, data);
      return response.data;
    }
  );
};

/**
 * 更新通用单元操作
 */
export const useUpdateGenericUnitOperation = () => {
  return useMutation<
    GenericUnitOperation,
    Error,
    { id: string; data: UnitOperationFormData }
  >(async ({ id, data }) => {
    const response = await axios.put(`${UO_API.GENERIC}/${id}`, data);
    return response.data;
  });
};

/**
 * 删除通用单元操作
 */
export const useDeleteGenericUnitOperation = () => {
  return useMutation<void, Error, string>(async (id) => {
    await axios.delete(`${UO_API.GENERIC}/${id}`);
  });
};

/**
 * 获取特定单元操作列表
 */
export const useGetSpecificUnitOperations = (
  genericUoId?: string,
  lab?: Laboratory,
  options?: UseQueryOptions<SpecificUnitOperation[]>
) => {
  return useQuery<SpecificUnitOperation[]>(
    ['specificUnitOperations', genericUoId, lab],
    async () => {
      const params = new URLSearchParams();
      if (genericUoId) params.append('genericUoId', genericUoId);
      if (lab) params.append('lab', lab);
      
      const response = await axios.get(`${UO_API.SPECIFIC}?${params.toString()}`);
      return response.data;
    },
    options
  );
};

/**
 * 获取单个特定单元操作
 */
export const useGetSpecificUnitOperation = (
  id: string,
  options?: UseQueryOptions<SpecificUnitOperation>
) => {
  return useQuery<SpecificUnitOperation>(
    ['specificUnitOperation', id],
    async () => {
      const response = await axios.get(`${UO_API.SPECIFIC}/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
      ...options,
    }
  );
};

/**
 * 创建特定单元操作
 */
export const useCreateSpecificUnitOperation = () => {
  return useMutation<SpecificUnitOperation, Error, UnitOperationFormData>(
    async (data) => {
      const response = await axios.post(UO_API.SPECIFIC, data);
      return response.data;
    }
  );
};

/**
 * 更新特定单元操作
 */
export const useUpdateSpecificUnitOperation = () => {
  return useMutation<
    SpecificUnitOperation,
    Error,
    { id: string; data: UnitOperationFormData }
  >(async ({ id, data }) => {
    const response = await axios.put(`${UO_API.SPECIFIC}/${id}`, data);
    return response.data;
  });
};

/**
 * 删除特定单元操作
 */
export const useDeleteSpecificUnitOperation = () => {
  return useMutation<void, Error, string>(async (id) => {
    await axios.delete(`${UO_API.SPECIFIC}/${id}`);
  });
};

/**
 * 基于通用单元操作创建特定单元操作
 */
export const useCreateSpecificFromGenericUnitOperation = () => {
  return useMutation<
    SpecificUnitOperation, 
    Error, 
    { genericUoId: string; data: Partial<UnitOperationFormData> }
  >(async ({ genericUoId, data }) => {
    const response = await axios.post(
      `${UO_API.GENERIC}/${genericUoId}/derive`, 
      data
    );
    return response.data;
  });
};

// MockAPI 服务，用于前端开发
export const mockGenericUnitOperations: GenericUnitOperation[] = [
  {
    id: 'g1',
    type: 'GENERIC',
    name: 'Batch Reactor',
    description: 'Standard batch reactor for chemical reactions',
    category: UnitOperationCategory.REACTION,
    subCategory: 'BATCH_REACTOR',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    applicableLabs: [Laboratory.SDL1, Laboratory.SDL2],
    parameters: [
      {
        id: 'p1',
        name: 'Temperature',
        description: 'Operating temperature',
        unit: '°C',
        direction: 'INPUT',
        required: true,
        parameterType: 'number'
      },
      {
        id: 'p2',
        name: 'Pressure',
        description: 'Operating pressure',
        unit: 'bar',
        direction: 'INPUT',
        required: true,
        parameterType: 'number'
      },
      {
        id: 'p3',
        name: 'Yield',
        description: 'Reaction yield',
        unit: '%',
        direction: 'OUTPUT',
        required: true,
        parameterType: 'number'
      }
    ],
    technicalSpecifications: {
      capacity: '50L',
      operatingTemperature: '20-150°C',
      operatingPressure: '1-10 bar',
      otherSpecifications: {}
    },
    workflowCompatibility: {
      applicableWorkflows: ['BASIC_REACTION', 'ADVANCED_SYNTHESIS'],
      requiresFileUpload: true
    }
  },
  {
    id: 'g2',
    type: 'GENERIC',
    name: 'Distillation Column',
    description: 'Separation of liquid components by boiling point differences',
    category: UnitOperationCategory.SEPARATION,
    subCategory: 'DISTILLATION',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    applicableLabs: [Laboratory.SDL3, Laboratory.SDL4],
    parameters: [
      {
        id: 'p4',
        name: 'Feed Rate',
        description: 'Rate of feed introduction',
        unit: 'L/min',
        direction: 'INPUT',
        required: true,
        parameterType: 'number'
      },
      {
        id: 'p5',
        name: 'Reflux Ratio',
        description: 'Ratio of reflux to distillate',
        unit: '',
        direction: 'INPUT',
        required: true,
        parameterType: 'number'
      },
      {
        id: 'p6',
        name: 'Distillate Purity',
        description: 'Purity of the distillate product',
        unit: '%',
        direction: 'OUTPUT',
        required: true,
        parameterType: 'number'
      }
    ],
    technicalSpecifications: {
      capacity: '100L/hr',
      operatingTemperature: '50-200°C',
      operatingPressure: '1-5 bar',
      otherSpecifications: {}
    },
    workflowCompatibility: {
      applicableWorkflows: ['BASIC_SEPARATION', 'PRODUCT_PURIFICATION'],
      requiresFileUpload: true
    }
  },
  {
    id: 'g3',
    type: 'GENERIC',
    name: 'Shell & Tube Heat Exchanger',
    description: 'Heat transfer between two fluid streams',
    category: UnitOperationCategory.HEAT_TRANSFER,
    subCategory: 'HEAT_EXCHANGER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    applicableLabs: [Laboratory.SDL2, Laboratory.SDL5],
    parameters: [
      {
        id: 'p7',
        name: 'Hot Fluid Flow Rate',
        description: 'Flow rate of hot fluid',
        unit: 'kg/s',
        direction: 'INPUT',
        required: true,
        parameterType: 'number'
      },
      {
        id: 'p8',
        name: 'Cold Fluid Flow Rate',
        description: 'Flow rate of cold fluid',
        unit: 'kg/s',
        direction: 'INPUT',
        required: true,
        parameterType: 'number'
      },
      {
        id: 'p9',
        name: 'Heat Transfer Rate',
        description: 'Rate of heat transfer',
        unit: 'kW',
        direction: 'OUTPUT',
        required: true,
        parameterType: 'number'
      }
    ],
    technicalSpecifications: {
      capacity: '500 kW',
      operatingTemperature: '0-300°C',
      operatingPressure: '1-20 bar',
      otherSpecifications: {}
    },
    workflowCompatibility: {
      applicableWorkflows: ['HEAT_RECOVERY', 'PROCESS_HEATING'],
      requiresFileUpload: false
    }
  }
];

// 使用模拟数据的通用单元操作查询
export const useMockGenericUnitOperations = (
  category?: UnitOperationCategory,
  lab?: Laboratory
) => {
  return useQuery<GenericUnitOperation[]>(
    ['mockGenericUnitOperations', category, lab],
    () => {
      let result = [...mockGenericUnitOperations];
      
      if (category) {
        result = result.filter(uo => uo.category === category);
      }
      
      if (lab) {
        result = result.filter(uo => uo.applicableLabs.includes(lab));
      }
      
      return Promise.resolve(result);
    }
  );
};

// 使用模拟数据获取单个通用单元操作
export const useMockGenericUnitOperation = (id: string) => {
  return useQuery<GenericUnitOperation>(
    ['mockGenericUnitOperation', id],
    () => {
      const uo = mockGenericUnitOperations.find(uo => uo.id === id);
      if (!uo) {
        throw new Error('Unit operation not found');
      }
      return Promise.resolve(uo);
    },
    {
      enabled: !!id
    }
  );
}; 
