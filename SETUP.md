# ContentOps — Setup Guide

## 1. Supabase Project

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run the full contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Storage** → create a bucket named `content-uploads`, set it to **Public**
4. In Storage → Policies, add these policies for the `content-uploads` bucket:
   - **INSERT** (authenticated): `(storage.foldername(name))[1] = auth.uid()::text`
   - **SELECT** (authenticated): `true`
   - **DELETE** (authenticated): `(storage.foldername(name))[1] = auth.uid()::text OR public.current_user_role() IN ('manager','admin')`
5. Go to **Database → Replication** → enable Realtime for tables: `content_cards`, `notifications`

## 2. Environment Variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase Dashboard → Settings → API.

## 3. Claude Caption Generation (Edge Function)

### Install Supabase CLI
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
```

### Set API Key Secret
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### Deploy Edge Function
```bash
supabase functions deploy generate-captions
```

## 4. Run the App

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 5. First Login

1. Sign up with your email — you'll receive a confirmation email
2. Confirm your email, then sign in
3. The first user can be upgraded to `admin` manually in Supabase:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'you@company.com';
   ```
4. Then use the Admin panel (`/admin`) to manage other team members' roles

## 6. Roles

| Role | Can do |
|---|---|
| **Contributor** | Create cards, resubmit after corrections |
| **Reviewer** | Comment, start review, approve/reject |
| **Manager** | Everything + schedule/mark posted + delete cards |
| **Admin** | Everything + manage user roles |
