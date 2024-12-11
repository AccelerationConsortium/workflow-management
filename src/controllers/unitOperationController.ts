import { Request, Response } from 'express';
import { pool } from '../db';
import { UnitOperation } from '../types/unitOperation';

export class UnitOperationController {
  // 获取所有UO模板
  async getTemplates(req: Request, res: Response) {
    try {
      const result = await pool.query(
        'SELECT * FROM unit_operation_templates ORDER BY category, template_name'
      );
      res.json({ templates: result.rows });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 获取单个UO详情
  async getUnitOperation(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM unit_operations WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Unit operation not found' });
      }
      
      res.json({ unitOperation: result.rows[0] });
    } catch (error) {
      console.error('Error fetching unit operation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 更新UO参数
  async updateUnitOperation(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;

    try {
      // 构建更新查询
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = Object.values(updates);
      
      const result = await pool.query(
        `UPDATE unit_operations 
         SET ${setClause} 
         WHERE id = $1 
         RETURNING *`,
        [id, ...values]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Unit operation not found' });
      }

      res.json({ unitOperation: result.rows[0] });
    } catch (error) {
      console.error('Error updating unit operation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 从模板创建新的UO实例
  async createInstance(req: Request, res: Response) {
    const { templateId, ...initialData } = req.body;

    try {
      // 开始事务
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 获取模板数据
        const templateResult = await client.query(
          'SELECT * FROM unit_operation_templates WHERE id = $1',
          [templateId]
        );

        if (templateResult.rows.length === 0) {
          throw new Error('Template not found');
        }

        const template = templateResult.rows[0];

        // 合并模板配置和初始数据
        const instanceConfig = {
          ...template.base_config,
          ...initialData
        };

        // 创建实例
        const result = await client.query(
          `INSERT INTO unit_operation_instances 
           (template_id, instance_config) 
           VALUES ($1, $2) 
           RETURNING *`,
          [templateId, instanceConfig]
        );

        await client.query('COMMIT');
        res.json({ unitOperation: result.rows[0] });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating unit operation instance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 