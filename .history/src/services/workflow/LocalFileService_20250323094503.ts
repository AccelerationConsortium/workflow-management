import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {
  IFileService,
  FileMetadata,
  FilePermissions,
  FileType,
  StorageProvider,
  FileReadOptions,
  FileWriteOptions,
} from './interfaces/IFileService';

/**
 * Local file storage service implementation
 */
export class LocalFileService implements IFileService {
  private baseDir: string;
  private metadataDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.metadataDir = path.join(baseDir, '.metadata');
    this.initializeStorage();
  }

  private async initializeStorage() {
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.mkdir(this.metadataDir, { recursive: true });
  }

  private async generateFileId(): Promise<string> {
    return crypto.randomUUID();
  }

  private getFilePath(fileId: string, version?: number): string {
    const versionSuffix = version ? `.v${version}` : '';
    return path.join(this.baseDir, `${fileId}${versionSuffix}`);
  }

  private getMetadataPath(fileId: string): string {
    return path.join(this.metadataDir, `${fileId}.json`);
  }

  private async saveMetadata(metadata: FileMetadata): Promise<void> {
    const metadataPath = this.getMetadataPath(metadata.id);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async loadMetadata(fileId: string): Promise<FileMetadata> {
    const metadataPath = this.getMetadataPath(fileId);
    const data = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(data);
  }

  async readFile(fileId: string, options?: FileReadOptions): Promise<{ data: any; metadata: FileMetadata }> {
    const metadata = await this.loadMetadata(fileId);
    
    // Check version
    const version = options?.version || metadata.version;
    const filePath = this.getFilePath(fileId, version);
    
    // Read file content
    const data = await fs.readFile(filePath, options?.encoding || 'utf-8');
    
    // Parse data based on file type
    let parsedData: any;
    switch (metadata.type) {
      case FileType.JSON:
        parsedData = JSON.parse(data);
        break;
      case FileType.CSV:
        // TODO: Implement CSV parsing
        parsedData = data;
        break;
      default:
        parsedData = data;
    }
    
    return { data: parsedData, metadata };
  }

  async writeFile(filename: string, data: any, options?: FileWriteOptions): Promise<FileMetadata> {
    const fileId = await this.generateFileId();
    const filePath = this.getFilePath(fileId);
    
    // Determine file type from extension
    const fileType = path.extname(filename).slice(1) as FileType;
    
    // Prepare data for writing
    let fileData: string;
    switch (fileType) {
      case FileType.JSON:
        fileData = JSON.stringify(data, null, 2);
        break;
      case FileType.CSV:
        // TODO: Implement CSV formatting
        fileData = data.toString();
        break;
      default:
        fileData = data.toString();
    }
    
    // Write file
    await fs.writeFile(filePath, fileData);
    
    // Create metadata
    const metadata: FileMetadata = {
      id: fileId,
      filename,
      type: fileType,
      size: Buffer.from(fileData).length,
      checksum: crypto.createHash('md5').update(fileData).digest('hex'),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system', // TODO: Get from auth context
      storageProvider: StorageProvider.LOCAL,
      storageLocation: filePath,
      permissions: {
        owner: 'system', // TODO: Get from auth context
        group: 'system',
        read: ['*'],
        write: ['system'],
        delete: ['system']
      }
    };
    
    await this.saveMetadata(metadata);
    return metadata;
  }

  async deleteFile(fileId: string): Promise<void> {
    const metadata = await this.loadMetadata(fileId);
    
    // Delete all versions
    const versions = await this.listVersions(fileId);
    for (const version of versions) {
      const versionPath = this.getFilePath(fileId, version.version);
      await fs.unlink(versionPath);
    }
    
    // Delete metadata
    await fs.unlink(this.getMetadataPath(fileId));
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    return this.loadMetadata(fileId);
  }

  async updateFileMetadata(fileId: string, metadata: Partial<FileMetadata>): Promise<FileMetadata> {
    const existingMetadata = await this.loadMetadata(fileId);
    const updatedMetadata = { ...existingMetadata, ...metadata, updatedAt: new Date() };
    await this.saveMetadata(updatedMetadata);
    return updatedMetadata;
  }

  async listVersions(fileId: string): Promise<FileMetadata[]> {
    const metadata = await this.loadMetadata(fileId);
    const versions: FileMetadata[] = [];
    
    for (let version = 1; version <= metadata.version; version++) {
      const versionPath = this.getFilePath(fileId, version);
      try {
        const stats = await fs.stat(versionPath);
        versions.push({
          ...metadata,
          version,
          size: stats.size,
          updatedAt: stats.mtime
        });
      } catch (error) {
        // Version file not found, skip
      }
    }
    
    return versions;
  }

  async getVersion(fileId: string, version: number): Promise<{ data: any; metadata: FileMetadata }> {
    return this.readFile(fileId, { version });
  }

  async revertToVersion(fileId: string, version: number): Promise<FileMetadata> {
    const { data } = await this.getVersion(fileId, version);
    const metadata = await this.loadMetadata(fileId);
    
    // Create new version with old content
    const newVersion = metadata.version + 1;
    const newPath = this.getFilePath(fileId, newVersion);
    await fs.writeFile(newPath, data);
    
    // Update metadata
    const updatedMetadata: FileMetadata = {
      ...metadata,
      version: newVersion,
      updatedAt: new Date()
    };
    await this.saveMetadata(updatedMetadata);
    
    return updatedMetadata;
  }

  // Permission management
  async updatePermissions(fileId: string, permissions: Partial<FilePermissions>): Promise<FileMetadata> {
    return this.updateFileMetadata(fileId, { permissions: permissions as FilePermissions });
  }

  async checkPermission(fileId: string, userId: string, permission: 'read' | 'write' | 'delete'): Promise<boolean> {
    const metadata = await this.loadMetadata(fileId);
    const permList = metadata.permissions[permission];
    return permList.includes('*') || permList.includes(userId);
  }

  // Storage management
  async migrateStorage(fileId: string, newProvider: StorageProvider): Promise<FileMetadata> {
    throw new Error('Storage migration not implemented for local storage');
  }

  async getStorageStats(fileId: string): Promise<{
    size: number;
    versions: number;
    lastAccessed: Date;
    storageProvider: StorageProvider;
  }> {
    const metadata = await this.loadMetadata(fileId);
    const versions = await this.listVersions(fileId);
    const totalSize = versions.reduce((sum, v) => sum + v.size, 0);
    
    return {
      size: totalSize,
      versions: versions.length,
      lastAccessed: metadata.updatedAt,
      storageProvider: StorageProvider.LOCAL
    };
  }

  // Search and list
  async listFiles(filters?: {
    type?: FileType[];
    owner?: string;
    createdAfter?: Date;
    createdBefore?: Date;
  }): Promise<FileMetadata[]> {
    const files = await fs.readdir(this.metadataDir);
    const metadataList = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(f => this.loadMetadata(f.replace('.json', '')))
    );
    
    return metadataList.filter(metadata => {
      if (filters?.type && !filters.type.includes(metadata.type)) return false;
      if (filters?.owner && metadata.permissions.owner !== filters.owner) return false;
      if (filters?.createdAfter && metadata.createdAt < filters.createdAfter) return false;
      if (filters?.createdBefore && metadata.createdAt > filters.createdBefore) return false;
      return true;
    });
  }

  // Utility methods
  async validateFile(file: any): Promise<{ valid: boolean; errors?: string[] }> {
    // TODO: Implement file validation based on type
    return { valid: true };
  }

  async generatePresignedUrl(fileId: string, operation: 'read' | 'write', expiresIn: number): Promise<string> {
    throw new Error('Presigned URLs not supported for local storage');
  }
} 
