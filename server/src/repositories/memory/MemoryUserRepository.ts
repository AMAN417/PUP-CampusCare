import { IUserRepository } from '../interfaces.js';
import { User } from '../../types/index.js';
import { INITIAL_USERS } from '../../data/initialData.js';

export class MemoryUserRepository implements IUserRepository {
  private users: User[] = JSON.parse(JSON.stringify(INITIAL_USERS));

  public async getAll(): Promise<User[]> {
    return JSON.parse(JSON.stringify(this.users));
  }

  public async getById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }

  public async getByEmail(email: string): Promise<User | null> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }

  public async create(userData: Partial<User>): Promise<User> {
    const newUser: User = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name || 'Anonymous User',
      email: userData.email || '',
      role: userData.role || 'student',
      gender: userData.gender,
      department: userData.department || 'General',
      rollNo: userData.rollNo,
      hostel: userData.hostel,
      phone: userData.phone,
      avatar: userData.avatar,
      joinedDate: userData.joinedDate || new Date().toISOString().split('T')[0],
      status: userData.status || 'Active',
    };

    this.users.push(newUser);
    return JSON.parse(JSON.stringify(newUser));
  }

  public async upsert(userData: Partial<User>): Promise<User> {
    const existingIndex = this.users.findIndex(
      (u) =>
        (userData.id && u.id === userData.id) ||
        (userData.email && u.email.toLowerCase() === userData.email.toLowerCase())
    );

    if (existingIndex >= 0) {
      const updated = {
        ...this.users[existingIndex],
        ...userData,
      };
      this.users[existingIndex] = updated as User;
      return JSON.parse(JSON.stringify(updated));
    }

    return this.create(userData);
  }
}
