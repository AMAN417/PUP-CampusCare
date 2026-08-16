import { getDataProvider, isSupabaseConfigured } from '../config/environment.js';
import type {
  IComplaintRepository,
  INotificationRepository,
  IUserRepository,
  IDepartmentRepository,
} from './interfaces.js';
import {
  MemoryComplaintRepository,
  MemoryNotificationRepository,
  MemoryUserRepository,
  MemoryDepartmentRepository,
} from './memory/index.js';
import {
  SupabaseComplaintRepository,
  SupabaseNotificationRepository,
  SupabaseUserRepository,
  SupabaseDepartmentRepository,
} from './supabase/index.js';

export type * from './interfaces.js';
export * from './memory/index.js';
export * from './supabase/index.js';

class RepositoryRegistry {
  private complaintRepo: IComplaintRepository | null = null;
  private notificationRepo: INotificationRepository | null = null;
  private userRepo: IUserRepository | null = null;
  private departmentRepo: IDepartmentRepository | null = null;

  public getComplaintRepository(): IComplaintRepository {
    if (!this.complaintRepo) {
      if (getDataProvider() === 'supabase' && isSupabaseConfigured()) {
        this.complaintRepo = new SupabaseComplaintRepository();
      } else {
        this.complaintRepo = new MemoryComplaintRepository();
      }
    }
    return this.complaintRepo;
  }

  public getNotificationRepository(): INotificationRepository {
    if (!this.notificationRepo) {
      if (getDataProvider() === 'supabase' && isSupabaseConfigured()) {
        this.notificationRepo = new SupabaseNotificationRepository();
      } else {
        this.notificationRepo = new MemoryNotificationRepository();
      }
    }
    return this.notificationRepo;
  }

  public getUserRepository(): IUserRepository {
    if (!this.userRepo) {
      if (getDataProvider() === 'supabase' && isSupabaseConfigured()) {
        this.userRepo = new SupabaseUserRepository();
      } else {
        this.userRepo = new MemoryUserRepository();
      }
    }
    return this.userRepo;
  }

  public getDepartmentRepository(): IDepartmentRepository {
    if (!this.departmentRepo) {
      if (getDataProvider() === 'supabase' && isSupabaseConfigured()) {
        this.departmentRepo = new SupabaseDepartmentRepository();
      } else {
        this.departmentRepo = new MemoryDepartmentRepository();
      }
    }
    return this.departmentRepo;
  }

  public resetForTesting(): void {
    this.complaintRepo = null;
    this.notificationRepo = null;
    this.userRepo = null;
    this.departmentRepo = null;
  }
}

export const repositoryRegistry = new RepositoryRegistry();

export const getComplaintRepository = () => repositoryRegistry.getComplaintRepository();
export const getNotificationRepository = () => repositoryRegistry.getNotificationRepository();
export const getUserRepository = () => repositoryRegistry.getUserRepository();
export const getDepartmentRepository = () => repositoryRegistry.getDepartmentRepository();
