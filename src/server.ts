import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import unitOperationRoutes from './routes/unitOperationRoutes';
import { errorHandler } from './middleware/errorHandler';

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/unit-operations', unitOperationRoutes);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app; 