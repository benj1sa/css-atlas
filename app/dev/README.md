# Dev Tools

This folder is **developer-only**. Access is restricted to users with `app_role === 'developer'` in `public.users`.

## Granting developer access

Set `app_role` to `'developer'` in your `public.users` table for the user:

```sql
update public.users
set app_role = 'developer'
where email = 'your-email@example.com';
```

## Routes

- `/dev` — Dev tools page with client-side test UI
- `/api/dev/*` — Dev API routes (also protected by developer check)

## Adding new tests

1. Add API routes in `app/api/dev/` — protect with `getDeveloperUser()` from `@/lib/supabase/server`
2. Add buttons/forms in `dev-test-client.tsx` to call them
