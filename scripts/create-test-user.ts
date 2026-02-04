import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vbclcsccuzcgrxedzpej.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiY2xjc2NjdXpjZ3J4ZWR6cGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYyNjAzOCwiZXhwIjoxODk2Mzk0MDM4fQ.9tNCpCJt2mJ8sEQh5VPqGgDr3IKp-aZmLNmPgGqWxkQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@pos.local',
      password: 'Test123456!',
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    console.log('✅ Test user created successfully!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('\nYou can now login with:');
    console.log('Email: test@pos.local');
    console.log('Password: Test123456!');
  } catch (err) {
    console.error('Error:', err);
  }
}

createTestUser();
