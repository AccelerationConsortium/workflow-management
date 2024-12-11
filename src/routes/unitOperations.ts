import express from 'express';
import { pool } from '../db';

const router = express.Router();

// 获取所有测试UO
router.get('/test', async (req, res) => {
  try {
    const { rows: uos } = await pool.query(
      `SELECT 
        uo.*,
        json_agg(DISTINCT inputs.*) as inputs,
        json_agg(DISTINCT params.*) as parameters,
        json_agg(DISTINCT outputs.*) as outputs,
        json_agg(DISTINCT constraints.*) as constraints
       FROM unit_operations uo
       LEFT JOIN uo_inputs inputs ON uo.id = inputs.uo_id
       LEFT JOIN uo_parameters params ON uo.id = params.uo_id
       LEFT JOIN uo_outputs outputs ON uo.id = outputs.uo_id
       LEFT JOIN uo_constraints constraints ON uo.id = constraints.uo_id
       WHERE uo.category = 'test'
       GROUP BY uo.id`
    );
    
    res.json(uos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test UOs' });
  }
});

export default router; 