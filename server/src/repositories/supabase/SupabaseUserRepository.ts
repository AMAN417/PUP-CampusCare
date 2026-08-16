import { IUserRepository } from '../interfaces.js';
import { User, UserRole } from '../../types/index.js';
import { getSupabaseClient } from '../../database/supabaseClient.js';

interface DbUserRow {
  id: string; // UUID
  name: string;
  email: string;
  role: string;
  roll_no?: string | null;
  department: string;
  hostel?: string | null;
  phone?: string | null;
  avatar?: string | null;
  status: string;
  joined_date: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseUserRepository implements IUserRepository {
  private mapRowToModel(row: DbUserRow): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as UserRole,
      rollNo: row.roll_no || undefined,
      department: row.department,
      hostel: row.hostel || undefined,
      phone: row.phone || undefined,
      avatar: row.avatar || undefined,
      status: row.status as 'Active' | 'Inactive',
      joinedDate: row.joined_date,
    };
  }

  public async getAll(): Promise<User[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) {
      throw new Error(`Failed to fetch users from Supabase: ${error.message}`);
    }
    return (data || []).map((row) => this.mapRowToModel(row as DbUserRow));
  }

  public async getById(id: string): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToModel(data as DbUserRow);
  }

  public async getByEmail(email: string): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToModel(data as DbUserRow);
  }

  public async create(user: Partial<User>): Promise<User> {
    const supabase = getSupabaseClient();
    const insertPayload = {
      name: user.name || 'Anonymous User',
      email: user.email || '',
      role: user.role || 'student',
      roll_no: user.rollNo || null,
      department: user.department || 'General',
      hostel: user.hostel || null,
      phone: user.phone || null,
      avatar: user.avatar || null,
      status: user.status || 'Active',
      joined_date: user.joinedDate || new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('users')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create user in Supabase: ${error?.message}`);
    }

    return this.mapRowToModel(data as DbUserRow);
  }
}
