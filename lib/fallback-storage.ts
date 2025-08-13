// Fallback storage mechanism for when file system is unavailable
import { Project } from '@/lib/types';

// In-memory storage as last resort
let memoryStorage: Project[] = [];
let storageWarningShown = false;

// Local storage helpers (for client-side fallback)
const isClient = typeof window !== 'undefined';

export class FallbackStorage {
  private static instance: FallbackStorage;
  private projects: Project[] = [];
  private storageType: 'file' | 'memory' | 'localStorage' | 'none' = 'none';

  private constructor() {
    this.initializeStorage();
  }

  static getInstance(): FallbackStorage {
    if (!FallbackStorage.instance) {
      FallbackStorage.instance = new FallbackStorage();
    }
    return FallbackStorage.instance;
  }

  private initializeStorage() {
    try {
      // Try to load from localStorage if available (client-side)
      if (isClient && window.localStorage) {
        const stored = localStorage.getItem('redai_projects_fallback');
        if (stored) {
          this.projects = JSON.parse(stored).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
          this.storageType = 'localStorage';
          console.log('🔄 Fallback storage: Using localStorage with', this.projects.length, 'projects');
          return;
        }
      }

      // Fallback to memory storage
      this.projects = memoryStorage;
      this.storageType = 'memory';
      console.log('🔄 Fallback storage: Using memory storage');
      
      if (!storageWarningShown) {
        console.warn('⚠️ Using fallback storage - projects will not persist between sessions');
        storageWarningShown = true;
      }
    } catch (error) {
      console.error('❌ Failed to initialize fallback storage:', error);
      this.projects = [];
      this.storageType = 'none';
    }
  }

  async getProjects(): Promise<Project[]> {
    return [...this.projects];
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return this.projects.filter(p => p.userId === userId);
  }

  async getProject(projectId: string): Promise<Project | null> {
    return this.projects.find(p => p.id === projectId) || null;
  }

  async saveProject(project: Project): Promise<Project> {
    try {
      // Check if project already exists
      const existingIndex = this.projects.findIndex(p => p.id === project.id);
      
      if (existingIndex >= 0) {
        // Update existing project
        this.projects[existingIndex] = {
          ...project,
          updatedAt: new Date()
        };
      } else {
        // Add new project
        this.projects.push(project);
      }

      // Persist to localStorage if available
      if (isClient && window.localStorage && this.storageType === 'localStorage') {
        localStorage.setItem('redai_projects_fallback', JSON.stringify(this.projects));
      }

      // Update memory storage
      memoryStorage = this.projects;

      console.log('💾 Fallback storage: Saved project', project.id, 'using', this.storageType);
      return project;
    } catch (error) {
      console.error('❌ Fallback storage save failed:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const initialLength = this.projects.length;
      this.projects = this.projects.filter(p => p.id !== projectId);
      
      if (this.projects.length < initialLength) {
        // Persist to localStorage if available
        if (isClient && window.localStorage && this.storageType === 'localStorage') {
          localStorage.setItem('redai_projects_fallback', JSON.stringify(this.projects));
        }

        // Update memory storage
        memoryStorage = this.projects;

        console.log('🗑️ Fallback storage: Deleted project', projectId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Fallback storage delete failed:', error);
      return false;
    }
  }

  getStorageInfo() {
    return {
      type: this.storageType,
      projectCount: this.projects.length,
      isTemporary: this.storageType === 'memory',
      isPersistent: this.storageType === 'localStorage',
      warning: this.storageType === 'memory' ? 'Projects will be lost on page refresh' : null
    };
  }

  // Method to try upgrading storage when file system becomes available
  async tryUpgrade(): Promise<boolean> {
    if (this.storageType === 'file') return true;

    try {
      // This would be called when file system becomes available
      // For now, just log the attempt
      console.log('🔄 Attempting to upgrade from fallback storage...');
      return false;
    } catch {
      return false;
    }
  }

  // Export projects for manual backup
  exportProjects(): string {
    return JSON.stringify(this.projects, null, 2);
  }

  // Import projects from backup
  async importProjects(projectsJson: string): Promise<number> {
    try {
      const imported = JSON.parse(projectsJson);
      const validProjects = imported.filter((p: any) => p.id && p.name);
      
      // Merge with existing projects (avoid duplicates)
      const existingIds = new Set(this.projects.map(p => p.id));
      const newProjects = validProjects.filter((p: any) => !existingIds.has(p.id));
      
      this.projects.push(...newProjects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })));

      // Persist changes
      if (isClient && window.localStorage && this.storageType === 'localStorage') {
        localStorage.setItem('redai_projects_fallback', JSON.stringify(this.projects));
      }
      memoryStorage = this.projects;

      console.log('📥 Imported', newProjects.length, 'new projects to fallback storage');
      return newProjects.length;
    } catch (error) {
      console.error('❌ Failed to import projects:', error);
      throw error;
    }
  }

  // Clear all data (for testing or reset)
  async clear(): Promise<void> {
    this.projects = [];
    memoryStorage = [];
    
    if (isClient && window.localStorage && this.storageType === 'localStorage') {
      localStorage.removeItem('redai_projects_fallback');
    }
    
    console.log('🧹 Fallback storage cleared');
  }
} 