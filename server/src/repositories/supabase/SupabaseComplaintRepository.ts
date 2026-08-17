import {
  IComplaintRepository,
  ComplaintFilterOptions,
  CreateComplaintDto,
  PatchComplaintDto,
  UpdateStatusDto,
  AddCommentDto,
} from '../interfaces.js';
import {
  Complaint,
  Comment,
  ComplaintCategory,
  ComplaintStatus,
  Priority,
  UserRole,
} from '../../types/index.js';
import { getSupabaseClient } from '../../database/supabaseClient.js';

interface DbComplaintRow {
  id: string; // UUID primary key
  complaint_id: string; // PUP-2026-XXXX human-readable tracking ID
  title: string;
  description: string;
  category: string;
  location: string;
  priority: string;
  status: string;
  student_id: string;
  student_name: string;
  student_roll_no?: string | null;
  student_department?: string | null;
  assigned_to?: string | null;
  assigned_department?: string | null;
  is_escalated: boolean;
  resolved_at?: string | null;
  attachments: any;
  created_at: string;
  updated_at: string;
}

interface DbHistoryRow {
  id: string;
  complaint_uuid: string;
  status: string;
  updated_by: string;
  role: string;
  notes?: string | null;
  department?: string | null;
  timestamp: string;
}

interface DbCommentRow {
  id: string;
  complaint_uuid: string;
  user_id: string;
  user_name: string;
  user_role: string;
  message: string;
  is_internal: boolean;
  avatar?: string | null;
  timestamp: string;
}

export class SupabaseComplaintRepository implements IComplaintRepository {
  private mapRowToModel(
    row: DbComplaintRow,
    history: DbHistoryRow[] = [],
    comments: DbCommentRow[] = []
  ): Complaint {
    return {
      id: row.complaint_id, // Expose human-readable PUP-2026-XXXX
      title: row.title,
      description: row.description,
      category: row.category as ComplaintCategory,
      location: row.location,
      priority: row.priority as Priority,
      status: row.status as ComplaintStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      studentId: row.student_id,
      studentName: row.student_name,
      studentRollNo: row.student_roll_no || undefined,
      studentDepartment: row.student_department || undefined,
      assignedTo: row.assigned_to || undefined,
      assignedDepartment: row.assigned_department || undefined,
      isEscalated: Boolean(row.is_escalated),
      resolvedAt: row.resolved_at || undefined,
      attachments: Array.isArray(row.attachments) ? row.attachments : [],
      statusHistory: history.map((h) => ({
        id: h.id,
        status: h.status as ComplaintStatus,
        timestamp: h.timestamp,
        updatedBy: h.updated_by,
        role: h.role as UserRole,
        notes: h.notes || undefined,
        department: h.department || undefined,
      })),
      comments: comments.map((c) => ({
        id: c.id,
        complaintId: row.complaint_id,
        userId: c.user_id,
        userName: c.user_name,
        userRole: c.user_role as UserRole,
        message: c.message,
        timestamp: c.timestamp,
        isInternal: c.is_internal,
        avatar: c.avatar || undefined,
      })),
    };
  }

  private async findComplaintRecord(
    idOrCode: string
  ): Promise<DbComplaintRow | null> {
    const supabase = getSupabaseClient();
    const clean = idOrCode.trim();

    // Check by complaint_id (e.g. PUP-2026-0101)
    const { data: byCode, error: err1 } = await supabase
      .from('complaints')
      .select('*')
      .ilike('complaint_id', clean)
      .maybeSingle();

    if (byCode && !err1) return byCode as DbComplaintRow;

    // Check if clean is UUID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        clean
      );
    if (isUuid) {
      const { data: byUuid, error: err2 } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', clean)
        .maybeSingle();

      if (byUuid && !err2) return byUuid as DbComplaintRow;
    }

    return null;
  }

  public async getAll(
    filters: ComplaintFilterOptions = {}
  ): Promise<Complaint[]> {
    const supabase = getSupabaseClient();
    let query = supabase.from('complaints').select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }
    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim();
      query = query.or(
        `title.ilike.%${s}%,description.ilike.%${s}%,complaint_id.ilike.%${s}%,location.ilike.%${s}%,student_name.ilike.%${s}%,student_roll_no.ilike.%${s}%`
      );
    }

    const { data: complaints, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to fetch complaints: ${error.message}`);
    }

    if (!complaints || complaints.length === 0) {
      return [];
    }

    const complaintUuids = complaints.map((c) => c.id);

    // Fetch history
    const { data: allHistory } = await supabase
      .from('complaint_status_history')
      .select('*')
      .in('complaint_uuid', complaintUuids)
      .order('timestamp', { ascending: true });

    // Fetch comments
    const { data: allComments } = await supabase
      .from('comments')
      .select('*')
      .in('complaint_uuid', complaintUuids)
      .order('timestamp', { ascending: true });

    const historyByUuid = new Map<string, DbHistoryRow[]>();
    for (const h of (allHistory || []) as DbHistoryRow[]) {
      const list = historyByUuid.get(h.complaint_uuid) || [];
      list.push(h);
      historyByUuid.set(h.complaint_uuid, list);
    }

    const commentsByUuid = new Map<string, DbCommentRow[]>();
    for (const c of (allComments || []) as DbCommentRow[]) {
      const list = commentsByUuid.get(c.complaint_uuid) || [];
      list.push(c);
      commentsByUuid.set(c.complaint_uuid, list);
    }

    return complaints.map((c) =>
      this.mapRowToModel(
        c as DbComplaintRow,
        historyByUuid.get(c.id) || [],
        commentsByUuid.get(c.id) || []
      )
    );
  }

  public async getById(id: string): Promise<Complaint | null> {
    const row = await this.findComplaintRecord(id);
    if (!row) return null;

    const supabase = getSupabaseClient();
    const { data: history } = await supabase
      .from('complaint_status_history')
      .select('*')
      .eq('complaint_uuid', row.id)
      .order('timestamp', { ascending: true });

    const { data: comments } = await supabase
      .from('comments')
      .select('*')
      .eq('complaint_uuid', row.id)
      .order('timestamp', { ascending: true });

    return this.mapRowToModel(
      row,
      (history || []) as DbHistoryRow[],
      (comments || []) as DbCommentRow[]
    );
  }

  public async create(data: CreateComplaintDto): Promise<Complaint> {
    const supabase = getSupabaseClient();
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `PUP-${year}-${randomSeq}`;
    const now = new Date().toISOString();

    const insertPayload = {
      complaint_id: complaintId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      location: data.location.trim(),
      priority: data.priority,
      status: 'Submitted',
      student_id: data.studentId || 'user-student-1',
      student_name: data.studentName || 'Harmanpreet Singh',
      student_roll_no: data.studentRollNo || 'PUP2024-CS-042',
      student_department:
        data.studentDepartment ||
        'Department of Computer Science & Engineering',
      attachments: data.attachments || [],
      created_at: now,
      updated_at: now,
    };

    const { data: inserted, error } = await supabase
      .from('complaints')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(`Failed to create complaint in Supabase: ${error?.message}`);
    }

    const historyPayload = {
      complaint_uuid: inserted.id,
      status: 'Submitted',
      updated_by: data.studentName || 'Student (Harmanpreet Singh)',
      role: 'student',
      notes:
        'Initial issue reported through Punjabi University Patiala CampusCare portal.',
      timestamp: now,
      created_at: now,
    };

    const { data: insertedHistory, error: histError } = await supabase
      .from('complaint_status_history')
      .insert(historyPayload)
      .select()
      .single();

    if (histError) {
      console.warn('Warning: Failed to insert initial history:', histError.message);
    }

    return this.mapRowToModel(
      inserted as DbComplaintRow,
      insertedHistory ? [insertedHistory as DbHistoryRow] : [],
      []
    );
  }

  public async patch(
    id: string,
    data: PatchComplaintDto
  ): Promise<Complaint | null> {
    const supabase = getSupabaseClient();
    const record = await this.findComplaintRecord(id);
    if (!record) return null;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Admin-only fields
    if (data.assignedDepartment !== undefined) {
      updates.assigned_department = data.assignedDepartment;
    }
    if (data.assignedTo !== undefined) {
      updates.assigned_to = data.assignedTo;
    }
    if (data.isEscalated !== undefined) {
      updates.is_escalated = data.isEscalated;
    }

    // Shared fields (student or admin)
    if (data.priority !== undefined) {
      updates.priority = data.priority;
    }
    if (data.title !== undefined) {
      updates.title = data.title.trim();
    }
    if (data.description !== undefined) {
      updates.description = data.description.trim();
    }
    if (data.category !== undefined) {
      updates.category = data.category;
    }
    if (data.location !== undefined) {
      updates.location = data.location.trim();
    }

    const { data: updated, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', record.id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to patch complaint: ${error?.message}`);
    }

    return this.getById(updated.complaint_id);
  }

  public async delete(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const record = await this.findComplaintRecord(id);
    if (!record) return false;

    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', record.id);

    if (error) {
      throw new Error(`Failed to delete complaint: ${error.message}`);
    }

    return true;
  }

  public async updateStatus(
    id: string,
    data: UpdateStatusDto
  ): Promise<Complaint | null> {
    const supabase = getSupabaseClient();
    const record = await this.findComplaintRecord(id);
    if (!record) return null;

    const now = new Date().toISOString();
    const updates: Record<string, any> = {
      status: data.status,
      updated_at: now,
    };

    if (data.status === 'Resolved' || data.status === 'Closed') {
      updates.resolved_at = now;
    }

    if (data.department) {
      updates.assigned_department = data.department;
    }

    const { data: updated, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', record.id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update complaint status: ${error?.message}`);
    }

    const historyPayload = {
      complaint_uuid: record.id,
      status: data.status,
      updated_by: data.updatedBy || 'Campus Administrator',
      role: data.role || 'admin',
      notes: data.notes || `Status updated to ${data.status}`,
      department: data.department || record.assigned_department,
      timestamp: now,
      created_at: now,
    };

    await supabase.from('complaint_status_history').insert(historyPayload);

    return this.getById(updated.complaint_id);
  }

  public async addComment(
    id: string,
    data: AddCommentDto
  ): Promise<{ comment: Comment; complaint: Complaint } | null> {
    const supabase = getSupabaseClient();
    const record = await this.findComplaintRecord(id);
    if (!record) return null;

    const now = new Date().toISOString();
    const commentPayload = {
      complaint_uuid: record.id,
      user_id: data.userId || 'user-student-1',
      user_name: data.userName || 'Harmanpreet Singh',
      user_role: data.userRole || 'student',
      message: data.message.trim(),
      is_internal: Boolean(data.isInternal),
      avatar: data.avatar || null,
      timestamp: now,
      created_at: now,
    };

    const { data: insertedComment, error } = await supabase
      .from('comments')
      .insert(commentPayload)
      .select()
      .single();

    if (error || !insertedComment) {
      throw new Error(`Failed to insert comment: ${error?.message}`);
    }

    // Touch complaint updated_at
    await supabase
      .from('complaints')
      .update({ updated_at: now })
      .eq('id', record.id);

    const updatedComplaint = await this.getById(record.complaint_id);

    const commentModel: Comment = {
      id: insertedComment.id,
      complaintId: record.complaint_id,
      userId: insertedComment.user_id,
      userName: insertedComment.user_name,
      userRole: insertedComment.user_role as UserRole,
      message: insertedComment.message,
      timestamp: insertedComment.timestamp,
      isInternal: insertedComment.is_internal,
      avatar: insertedComment.avatar || undefined,
    };

    return {
      comment: commentModel,
      complaint: updatedComplaint!,
    };
  }
}
