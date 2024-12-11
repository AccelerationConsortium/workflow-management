import { pool } from '../db';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  try {
    // 读取迁移SQL文件
    const migrationPath = path.join(__dirname, '../../migrations/001_create_unit_operations.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // 执行迁移
    await pool.query(sql);
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 