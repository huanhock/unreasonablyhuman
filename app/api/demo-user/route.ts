import { createClient } from '@supabase/supabase-js';

const DEMO_EMAIL = 'aie-demo@unreasonablyhuman.app';
const DEMO_PASSWORD = 'test1234';

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await supabase.auth.admin.listUsers();
  const demoUser = existing?.users?.find(u => u.email === DEMO_EMAIL);

  if (!demoUser) {
    const { error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
}
