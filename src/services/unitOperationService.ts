import axios from 'axios';
import { UnitOperation } from '../types/unitOperation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const unitOperationService = {
  // 获取单个UO的详细信息
  async getUnitOperation(uoId: string): Promise<UnitOperation> {
    const response = await axios.get(`${API_BASE_URL}/unit-operations/${uoId}`);
    return response.data;
  },

  // 更新UO的参数
  async updateUnitOperation(
    uoId: string, 
    data: Partial<UnitOperation>
  ): Promise<UnitOperation> {
    const response = await axios.patch(
      `${API_BASE_URL}/unit-operations/${uoId}`,
      data
    );
    return response.data;
  },

  // 获取所有UO模板
  async getUnitOperationTemplates(): Promise<UnitOperation[]> {
    const response = await axios.get(`${API_BASE_URL}/unit-operations/templates`);
    return response.data;
  },

  // 从模板创建新的UO实例
  async createUnitOperationInstance(
    templateId: string,
    initialData: Partial<UnitOperation>
  ): Promise<UnitOperation> {
    const response = await axios.post(
      `${API_BASE_URL}/unit-operations/instances`,
      {
        templateId,
        ...initialData
      }
    );
    return response.data;
  }
}; 