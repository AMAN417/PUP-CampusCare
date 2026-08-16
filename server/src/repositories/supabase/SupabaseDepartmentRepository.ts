import { IDepartmentRepository } from '../interfaces.js';
import { Department } from '../../types/index.js';
import { getSupabaseClient } from '../../database/supabaseClient.js';

interface DbDepartmentRow {
  id: string; // UUID
  code: string;
  name: string;
  contact_email: string;
  lead_officer: string;
  active_complaints: number;
  resolved_complaints: number;
  created_at: string;
  updated_at: string;
}

export class SupabaseDepartmentRepository implements IDepartmentRepository {
  private mapRowToModel(row: DbDepartmentRow): Department {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      contactEmail: row.contact_email,
      leadOfficer: row.lead_officer,
      activeComplaints: row.active_complaints ?? 0,
      resolvedComplaints: row.resolved_complaints ?? 0,
    };
  }

  public async getAll(): Promise<Department[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('departments').select('*').order('name');
    if (error) {
      throw new Error(`Failed to fetch departments from Supabase: ${error.message}`);
    }
    return (data || []).map((row) => this.mapRowToModel(row as DbDepartmentRow));
  }

  public async getById(id: string): Promise<Department | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToModel(data as DbDepartmentRow);
  }

  public async getByCode(code: string): Promise<Department | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .ilike('code', code.trim())
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToModel(data as DbDepartmentRow);
  }

  public async create(department: Partial<Department>): Promise<Department> {
    const supabase = getSupabaseClient();
    const insertPayload = {
      code: (department.code || 'DEPT').toUpperCase(),
      name: department.name || 'Unnamed Department',
      contact_email: department.contactEmail || 'dept@pup.ac.in',
      lead_officer: department.leadOfficer || 'Department Officer',
      active_complaints: department.activeComplaints || 0,
      resolved_complaints: department.resolvedComplaints || 0,
    };

    const { data, error } = await supabase
      .from('departments')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create department in Supabase: ${error?.message}`);
    }

    return this.mapRowToModel(data as DbDepartmentRow);
  }
}
