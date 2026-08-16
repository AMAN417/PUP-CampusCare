import {
  INotificationRepository,
  CreateNotificationDto,
} from '../interfaces.js';
import { Notification } from '../../types/index.js';
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

  public async getAll(userId?: string): Promise<Notification[]> {
    const supabase = getSupabaseClient();
    let query = supabase.from('notifications').select('*');

    if (userId && userId !== 'all') {
      query = query.or(`user_id.eq.${userId},user_id.eq.all`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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
}
