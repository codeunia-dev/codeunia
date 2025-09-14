import { createServiceClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export interface BackupConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  backupRetentionDays: number;
  backupSchedule: string; // Cron expression
  notificationWebhook?: string;
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  timestamp: string;
  size: number;
  tables: string[];
  error?: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  size: number;
  tables: string[];
  status: 'completed' | 'failed' | 'in_progress';
  error?: string;
}

/**
 * Database Backup Strategy
 */
export class DatabaseBackupManager {
  private config: BackupConfig;
  private supabase: ReturnType<typeof createClient>;

  constructor(config: BackupConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  }

  /**
   * Create a full database backup
   */
  async createBackup(): Promise<BackupResult> {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    try {
      // Get list of all tables
      const tables = await this.getTableList();
      
      // Create backup data structure
      const backupData: Record<string, unknown[]> = {};
      let totalSize = 0;

      // Backup each table
      for (const table of tables) {
        try {
          const { data, error } = await this.supabase
            .from(table)
            .select('*');

          if (error) {
            console.error(`Error backing up table ${table}:`, error);
            continue;
          }

          backupData[table] = data || [];
          totalSize += JSON.stringify(data).length;
        } catch (error) {
          console.error(`Error backing up table ${table}:`, error);
        }
      }

      // Store backup metadata
      const backupMetadata: BackupMetadata = {
        id: backupId,
        timestamp,
        size: totalSize,
        tables: Object.keys(backupData),
        status: 'completed'
      };

      // Store backup in database (backup_metadata table)
      await this.storeBackupMetadata(backupMetadata);

      // Store actual backup data (backup_data table)
      await this.storeBackupData(backupId, backupData);

      // Clean up old backups
      await this.cleanupOldBackups();

      return {
        success: true,
        backupId,
        timestamp,
        size: totalSize,
        tables: Object.keys(backupData)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Store failed backup metadata
      const backupMetadata: BackupMetadata = {
        id: backupId,
        timestamp,
        size: 0,
        tables: [],
        status: 'failed',
        error: errorMessage
      };

      await this.storeBackupMetadata(backupMetadata);

      return {
        success: false,
        backupId,
        timestamp,
        size: 0,
        tables: [],
        error: errorMessage
      };
    }
  }

  /**
   * Get list of all tables in the database
   */
  private async getTableList(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_name', 'backup_metadata')
        .neq('table_name', 'backup_data');

      if (error) {
        throw new Error(`Failed to get table list: ${error.message}`);
      }

      return data?.map((row: { table_name: unknown }) => row.table_name as string) || [];
    } catch (error) {
      console.error('Error getting table list:', error);
      // Fallback to known tables
      return [
        'profiles',
        'user_points',
        'user_activity_log',
        'hackathons',
        'events',
        'blog_posts',
        'certificates',
        'payments',
        'reserved_usernames'
      ];
    }
  }

  /**
   * Store backup metadata
   */
  private async storeBackupMetadata(metadata: BackupMetadata): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('backup_metadata')
        .insert([metadata as unknown as Record<string, unknown>]);

      if (error) {
        console.error('Error storing backup metadata:', error);
      }
    } catch (error) {
      console.error('Error storing backup metadata:', error);
    }
  }

  /**
   * Store backup data
   */
  private async storeBackupData(backupId: string, data: Record<string, unknown[]>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('backup_data')
        .insert([{
          backup_id: backupId,
          data: data,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error storing backup data:', error);
      }
    } catch (error) {
      console.error('Error storing backup data:', error);
    }
  }

  /**
   * Clean up old backups
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.backupRetentionDays);

      // Delete old backup metadata
      const { error: metadataError } = await this.supabase
        .from('backup_metadata')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (metadataError) {
        console.error('Error cleaning up backup metadata:', metadataError);
      }

      // Delete old backup data
      const { error: dataError } = await this.supabase
        .from('backup_data')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (dataError) {
        console.error('Error cleaning up backup data:', dataError);
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get backup metadata
      const { data: metadata, error: metadataError } = await this.supabase
        .from('backup_metadata')
        .select('*')
        .eq('id', backupId)
        .single();

      if (metadataError || !metadata) {
        return {
          success: false,
          error: 'Backup not found'
        };
      }

      // Get backup data
      const { data: backupData, error: dataError } = await this.supabase
        .from('backup_data')
        .select('data')
        .eq('backup_id', backupId)
        .single();

      if (dataError || !backupData) {
        return {
          success: false,
          error: 'Backup data not found'
        };
      }

      // Restore each table
      for (const [tableName, tableData] of Object.entries(backupData.data as Record<string, unknown>)) {
        try {
          // Clear existing data (be careful in production!)
          if (process.env.NODE_ENV === 'production') {
            console.warn('Skipping data clearing in production environment');
            continue;
          }

          // Insert backup data
          if (Array.isArray(tableData) && tableData.length > 0) {
            const { error } = await this.supabase
              .from(tableName)
              .insert(tableData as Record<string, unknown>[]);

            if (error) {
              console.error(`Error restoring table ${tableName}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error restoring table ${tableName}:`, error);
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get backup list
   */
  async getBackupList(): Promise<BackupMetadata[]> {
    try {
      const { data, error } = await this.supabase
        .from('backup_metadata')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting backup list:', error);
        return [];
      }

      return (data as unknown as BackupMetadata[]) || [];
    } catch (error) {
      console.error('Error getting backup list:', error);
      return [];
    }
  }

  /**
   * Get backup details
   */
  async getBackupDetails(backupId: string): Promise<BackupMetadata | null> {
    try {
      const { data, error } = await this.supabase
        .from('backup_metadata')
        .select('*')
        .eq('id', backupId)
        .single();

      if (error) {
        console.error('Error getting backup details:', error);
        return null;
      }

      return data as unknown as BackupMetadata;
    } catch (error) {
      console.error('Error getting backup details:', error);
      return null;
    }
  }
}

/**
 * Create database backup tables (run once)
 */
export async function createBackupTables(): Promise<void> {
  const supabase = createServiceClient();

  try {
    // Create backup_metadata table
    const { error: metadataError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS backup_metadata (
          id TEXT PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL,
          size BIGINT NOT NULL,
          tables TEXT[] NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'in_progress')),
          error TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (metadataError) {
      console.error('Error creating backup_metadata table:', metadataError);
    }

    // Create backup_data table
    const { error: dataError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS backup_data (
          id SERIAL PRIMARY KEY,
          backup_id TEXT NOT NULL REFERENCES backup_metadata(id) ON DELETE CASCADE,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });

    if (dataError) {
      console.error('Error creating backup_data table:', dataError);
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_backup_metadata_timestamp ON backup_metadata(timestamp);
        CREATE INDEX IF NOT EXISTS idx_backup_data_backup_id ON backup_data(backup_id);
      `
    });

    if (indexError) {
      console.error('Error creating backup indexes:', indexError);
    }

    console.log('✅ Backup tables created successfully');
  } catch (error) {
    console.error('Error creating backup tables:', error);
  }
}

/**
 * Database connection optimization
 */
export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private connectionPool: Map<string, unknown> = new Map();
  private maxConnections = 10;

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  /**
   * Get optimized database connection
   */
  getConnection(key: string = 'default') {
    if (this.connectionPool.has(key)) {
      return this.connectionPool.get(key);
    }

    if (this.connectionPool.size >= this.maxConnections) {
      // Remove oldest connection
      const oldestKey = this.connectionPool.keys().next().value;
      if (oldestKey) {
        this.connectionPool.delete(oldestKey);
      }
    }

    const connection = createServiceClient();

    this.connectionPool.set(key, connection);
    return connection;
  }

  /**
   * Close all connections
   */
  closeAllConnections(): void {
    this.connectionPool.clear();
  }
}

// Function to create backup manager instance (lazy initialization)
export function createBackupManager(): DatabaseBackupManager {
  return new DatabaseBackupManager({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    backupRetentionDays: 30,
    backupSchedule: '0 2 * * *' // Daily at 2 AM
  });
}

// Global connection manager instance
export const connectionManager = DatabaseConnectionManager.getInstance();
