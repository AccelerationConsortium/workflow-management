import { Request, Response } from 'express';
import { FileService } from '../services/file';

export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  uploadFile = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { nodeId, inputId } = req.body;
      const fileData = {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        fileType: req.file.mimetype,
        filePath: req.file.path,
        nodeId,
        inputId
      };

      const result = await this.fileService.saveFile(fileData);
      res.json(result);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  };

  getFile = async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      const file = await this.fileService.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json(file);
    } catch (error) {
      console.error('Error getting file:', error);
      res.status(500).json({ error: 'Failed to get file' });
    }
  };

  listFiles = async (req: Request, res: Response) => {
    try {
      const { nodeId } = req.query;
      const files = await this.fileService.listFiles(nodeId as string);
      res.json(files);
    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({ error: 'Failed to list files' });
    }
  };
} 
