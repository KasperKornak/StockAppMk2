import { supabaseAdmin } from "./supabase-admin";

export interface TestUser {
  id: string;
  email: string;
  password: string;
}

/** Bypasses Supabase's real signup email flow (and its free-tier rate limit) via the admin API. */
export async function createConfirmedTestUser(): Promise<TestUser> {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@mailinator.com`;
  const password = "TestPassword123!";

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`Failed to create test user: ${error?.message}`);
  }

  return { id: data.user.id, email, password };
}

export async function deleteTestUser(userId: string): Promise<void> {
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

/** For tests that create a user via the real signup form rather than the admin API. */
export async function deleteTestUserByEmail(email: string): Promise<void> {
  const { data } = await supabaseAdmin.auth.admin.listUsers();
  const user = data.users.find((u) => u.email === email);
  if (user) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
  }
}
