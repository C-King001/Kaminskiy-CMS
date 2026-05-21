-- ============================================================
-- MIGRATION: 001_initial_schema.sql
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE content_type AS ENUM (
  'reel', 'static_post', 'carousel', 'infographic', 'ai_video'
);

CREATE TYPE platform AS ENUM (
  'instagram', 'facebook', 'youtube_shorts'
);

CREATE TYPE content_status AS ENUM (
  'submitted', 'in_review', 'corrections_needed',
  'resubmitted', 'approved', 'scheduled', 'posted'
);

CREATE TYPE user_role AS ENUM (
  'contributor', 'reviewer', 'manager', 'admin'
);

CREATE TYPE idea_status AS ENUM (
  'raw', 'promoted'
);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'contributor',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CONTENT CARDS
-- ============================================================
CREATE TABLE public.content_cards (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  content_type          content_type NOT NULL,
  platform              platform NOT NULL,
  caption               TEXT,
  hashtags              TEXT[] DEFAULT '{}',
  scheduled_date        TIMESTAMPTZ,
  notes                 TEXT,
  status                content_status NOT NULL DEFAULT 'submitted',
  drive_link            TEXT,
  file_path             TEXT,
  file_url              TEXT,
  owner_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_reviewer_id  UUID REFERENCES public.profiles(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_cards_owner    ON public.content_cards(owner_id);
CREATE INDEX idx_content_cards_status   ON public.content_cards(status);
CREATE INDEX idx_content_cards_schedule ON public.content_cards(scheduled_date);
CREATE INDEX idx_content_cards_platform ON public.content_cards(platform);

-- ============================================================
-- STATUS HISTORY
-- ============================================================
CREATE TABLE public.status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id     UUID NOT NULL REFERENCES public.content_cards(id) ON DELETE CASCADE,
  from_status content_status,
  to_status   content_status NOT NULL,
  changed_by  UUID NOT NULL REFERENCES public.profiles(id),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_card ON public.status_history(card_id);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE public.comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id    UUID NOT NULL REFERENCES public.content_cards(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  parent_id  UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  resolved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_card ON public.comments(card_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id     UUID REFERENCES public.profiles(id),
  card_id      UUID REFERENCES public.content_cards(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  message      TEXT NOT NULL,
  read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, read);

-- ============================================================
-- IDEA BANK
-- ============================================================
CREATE TABLE public.ideas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT,
  content_type     content_type,
  tags             TEXT[] DEFAULT '{}',
  status           idea_status NOT NULL DEFAULT 'raw',
  promoted_card_id UUID REFERENCES public.content_cards(id),
  owner_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ideas_owner  ON public.ideas(owner_id);
CREATE INDEX idx_ideas_status ON public.ideas(status);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_content_cards BEFORE UPDATE ON public.content_cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_comments      BEFORE UPDATE ON public.comments      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_ideas         BEFORE UPDATE ON public.ideas         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at_profiles      BEFORE UPDATE ON public.profiles      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_cards   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas           ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.current_user_role() = 'admin')
  WITH CHECK (id = auth.uid() OR public.current_user_role() = 'admin');

-- CONTENT CARDS
CREATE POLICY "cards_select" ON public.content_cards FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "cards_insert" ON public.content_cards FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "cards_update" ON public.content_cards FOR UPDATE TO authenticated
  USING (
    (owner_id = auth.uid() AND status IN ('submitted', 'corrections_needed', 'resubmitted'))
    OR public.current_user_role() IN ('reviewer', 'manager', 'admin')
  );
CREATE POLICY "cards_delete" ON public.content_cards FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('manager', 'admin'));

-- STATUS HISTORY
CREATE POLICY "history_select" ON public.status_history FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "history_insert" ON public.status_history FOR INSERT TO authenticated
  WITH CHECK (changed_by = auth.uid());

-- COMMENTS
CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "comments_update" ON public.comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.current_user_role() IN ('manager', 'admin'));

-- NOTIFICATIONS
CREATE POLICY "notifs_select" ON public.notifications FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());
CREATE POLICY "notifs_update" ON public.notifications FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());
CREATE POLICY "notifs_insert" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- IDEAS
CREATE POLICY "ideas_select" ON public.ideas FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "ideas_insert" ON public.ideas FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "ideas_update" ON public.ideas FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.current_user_role() IN ('manager', 'admin'));
CREATE POLICY "ideas_delete" ON public.ideas FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.current_user_role() IN ('manager', 'admin'));

-- ============================================================
-- NOTIFICATION TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_on_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify card owner
    IF NEW.owner_id != auth.uid() THEN
      INSERT INTO public.notifications (recipient_id, actor_id, card_id, type, message)
      VALUES (
        NEW.owner_id, auth.uid(), NEW.id, 'status_change',
        'Your content "' || NEW.title || '" moved to: ' || NEW.status::TEXT
      );
    END IF;
    -- Notify assigned reviewer when resubmitted
    IF NEW.assigned_reviewer_id IS NOT NULL
       AND NEW.assigned_reviewer_id != auth.uid()
       AND NEW.status IN ('submitted', 'resubmitted') THEN
      INSERT INTO public.notifications (recipient_id, actor_id, card_id, type, message)
      VALUES (
        NEW.assigned_reviewer_id, auth.uid(), NEW.id, 'review_requested',
        'Review requested for: "' || NEW.title || '"'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_status_change
  AFTER UPDATE OF status ON public.content_cards
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_status_change();

CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_owner_id UUID;
  v_title    TEXT;
BEGIN
  SELECT owner_id, title INTO v_owner_id, v_title
  FROM public.content_cards WHERE id = NEW.card_id;

  IF v_owner_id IS NOT NULL AND v_owner_id != NEW.author_id THEN
    INSERT INTO public.notifications (recipient_id, actor_id, card_id, type, message)
    VALUES (
      v_owner_id, NEW.author_id, NEW.card_id, 'comment',
      'New comment on your content: "' || v_title || '"'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_added
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- ============================================================
-- ADMIN RPC: set_user_role
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_user_role(target_id UUID, new_role user_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF public.current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_id;
END;
$$;

-- ============================================================
-- STORAGE BUCKET
-- (Run separately in Supabase Dashboard > Storage if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'content-uploads', 'content-uploads', TRUE, 52428800,
--   ARRAY['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/quicktime']
-- ) ON CONFLICT DO NOTHING;

-- Storage RLS (enable in Storage section of dashboard):
-- CREATE POLICY "storage_upload" ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'content-uploads' AND auth.uid()::TEXT = (storage.foldername(name))[1]);
-- CREATE POLICY "storage_read"   ON storage.objects FOR SELECT TO authenticated
--   USING (bucket_id = 'content-uploads');
-- CREATE POLICY "storage_delete" ON storage.objects FOR DELETE TO authenticated
--   USING (bucket_id = 'content-uploads' AND
--     (auth.uid()::TEXT = (storage.foldername(name))[1] OR public.current_user_role() IN ('manager','admin')));
