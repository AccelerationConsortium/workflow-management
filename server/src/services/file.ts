import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FileData {
  originalName: string;
  fileName: string;
  fileType: string;
  filePath: string;
  nodeId: string;
  inputId: string;
}

export class FileService {
  async saveFile(fileData: FileData) {
    try {
      const file = await prisma.file.create({
        data: {
          originalName: fileData.originalName,
          fileName: fileData.fileName,
          fileType: fileData.fileType,
          filePath: fileData.filePath,
          nodeId: fileData.nodeId,
          inputId: fileData.inputId
        }
      });
      return file;
    } catch (error) {
      console.error('Error saving file to database:', error);
      throw error;
    }
  }

  async getFile(fileId: string) {
    try {
      const file = await prisma.file.findUnique({
        where: { id: fileId }
      });
      return file;
    } catch (error) {
      console.error('Error getting file from database:', error);
      throw error;
    }
  }

  async listFiles(nodeId?: string) {
    try {
      const files = await prisma.file.findMany({
        where: nodeId ? { nodeId } : undefined,
        orderBy: { createdAt: 'desc' }
      });
      return files;
    } catch (error) {
      console.error('Error listing files from database:', error);
      throw error;
    }
  }
} 
