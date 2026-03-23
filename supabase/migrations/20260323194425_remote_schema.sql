drop extension if exists "pg_net";


  create table "public"."activity_events" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "user_id" uuid,
    "event_type" text not null,
    "entity_type" text not null,
    "entity_id" uuid not null,
    "title" text not null,
    "description" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."activity_events" enable row level security;


  create table "public"."marketplace_installs" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "item_id" uuid not null,
    "installed_at" timestamp with time zone not null default now(),
    "installed_by" uuid,
    "configuration" jsonb default '{}'::jsonb,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."marketplace_installs" enable row level security;


  create table "public"."marketplace_items" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "tagline" text not null,
    "description" text not null,
    "category" text not null,
    "type" text not null,
    "icon" text default 'package'::text,
    "cover_image" text,
    "vendor" text not null default 'Bridgebox'::text,
    "is_official" boolean not null default true,
    "is_featured" boolean default false,
    "is_trending" boolean default false,
    "is_active" boolean not null default true,
    "price_type" text not null default 'free'::text,
    "price_amount" numeric default 0,
    "rating_average" numeric default 0,
    "rating_count" integer default 0,
    "install_count" integer default 0,
    "plugin_id" uuid,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."marketplace_items" enable row level security;


  create table "public"."marketplace_reviews" (
    "id" uuid not null default gen_random_uuid(),
    "item_id" uuid not null,
    "organization_id" uuid not null,
    "user_id" uuid not null,
    "rating" integer not null,
    "title" text,
    "review" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."marketplace_reviews" enable row level security;


  create table "public"."message_threads" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "thread_type" text not null,
    "context_id" uuid,
    "title" text not null,
    "is_internal" boolean not null default false,
    "last_message_at" timestamp with time zone not null default now(),
    "created_by" uuid,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."message_threads" enable row level security;


  create table "public"."organization_plugins" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "plugin_id" uuid not null,
    "is_enabled" boolean not null default true,
    "configuration" jsonb default '{}'::jsonb,
    "installed_at" timestamp with time zone not null default now(),
    "last_enabled_at" timestamp with time zone,
    "enabled_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."organization_plugins" enable row level security;


  create table "public"."permission_actions" (
    "id" uuid not null default gen_random_uuid(),
    "action_name" text not null,
    "action_label" text not null,
    "action_description" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."permission_actions" enable row level security;


  create table "public"."permission_audit_log" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "organization_id" uuid,
    "resource_name" text not null,
    "action_name" text not null,
    "resource_id" uuid,
    "was_allowed" boolean not null,
    "reason" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."permission_audit_log" enable row level security;


  create table "public"."permission_resources" (
    "id" uuid not null default gen_random_uuid(),
    "resource_name" text not null,
    "resource_label" text not null,
    "resource_description" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."permission_resources" enable row level security;


  create table "public"."plugin_activity_log" (
    "id" uuid not null default gen_random_uuid(),
    "organization_id" uuid not null,
    "plugin_id" uuid not null,
    "action" text not null,
    "user_id" uuid,
    "details" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."plugin_activity_log" enable row level security;


  create table "public"."plugins" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "description" text not null,
    "long_description" text,
    "category" text not null,
    "version" text not null default '1.0.0'::text,
    "author" text not null default 'Bridgebox'::text,
    "icon" text default 'package'::text,
    "is_official" boolean not null default true,
    "is_active" boolean not null default true,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."plugins" enable row level security;


  create table "public"."role_permissions" (
    "id" uuid not null default gen_random_uuid(),
    "role" text not null,
    "organization_id" uuid,
    "resource_name" text not null,
    "action_name" text not null,
    "is_allowed" boolean not null default true,
    "conditions" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."role_permissions" enable row level security;


  create table "public"."thread_messages" (
    "id" uuid not null default gen_random_uuid(),
    "thread_id" uuid not null,
    "sender_id" uuid,
    "content" text not null,
    "is_internal" boolean not null default false,
    "is_important" boolean not null default false,
    "is_flagged" boolean not null default false,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."thread_messages" enable row level security;


  create table "public"."thread_participants" (
    "id" uuid not null default gen_random_uuid(),
    "thread_id" uuid not null,
    "user_id" uuid not null,
    "last_read_at" timestamp with time zone not null default now(),
    "is_muted" boolean not null default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."thread_participants" enable row level security;


  create table "public"."user_permissions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "organization_id" uuid not null,
    "resource_name" text not null,
    "action_name" text not null,
    "is_allowed" boolean not null default true,
    "conditions" jsonb default '{}'::jsonb,
    "expires_at" timestamp with time zone,
    "granted_by" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_permissions" enable row level security;


  create table "public"."user_presence" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "organization_id" uuid not null,
    "context_type" text not null,
    "context_id" uuid not null,
    "last_seen" timestamp with time zone not null default now(),
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user_presence" enable row level security;

CREATE UNIQUE INDEX activity_events_pkey ON public.activity_events USING btree (id);

CREATE INDEX idx_activity_events_created_at ON public.activity_events USING btree (created_at DESC);

CREATE INDEX idx_activity_events_entity ON public.activity_events USING btree (entity_type, entity_id);

CREATE INDEX idx_activity_events_org_id ON public.activity_events USING btree (organization_id);

CREATE INDEX idx_activity_events_user_id ON public.activity_events USING btree (user_id);

CREATE INDEX idx_marketplace_installs_active ON public.marketplace_installs USING btree (organization_id, is_active);

CREATE INDEX idx_marketplace_installs_item ON public.marketplace_installs USING btree (item_id);

CREATE INDEX idx_marketplace_installs_org ON public.marketplace_installs USING btree (organization_id);

CREATE INDEX idx_marketplace_items_active ON public.marketplace_items USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_marketplace_items_category ON public.marketplace_items USING btree (category);

CREATE INDEX idx_marketplace_items_featured ON public.marketplace_items USING btree (is_featured) WHERE (is_featured = true);

CREATE INDEX idx_marketplace_items_slug ON public.marketplace_items USING btree (slug);

CREATE INDEX idx_marketplace_items_trending ON public.marketplace_items USING btree (is_trending) WHERE (is_trending = true);

CREATE INDEX idx_marketplace_items_type ON public.marketplace_items USING btree (type);

CREATE INDEX idx_marketplace_reviews_item ON public.marketplace_reviews USING btree (item_id);

CREATE INDEX idx_marketplace_reviews_org ON public.marketplace_reviews USING btree (organization_id);

CREATE INDEX idx_message_threads_context ON public.message_threads USING btree (context_id);

CREATE INDEX idx_message_threads_last_message ON public.message_threads USING btree (last_message_at DESC);

CREATE INDEX idx_message_threads_org_id ON public.message_threads USING btree (organization_id);

CREATE INDEX idx_message_threads_type ON public.message_threads USING btree (thread_type);

CREATE INDEX idx_org_plugins_enabled ON public.organization_plugins USING btree (organization_id, is_enabled);

CREATE INDEX idx_org_plugins_org ON public.organization_plugins USING btree (organization_id);

CREATE INDEX idx_org_plugins_plugin ON public.organization_plugins USING btree (plugin_id);

CREATE INDEX idx_permission_audit_created ON public.permission_audit_log USING btree (created_at DESC);

CREATE INDEX idx_permission_audit_org ON public.permission_audit_log USING btree (organization_id);

CREATE INDEX idx_permission_audit_resource ON public.permission_audit_log USING btree (resource_name, action_name);

CREATE INDEX idx_permission_audit_user ON public.permission_audit_log USING btree (user_id);

CREATE INDEX idx_plugin_log_created ON public.plugin_activity_log USING btree (created_at DESC);

CREATE INDEX idx_plugin_log_org ON public.plugin_activity_log USING btree (organization_id);

CREATE INDEX idx_plugin_log_plugin ON public.plugin_activity_log USING btree (plugin_id);

CREATE INDEX idx_plugins_active ON public.plugins USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_plugins_category ON public.plugins USING btree (category);

CREATE INDEX idx_plugins_slug ON public.plugins USING btree (slug);

CREATE INDEX idx_role_permissions_lookup ON public.role_permissions USING btree (role, organization_id, resource_name, action_name);

CREATE INDEX idx_role_permissions_org ON public.role_permissions USING btree (organization_id);

CREATE INDEX idx_role_permissions_resource ON public.role_permissions USING btree (resource_name);

CREATE INDEX idx_role_permissions_role ON public.role_permissions USING btree (role);

CREATE INDEX idx_thread_messages_created_at ON public.thread_messages USING btree (created_at DESC);

CREATE INDEX idx_thread_messages_flagged ON public.thread_messages USING btree (is_flagged) WHERE (is_flagged = true);

CREATE INDEX idx_thread_messages_important ON public.thread_messages USING btree (is_important) WHERE (is_important = true);

CREATE INDEX idx_thread_messages_sender_id ON public.thread_messages USING btree (sender_id);

CREATE INDEX idx_thread_messages_thread_id ON public.thread_messages USING btree (thread_id);

CREATE INDEX idx_thread_participants_thread_id ON public.thread_participants USING btree (thread_id);

CREATE INDEX idx_thread_participants_unread ON public.thread_participants USING btree (user_id, last_read_at);

CREATE INDEX idx_thread_participants_user_id ON public.thread_participants USING btree (user_id);

CREATE INDEX idx_user_permissions_expires ON public.user_permissions USING btree (expires_at) WHERE (expires_at IS NOT NULL);

CREATE INDEX idx_user_permissions_lookup ON public.user_permissions USING btree (user_id, organization_id, resource_name, action_name);

CREATE INDEX idx_user_permissions_org ON public.user_permissions USING btree (organization_id);

CREATE INDEX idx_user_permissions_user ON public.user_permissions USING btree (user_id);

CREATE INDEX idx_user_presence_context ON public.user_presence USING btree (context_type, context_id);

CREATE INDEX idx_user_presence_last_seen ON public.user_presence USING btree (last_seen);

CREATE INDEX idx_user_presence_org_id ON public.user_presence USING btree (organization_id);

CREATE INDEX idx_user_presence_user_id ON public.user_presence USING btree (user_id);

CREATE UNIQUE INDEX marketplace_installs_organization_id_item_id_key ON public.marketplace_installs USING btree (organization_id, item_id);

CREATE UNIQUE INDEX marketplace_installs_pkey ON public.marketplace_installs USING btree (id);

CREATE UNIQUE INDEX marketplace_items_pkey ON public.marketplace_items USING btree (id);

CREATE UNIQUE INDEX marketplace_items_slug_key ON public.marketplace_items USING btree (slug);

CREATE UNIQUE INDEX marketplace_reviews_item_id_organization_id_key ON public.marketplace_reviews USING btree (item_id, organization_id);

CREATE UNIQUE INDEX marketplace_reviews_pkey ON public.marketplace_reviews USING btree (id);

CREATE UNIQUE INDEX message_threads_pkey ON public.message_threads USING btree (id);

CREATE UNIQUE INDEX organization_plugins_organization_id_plugin_id_key ON public.organization_plugins USING btree (organization_id, plugin_id);

CREATE UNIQUE INDEX organization_plugins_pkey ON public.organization_plugins USING btree (id);

CREATE UNIQUE INDEX permission_actions_action_name_key ON public.permission_actions USING btree (action_name);

CREATE UNIQUE INDEX permission_actions_pkey ON public.permission_actions USING btree (id);

CREATE UNIQUE INDEX permission_audit_log_pkey ON public.permission_audit_log USING btree (id);

CREATE UNIQUE INDEX permission_resources_pkey ON public.permission_resources USING btree (id);

CREATE UNIQUE INDEX permission_resources_resource_name_key ON public.permission_resources USING btree (resource_name);

CREATE UNIQUE INDEX plugin_activity_log_pkey ON public.plugin_activity_log USING btree (id);

CREATE UNIQUE INDEX plugins_pkey ON public.plugins USING btree (id);

CREATE UNIQUE INDEX plugins_slug_key ON public.plugins USING btree (slug);

CREATE UNIQUE INDEX role_permissions_pkey ON public.role_permissions USING btree (id);

CREATE UNIQUE INDEX thread_messages_pkey ON public.thread_messages USING btree (id);

CREATE UNIQUE INDEX thread_participants_pkey ON public.thread_participants USING btree (id);

CREATE UNIQUE INDEX thread_participants_thread_id_user_id_key ON public.thread_participants USING btree (thread_id, user_id);

CREATE UNIQUE INDEX unique_role_permission ON public.role_permissions USING btree (role, organization_id, resource_name, action_name) NULLS NOT DISTINCT;

CREATE UNIQUE INDEX user_permissions_pkey ON public.user_permissions USING btree (id);

CREATE UNIQUE INDEX user_permissions_user_id_organization_id_resource_name_acti_key ON public.user_permissions USING btree (user_id, organization_id, resource_name, action_name);

CREATE UNIQUE INDEX user_presence_pkey ON public.user_presence USING btree (id);

alter table "public"."activity_events" add constraint "activity_events_pkey" PRIMARY KEY using index "activity_events_pkey";

alter table "public"."marketplace_installs" add constraint "marketplace_installs_pkey" PRIMARY KEY using index "marketplace_installs_pkey";

alter table "public"."marketplace_items" add constraint "marketplace_items_pkey" PRIMARY KEY using index "marketplace_items_pkey";

alter table "public"."marketplace_reviews" add constraint "marketplace_reviews_pkey" PRIMARY KEY using index "marketplace_reviews_pkey";

alter table "public"."message_threads" add constraint "message_threads_pkey" PRIMARY KEY using index "message_threads_pkey";

alter table "public"."organization_plugins" add constraint "organization_plugins_pkey" PRIMARY KEY using index "organization_plugins_pkey";

alter table "public"."permission_actions" add constraint "permission_actions_pkey" PRIMARY KEY using index "permission_actions_pkey";

alter table "public"."permission_audit_log" add constraint "permission_audit_log_pkey" PRIMARY KEY using index "permission_audit_log_pkey";

alter table "public"."permission_resources" add constraint "permission_resources_pkey" PRIMARY KEY using index "permission_resources_pkey";

alter table "public"."plugin_activity_log" add constraint "plugin_activity_log_pkey" PRIMARY KEY using index "plugin_activity_log_pkey";

alter table "public"."plugins" add constraint "plugins_pkey" PRIMARY KEY using index "plugins_pkey";

alter table "public"."role_permissions" add constraint "role_permissions_pkey" PRIMARY KEY using index "role_permissions_pkey";

alter table "public"."thread_messages" add constraint "thread_messages_pkey" PRIMARY KEY using index "thread_messages_pkey";

alter table "public"."thread_participants" add constraint "thread_participants_pkey" PRIMARY KEY using index "thread_participants_pkey";

alter table "public"."user_permissions" add constraint "user_permissions_pkey" PRIMARY KEY using index "user_permissions_pkey";

alter table "public"."user_presence" add constraint "user_presence_pkey" PRIMARY KEY using index "user_presence_pkey";

alter table "public"."activity_events" add constraint "activity_events_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."activity_events" validate constraint "activity_events_organization_id_fkey";

alter table "public"."activity_events" add constraint "activity_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."activity_events" validate constraint "activity_events_user_id_fkey";

alter table "public"."marketplace_installs" add constraint "marketplace_installs_installed_by_fkey" FOREIGN KEY (installed_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."marketplace_installs" validate constraint "marketplace_installs_installed_by_fkey";

alter table "public"."marketplace_installs" add constraint "marketplace_installs_item_id_fkey" FOREIGN KEY (item_id) REFERENCES public.marketplace_items(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_installs" validate constraint "marketplace_installs_item_id_fkey";

alter table "public"."marketplace_installs" add constraint "marketplace_installs_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_installs" validate constraint "marketplace_installs_organization_id_fkey";

alter table "public"."marketplace_installs" add constraint "marketplace_installs_organization_id_item_id_key" UNIQUE using index "marketplace_installs_organization_id_item_id_key";

alter table "public"."marketplace_items" add constraint "marketplace_items_plugin_id_fkey" FOREIGN KEY (plugin_id) REFERENCES public.plugins(id) ON DELETE SET NULL not valid;

alter table "public"."marketplace_items" validate constraint "marketplace_items_plugin_id_fkey";

alter table "public"."marketplace_items" add constraint "marketplace_items_slug_key" UNIQUE using index "marketplace_items_slug_key";

alter table "public"."marketplace_reviews" add constraint "marketplace_reviews_item_id_fkey" FOREIGN KEY (item_id) REFERENCES public.marketplace_items(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_reviews" validate constraint "marketplace_reviews_item_id_fkey";

alter table "public"."marketplace_reviews" add constraint "marketplace_reviews_item_id_organization_id_key" UNIQUE using index "marketplace_reviews_item_id_organization_id_key";

alter table "public"."marketplace_reviews" add constraint "marketplace_reviews_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_reviews" validate constraint "marketplace_reviews_organization_id_fkey";

alter table "public"."marketplace_reviews" add constraint "marketplace_reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))) not valid;

alter table "public"."marketplace_reviews" validate constraint "marketplace_reviews_rating_check";

alter table "public"."marketplace_reviews" add constraint "marketplace_reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."marketplace_reviews" validate constraint "marketplace_reviews_user_id_fkey";

alter table "public"."message_threads" add constraint "message_threads_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."message_threads" validate constraint "message_threads_created_by_fkey";

alter table "public"."message_threads" add constraint "message_threads_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."message_threads" validate constraint "message_threads_organization_id_fkey";

alter table "public"."message_threads" add constraint "message_threads_thread_type_check" CHECK ((thread_type = ANY (ARRAY['project'::text, 'ticket'::text, 'client'::text, 'internal'::text]))) not valid;

alter table "public"."message_threads" validate constraint "message_threads_thread_type_check";

alter table "public"."organization_plugins" add constraint "organization_plugins_enabled_by_fkey" FOREIGN KEY (enabled_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."organization_plugins" validate constraint "organization_plugins_enabled_by_fkey";

alter table "public"."organization_plugins" add constraint "organization_plugins_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."organization_plugins" validate constraint "organization_plugins_organization_id_fkey";

alter table "public"."organization_plugins" add constraint "organization_plugins_organization_id_plugin_id_key" UNIQUE using index "organization_plugins_organization_id_plugin_id_key";

alter table "public"."organization_plugins" add constraint "organization_plugins_plugin_id_fkey" FOREIGN KEY (plugin_id) REFERENCES public.plugins(id) ON DELETE CASCADE not valid;

alter table "public"."organization_plugins" validate constraint "organization_plugins_plugin_id_fkey";

alter table "public"."permission_actions" add constraint "permission_actions_action_name_key" UNIQUE using index "permission_actions_action_name_key";

alter table "public"."permission_audit_log" add constraint "permission_audit_log_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."permission_audit_log" validate constraint "permission_audit_log_organization_id_fkey";

alter table "public"."permission_audit_log" add constraint "permission_audit_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."permission_audit_log" validate constraint "permission_audit_log_user_id_fkey";

alter table "public"."permission_resources" add constraint "permission_resources_resource_name_key" UNIQUE using index "permission_resources_resource_name_key";

alter table "public"."plugin_activity_log" add constraint "plugin_activity_log_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."plugin_activity_log" validate constraint "plugin_activity_log_organization_id_fkey";

alter table "public"."plugin_activity_log" add constraint "plugin_activity_log_plugin_id_fkey" FOREIGN KEY (plugin_id) REFERENCES public.plugins(id) ON DELETE CASCADE not valid;

alter table "public"."plugin_activity_log" validate constraint "plugin_activity_log_plugin_id_fkey";

alter table "public"."plugin_activity_log" add constraint "plugin_activity_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."plugin_activity_log" validate constraint "plugin_activity_log_user_id_fkey";

alter table "public"."plugins" add constraint "plugins_slug_key" UNIQUE using index "plugins_slug_key";

alter table "public"."role_permissions" add constraint "role_permissions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."role_permissions" validate constraint "role_permissions_organization_id_fkey";

alter table "public"."role_permissions" add constraint "unique_role_permission" UNIQUE using index "unique_role_permission";

alter table "public"."thread_messages" add constraint "thread_messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."thread_messages" validate constraint "thread_messages_sender_id_fkey";

alter table "public"."thread_messages" add constraint "thread_messages_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES public.message_threads(id) ON DELETE CASCADE not valid;

alter table "public"."thread_messages" validate constraint "thread_messages_thread_id_fkey";

alter table "public"."thread_participants" add constraint "thread_participants_thread_id_fkey" FOREIGN KEY (thread_id) REFERENCES public.message_threads(id) ON DELETE CASCADE not valid;

alter table "public"."thread_participants" validate constraint "thread_participants_thread_id_fkey";

alter table "public"."thread_participants" add constraint "thread_participants_thread_id_user_id_key" UNIQUE using index "thread_participants_thread_id_user_id_key";

alter table "public"."thread_participants" add constraint "thread_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."thread_participants" validate constraint "thread_participants_user_id_fkey";

alter table "public"."user_permissions" add constraint "user_permissions_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."user_permissions" validate constraint "user_permissions_granted_by_fkey";

alter table "public"."user_permissions" add constraint "user_permissions_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."user_permissions" validate constraint "user_permissions_organization_id_fkey";

alter table "public"."user_permissions" add constraint "user_permissions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_permissions" validate constraint "user_permissions_user_id_fkey";

alter table "public"."user_permissions" add constraint "user_permissions_user_id_organization_id_resource_name_acti_key" UNIQUE using index "user_permissions_user_id_organization_id_resource_name_acti_key";

alter table "public"."user_presence" add constraint "user_presence_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE not valid;

alter table "public"."user_presence" validate constraint "user_presence_organization_id_fkey";

alter table "public"."user_presence" add constraint "user_presence_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_presence" validate constraint "user_presence_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_user_permission(p_user_id uuid, p_organization_id uuid, p_resource_name text, p_action_name text, p_conditions jsonb DEFAULT '{}'::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_user_role text;
v_has_permission boolean;
v_user_override boolean;
BEGIN
-- Get user's role in the organization
SELECT role::text INTO v_user_role
FROM organization_memberships
WHERE user_id = p_user_id AND organization_id = p_organization_id;

-- If no role found, user is not a member
IF v_user_role IS NULL THEN
RETURN false;
END IF;

-- Check for user-specific override (takes precedence)
SELECT is_allowed INTO v_user_override
FROM user_permissions
WHERE user_id = p_user_id
AND organization_id = p_organization_id
AND resource_name = p_resource_name
AND action_name = p_action_name
AND (expires_at IS NULL OR expires_at > now());

IF v_user_override IS NOT NULL THEN
RETURN v_user_override;
END IF;

-- Check role-based permission
SELECT is_allowed INTO v_has_permission
FROM role_permissions
WHERE role = v_user_role
AND (organization_id = p_organization_id OR organization_id IS NULL)
AND resource_name = p_resource_name
AND action_name = p_action_name
ORDER BY organization_id NULLS LAST
LIMIT 1;

-- Default deny if no permission found
RETURN COALESCE(v_has_permission, false);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_stale_presence()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
DELETE FROM user_presence
WHERE last_seen < now() - interval '5 minutes';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id uuid, p_thread_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_last_read_at timestamptz;
v_unread_count bigint;
BEGIN
-- Get user's last read timestamp
SELECT last_read_at INTO v_last_read_at
FROM thread_participants
WHERE thread_id = p_thread_id AND user_id = p_user_id;

-- If user is not a participant, return 0
IF v_last_read_at IS NULL THEN
RETURN 0;
END IF;

-- Count messages after last read
SELECT COUNT(*) INTO v_unread_count
FROM thread_messages
WHERE thread_id = p_thread_id
AND created_at > v_last_read_at
AND sender_id != p_user_id;

RETURN v_unread_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_install_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
IF TG_OP = 'INSERT' THEN
UPDATE marketplace_items
SET install_count = install_count + 1
WHERE id = NEW.item_id;
END IF;

RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_activity_event(p_organization_id uuid, p_event_type text, p_entity_type text, p_entity_id uuid, p_title text, p_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_event_id uuid;
BEGIN
INSERT INTO activity_events (
organization_id,
user_id,
event_type,
entity_type,
entity_id,
title,
description,
metadata
) VALUES (
p_organization_id,
auth.uid(),
p_event_type,
p_entity_type,
p_entity_id,
p_title,
p_description,
p_metadata
)
RETURNING id INTO v_event_id;

RETURN v_event_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_permission_check(p_user_id uuid, p_organization_id uuid, p_resource_name text, p_action_name text, p_resource_id uuid, p_was_allowed boolean, p_reason text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
INSERT INTO permission_audit_log (
user_id,
organization_id,
resource_name,
action_name,
resource_id,
was_allowed,
reason,
metadata
) VALUES (
p_user_id,
p_organization_id,
p_resource_name,
p_action_name,
p_resource_id,
p_was_allowed,
p_reason,
p_metadata
);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_plugin_activity(p_organization_id uuid, p_plugin_id uuid, p_action text, p_user_id uuid, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
INSERT INTO plugin_activity_log (
organization_id,
plugin_id,
action,
user_id,
details
) VALUES (
p_organization_id,
p_plugin_id,
p_action,
p_user_id,
p_details
);
END;
$function$
;

create or replace view "public"."marketplace_featured" as  SELECT id,
    name,
    slug,
    tagline,
    description,
    category,
    type,
    icon,
    cover_image,
    vendor,
    is_official,
    is_featured,
    is_trending,
    is_active,
    price_type,
    price_amount,
    rating_average,
    rating_count,
    install_count,
    plugin_id,
    metadata,
    created_at,
    updated_at
   FROM public.marketplace_items
  WHERE ((is_featured = true) AND (is_active = true))
  ORDER BY install_count DESC, created_at DESC;


create or replace view "public"."marketplace_trending" as  SELECT id,
    name,
    slug,
    tagline,
    description,
    category,
    type,
    icon,
    cover_image,
    vendor,
    is_official,
    is_featured,
    is_trending,
    is_active,
    price_type,
    price_amount,
    rating_average,
    rating_count,
    install_count,
    plugin_id,
    metadata,
    created_at,
    updated_at
   FROM public.marketplace_items
  WHERE ((is_trending = true) AND (is_active = true))
  ORDER BY install_count DESC, created_at DESC;


create or replace view "public"."plugin_stats" as  SELECT p.id,
    p.name,
    p.slug,
    p.category,
    count(DISTINCT op.organization_id) AS install_count,
    count(DISTINCT
        CASE
            WHEN op.is_enabled THEN op.organization_id
            ELSE NULL::uuid
        END) AS active_count
   FROM (public.plugins p
     LEFT JOIN public.organization_plugins op ON ((p.id = op.plugin_id)))
  GROUP BY p.id, p.name, p.slug, p.category;


CREATE OR REPLACE FUNCTION public.update_marketplace_item_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
UPDATE marketplace_items
SET 
rating_average = (
SELECT AVG(rating)::numeric(3,2)
FROM marketplace_reviews
WHERE item_id = NEW.item_id
),
rating_count = (
SELECT COUNT(*)
FROM marketplace_reviews
WHERE item_id = NEW.item_id
)
WHERE id = NEW.item_id;

RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_presence_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
NEW.updated_at = now();
NEW.last_seen = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_thread_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
UPDATE message_threads
SET last_message_at = NEW.created_at,
updated_at = NEW.created_at
WHERE id = NEW.thread_id;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_execution_duration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
END IF;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_document_processing_tasks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
INSERT INTO public.document_processing_queue (
document_id,
organization_id,
task_type,
priority,
status
) VALUES
(NEW.id, NEW.organization_id, 'text_extraction', 1, 'pending'),
(NEW.id, NEW.organization_id, 'entity_recognition', 2, 'pending'),
(NEW.id, NEW.organization_id, 'classification', 3, 'pending');

RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.expire_old_agent_actions()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
UPDATE agent_actions
SET status = 'dismissed'
WHERE status IN ('suggested', 'pending_review')
AND expires_at IS NOT NULL
AND expires_at < now();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.expire_old_invitations()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
UPDATE invitations
SET status = 'expired',
updated_at = now()
WHERE status = 'pending'
AND expires_at < now();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_next_queue_item()
 RETURNS TABLE(id uuid, document_id uuid, task_type text, priority integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
RETURN QUERY
SELECT 
q.id,
q.document_id,
q.task_type,
q.priority
FROM public.document_processing_queue q
WHERE q.status = 'pending'
ORDER BY q.priority ASC, q.created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_next_queue_item(p_task_type text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
v_queue_id uuid;
BEGIN
SELECT id INTO v_queue_id
FROM document_processing_queue
WHERE status IN ('pending', 'retrying')
AND (p_task_type IS NULL OR task_type = p_task_type)
ORDER BY priority DESC, created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;

IF v_queue_id IS NOT NULL THEN
UPDATE document_processing_queue
SET status = 'processing', started_at = now()
WHERE id = v_queue_id;
END IF;

RETURN v_queue_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_document_view_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
UPDATE knowledge_documents
SET view_count = view_count + 1
WHERE id = NEW.document_id;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_workflow_execution_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
UPDATE public.workflows
SET execution_count = COALESCE(execution_count, 0) + 1,
last_executed_at = NEW.started_at
WHERE id = NEW.workflow_id;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_stripe_subscription_to_organization()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
UPDATE organizations
SET
stripe_subscription_id = NEW.stripe_subscription_id,
subscription_status = NEW.status,
billing_plan = NEW.plan,
subscription_current_period_start = NEW.current_period_start,
subscription_current_period_end = NEW.current_period_end,
subscription_cancel_at_period_end = NEW.cancel_at_period_end,
billing_synced_at = now()
WHERE id = NEW.organization_id;

RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.track_proposal_view()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
IF OLD.viewed_at IS NULL AND NEW.status = 'viewed' THEN
NEW.viewed_at = now();
END IF;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_agent_actions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
UPDATE copilot_conversations
SET updated_at = now()
WHERE id = NEW.conversation_id;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_delivery_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_document_on_analysis()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
UPDATE public.documents
SET 
content_type = COALESCE(NEW.content_type, content_type),
updated_at = now()
WHERE id = NEW.document_id;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_document_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_extracted_data_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_market_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_opportunities_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_proposals_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_stripe_subscription_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_support_tickets_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();

IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
NEW.resolved_at = now();
END IF;

IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
NEW.closed_at = now();
END IF;

RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_ticket_comments_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_white_label_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_workflow_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$
;

grant delete on table "public"."activity_events" to "anon";

grant insert on table "public"."activity_events" to "anon";

grant references on table "public"."activity_events" to "anon";

grant select on table "public"."activity_events" to "anon";

grant trigger on table "public"."activity_events" to "anon";

grant truncate on table "public"."activity_events" to "anon";

grant update on table "public"."activity_events" to "anon";

grant delete on table "public"."activity_events" to "authenticated";

grant insert on table "public"."activity_events" to "authenticated";

grant references on table "public"."activity_events" to "authenticated";

grant select on table "public"."activity_events" to "authenticated";

grant trigger on table "public"."activity_events" to "authenticated";

grant truncate on table "public"."activity_events" to "authenticated";

grant update on table "public"."activity_events" to "authenticated";

grant delete on table "public"."activity_events" to "service_role";

grant insert on table "public"."activity_events" to "service_role";

grant references on table "public"."activity_events" to "service_role";

grant select on table "public"."activity_events" to "service_role";

grant trigger on table "public"."activity_events" to "service_role";

grant truncate on table "public"."activity_events" to "service_role";

grant update on table "public"."activity_events" to "service_role";

grant delete on table "public"."marketplace_installs" to "anon";

grant insert on table "public"."marketplace_installs" to "anon";

grant references on table "public"."marketplace_installs" to "anon";

grant select on table "public"."marketplace_installs" to "anon";

grant trigger on table "public"."marketplace_installs" to "anon";

grant truncate on table "public"."marketplace_installs" to "anon";

grant update on table "public"."marketplace_installs" to "anon";

grant delete on table "public"."marketplace_installs" to "authenticated";

grant insert on table "public"."marketplace_installs" to "authenticated";

grant references on table "public"."marketplace_installs" to "authenticated";

grant select on table "public"."marketplace_installs" to "authenticated";

grant trigger on table "public"."marketplace_installs" to "authenticated";

grant truncate on table "public"."marketplace_installs" to "authenticated";

grant update on table "public"."marketplace_installs" to "authenticated";

grant delete on table "public"."marketplace_installs" to "service_role";

grant insert on table "public"."marketplace_installs" to "service_role";

grant references on table "public"."marketplace_installs" to "service_role";

grant select on table "public"."marketplace_installs" to "service_role";

grant trigger on table "public"."marketplace_installs" to "service_role";

grant truncate on table "public"."marketplace_installs" to "service_role";

grant update on table "public"."marketplace_installs" to "service_role";

grant delete on table "public"."marketplace_items" to "anon";

grant insert on table "public"."marketplace_items" to "anon";

grant references on table "public"."marketplace_items" to "anon";

grant select on table "public"."marketplace_items" to "anon";

grant trigger on table "public"."marketplace_items" to "anon";

grant truncate on table "public"."marketplace_items" to "anon";

grant update on table "public"."marketplace_items" to "anon";

grant delete on table "public"."marketplace_items" to "authenticated";

grant insert on table "public"."marketplace_items" to "authenticated";

grant references on table "public"."marketplace_items" to "authenticated";

grant select on table "public"."marketplace_items" to "authenticated";

grant trigger on table "public"."marketplace_items" to "authenticated";

grant truncate on table "public"."marketplace_items" to "authenticated";

grant update on table "public"."marketplace_items" to "authenticated";

grant delete on table "public"."marketplace_items" to "service_role";

grant insert on table "public"."marketplace_items" to "service_role";

grant references on table "public"."marketplace_items" to "service_role";

grant select on table "public"."marketplace_items" to "service_role";

grant trigger on table "public"."marketplace_items" to "service_role";

grant truncate on table "public"."marketplace_items" to "service_role";

grant update on table "public"."marketplace_items" to "service_role";

grant delete on table "public"."marketplace_reviews" to "anon";

grant insert on table "public"."marketplace_reviews" to "anon";

grant references on table "public"."marketplace_reviews" to "anon";

grant select on table "public"."marketplace_reviews" to "anon";

grant trigger on table "public"."marketplace_reviews" to "anon";

grant truncate on table "public"."marketplace_reviews" to "anon";

grant update on table "public"."marketplace_reviews" to "anon";

grant delete on table "public"."marketplace_reviews" to "authenticated";

grant insert on table "public"."marketplace_reviews" to "authenticated";

grant references on table "public"."marketplace_reviews" to "authenticated";

grant select on table "public"."marketplace_reviews" to "authenticated";

grant trigger on table "public"."marketplace_reviews" to "authenticated";

grant truncate on table "public"."marketplace_reviews" to "authenticated";

grant update on table "public"."marketplace_reviews" to "authenticated";

grant delete on table "public"."marketplace_reviews" to "service_role";

grant insert on table "public"."marketplace_reviews" to "service_role";

grant references on table "public"."marketplace_reviews" to "service_role";

grant select on table "public"."marketplace_reviews" to "service_role";

grant trigger on table "public"."marketplace_reviews" to "service_role";

grant truncate on table "public"."marketplace_reviews" to "service_role";

grant update on table "public"."marketplace_reviews" to "service_role";

grant delete on table "public"."message_threads" to "anon";

grant insert on table "public"."message_threads" to "anon";

grant references on table "public"."message_threads" to "anon";

grant select on table "public"."message_threads" to "anon";

grant trigger on table "public"."message_threads" to "anon";

grant truncate on table "public"."message_threads" to "anon";

grant update on table "public"."message_threads" to "anon";

grant delete on table "public"."message_threads" to "authenticated";

grant insert on table "public"."message_threads" to "authenticated";

grant references on table "public"."message_threads" to "authenticated";

grant select on table "public"."message_threads" to "authenticated";

grant trigger on table "public"."message_threads" to "authenticated";

grant truncate on table "public"."message_threads" to "authenticated";

grant update on table "public"."message_threads" to "authenticated";

grant delete on table "public"."message_threads" to "service_role";

grant insert on table "public"."message_threads" to "service_role";

grant references on table "public"."message_threads" to "service_role";

grant select on table "public"."message_threads" to "service_role";

grant trigger on table "public"."message_threads" to "service_role";

grant truncate on table "public"."message_threads" to "service_role";

grant update on table "public"."message_threads" to "service_role";

grant delete on table "public"."organization_plugins" to "anon";

grant insert on table "public"."organization_plugins" to "anon";

grant references on table "public"."organization_plugins" to "anon";

grant select on table "public"."organization_plugins" to "anon";

grant trigger on table "public"."organization_plugins" to "anon";

grant truncate on table "public"."organization_plugins" to "anon";

grant update on table "public"."organization_plugins" to "anon";

grant delete on table "public"."organization_plugins" to "authenticated";

grant insert on table "public"."organization_plugins" to "authenticated";

grant references on table "public"."organization_plugins" to "authenticated";

grant select on table "public"."organization_plugins" to "authenticated";

grant trigger on table "public"."organization_plugins" to "authenticated";

grant truncate on table "public"."organization_plugins" to "authenticated";

grant update on table "public"."organization_plugins" to "authenticated";

grant delete on table "public"."organization_plugins" to "service_role";

grant insert on table "public"."organization_plugins" to "service_role";

grant references on table "public"."organization_plugins" to "service_role";

grant select on table "public"."organization_plugins" to "service_role";

grant trigger on table "public"."organization_plugins" to "service_role";

grant truncate on table "public"."organization_plugins" to "service_role";

grant update on table "public"."organization_plugins" to "service_role";

grant delete on table "public"."permission_actions" to "anon";

grant insert on table "public"."permission_actions" to "anon";

grant references on table "public"."permission_actions" to "anon";

grant select on table "public"."permission_actions" to "anon";

grant trigger on table "public"."permission_actions" to "anon";

grant truncate on table "public"."permission_actions" to "anon";

grant update on table "public"."permission_actions" to "anon";

grant delete on table "public"."permission_actions" to "authenticated";

grant insert on table "public"."permission_actions" to "authenticated";

grant references on table "public"."permission_actions" to "authenticated";

grant select on table "public"."permission_actions" to "authenticated";

grant trigger on table "public"."permission_actions" to "authenticated";

grant truncate on table "public"."permission_actions" to "authenticated";

grant update on table "public"."permission_actions" to "authenticated";

grant delete on table "public"."permission_actions" to "service_role";

grant insert on table "public"."permission_actions" to "service_role";

grant references on table "public"."permission_actions" to "service_role";

grant select on table "public"."permission_actions" to "service_role";

grant trigger on table "public"."permission_actions" to "service_role";

grant truncate on table "public"."permission_actions" to "service_role";

grant update on table "public"."permission_actions" to "service_role";

grant delete on table "public"."permission_audit_log" to "anon";

grant insert on table "public"."permission_audit_log" to "anon";

grant references on table "public"."permission_audit_log" to "anon";

grant select on table "public"."permission_audit_log" to "anon";

grant trigger on table "public"."permission_audit_log" to "anon";

grant truncate on table "public"."permission_audit_log" to "anon";

grant update on table "public"."permission_audit_log" to "anon";

grant delete on table "public"."permission_audit_log" to "authenticated";

grant insert on table "public"."permission_audit_log" to "authenticated";

grant references on table "public"."permission_audit_log" to "authenticated";

grant select on table "public"."permission_audit_log" to "authenticated";

grant trigger on table "public"."permission_audit_log" to "authenticated";

grant truncate on table "public"."permission_audit_log" to "authenticated";

grant update on table "public"."permission_audit_log" to "authenticated";

grant delete on table "public"."permission_audit_log" to "service_role";

grant insert on table "public"."permission_audit_log" to "service_role";

grant references on table "public"."permission_audit_log" to "service_role";

grant select on table "public"."permission_audit_log" to "service_role";

grant trigger on table "public"."permission_audit_log" to "service_role";

grant truncate on table "public"."permission_audit_log" to "service_role";

grant update on table "public"."permission_audit_log" to "service_role";

grant delete on table "public"."permission_resources" to "anon";

grant insert on table "public"."permission_resources" to "anon";

grant references on table "public"."permission_resources" to "anon";

grant select on table "public"."permission_resources" to "anon";

grant trigger on table "public"."permission_resources" to "anon";

grant truncate on table "public"."permission_resources" to "anon";

grant update on table "public"."permission_resources" to "anon";

grant delete on table "public"."permission_resources" to "authenticated";

grant insert on table "public"."permission_resources" to "authenticated";

grant references on table "public"."permission_resources" to "authenticated";

grant select on table "public"."permission_resources" to "authenticated";

grant trigger on table "public"."permission_resources" to "authenticated";

grant truncate on table "public"."permission_resources" to "authenticated";

grant update on table "public"."permission_resources" to "authenticated";

grant delete on table "public"."permission_resources" to "service_role";

grant insert on table "public"."permission_resources" to "service_role";

grant references on table "public"."permission_resources" to "service_role";

grant select on table "public"."permission_resources" to "service_role";

grant trigger on table "public"."permission_resources" to "service_role";

grant truncate on table "public"."permission_resources" to "service_role";

grant update on table "public"."permission_resources" to "service_role";

grant delete on table "public"."plugin_activity_log" to "anon";

grant insert on table "public"."plugin_activity_log" to "anon";

grant references on table "public"."plugin_activity_log" to "anon";

grant select on table "public"."plugin_activity_log" to "anon";

grant trigger on table "public"."plugin_activity_log" to "anon";

grant truncate on table "public"."plugin_activity_log" to "anon";

grant update on table "public"."plugin_activity_log" to "anon";

grant delete on table "public"."plugin_activity_log" to "authenticated";

grant insert on table "public"."plugin_activity_log" to "authenticated";

grant references on table "public"."plugin_activity_log" to "authenticated";

grant select on table "public"."plugin_activity_log" to "authenticated";

grant trigger on table "public"."plugin_activity_log" to "authenticated";

grant truncate on table "public"."plugin_activity_log" to "authenticated";

grant update on table "public"."plugin_activity_log" to "authenticated";

grant delete on table "public"."plugin_activity_log" to "service_role";

grant insert on table "public"."plugin_activity_log" to "service_role";

grant references on table "public"."plugin_activity_log" to "service_role";

grant select on table "public"."plugin_activity_log" to "service_role";

grant trigger on table "public"."plugin_activity_log" to "service_role";

grant truncate on table "public"."plugin_activity_log" to "service_role";

grant update on table "public"."plugin_activity_log" to "service_role";

grant delete on table "public"."plugins" to "anon";

grant insert on table "public"."plugins" to "anon";

grant references on table "public"."plugins" to "anon";

grant select on table "public"."plugins" to "anon";

grant trigger on table "public"."plugins" to "anon";

grant truncate on table "public"."plugins" to "anon";

grant update on table "public"."plugins" to "anon";

grant delete on table "public"."plugins" to "authenticated";

grant insert on table "public"."plugins" to "authenticated";

grant references on table "public"."plugins" to "authenticated";

grant select on table "public"."plugins" to "authenticated";

grant trigger on table "public"."plugins" to "authenticated";

grant truncate on table "public"."plugins" to "authenticated";

grant update on table "public"."plugins" to "authenticated";

grant delete on table "public"."plugins" to "service_role";

grant insert on table "public"."plugins" to "service_role";

grant references on table "public"."plugins" to "service_role";

grant select on table "public"."plugins" to "service_role";

grant trigger on table "public"."plugins" to "service_role";

grant truncate on table "public"."plugins" to "service_role";

grant update on table "public"."plugins" to "service_role";

grant delete on table "public"."role_permissions" to "anon";

grant insert on table "public"."role_permissions" to "anon";

grant references on table "public"."role_permissions" to "anon";

grant select on table "public"."role_permissions" to "anon";

grant trigger on table "public"."role_permissions" to "anon";

grant truncate on table "public"."role_permissions" to "anon";

grant update on table "public"."role_permissions" to "anon";

grant delete on table "public"."role_permissions" to "authenticated";

grant insert on table "public"."role_permissions" to "authenticated";

grant references on table "public"."role_permissions" to "authenticated";

grant select on table "public"."role_permissions" to "authenticated";

grant trigger on table "public"."role_permissions" to "authenticated";

grant truncate on table "public"."role_permissions" to "authenticated";

grant update on table "public"."role_permissions" to "authenticated";

grant delete on table "public"."role_permissions" to "service_role";

grant insert on table "public"."role_permissions" to "service_role";

grant references on table "public"."role_permissions" to "service_role";

grant select on table "public"."role_permissions" to "service_role";

grant trigger on table "public"."role_permissions" to "service_role";

grant truncate on table "public"."role_permissions" to "service_role";

grant update on table "public"."role_permissions" to "service_role";

grant delete on table "public"."thread_messages" to "anon";

grant insert on table "public"."thread_messages" to "anon";

grant references on table "public"."thread_messages" to "anon";

grant select on table "public"."thread_messages" to "anon";

grant trigger on table "public"."thread_messages" to "anon";

grant truncate on table "public"."thread_messages" to "anon";

grant update on table "public"."thread_messages" to "anon";

grant delete on table "public"."thread_messages" to "authenticated";

grant insert on table "public"."thread_messages" to "authenticated";

grant references on table "public"."thread_messages" to "authenticated";

grant select on table "public"."thread_messages" to "authenticated";

grant trigger on table "public"."thread_messages" to "authenticated";

grant truncate on table "public"."thread_messages" to "authenticated";

grant update on table "public"."thread_messages" to "authenticated";

grant delete on table "public"."thread_messages" to "service_role";

grant insert on table "public"."thread_messages" to "service_role";

grant references on table "public"."thread_messages" to "service_role";

grant select on table "public"."thread_messages" to "service_role";

grant trigger on table "public"."thread_messages" to "service_role";

grant truncate on table "public"."thread_messages" to "service_role";

grant update on table "public"."thread_messages" to "service_role";

grant delete on table "public"."thread_participants" to "anon";

grant insert on table "public"."thread_participants" to "anon";

grant references on table "public"."thread_participants" to "anon";

grant select on table "public"."thread_participants" to "anon";

grant trigger on table "public"."thread_participants" to "anon";

grant truncate on table "public"."thread_participants" to "anon";

grant update on table "public"."thread_participants" to "anon";

grant delete on table "public"."thread_participants" to "authenticated";

grant insert on table "public"."thread_participants" to "authenticated";

grant references on table "public"."thread_participants" to "authenticated";

grant select on table "public"."thread_participants" to "authenticated";

grant trigger on table "public"."thread_participants" to "authenticated";

grant truncate on table "public"."thread_participants" to "authenticated";

grant update on table "public"."thread_participants" to "authenticated";

grant delete on table "public"."thread_participants" to "service_role";

grant insert on table "public"."thread_participants" to "service_role";

grant references on table "public"."thread_participants" to "service_role";

grant select on table "public"."thread_participants" to "service_role";

grant trigger on table "public"."thread_participants" to "service_role";

grant truncate on table "public"."thread_participants" to "service_role";

grant update on table "public"."thread_participants" to "service_role";

grant delete on table "public"."user_permissions" to "anon";

grant insert on table "public"."user_permissions" to "anon";

grant references on table "public"."user_permissions" to "anon";

grant select on table "public"."user_permissions" to "anon";

grant trigger on table "public"."user_permissions" to "anon";

grant truncate on table "public"."user_permissions" to "anon";

grant update on table "public"."user_permissions" to "anon";

grant delete on table "public"."user_permissions" to "authenticated";

grant insert on table "public"."user_permissions" to "authenticated";

grant references on table "public"."user_permissions" to "authenticated";

grant select on table "public"."user_permissions" to "authenticated";

grant trigger on table "public"."user_permissions" to "authenticated";

grant truncate on table "public"."user_permissions" to "authenticated";

grant update on table "public"."user_permissions" to "authenticated";

grant delete on table "public"."user_permissions" to "service_role";

grant insert on table "public"."user_permissions" to "service_role";

grant references on table "public"."user_permissions" to "service_role";

grant select on table "public"."user_permissions" to "service_role";

grant trigger on table "public"."user_permissions" to "service_role";

grant truncate on table "public"."user_permissions" to "service_role";

grant update on table "public"."user_permissions" to "service_role";

grant delete on table "public"."user_presence" to "anon";

grant insert on table "public"."user_presence" to "anon";

grant references on table "public"."user_presence" to "anon";

grant select on table "public"."user_presence" to "anon";

grant trigger on table "public"."user_presence" to "anon";

grant truncate on table "public"."user_presence" to "anon";

grant update on table "public"."user_presence" to "anon";

grant delete on table "public"."user_presence" to "authenticated";

grant insert on table "public"."user_presence" to "authenticated";

grant references on table "public"."user_presence" to "authenticated";

grant select on table "public"."user_presence" to "authenticated";

grant trigger on table "public"."user_presence" to "authenticated";

grant truncate on table "public"."user_presence" to "authenticated";

grant update on table "public"."user_presence" to "authenticated";

grant delete on table "public"."user_presence" to "service_role";

grant insert on table "public"."user_presence" to "service_role";

grant references on table "public"."user_presence" to "service_role";

grant select on table "public"."user_presence" to "service_role";

grant trigger on table "public"."user_presence" to "service_role";

grant truncate on table "public"."user_presence" to "service_role";

grant update on table "public"."user_presence" to "service_role";


  create policy "Users can create activity events in their organization"
  on "public"."activity_events"
  as permissive
  for insert
  to authenticated
with check ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));



  create policy "Users can view activity in their organization"
  on "public"."activity_events"
  as permissive
  for select
  to authenticated
using ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));



  create policy "Admins can manage org installs"
  on "public"."marketplace_installs"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = marketplace_installs.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = marketplace_installs.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))));



  create policy "Users can view org installs"
  on "public"."marketplace_installs"
  as permissive
  for select
  to authenticated
using ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));



  create policy "Anyone can view active marketplace items"
  on "public"."marketplace_items"
  as permissive
  for select
  to authenticated
using ((is_active = true));



  create policy "Anyone can view reviews"
  on "public"."marketplace_reviews"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Users can manage their org reviews"
  on "public"."marketplace_reviews"
  as permissive
  for all
  to authenticated
using ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))))
with check ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));



  create policy "Users can create threads in their organization"
  on "public"."message_threads"
  as permissive
  for insert
  to authenticated
with check ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));



  create policy "Users can update threads in their organization"
  on "public"."message_threads"
  as permissive
  for update
  to authenticated
using ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))))
with check ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));



  create policy "Users can view threads in their organization"
  on "public"."message_threads"
  as permissive
  for select
  to authenticated
using ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));



  create policy "Admins can manage org plugins"
  on "public"."organization_plugins"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = organization_plugins.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = organization_plugins.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))));



  create policy "Users can view org plugins"
  on "public"."organization_plugins"
  as permissive
  for select
  to authenticated
using ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));



  create policy "Anyone can view permission actions"
  on "public"."permission_actions"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admins can view audit logs"
  on "public"."permission_audit_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = permission_audit_log.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))));



  create policy "System can insert audit logs"
  on "public"."permission_audit_log"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Anyone can view permission resources"
  on "public"."permission_resources"
  as permissive
  for select
  to authenticated
using (true);



  create policy "System can insert plugin logs"
  on "public"."plugin_activity_log"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Users can view org plugin logs"
  on "public"."plugin_activity_log"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = plugin_activity_log.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))));



  create policy "Admins can manage plugins"
  on "public"."plugins"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.role = 'super_admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.role = 'super_admin'::public.user_role)))));



  create policy "Anyone can view active plugins"
  on "public"."plugins"
  as permissive
  for select
  to authenticated
using ((is_active = true));



  create policy "Admins can manage role permissions"
  on "public"."role_permissions"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND ((organization_memberships.organization_id = role_permissions.organization_id) OR (role_permissions.organization_id IS NULL)) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND ((organization_memberships.organization_id = role_permissions.organization_id) OR (role_permissions.organization_id IS NULL)) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))));



  create policy "Users can view role permissions in their org"
  on "public"."role_permissions"
  as permissive
  for select
  to authenticated
using (((organization_id IS NULL) OR (organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid())))));



  create policy "Users can create messages in accessible threads"
  on "public"."thread_messages"
  as permissive
  for insert
  to authenticated
with check ((thread_id IN ( SELECT message_threads.id
   FROM public.message_threads
  WHERE (message_threads.organization_id IN ( SELECT organization_memberships.organization_id
           FROM public.organization_memberships
          WHERE (organization_memberships.user_id = auth.uid()))))));



  create policy "Users can update their own messages"
  on "public"."thread_messages"
  as permissive
  for update
  to authenticated
using ((sender_id = auth.uid()))
with check ((sender_id = auth.uid()));



  create policy "Users can view messages in accessible threads"
  on "public"."thread_messages"
  as permissive
  for select
  to authenticated
using ((thread_id IN ( SELECT message_threads.id
   FROM public.message_threads
  WHERE (message_threads.organization_id IN ( SELECT organization_memberships.organization_id
           FROM public.organization_memberships
          WHERE (organization_memberships.user_id = auth.uid()))))));



  create policy "Users can manage their own participation"
  on "public"."thread_participants"
  as permissive
  for all
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can view participants in their threads"
  on "public"."thread_participants"
  as permissive
  for select
  to authenticated
using ((thread_id IN ( SELECT message_threads.id
   FROM public.message_threads
  WHERE (message_threads.organization_id IN ( SELECT organization_memberships.organization_id
           FROM public.organization_memberships
          WHERE (organization_memberships.user_id = auth.uid()))))));



  create policy "Admins can manage user permissions"
  on "public"."user_permissions"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = user_permissions.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = user_permissions.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role]))))));



  create policy "Users can view their own permissions"
  on "public"."user_permissions"
  as permissive
  for select
  to authenticated
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.organization_memberships
  WHERE ((organization_memberships.user_id = auth.uid()) AND (organization_memberships.organization_id = user_permissions.organization_id) AND (organization_memberships.role = ANY (ARRAY['super_admin'::public.user_role, 'internal_staff'::public.user_role])))))));



  create policy "Users can delete their own presence"
  on "public"."user_presence"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can insert their own presence"
  on "public"."user_presence"
  as permissive
  for insert
  to authenticated
with check (((user_id = auth.uid()) AND (organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid())))));



  create policy "Users can update their own presence"
  on "public"."user_presence"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can view presence in their organization"
  on "public"."user_presence"
  as permissive
  for select
  to authenticated
using ((organization_id IN ( SELECT organization_memberships.organization_id
   FROM public.organization_memberships
  WHERE (organization_memberships.user_id = auth.uid()))));


CREATE TRIGGER trigger_increment_install_count AFTER INSERT ON public.marketplace_installs FOR EACH ROW EXECUTE FUNCTION public.increment_install_count();

CREATE TRIGGER trigger_update_rating_on_review AFTER INSERT OR DELETE OR UPDATE ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION public.update_marketplace_item_rating();

CREATE TRIGGER update_thread_last_message_trigger AFTER INSERT ON public.thread_messages FOR EACH ROW EXECUTE FUNCTION public.update_thread_last_message();

CREATE TRIGGER update_presence_timestamp_trigger BEFORE UPDATE ON public.user_presence FOR EACH ROW EXECUTE FUNCTION public.update_presence_timestamp();


