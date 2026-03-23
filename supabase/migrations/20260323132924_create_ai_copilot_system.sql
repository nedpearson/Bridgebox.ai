/*
  # AI Copilot System

  1. New Tables
    - `copilot_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `organization_id` (uuid, references organizations)
      - `title` (text) - auto-generated summary of conversation
      - `context_type` (text: 'general', 'crm', 'project', 'support', 'automation', 'analytics') - what user is asking about
      - `is_archived` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `copilot_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references copilot_conversations)
      - `role` (text: 'user', 'assistant', 'system')
      - `content` (text) - message content
      - `metadata` (jsonb) - store context, suggestions, references
      - `created_at` (timestamptz)

    - `copilot_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `organization_id` (uuid, references organizations)
      - `suggestion_type` (text: 'workflow', 'automation', 'next_step', 'risk_alert', 'opportunity')
      - `title` (text)
      - `description` (text)
      - `context` (jsonb) - related data
      - `priority` (text: 'low', 'medium', 'high', 'urgent')
      - `status` (text: 'pending', 'accepted', 'dismissed')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own conversations
    - Organization members can see shared suggestions
    - Track all AI interactions for compliance
*/

-- Copilot Conversations
CREATE TABLE IF NOT EXISTS copilot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text DEFAULT 'New Conversation',
  context_type text CHECK (context_type IN (
    'general',
    'crm',
    'project',
    'support',
    'automation',
    'analytics'
  )) DEFAULT 'general',
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copilot_conversations_user ON copilot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_conversations_org ON copilot_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_copilot_conversations_context ON copilot_conversations(context_type);
CREATE INDEX IF NOT EXISTS idx_copilot_conversations_archived ON copilot_conversations(is_archived) WHERE is_archived = false;

ALTER TABLE copilot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON copilot_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON copilot_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON copilot_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON copilot_conversations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Copilot Messages
CREATE TABLE IF NOT EXISTS copilot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES copilot_conversations(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_conversation ON copilot_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_role ON copilot_messages(role);

ALTER TABLE copilot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON copilot_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM copilot_conversations
      WHERE copilot_conversations.id = copilot_messages.conversation_id
      AND copilot_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON copilot_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM copilot_conversations
      WHERE copilot_conversations.id = copilot_messages.conversation_id
      AND copilot_conversations.user_id = auth.uid()
    )
  );

-- Copilot Suggestions
CREATE TABLE IF NOT EXISTS copilot_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  suggestion_type text CHECK (suggestion_type IN (
    'workflow',
    'automation',
    'next_step',
    'risk_alert',
    'opportunity'
  )) NOT NULL,
  title text NOT NULL,
  description text,
  context jsonb DEFAULT '{}'::jsonb,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status text CHECK (status IN ('pending', 'accepted', 'dismissed')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copilot_suggestions_user ON copilot_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_suggestions_org ON copilot_suggestions(organization_id);
CREATE INDEX IF NOT EXISTS idx_copilot_suggestions_type ON copilot_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_copilot_suggestions_status ON copilot_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_copilot_suggestions_priority ON copilot_suggestions(priority);

ALTER TABLE copilot_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suggestions for their organization"
  ON copilot_suggestions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = copilot_suggestions.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create suggestions"
  ON copilot_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own suggestions"
  ON copilot_suggestions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own suggestions"
  ON copilot_suggestions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE copilot_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON copilot_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();
