import readline from 'readline';
import { isSupabaseConfigured, config } from '../src/config/environment.js';
import { getSupabaseClient } from '../src/database/supabaseClient.js';
import { getUserRepository } from '../src/repositories/index.js';
import { UserRole } from '../src/types/index.js';

function promptText(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);

    if (!stdin.isTTY) {
      // Non-interactive fallback (e.g. piped input)
      const rl = readline.createInterface({ input: stdin, output: process.stdout });
      rl.question('', (ans) => {
        rl.close();
        resolve(ans.trim());
      });
      return;
    }

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf-8');

    let input = '';
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n' || char === '\u0004') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(input);
          return;
        } else if (char === '\u0003') {
          // Ctrl+C
          process.stdout.write('\n');
          process.exit(1);
        } else if (char === '\u0008' || char === '\x7f') {
          // Backspace
          if (input.length > 0) {
            input = input.slice(0, -1);
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(question + '*'.repeat(input.length));
          }
        } else {
          input += char;
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(question + '*'.repeat(input.length));
        }
      }
    };

    stdin.on('data', onData);
  });
}

async function main() {
  console.log('\n======================================================================');
  console.log('  🏛️  PUP CampusCare — Create Real Administrator Account');
  console.log('======================================================================\n');

  if (!isSupabaseConfigured()) {
    console.warn('⚠️  Warning: Supabase is not fully configured (DATA_PROVIDER=memory or missing keys).');
    console.warn('   Will attempt creation with local repository provider.\n');
  }

  // 1. Interactive Admin Email
  let email = '';
  while (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    email = await promptText('Enter Admin Email Address: ');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('❌ Please enter a valid email address (e.g. admin@pup.ac.in).');
    }
  }

  // 2. Interactive Admin Full Name
  let name = '';
  while (!name || name.length < 2) {
    name = await promptText('Enter Admin Full Name: ');
    if (!name || name.length < 2) {
      console.log('❌ Admin name must be at least 2 characters.');
    }
  }

  // 3. Interactive Department (Optional with sensible default)
  const departmentInput = await promptText('Enter Administrative Department [Estate & Infrastructure Management Office]: ');
  const department = departmentInput || 'Estate & Infrastructure Management Office';

  // 4. Hidden Password Input
  let password = '';
  while (!password || password.length < 6) {
    password = await promptHidden('Enter Admin Password (min 6 chars, hidden): ');
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters.');
    }
  }

  // 5. Confirm Password
  let confirmPassword = '';
  confirmPassword = await promptHidden('Confirm Admin Password (hidden): ');
  if (password !== confirmPassword) {
    console.log('\n❌ Passwords do not match. Aborting admin creation.');
    process.exit(1);
  }

  console.log('\n⏳ Provisioning administrator account in Supabase Auth & public.users...');

  const role: UserRole = 'admin';

  try {
    let authUserId: string | undefined = undefined;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();

      // Create admin user via Supabase Auth Admin API with email_confirm: true
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
          department,
        },
      });

      if (createError) {
        const msg = createError.message.toLowerCase();
        if (
          msg.includes('already registered') ||
          msg.includes('already been registered') ||
          msg.includes('email address is already')
        ) {
          console.log('ℹ️  User already exists in Supabase Auth. Updating credentials and setting role to admin...');

          // List users to find the auth user id
          const { data: userListData } = await supabase.auth.admin.listUsers();
          const existingUser = userListData?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );

          if (existingUser) {
            authUserId = existingUser.id;
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              existingUser.id,
              {
                password,
                email_confirm: true,
                user_metadata: {
                  ...existingUser.user_metadata,
                  name,
                  role,
                  department,
                },
              }
            );

            if (updateError) {
              throw new Error(`Failed to update existing auth user: ${updateError.message}`);
            }
          } else {
            throw new Error(`User exists but could not be located in auth list: ${createError.message}`);
          }
        } else {
          throw new Error(`Supabase Auth Admin creation failed: ${createError.message}`);
        }
      } else {
        authUserId = createData.user?.id;
      }
    }

    // Upsert into public.users profile table
    const userRepo = getUserRepository();
    const profile = await userRepo.upsert({
      id: authUserId,
      name,
      email,
      role: 'admin',
      department,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
    });

    console.log('\n======================================================================');
    console.log('  ✅ SUCCESS: Real Administrator Account Ready!');
    console.log('======================================================================');
    console.log(`• Admin ID:      ${profile.id}`);
    console.log(`• Full Name:     ${profile.name}`);
    console.log(`• Email:         ${profile.email}`);
    console.log(`• Role:          ${profile.role} (Authoritative)`);
    console.log(`• Department:    ${profile.department}`);
    console.log(`• Status:        ${profile.status}`);
    console.log('======================================================================');
    console.log('🔑 You can now sign in with this email and password at:');
    console.log(`   ${config.FRONTEND_URL}/#/login`);
    console.log('   The system will automatically route this account to /admin/dashboard.\n');
  } catch (err: any) {
    console.error('\n❌ Admin creation failed:', err.message || err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal script error:', err);
  process.exit(1);
});
