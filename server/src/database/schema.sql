-- ==============================================================================
-- PUP CampusCare - Supabase PostgreSQL Database Schema
-- Product: PUP CampusCare ("Report. Track. Resolve.")
-- Phase 2B: Database Integration Schema & Seed Data
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  lead_officer TEXT NOT NULL,
  active_complaints INT NOT NULL DEFAULT 0,
  resolved_complaints INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'faculty')),
  roll_no TEXT,
  department TEXT NOT NULL,
  hostel TEXT,
  phone TEXT,
  avatar TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 3. COMPLAINTS TABLE
-- Uses UUID primary key 'id' and human-readable complaint_id (PUP-2026-XXXX)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Hostel', 'Classroom', 'Electricity', 'Water', 'Sanitation',
    'Internet', 'Transportation', 'Infrastructure', 'Security', 'Other'
  )),
  location TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN (
    'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'
  )),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_roll_no TEXT,
  student_department TEXT,
  assigned_to TEXT,
  assigned_department TEXT,
  is_escalated BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. COMPLAINT STATUS HISTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_uuid UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN (
    'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'
  )),
  updated_by TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'faculty')),
  notes TEXT,
  department TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_complaint ON complaint_status_history(complaint_uuid);
CREATE INDEX IF NOT EXISTS idx_status_history_timestamp ON complaint_status_history(timestamp ASC);

-- ------------------------------------------------------------------------------
-- 5. COMMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_uuid UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('student', 'admin', 'faculty')),
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  avatar TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_complaint ON comments(complaint_uuid);
CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp ASC);

-- ------------------------------------------------------------------------------
-- 6. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('status_change', 'assignment', 'comment', 'urgent', 'general')),
  complaint_id TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ------------------------------------------------------------------------------
-- TABLE PERMISSIONS & ROW LEVEL SECURITY (Permissive for REST / Backend API)
-- ------------------------------------------------------------------------------
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON departments TO anon, authenticated, service_role;
GRANT ALL ON users TO anon, authenticated, service_role;
GRANT ALL ON complaints TO anon, authenticated, service_role;
GRANT ALL ON complaint_status_history TO anon, authenticated, service_role;
GRANT ALL ON comments TO anon, authenticated, service_role;
GRANT ALL ON notifications TO anon, authenticated, service_role;

-- ==============================================================================
-- DEMO SEED DATA (Fictional Punjabi University Patiala Campus Records)
-- ==============================================================================

-- Seed Departments
INSERT INTO departments (code, name, contact_email, lead_officer, active_complaints, resolved_complaints)
VALUES
  ('EIM', 'Estate & Infrastructure Management', 'estate.demo@pup.ac.in', 'Er. Davinder Singh', 8, 142),
  ('EEW', 'Electrical Engineering Wing', 'electrical.demo@pup.ac.in', 'S. Subhash Chander', 5, 98),
  ('WSPH', 'Water Supply & Public Health', 'sanitation.demo@pup.ac.in', 'Er. Gurpreet Singh', 4, 86),
  ('UCC', 'University Computer Center & IT', 'itcenter.demo@pup.ac.in', 'Er. Manpreet Kaur', 6, 115),
  ('HAO', 'Hostel Administration Office', 'hostels.demo@pup.ac.in', 'Dr. Paramjit Sharma', 7, 130),
  ('CSV', 'Campus Security & Vigilance', 'security.demo@pup.ac.in', 'Insp. Jaswant Singh', 2, 45),
  ('UTS', 'University Transport Section', 'transport.demo@pup.ac.in', 'S. Baljit Singh', 3, 39)
ON CONFLICT (code) DO NOTHING;

-- Seed Demo Users
INSERT INTO users (name, email, role, roll_no, department, hostel, phone, status)
VALUES
  ('Harmanpreet Singh', 'harman.student@demo.pup.ac.in', 'student', 'PUP2024-CS-042', 'Department of Computer Science & Engineering', 'Banda Singh Bahadur Hostel (Block A, Room 304)', '+91 98765 43210', 'Active'),
  ('Dr. Rajinder Kumar', 'rajinder.admin@demo.pup.ac.in', 'admin', NULL, 'Estate & Infrastructure Management Office', NULL, '+91 175 3046123', 'Active'),
  ('Dr. Simranjeet Kaur', 'simran.faculty@demo.pup.ac.in', 'faculty', NULL, 'Department of Electronics & Communication', NULL, '+91 98140 12345', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Seed Initial Complaints & History
DO $$
DECLARE
  v_complaint_id UUID;
BEGIN
  -- 1. Complaint PUP-2026-0101
  IF NOT EXISTS (SELECT 1 FROM complaints WHERE complaint_id = 'PUP-2026-0101') THEN
    INSERT INTO complaints (
      complaint_id, title, description, category, location, priority, status,
      student_id, student_name, student_roll_no, student_department,
      assigned_to, assigned_department, created_at, updated_at
    ) VALUES (
      'PUP-2026-0101',
      'Ceiling Fan Regulator Damaged & Sparks Emitting in Room 304',
      'The speed regulator for the ceiling fan in Hostel Block A, Room 304 is completely broken and emits slight electrical spark when turned on. Need urgent replacement to prevent electrical short circuit hazard.',
      'Electricity',
      'Banda Singh Bahadur Hostel - Block A, Room 304',
      'High',
      'In Progress',
      'user-student-1',
      'Harmanpreet Singh',
      'PUP2024-CS-042',
      'Department of Computer Science & Engineering',
      'S. Subhash Chander',
      'Electrical Engineering Wing',
      NOW() - INTERVAL '2 days',
      NOW() - INTERVAL '1 day'
    ) RETURNING id INTO v_complaint_id;

    -- History for PUP-2026-0101
    INSERT INTO complaint_status_history (complaint_uuid, status, updated_by, role, notes, timestamp)
    VALUES
      (v_complaint_id, 'Submitted', 'Harmanpreet Singh', 'student', 'Complaint filed with photographic evidence.', NOW() - INTERVAL '2 days'),
      (v_complaint_id, 'Under Review', 'Estate Admin Desk', 'admin', 'Triaged by maintenance helpdesk. High priority safety inspection scheduled.', NOW() - INTERVAL '44 hours'),
      (v_complaint_id, 'Assigned', 'Dr. Rajinder Kumar', 'admin', 'Assigned to Electrical Engineering Wing for physical visit.', NOW() - INTERVAL '40 hours'),
      (v_complaint_id, 'In Progress', 'S. Subhash Chander', 'admin', 'Electrician dispatched with spare modular regulator.', NOW() - INTERVAL '1 day');

    -- Comments for PUP-2026-0101
    INSERT INTO comments (complaint_uuid, user_id, user_name, user_role, message, timestamp)
    VALUES
      (v_complaint_id, 'user-student-1', 'Harmanpreet Singh', 'student', 'Please resolve before evening study hours as fan cannot be switched off safely.', NOW() - INTERVAL '47 hours'),
      (v_complaint_id, 'user-admin-1', 'S. Subhash Chander (EEW)', 'admin', 'Technician Jasbir has been allocated work order #EE-412. ETA 2:30 PM today.', NOW() - INTERVAL '1 day');
  END IF;

  -- 2. Complaint PUP-2026-0102
  IF NOT EXISTS (SELECT 1 FROM complaints WHERE complaint_id = 'PUP-2026-0102') THEN
    INSERT INTO complaints (
      complaint_id, title, description, category, location, priority, status,
      student_id, student_name, student_roll_no, student_department,
      assigned_to, assigned_department, created_at, updated_at
    ) VALUES (
      'PUP-2026-0102',
      'Low Water Pressure and Broken Tap on 2nd Floor Washroom',
      'The faucet in the 2nd floor common washroom is continuously leaking and water pressure across the corridor washbasins is negligible since yesterday.',
      'Water',
      'Mai Bhago Girls Hostel - Block B, 2nd Floor Washroom',
      'Medium',
      'Assigned',
      'user-student-2',
      'Navjot Kaur',
      'PUP2024-EC-018',
      'Department of Electronics',
      'Er. Gurpreet Singh',
      'Water Supply & Public Health',
      NOW() - INTERVAL '2 days',
      NOW() - INTERVAL '1 day'
    ) RETURNING id INTO v_complaint_id;

    INSERT INTO complaint_status_history (complaint_uuid, status, updated_by, role, timestamp)
    VALUES
      (v_complaint_id, 'Submitted', 'Navjot Kaur', 'student', NOW() - INTERVAL '2 days'),
      (v_complaint_id, 'Under Review', 'Helpdesk Admin', 'admin', NOW() - INTERVAL '40 hours'),
      (v_complaint_id, 'Assigned', 'Dr. Rajinder Kumar', 'admin', NOW() - INTERVAL '1 day');
  END IF;

  -- 3. Complaint PUP-2026-0103
  IF NOT EXISTS (SELECT 1 FROM complaints WHERE complaint_id = 'PUP-2026-0103') THEN
    INSERT INTO complaints (
      complaint_id, title, description, category, location, priority, status,
      student_id, student_name, student_roll_no, student_department,
      created_at, updated_at
    ) VALUES (
      'PUP-2026-0103',
      'Wi-Fi Access Point Dropping Connections in CSE Lab 302',
      'Students are experiencing severe packet drops and authentication disconnects on the university campus Wi-Fi access point installed near Lab 302.',
      'Internet',
      'Department of Computer Science - Lab 302',
      'High',
      'Under Review',
      'user-student-1',
      'Harmanpreet Singh',
      'PUP2024-CS-042',
      'Department of Computer Science & Engineering',
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '22 hours'
    ) RETURNING id INTO v_complaint_id;

    INSERT INTO complaint_status_history (complaint_uuid, status, updated_by, role, notes, timestamp)
    VALUES
      (v_complaint_id, 'Submitted', 'Harmanpreet Singh', 'student', 'Reported via student portal.', NOW() - INTERVAL '1 day'),
      (v_complaint_id, 'Under Review', 'Network Admin', 'admin', 'UCC network team checking gateway telemetry.', NOW() - INTERVAL '22 hours');
  END IF;

  -- 4. Complaint PUP-2026-0104
  IF NOT EXISTS (SELECT 1 FROM complaints WHERE complaint_id = 'PUP-2026-0104') THEN
    INSERT INTO complaints (
      complaint_id, title, description, category, location, priority, status,
      student_id, student_name, student_roll_no, student_department,
      assigned_to, assigned_department, resolved_at, created_at, updated_at
    ) VALUES (
      'PUP-2026-0104',
      'Broken Projector HDMI Port in Classroom 104',
      'The overhead projector in lecture hall 104 has a damaged HDMI female port. Faculty unable to connect laptops for morning lectures.',
      'Classroom',
      'Arts Faculty Building - Ground Floor, Room 104',
      'Medium',
      'Resolved',
      'user-student-3',
      'Gurleen Kaur',
      'PUP2023-AR-009',
      'Department of Punjabi',
      'Er. Manpreet Kaur',
      'University Computer Center & IT',
      NOW() - INTERVAL '3 days',
      NOW() - INTERVAL '4 days',
      NOW() - INTERVAL '3 days'
    ) RETURNING id INTO v_complaint_id;

    INSERT INTO complaint_status_history (complaint_uuid, status, updated_by, role, notes, timestamp)
    VALUES
      (v_complaint_id, 'Submitted', 'Gurleen Kaur', 'student', 'Classroom issue logged.', NOW() - INTERVAL '4 days'),
      (v_complaint_id, 'In Progress', 'Er. Manpreet Kaur', 'admin', 'Replacement parts requisitioned.', NOW() - INTERVAL '70 hours'),
      (v_complaint_id, 'Resolved', 'Er. Manpreet Kaur', 'admin', 'Replaced wall-mount HDMI converter plate and tested display output.', NOW() - INTERVAL '3 days');

    INSERT INTO comments (complaint_uuid, user_id, user_name, user_role, message, timestamp)
    VALUES
      (v_complaint_id, 'user-admin-1', 'Er. Manpreet Kaur', 'admin', 'Fixed and verified with department lab assistant.', NOW() - INTERVAL '3 days');
  END IF;

  -- 5. Complaint PUP-2026-0105
  IF NOT EXISTS (SELECT 1 FROM complaints WHERE complaint_id = 'PUP-2026-0105') THEN
    INSERT INTO complaints (
      complaint_id, title, description, category, location, priority, status,
      student_id, student_name, student_roll_no, student_department,
      created_at, updated_at
    ) VALUES (
      'PUP-2026-0105',
      'Street Lamp Defective Near Gate 2 Library Pathway',
      'The solar LED pathway pole light near the library rear entrance is flickering continuously and turns off completely after midnight, causing dark safety hazard.',
      'Security',
      'Bhai Kahn Singh Nabha Library - Gate 2 Pathway',
      'Urgent',
      'Submitted',
      'user-student-1',
      'Harmanpreet Singh',
      'PUP2024-CS-042',
      'Department of Computer Science & Engineering',
      NOW() - INTERVAL '6 hours',
      NOW() - INTERVAL '6 hours'
    ) RETURNING id INTO v_complaint_id;

    INSERT INTO complaint_status_history (complaint_uuid, status, updated_by, role, notes, timestamp)
    VALUES
      (v_complaint_id, 'Submitted', 'Harmanpreet Singh', 'student', 'Reported for campus night security attention.', NOW() - INTERVAL '6 hours');
  END IF;
END $$;

-- Seed Notifications
INSERT INTO notifications (user_id, title, message, type, complaint_id, read, created_at)
VALUES
  ('all', 'Complaint Status Updated', 'Complaint PUP-2026-0101 has been moved to In Progress by Electrical Engineering Wing.', 'status_change', 'PUP-2026-0101', false, NOW() - INTERVAL '1 day'),
  ('user-student-1', 'Officer Assigned', 'S. Subhash Chander was assigned to your electricity complaint PUP-2026-0101.', 'assignment', 'PUP-2026-0101', false, NOW() - INTERVAL '2 days'),
  ('all', 'Campus Notice', 'Scheduled maintenance for campus water overhead tank on Sunday 8:00 AM - 12:00 PM.', 'general', NULL, true, NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;
