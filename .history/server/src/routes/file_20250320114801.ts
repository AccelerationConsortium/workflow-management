import express from 'express';
import multer from 'multer';
import { FileController } from '../controllers/file';

const router = express.Router();
const fileController = new FileController();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/:fileId', fileController.getFile);
router.get('/', fileController.listFiles);

export { router as fileRouter }; 
