/**
 * File storage provider types
 */
export enum StorageProvider {
  LOCAL = 'local',
  AWS_S3 = 'aws_s3',
  // Future providers can be added here
}

/**
 * File types supported by the system
 */
export enum FileType {
  CSV = 'csv',
  EXCEL = 'xlsx',
  JSON = 'json',
  TEXT = 'txt',
}

/**
 * File metadata interface
 */
export interface FileMetadata {
  id: string;
  filename: string;
  type: FileType;
  size: number;
  checksum: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  storageProvider: StorageProvider;
  storageLocation: string;
  permissions: FilePermissions;
}

/**
 * File permissions interface
 */
export interface FilePermissions {
  owner: string;
  group: string;
  read: string[];   // List of user/group IDs with read permission
  write: string[];  // List of user/group IDs with write permission
  delete: string[]; // List of user/group IDs with delete permission
}

/**
 * File storage options
 */
export interface FileStorageOptions {
  provider: StorageProvider;
  versioning: boolean;
  preserveHistory: boolean;
  maxVersions?: number;
  encryption?: boolean;
  compression?: boolean;
}

/**
 * File read options
 */
export interface FileReadOptions {
  version?: number;    // Specific version to read, latest if not specified
  format?: string;     // Output format if conversion needed
  encoding?: string;   // File encoding
}

/**
 * File write options
 */
export interface FileWriteOptions {
  overwrite?: boolean;
  createVersion?: boolean;
  permissions?: Partial<FilePermissions>;
  encryption?: boolean;
  compression?: boolean;
}

/**
 * File service interface
 */
export interface IFileService {
  // Basic file operations
  readFile(fileId: string, options?: FileReadOptions): Promise<{ data: any; metadata: FileMetadata }>;
  writeFile(filename: string, data: any, options?: FileWriteOptions): Promise<FileMetadata>;
  deleteFile(fileId: string): Promise<void>;
  
  // Metadata operations
  getFileMetadata(fileId: string): Promise<FileMetadata>;
  updateFileMetadata(fileId: string, metadata: Partial<FileMetadata>): Promise<FileMetadata>;
  
  // Version control
  listVersions(fileId: string): Promise<FileMetadata[]>;
  getVersion(fileId: string, version: number): Promise<{ data: any; metadata: FileMetadata }>;
  revertToVersion(fileId: string, version: number): Promise<FileMetadata>;
  
  // Permission management
  updatePermissions(fileId: string, permissions: Partial<FilePermissions>): Promise<FileMetadata>;
  checkPermission(fileId: string, userId: string, permission: 'read' | 'write' | 'delete'): Promise<boolean>;
  
  // Storage management
  migrateStorage(fileId: string, newProvider: StorageProvider): Promise<FileMetadata>;
  getStorageStats(fileId: string): Promise<{
    size: number;
    versions: number;
    lastAccessed: Date;
    storageProvider: StorageProvider;
  }>;
  
  // Search and list
  listFiles(filters?: {
    type?: FileType[];
    owner?: string;
    createdAfter?: Date;
    createdBefore?: Date;
  }): Promise<FileMetadata[]>;
  
  // Utility methods
  validateFile(file: any): Promise<{
    valid: boolean;
    errors?: string[];
  }>;
  generatePresignedUrl(fileId: string, operation: 'read' | 'write', expiresIn: number): Promise<string>;
}

/**
 * File operation result
 */
export interface FileOperationResult {
  success: boolean;
  metadata?: FileMetadata;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
} 
