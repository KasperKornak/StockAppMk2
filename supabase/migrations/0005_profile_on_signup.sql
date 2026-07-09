-- holdings.user_id and notification_preferences.user_id both reference
-- public.profiles(id), but nothing was ever creating that row — every
-- signup (including OAuth) would hit a foreign key violation the moment
-- the user tried to add a holding. Standard Supabase pattern: a trigger on
-- auth.users creates the profile (and default notification prefs) row.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill any users created before this trigger existed.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

insert into public.notification_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;
