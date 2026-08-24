import {
  INotificationRepository,
  CreateNotificationDto,
} from '../interfaces.js';
import { Notification, User } from '../../types/index.js';
import { getSupabaseClient } from '../../database/supabaseClient.js';

interface DbNotificationRow {
  id: string; // UUID
  user_id: string;
  title: string;
  message: string;
  type: string;
  complaint_id?: string | null;
  read: boolean;
  created_at: string;
}

export class SupabaseNotificationRepository implements INotificationRepository {
  private mapRowToModel(row: DbNotificationRow): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type as any,
      complaintId: row.complaint_id || undefined,
      read: Boolean(row.read),
      createdAt: row.created_at,
    };
  }

  public async getById(id: string): Promise<Notification | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRowToModel(data as DbNotificationRow);
  }

  public async getAll(userOrId?: User | string): Promise<Notification[]> {
    const supabase = getSupabaseClient();

    // If no user specified or admin requested, return all notifications
    if (!userOrId || userOrId === 'all') {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch notifications from Supabase: ${error.message}`);
      }

      return (data || []).map((row) => this.mapRowToModel(row as DbNotificationRow));
    }

    if (typeof userOrId === 'object' && userOrId !== null) {
      if (userOrId.role === 'admin') {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch notifications from Supabase: ${error.message}`);
        }

        return (data || []).map((row) => this.mapRowToModel(row as DbNotificationRow));
      }

      // For students: strictly isolate notifications by complaints owned by the student
      if (userOrId.role === 'student') {
        let complaintQuery = supabase
          .from('complaints')
          .select('id, complaint_id');

        if (userOrId.email === 'harman.student@demo.pup.ac.in') {
          complaintQuery = complaintQuery.or(
            `student_id.eq.${userOrId.id},student_id.eq.user-student-1,student_name.eq.${userOrId.name}`
          );
        } else {
          complaintQuery = complaintQuery.eq('student_id', userOrId.id);
        }

        const { data: studentComplaints, error: cError } = await complaintQuery;
        if (cError) {
          throw new Error(`Failed to fetch student complaints: ${cError.message}`);
        }

        if (!studentComplaints || studentComplaints.length === 0) {
          return [];
        }

        const complaintIdentifiers = new Set<string>();
        for (const sc of studentComplaints) {
          if (sc.complaint_id) complaintIdentifiers.add(sc.complaint_id);
          if (sc.id) complaintIdentifiers.add(sc.id);
        }

        const idList = Array.from(complaintIdentifiers);
        if (idList.length === 0) return [];

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .in('complaint_id', idList)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch notifications from Supabase: ${error.message}`);
        }

        return (data || []).map((row) => this.mapRowToModel(row as DbNotificationRow));
      }
    }

    // String userId passed
    let complaintQuery = supabase
      .from('complaints')
      .select('id, complaint_id');

    if (userOrId === 'user-student-1') {
      complaintQuery = complaintQuery.or(`student_id.eq.${userOrId},student_id.eq.user-student-1`);
    } else {
      complaintQuery = complaintQuery.eq('student_id', userOrId);
    }

    const { data: studentComplaints, error: cError } = await complaintQuery;
    if (cError) {
      throw new Error(`Failed to fetch student complaints: ${cError.message}`);
    }

    if (!studentComplaints || studentComplaints.length === 0) {
      return [];
    }

    const complaintIdentifiers = new Set<string>();
    for (const sc of studentComplaints) {
      if (sc.complaint_id) complaintIdentifiers.add(sc.complaint_id);
      if (sc.id) complaintIdentifiers.add(sc.id);
    }

    const idList = Array.from(complaintIdentifiers);
    if (idList.length === 0) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .in('complaint_id', idList)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch notifications from Supabase: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToModel(row as DbNotificationRow));
  }

  public async create(data: CreateNotificationDto): Promise<Notification> {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();

    const insertPayload = {
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      complaint_id: data.complaintId || null,
      read: false,
      created_at: now,
    };

    const { data: inserted, error } = await supabase
      .from('notifications')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(`Failed to create notification in Supabase: ${error?.message}`);
    }

    return this.mapRowToModel(inserted as DbNotificationRow);
  }

  public async markAsRead(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    return !error;
  }

  public async deleteByComplaint(complaintIds: string[]): Promise<boolean> {
    const identifiers = (complaintIds || [])
      .filter((id) => typeof id === 'string' && id.trim().length > 0)
      .map((id) => id.trim());

    if (identifiers.length === 0) return true;

    const supabase = getSupabaseClient();
    // Notifications may reference either the human-readable complaint_id
    // (PUP-2026-XXXX) or the underlying UUID, so match all provided forms.
    const { error } = await supabase
      .from('notifications')
      .delete()
      .in('complaint_id', identifiers);

    if (error) {
      throw new Error(`Failed to delete notifications for complaint: ${error.message}`);
    }

    return true;
  }
}
