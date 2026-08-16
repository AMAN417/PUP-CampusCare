import { config, isSupabaseConfigured } from '../config/environment.js';
import { getSupabaseClient } from './supabaseClient.js';

export async function verifySupabaseConnection(): Promise<boolean> {
  console.log('\n--- Environment Verification ---');
  console.log('SUPABASE_URL provided:', Boolean(config.SUPABASE_URL && config.SUPABASE_URL.length > 0));
  console.log('SUPABASE_KEY provided:', Boolean((config.SUPABASE_ANON_KEY || config.SUPABASE_SERVICE_ROLE_KEY) && (config.SUPABASE_ANON_KEY || config.SUPABASE_SERVICE_ROLE_KEY).length > 0));
  console.log('DATA_PROVIDER configured as:', config.DATA_PROVIDER);
  console.log('isSupabaseConfigured:', isSupabaseConfigured());

  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase credentials are not fully configured in environment.');
    return false;
  }

  try {
    const supabase = getSupabaseClient();
    console.log('\n--- Testing Supabase Connection ---');

    // Test departments query
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id, code, name')
      .limit(5);

    if (deptError) {
      console.log('❌ Failed to query "departments" table:', deptError.message);
      console.log('Details:', deptError.details || 'Check if schema.sql was executed in Supabase SQL editor.');
      return false;
    }

    console.log(`✅ Supabase connection successful! Found ${deptData?.length ?? 0} department records.`);

    // Test complaints query
    const { data: complaintData, error: complaintError } = await supabase
      .from('complaints')
      .select('id, complaint_id, title, status')
      .limit(5);

    if (complaintError) {
      console.log('❌ Failed to query "complaints" table:', complaintError.message);
      return false;
    }

    console.log(`✅ "complaints" table verified! Found ${complaintData?.length ?? 0} complaint records.`);

    // Test write permission on complaints table
    const testComplaintId = `TEST-PUP-${Date.now()}`;
    const { data: testComp, error: compWriteError } = await supabase
      .from('complaints')
      .insert({
        complaint_id: testComplaintId,
        title: 'Connection Test',
        description: 'Testing write permissions on complaints table',
        category: 'Other',
        location: 'Test Location',
        priority: 'Low',
        status: 'Submitted',
        student_id: 'test-user',
        student_name: 'Test Student',
      })
      .select()
      .single();

    if (compWriteError) {
      console.log('⚠️ Supabase write permissions restricted on "complaints" table:', compWriteError.message);
      console.log('ℹ️ Run "server/src/database/schema.sql" in Supabase SQL editor to grant full table write permissions.');
      return false;
    }

    // Clean up test complaint
    if (testComp?.id) {
      await supabase.from('complaints').delete().eq('id', testComp.id);
    }

    console.log('✅ Supabase write permissions verified on complaints table!');
    return true;
  } catch (err: any) {
    console.log('❌ Supabase connection error:', err?.message || err);
    return false;
  }
}

if (process.argv[1]?.includes('verifyConnection')) {
  verifySupabaseConnection().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
