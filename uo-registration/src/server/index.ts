import express from 'express';
import cors from 'cors';
import path from 'path';
import { unitOperationsRouter } from './routes/unitOperations';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
}

// API Routes
app.use('/api/unit-operations', unitOperationsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Handle client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 
