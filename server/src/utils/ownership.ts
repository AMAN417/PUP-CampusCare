import type { Complaint, User } from '../types/index.js';

/**
 * Checks whether a given complaint belongs to the specified student user.
 * Supports exact user.id matching as well as the demo account aliases.
 */
export const isStudentComplaintOwner = (
  complaint: Complaint | { studentId: string; studentName?: string },
  user: User | { id?: string; name?: string; email?: string; role?: string }
): boolean => {
  if (!user || !complaint) return false;

  // Direct user ID match
  if (user.id && complaint.studentId === user.id) {
    return true;
  }

  // Handle seed demo student match (harman.student@demo.pup.ac.in <-> user-student-1)
  if (
    user.email === 'harman.student@demo.pup.ac.in' &&
    (complaint.studentId === 'user-student-1' || complaint.studentName === user.name)
  ) {
    return true;
  }

  return false;
};
